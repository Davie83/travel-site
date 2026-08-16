/* ==========================================================================
   빌드 스크립트 — Markdown 글을 정적 HTML 사이트로 만듭니다.
   --------------------------------------------------------------------------
   외부 라이브러리를 하나도 쓰지 않습니다 (npm 설치 실패로 빌드가 깨질 일 없음).

   실행:  node build.js
   결과:  dist/ 폴더에 완성된 사이트가 생성됩니다.
          Netlify 는 이 dist 폴더를 배포합니다.

   ※ 평소에는 이 파일을 열 일이 없습니다.
      글 추가 → content/posts/ 에 .md 파일
      설정 변경 → site.config.js
      디자인 변경 → templates/ 또는 static/assets/style.css
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT      = __dirname;
const CONTENT   = path.join(ROOT, 'content');
const TEMPLATES = path.join(ROOT, 'templates');
const STATIC    = path.join(ROOT, 'static');
const DIST      = path.join(ROOT, 'dist');

const site = require('./site.config.js');
const SITE_URL = site.url.replace(/\/+$/, ''); // 끝 슬래시 제거

// 목록 맨 뒤로 밀어둘 예시글 slug 목록 (site.config.js 에서 관리)
const DEMO_POSTS = new Set(site.demoPosts || []);

/* ==========================================================================
   1. 아주 작은 유틸
   ========================================================================== */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** {{key}} 자리를 값으로 채웁니다. 값이 없으면 빈 문자열. */
function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] === undefined || vars[k] === null ? '' : String(vars[k])
  );
}

/* ==========================================================================
   2. 프론트매터 파서 (.md 파일 맨 위 --- 사이 영역)
   --------------------------------------------------------------------------
   지원하는 형태
     title: 제목입니다
     tags: [서울, 종로]
     info:
       - 위치|서울 종로구
       - 주차|없음
   ========================================================================== */

function parseFrontMatter(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };

  const meta = {};
  const lines = m[1].split('\n');
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    // "  - 항목"  → 바로 위 key 의 배열 항목
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(stripQuotes(item[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;

    const key = kv[1];
    const val = kv[2].trim();
    currentKey = key;

    if (val === '') {                       // 다음 줄부터 배열이 올 수 있음
      meta[key] = '';
    } else if (/^\[.*\]$/.test(val)) {      // [a, b, c] 형태
      meta[key] = val.slice(1, -1).split(',')
        .map(s => stripQuotes(s.trim())).filter(Boolean);
    } else {
      meta[key] = stripQuotes(val);
    }
  }

  return { meta, body: text.slice(m[0].length) };
}

function stripQuotes(s) {
  return s.replace(/^['"](.*)['"]$/, '$1');
}

/* ==========================================================================
   3. 마크다운 → HTML
   --------------------------------------------------------------------------
   글 작성에 필요한 문법만 직접 구현했습니다.
     # 제목        h1~h6
     **굵게**  *기울임*  `코드`
     [링크](주소)   ![사진](경로)
     - 목록        1. 번호목록
     > 인용        → 강조 박스(.callout)
     | 표 | 헤더 |  → 표
     ---           구분선
     ```코드블록```
     < 로 시작하는 줄은 HTML 그대로 통과
   ========================================================================== */

/** 줄 안쪽 서식 (이미 escapeHtml 처리된 문자열을 받습니다) */
function inline(s) {
  return s
    // 사진
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`)
    // 링크 (외부 링크는 새 탭)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
      const ext = /^https?:/i.test(url);
      return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

/** 한 줄이 새로운 블록의 시작인지 (문단을 여기서 끊어야 하는지) */
function isBlockStart(line) {
  return /^\s*$/.test(line)
      || /^#{1,6}\s/.test(line)
      || /^\s*[-*]\s+/.test(line)
      || /^\s*\d+\.\s+/.test(line)
      || /^\s*>/.test(line)
      || /^\s*\|/.test(line)
      || /^\s*```/.test(line)
      || /^-{3,}\s*$/.test(line)
      || /^\s*</.test(line);
}

function markdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄
    if (!line.trim()) { i++; continue; }

    // 코드 블록
    if (/^\s*```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // 닫는 ```
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // 구분선 (프론트매터는 이미 제거된 뒤라 안전)
    if (/^-{3,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    // 제목
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const lv = h[1].length;
      out.push(`<h${lv}>${inline(escapeHtml(h[2].trim()))}</h${lv}>`);
      i++; continue;
    }

    // 표  ( |...| 다음 줄이 |---|---| 형태일 때만 표로 인식 )
    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cut = r => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const head = cut(rows[0]);
      const body = rows.slice(2).map(cut);
      out.push(
        '<div class="table-scroll"><table class="md-table"><thead><tr>' +
        head.map(c => `<th>${inline(escapeHtml(c))}</th>`).join('') +
        '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => `<td>${inline(escapeHtml(c))}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>'
      );
      continue;
    }

    // 인용 → 강조 박스
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, '')); i++;
      }
      out.push(`<div class="callout">${inline(escapeHtml(buf.join(' ')))}</div>`);
      continue;
    }

    // 목록 (- 또는 * / 1. 2. 3.)
    const bullet = /^\s*[-*]\s+/.test(line);
    const number = /^\s*\d+\.\s+/.test(line);
    if (bullet || number) {
      const re  = bullet ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      const tag = bullet ? 'ul' : 'ol';
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        items.push(lines[i].replace(re, '').trim()); i++;
      }
      out.push(`<${tag}>` + items.map(t => `<li>${inline(escapeHtml(t))}</li>`).join('') + `</${tag}>`);
      continue;
    }

    // HTML 그대로 통과 (< 로 시작하는 줄부터 빈 줄까지)
    if (/^\s*</.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim()) { buf.push(lines[i]); i++; }
      out.push(buf.join('\n'));
      continue;
    }

    // 나머지는 문단
    const buf = [];
    while (i < lines.length && !isBlockStart(lines[i])) { buf.push(lines[i].trim()); i++; }
    out.push(`<p>${inline(escapeHtml(buf.join(' ')))}</p>`);
  }

  return out.join('\n');
}

/* ==========================================================================
   4. 파일 읽기/쓰기 도우미
   ========================================================================== */

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function writeFile(relPath, content) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

/** static/ 폴더를 dist/ 로 통째로 복사 */
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/** 폴더 안의 .md 파일 목록 (없으면 빈 배열) */
function readMarkdownDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return { slug: f.replace(/\.md$/, ''), meta, body };
    });
}

/* ==========================================================================
   5. 조각 HTML 만들기
   ========================================================================== */

/** 헤더 내비게이션 (현재 페이지 표시 포함) */
function navHTML(current, base) {
  const items = [
    { href: 'index.html', label: '홈', key: 'home' },
    ...site.categories.map(c => ({ href: `${c.slug}.html`, label: c.label, key: c.slug })),
    { href: 'about.html', label: '소개', key: 'about' },
    { href: 'contact.html', label: '문의', key: 'contact' }
  ];
  return items.map(it =>
    `<a href="${base}${it.href}"${it.key === current ? ' aria-current="page"' : ''}>${it.label}</a>`
  ).join('\n      ');
}

/** 카드 한 장 — 검색/필터가 쓸 정보를 data-* 로 함께 심습니다 */
function cardHTML(post, base) {
  const m = post.meta;
  const thumb = m.thumb
    ? `<img src="${base}${m.thumb}" alt="${escapeHtml(m.title)}" loading="lazy">`
    : (m.emoji || '📍');
  const catLabel = (site.categories.find(c => c.slug === m.cat) || {}).label || m.cat;
  const search = [m.title, m.excerpt, m.region, (m.tags || []).join(' ')]
    .join(' ').toLowerCase();

  return `      <article class="card" data-cat="${escapeHtml(m.cat)}" data-region="${escapeHtml(m.region)}" data-search="${escapeHtml(search)}">
        <a href="${base}posts/${post.slug}.html">
          <div class="card-thumb">${thumb}<span class="card-badge">${escapeHtml(catLabel)}</span></div>
          <div class="card-body">
            <h3>${escapeHtml(m.title)}</h3>
            <p>${escapeHtml(m.excerpt)}</p>
            <div class="card-meta"><span>📍 ${escapeHtml(m.region)}</span><span>${String(m.date).replace(/-/g, '.')}</span></div>
          </div>
        </a>
      </article>`;
}

/** 글 상단 정보 요약표 — 프론트매터의 info: 목록에서 만듭니다 */
function infoTableHTML(info) {
  if (!Array.isArray(info) || !info.length) return '';
  const rows = info.map(row => {
    const idx = String(row).indexOf('|');
    if (idx < 0) return '';
    const label = row.slice(0, idx).trim();
    const value = row.slice(idx + 1).trim();
    return `<tr><th>${inline(escapeHtml(label))}</th><td>${inline(escapeHtml(value))}</td></tr>`;
  }).join('');
  return `<div class="table-scroll"><table class="info-table"><tbody>${rows}</tbody></table></div>`;
}

/** 리액션 버튼 묶음 */
function reactionsHTML(slug) {
  if (!site.supabase.url || !site.supabase.anonKey) return '';
  const buttons = site.reactions.map(r =>
    `      <button class="reaction" type="button" data-key="${r.key}" aria-pressed="false" title="${escapeHtml(r.label)}">
        <span class="reaction-emoji">${r.emoji}</span>
        <span class="reaction-label">${escapeHtml(r.label)}</span>
        <span class="reaction-count" data-count="${r.key}">0</span>
      </button>`
  ).join('\n');

  return `<section class="reactions" data-slug="${escapeHtml(slug)}" aria-label="이 글에 반응 남기기">
    <h2 class="reactions-title">이 글, 어떠셨나요?</h2>
    <div class="reaction-list">
${buttons}
    </div>
    <p class="reactions-note">로그인 없이 누를 수 있습니다. 다시 누르면 취소됩니다.</p>
  </section>`;
}

/** 광고 자리
 *  · 애드센스 설정 전에는 아무것도 만들지 않습니다.
 *    (방문자에게 "광고 영역" 빈 박스가 보이면 미완성 사이트로 보이고,
 *     애드센스 심사에도 불리합니다)
 *  · site.config.js 에 showAdPlaceholders: true 를 넣으면
 *    배치 확인용 점선 박스가 다시 보입니다.
 */
function adSlotHTML(name) {
  if (site.adsensePublisherId) {
    return `<div class="ad-slot live" data-ad="${name}">
      <!-- 광고 단위 코드 자리 (자동 광고를 쓰면 비워두어도 됩니다) -->
    </div>`;
  }
  if (site.showAdPlaceholders) {
    return `<div class="ad-slot" data-ad="${name}">광고 영역 (${name})</div>`;
  }
  return '';
}

/** 애드센스 스크립트 (게시자 ID 가 설정돼 있을 때만) */
function adsenseHTML() {
  if (!site.adsensePublisherId) return '<!-- 애드센스 미설정: site.config.js 의 adsensePublisherId 를 채우면 자동 삽입됩니다 -->';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsensePublisherId}" crossorigin="anonymous"></script>`;
}

/* ==========================================================================
   6. 페이지 조립
   ========================================================================== */

function renderPage(opts) {
  const base = opts.base || '';
  return fill(base_tpl, {
    lang: 'ko',
    title: escapeHtml(opts.title),
    description: escapeHtml(opts.description || site.description),
    canonical: `${SITE_URL}/${opts.canonical}`,
    ogType: opts.ogType || 'website',
    siteName: escapeHtml(site.name),
    base: base,
    nav: navHTML(opts.current, base),
    adsense: adsenseHTML(),
    headExtra: opts.headExtra || '',
    body: opts.body,
    year: new Date().getFullYear(),
    noindex: opts.noindex ? '<meta name="robots" content="noindex">' : '',
    supabaseUrl: site.supabase.url,
    supabaseKey: site.supabase.anonKey
  });
}

/* ==========================================================================
   7. 실행
   ========================================================================== */

const base_tpl = readTemplate('base.html');
const home_tpl = readTemplate('home.html');
const list_tpl = readTemplate('list.html');
const post_tpl = readTemplate('post.html');
const page_tpl = readTemplate('page.html');

function build() {
  // dist 폴더 비우고 새로 시작
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // ---- 글 읽어서 최신순 정렬 ----
  const posts = readMarkdownDir(path.join(CONTENT, 'posts'))
    .filter(p => {
      if (String(p.meta.draft) === 'true') {
        console.log(`  · 초안이라 건너뜀: ${p.slug}`);
        return false;
      }
      const missing = ['title', 'cat', 'region', 'date', 'excerpt'].filter(k => !p.meta[k]);
      if (missing.length) {
        console.warn(`  ! ${p.slug}.md 에 빠진 항목: ${missing.join(', ')} — 건너뜁니다`);
        return false;
      }

      // 파일명 규칙 — 어기면 배포는 되지만 리액션 저장이 실패합니다.
      // (Supabase 쪽 검사와 같은 규칙: 영문 소문자 / 숫자 / 하이픈, 80자 이내)
      if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) {
        console.warn(`  ! ${p.slug}.md — 파일명은 영문 소문자·숫자·하이픈만, 80자 이내여야 합니다 (한글·공백·대문자 불가). 건너뜁니다`);
        return false;
      }

      // 날짜 형식 — 정렬 기준이라 형식이 틀리면 순서가 뒤죽박죽이 됩니다
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.meta.date))) {
        console.warn(`  ! ${p.slug}.md 의 date 가 "${p.meta.date}" 입니다 — YYYY-MM-DD 형식이어야 합니다. 건너뜁니다`);
        return false;
      }

      // 카테고리 확인 — 오타를 내면 어느 목록에도 안 나옵니다
      if (!site.categories.some(c => c.slug === p.meta.cat)) {
        const valid = site.categories.map(c => c.slug).join(', ');
        console.warn(`  ! ${p.slug}.md 의 cat 이 "${p.meta.cat}" 입니다 — ${valid} 중 하나여야 합니다. 건너뜁니다`);
        return false;
      }

      return true;
    })
    // 정렬 규칙
    //  1순위: 예시글(site.config.js 의 demoPosts)은 날짜와 상관없이 항상 맨 뒤
    //  2순위: 나머지는 date 최신순
    // → 예전에 다녀온 곳을 나중에 써서 날짜가 과거여도 예시글보다는 위에 놓입니다.
    .sort((a, b) => {
      const demoA = DEMO_POSTS.has(a.slug) ? 1 : 0;
      const demoB = DEMO_POSTS.has(b.slug) ? 1 : 0;
      if (demoA !== demoB) return demoA - demoB;
      return a.meta.date < b.meta.date ? 1 : -1;
    });

  const pages = readMarkdownDir(path.join(CONTENT, 'pages'));

  /* ---- 홈 ---- */
  const catSections = site.categories.map(c => {
    const cards = posts.filter(p => p.meta.cat === c.slug).slice(0, 3).map(p => cardHTML(p, '')).join('\n');
    if (!cards) return '';
    return `    <section class="section">
      <div class="section-head">
        <h2>${escapeHtml(c.label)}</h2>
        <a class="more" href="${c.slug}.html">전체 보기 →</a>
      </div>
      <div class="grid">
${cards}
      </div>
    </section>`;
  }).filter(Boolean).join('\n\n');

  writeFile('index.html', renderPage({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    canonical: '',
    current: 'home',
    body: fill(home_tpl, {
      tagline: escapeHtml(site.tagline),
      description: escapeHtml(site.description),
      // 글 전체를 넣되 평소에는 CSS(.limit-6)로 6개만 보여줍니다.
      // 검색하면 제한이 풀려서 전체 글에서 찾습니다.
      latest: posts.map(p => cardHTML(p, '')).join('\n'),
      categorySections: catSections,
      adTop:    adSlotHTML('home-top'),
      adMid:    adSlotHTML('home-mid'),
      adBottom: adSlotHTML('home-bottom')
    })
  }));

  /* ---- 카테고리 목록 페이지 ---- */
  for (const c of site.categories) {
    const inCat = posts.filter(p => p.meta.cat === c.slug);
    const regions = ['전체', ...new Set(inCat.map(p => p.meta.region))];
    writeFile(`${c.slug}.html`, renderPage({
      title: `${c.title} — ${site.name}`,
      description: c.desc,
      canonical: `${c.slug}.html`,
      current: c.slug,
      body: fill(list_tpl, {
        heading: escapeHtml(c.title),
        desc: escapeHtml(c.desc),
        placeholder: `${escapeHtml(c.label)} 검색`,
        // 글이 하나도 없는 카테고리는 지역 버튼을 숨기고 안내 문구를 보여줍니다
        // (빈 화면만 나오면 사이트가 고장 난 것처럼 보입니다)
        chips: inCat.length ? regions.map((r, i) =>
          `<button class="chip${i === 0 ? ' active' : ''}" type="button" data-region="${escapeHtml(r)}">${escapeHtml(r)}</button>`
        ).join('\n        ') : '',
        cards: inCat.length
          ? inCat.map(p => cardHTML(p, '')).join('\n')
          : `      <p class="empty" style="grid-column:1/-1">아직 등록된 글이 없습니다. 준비되는 대로 채워집니다.</p>`,
        adTop:    adSlotHTML('list-top'),
        adBottom: adSlotHTML('list-bottom')
      })
    }));
  }

  /* ---- 글 상세 ---- */
  for (const p of posts) {
    const m = p.meta;
    const catLabel = (site.categories.find(c => c.slug === m.cat) || {}).label || m.cat;
    const related = posts
      .filter(x => x.meta.cat === m.cat && x.slug !== p.slug)
      .slice(0, 3).map(x => cardHTML(x, '../')).join('\n');

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: m.title,
      description: m.excerpt,
      datePublished: m.date,
      dateModified: m.updated || m.date,
      author:    { '@type': 'Person', name: site.name },
      publisher: { '@type': 'Organization', name: site.name },
      mainEntityOfPage: `${SITE_URL}/posts/${p.slug}.html`
    };

    writeFile(`posts/${p.slug}.html`, renderPage({
      title: `${m.title} | ${site.name}`,
      description: m.excerpt,
      canonical: `posts/${p.slug}.html`,
      ogType: 'article',
      current: m.cat,
      base: '../',
      headExtra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
      body: fill(post_tpl, {
        kicker: `${escapeHtml(catLabel)} · ${escapeHtml(m.region)}`,
        title: escapeHtml(m.title),
        meta: `${String(m.date).replace(/-/g, '.')} 발행${m.visited ? ` · 방문 기준 ${escapeHtml(m.visited)}` : ''}`,
        infoTable: infoTableHTML(m.info),
        content: markdown(p.body),
        adTop:    adSlotHTML('post-top'),
        adBottom: adSlotHTML('post-bottom'),
        reactions: reactionsHTML(p.slug),
        related: related
          ? `<section class="related">
    <div class="section-head"><h2>함께 보면 좋은 글</h2></div>
    <div class="grid">\n${related}\n    </div>
  </section>` : ''
      })
    }));
  }

  /* ---- 소개 / 문의 / 개인정보처리방침 ---- */
  for (const pg of pages) {
    // 본문 안의 {{email}} 같은 표시는 설정값으로 치환
    const bodyMd = pg.body
      .replace(/\{\{email\}\}/g, site.email)
      .replace(/\{\{siteName\}\}/g, site.name);

    writeFile(`${pg.slug}.html`, renderPage({
      title: `${pg.meta.title} — ${site.name}`,
      description: pg.meta.description || site.description,
      canonical: `${pg.slug}.html`,
      current: pg.slug,
      body: fill(page_tpl, {
        title: escapeHtml(pg.meta.title),
        // 문구 전체를 .md 의 updated: 에 그대로 씁니다
        // (페이지마다 "최종 수정일" / "시행일" 처럼 표현이 달라서)
        updated: pg.meta.updated ? escapeHtml(pg.meta.updated) : '',
        content: markdown(bodyMd)
      })
    }));
  }

  /* ---- 404 ---- */
  writeFile('404.html', renderPage({
    title: `페이지를 찾을 수 없습니다 — ${site.name}`,
    canonical: '404.html',
    noindex: true,
    body: `<section class="hero">
    <div class="wrap">
      <h1>길을 잘못 드셨네요 🧭</h1>
      <p>찾으시는 페이지가 없거나 주소가 바뀌었습니다.</p>
      <p style="margin-top:20px;"><a class="more" href="index.html">홈으로 돌아가기 →</a></p>
    </div>
  </section>
  <div class="wrap"><section class="section">
    <div class="section-head"><h2>최근 올라온 글</h2></div>
    <div class="grid">\n${posts.slice(0, 3).map(p => cardHTML(p, '')).join('\n')}\n    </div>
  </section></div>`
  }));

  /* ---- sitemap.xml (글 추가하면 자동으로 반영됩니다) ---- */
  const urls = [
    { loc: '', pri: '1.0', freq: 'daily' },
    ...site.categories.map(c => ({ loc: c.slug + '.html', pri: '0.9', freq: 'daily' })),
    ...pages.map(pg => ({ loc: pg.slug + '.html', pri: '0.3' })),
    ...posts.map(p => ({ loc: `posts/${p.slug}.html`, pri: '0.8', lastmod: p.meta.updated || p.meta.date }))
  ];
  writeFile('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u =>
      `  <url><loc>${SITE_URL}/${u.loc}</loc>` +
      (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
      (u.freq ? `<changefreq>${u.freq}</changefreq>` : '') +
      `<priority>${u.pri}</priority></url>`
    ).join('\n') +
    `\n</urlset>\n`
  );

  /* ---- robots.txt ---- */
  writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  /* ---- ads.txt (애드센스 승인 후 자동 생성) ---- */
  if (site.adsensePublisherId) {
    const pub = site.adsensePublisherId.replace(/^ca-/, '');
    writeFile('ads.txt', `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  }

  /* ---- static 폴더 통째로 복사 ---- */
  copyDir(STATIC, DIST);

  console.log(`\n✅ 빌드 완료`);
  const demoCount = posts.filter(p => DEMO_POSTS.has(p.slug)).length;
  console.log(`   글 ${posts.length}개 (실제 ${posts.length - demoCount} · 예시 ${demoCount}는 맨 뒤로) · 페이지 ${pages.length}개`);
  console.log(`   결과: dist/`);
  if (!site.supabase.url) console.log(`   ⚠ Supabase 미설정 — 리액션 버튼이 표시되지 않습니다`);
  if (!site.adsensePublisherId) console.log(`   ⚠ 애드센스 미설정 — 광고 코드가 들어가지 않았습니다`);
  if (SITE_URL.includes('example')) console.log(`   ⚠ site.config.js 의 url 이 아직 예시 주소입니다`);
}

/* 다른 곳에서 함수만 가져다 쓸 수 있게 내보내기 (테스트용) */
module.exports = { markdown, parseFrontMatter, inline, escapeHtml, fill };

if (require.main === module) build();
