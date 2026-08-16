/* ==========================================================================
   빌드 스크립트 — Markdown 글을 다국어 정적 사이트로 만듭니다.
   --------------------------------------------------------------------------
   외부 라이브러리를 하나도 쓰지 않습니다.

   실행:  node build.js        결과: dist/
   Netlify 는 dist 폴더를 배포합니다.

   폴더 규칙
     content/posts/<언어>/<슬러그>.md   글
     content/pages/<언어>/about.md      소개·문의·개인정보처리방침
     static/                            그대로 복사되는 파일

   주소 규칙
     한국어  /posts/<슬러그>.html      (접두어 없음 — 기존 주소 유지)
     그 외    /en/posts/<슬러그>.html

   ※ 평소에는 이 파일을 열 일이 없습니다.
      글 추가 → content/posts/<언어>/ 에 .md
      설정   → site.config.js
      문구   → content/i18n.js
      디자인 → templates/ 또는 static/assets/style.css
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT      = __dirname;
const CONTENT   = path.join(ROOT, 'content');
const TEMPLATES = path.join(ROOT, 'templates');
const STATIC    = path.join(ROOT, 'static');
const DIST      = path.join(ROOT, 'dist');

const site = require('./site.config.js');
const I18N = require('./content/i18n.js');

const SITE_URL   = site.url.replace(/\/+$/, '');
const DEMO_POSTS = new Set(site.demoPosts || []);
const LOCALES    = site.locales.filter(l => l.enabled);

/* ==========================================================================
   1. 유틸
   ========================================================================== */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** {{key}} 자리를 값으로 채웁니다 */
function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] === undefined || vars[k] === null ? '' : String(vars[k])
  );
}

/** 출력 경로에서 최상단으로 돌아가는 상대 경로를 계산 ('en/posts/x.html' → '../../') */
function baseOf(outPath) {
  return '../'.repeat(outPath.split('/').length - 1);
}

const localeDir = code => (site.locales.find(l => l.code === code) || {}).dir || '';

/** 사이트 이름 — site.config.js 에서 언어별 객체로 줄 수도, 문자열 하나로 줄 수도 있습니다 */
const siteName = code => (typeof site.name === 'object'
  ? (site.name[code] || site.name.en || Object.values(site.name)[0])
  : site.name);

const regionOf  = slug => site.regions.find(r => r.slug === slug);
const regionName = (slug, code) => {
  const r = regionOf(slug);
  return r ? (r.names[code] || r.names.en || r.slug) : slug;
};

/* ==========================================================================
   2. 프론트매터 파서
   ========================================================================== */

function parseFrontMatter(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };

  const meta = {};
  let currentKey = null;

  for (const line of m[1].split('\n')) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(stripQuotes(item[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;

    const key = kv[1], val = kv[2].trim();
    currentKey = key;

    if (val === '') meta[key] = '';
    else if (/^\[.*\]$/.test(val)) {
      meta[key] = val.slice(1, -1).split(',').map(s => stripQuotes(s.trim())).filter(Boolean);
    } else meta[key] = stripQuotes(val);
  }
  return { meta, body: text.slice(m[0].length) };
}

const stripQuotes = s => s.replace(/^['"](.*)['"]$/, '$1');

/* ==========================================================================
   3. 마크다운 → HTML
   ========================================================================== */

function inline(s) {
  return s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
      const ext = /^https?:/i.test(url);
      return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

function isBlockStart(line) {
  return /^\s*$/.test(line) || /^#{1,6}\s/.test(line)
      || /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)
      || /^\s*>/.test(line) || /^\s*\|/.test(line)
      || /^\s*```/.test(line) || /^-{3,}\s*$/.test(line) || /^\s*</.test(line);
}

function markdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (/^\s*```/.test(line)) {
      const buf = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^-{3,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const lv = h[1].length;
      out.push(`<h${lv}>${inline(escapeHtml(h[2].trim()))}</h${lv}>`);
      i++; continue;
    }

    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cut = r => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const head = cut(rows[0]), body = rows.slice(2).map(cut);
      out.push(
        '<div class="table-scroll"><table class="md-table"><thead><tr>' +
        head.map(c => `<th>${inline(escapeHtml(c))}</th>`).join('') +
        '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => `<td>${inline(escapeHtml(c))}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>'
      );
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<div class="callout">${inline(escapeHtml(buf.join(' ')))}</div>`);
      continue;
    }

    const bullet = /^\s*[-*]\s+/.test(line), number = /^\s*\d+\.\s+/.test(line);
    if (bullet || number) {
      const re = bullet ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      const tag = bullet ? 'ul' : 'ol';
      const items = [];
      while (i < lines.length && re.test(lines[i])) { items.push(lines[i].replace(re, '').trim()); i++; }
      out.push(`<${tag}>` + items.map(t => `<li>${inline(escapeHtml(t))}</li>`).join('') + `</${tag}>`);
      continue;
    }

    if (/^\s*</.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim()) { buf.push(lines[i]); i++; }
      out.push(buf.join('\n'));
      continue;
    }

    const buf = [];
    while (i < lines.length && !isBlockStart(lines[i])) { buf.push(lines[i].trim()); i++; }
    out.push(`<p>${inline(escapeHtml(buf.join(' ')))}</p>`);
  }
  return out.join('\n');
}

/* ==========================================================================
   4. 파일 입출력
   ========================================================================== */

const readTemplate = n => fs.readFileSync(path.join(TEMPLATES, n), 'utf8');

function writeFile(relPath, content) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, e.name), dst = path.join(to, e.name);
    if (e.isDirectory()) copyDir(src, dst); else fs.copyFileSync(src, dst);
  }
}

function readMarkdownDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { slug: f.replace(/\.md$/, ''), meta, body };
  });
}

/* ==========================================================================
   5. 글 읽기 + 검사
   ========================================================================== */

const warnings = [];

/* 언어 폴더가 생기기 전에 만든 파일들(content/posts/*.md)도 계속 읽습니다.
   기본 언어(목록 첫 번째)로 취급하며, 같은 이름이 언어 폴더에도 있으면 그쪽이 이깁니다.
   → 예전 파일을 옮기지 않아도 사이트에서 사라지지 않습니다. */
const LEGACY_LOCALE = (LOCALES[0] || {}).code;

function readWithLegacy(kind, code) {
  const items = readMarkdownDir(path.join(CONTENT, kind, code));
  if (code !== LEGACY_LOCALE) return items;

  const seen = new Set(items.map(x => x.slug));
  for (const old of readMarkdownDir(path.join(CONTENT, kind))) {
    if (seen.has(old.slug)) continue;
    warnings.push(`content/${kind}/${old.slug}.md — 예전 위치입니다. content/${kind}/${code}/ 로 옮기는 것을 권합니다 (지금은 ${code} 로 처리했습니다)`);
    items.push(old);
  }
  return items;
}

function loadPosts(code) {
  return readWithLegacy('posts', code)
    .filter(p => {
      const where = `${code}/${p.slug}.md`;

      if (String(p.meta.draft) === 'true') return false;

      const missing = ['title', 'cat', 'region', 'date', 'excerpt'].filter(k => !p.meta[k]);
      if (missing.length) { warnings.push(`${where} — 빠진 항목: ${missing.join(', ')}`); return false; }

      // 파일명 규칙 (Supabase 리액션 제약과 동일)
      if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) {
        warnings.push(`${where} — 파일명은 영문 소문자·숫자·하이픈만, 80자 이내`); return false;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.meta.date))) {
        warnings.push(`${where} — date 는 YYYY-MM-DD 형식이어야 합니다 (현재 "${p.meta.date}")`); return false;
      }

      // 예전 표기 자동 변환: cat travel → places, region 서울 → seoul
      p.meta.cat    = site.categoryAliases[p.meta.cat] || p.meta.cat;
      p.meta.region = site.regionAliases[p.meta.region] || p.meta.region;

      if (!site.categories.some(c => c.slug === p.meta.cat)) {
        warnings.push(`${where} — cat 이 "${p.meta.cat}" 입니다. ${site.categories.map(c => c.slug).join(' / ')} 중 하나여야 합니다`);
        return false;
      }
      if (!regionOf(p.meta.region)) {
        warnings.push(`${where} — region 이 "${p.meta.region}" 입니다. ${site.regions.map(r => r.slug).join(' / ')} 중 하나여야 합니다`);
        return false;
      }
      return true;
    })
    // 예시글은 날짜와 상관없이 항상 뒤로, 나머지는 최신순
    .sort((a, b) => {
      const da = DEMO_POSTS.has(a.slug) ? 1 : 0, db = DEMO_POSTS.has(b.slug) ? 1 : 0;
      if (da !== db) return da - db;
      return a.meta.date < b.meta.date ? 1 : -1;
    });
}

/* ==========================================================================
   6. 조각 HTML
   ========================================================================== */

/** 언어 전환 버튼 — 그 페이지가 실제로 존재하는 언어만 보여줍니다 */
function langSwitchHTML(base, current, availability, t) {
  const items = LOCALES.filter(l => availability[l.code]);
  if (items.length < 2) return '';
  return `<div class="langs" role="group" aria-label="${escapeHtml(t.langLabel)}">
      ${items.map(l => l.code === current
        ? `<span class="lang on" aria-current="true">${escapeHtml(l.short)}</span>`
        : `<a class="lang" href="${base}${availability[l.code]}" hreflang="${l.hreflang}" lang="${l.htmlLang}">${escapeHtml(l.short)}</a>`
      ).join('\n      ')}
    </div>`;
}

/** hreflang — 같은 글의 다른 언어판을 검색엔진에 알립니다 */
function hreflangHTML(availability) {
  const rows = LOCALES.filter(l => availability[l.code]).map(l =>
    `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}/${availability[l.code]}">`
  );
  const def = availability[site.defaultLocale] || availability[LOCALES[0] && LOCALES[0].code];
  if (def && rows.length > 1) rows.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${def}">`);
  return rows.join('\n');
}

function navHTML(current, base, code, t) {
  const d = localeDir(code);
  // 카테고리는 site.config.js 에서 그대로 가져옵니다 (한 곳만 고치면 메뉴도 따라옵니다)
  const items = [
    { href: 'index.html', label: t.nav.regions, key: 'home' },
    ...site.categories.map(c => ({ href: `${c.slug}.html`, label: t.category[c.slug], key: c.slug })),
    { href: 'about.html',   label: t.nav.about,   key: 'about' },
    { href: 'contact.html', label: t.nav.contact, key: 'contact' }
  ];
  return items.map(it =>
    `<a href="${base}${d}${it.href}"${it.key === current ? ' aria-current="page"' : ''}>${escapeHtml(it.label)}</a>`
  ).join('\n      ');
}

/** 지역 카드 (홈) */
function regionCardHTML(region, base, code, counts, t) {
  const d = localeDir(code);
  const total = (counts.places || 0) + (counts.food || 0);
  const name = regionName(region.slug, code);

  if (!total) {
    return `        <div class="region empty">
          <div><span class="r-name">${escapeHtml(name)}</span><span class="r-en">${escapeHtml(region.slug)}</span></div>
          <span class="r-count">${escapeHtml(t.comingSoon)}</span>
        </div>`;
  }
  return `        <a class="region" href="${base}${d}region/${region.slug}.html" style="--r:var(--region-${region.slug})">
          <div><span class="r-name">${escapeHtml(name)}</span><span class="r-en">${escapeHtml(region.slug)}</span></div>
          <span class="r-count">${escapeHtml(t.category.places)} ${counts.places || 0} · ${escapeHtml(t.category.food)} ${counts.food || 0}</span>
        </a>`;
}

/** 글 카드 */
function cardHTML(post, base, code, t) {
  const m = post.meta;
  const d = localeDir(code);
  const thumb = m.thumb
    ? `<img src="${base}${m.thumb}" alt="${escapeHtml(m.title)}" loading="lazy">`
    : `<span class="emoji">${m.emoji || '📍'}</span>`;
  const rname = regionName(m.region, code);
  const search = [m.title, m.excerpt, rname, (m.tags || []).join(' ')].join(' ').toLowerCase();

  return `        <article class="card" data-cat="${escapeHtml(m.cat)}" data-region="${escapeHtml(m.region)}" data-search="${escapeHtml(search)}" style="--r:var(--region-${escapeHtml(m.region)})">
          <a href="${base}${d}posts/${post.slug}.html">
            <div class="card-thumb${m.thumb ? ' has-photo' : ''}">${thumb}<span class="card-tag">${escapeHtml(t.category[m.cat] || m.cat)}</span></div>
            <div class="card-body">
              <h3>${escapeHtml(m.title)}</h3>
              <p>${escapeHtml(m.excerpt)}</p>
              <div class="card-meta"><span class="dot"></span>${escapeHtml(rname)} · ${String(m.date).replace(/-/g, '.')}</div>
            </div>
          </a>
        </article>`;
}

function infoTableHTML(info) {
  if (!Array.isArray(info) || !info.length) return '';
  const rows = info.map(row => {
    const i = String(row).indexOf('|');
    if (i < 0) return '';
    return `<tr><th>${inline(escapeHtml(row.slice(0, i).trim()))}</th><td>${inline(escapeHtml(row.slice(i + 1).trim()))}</td></tr>`;
  }).join('');
  return `<div class="table-scroll"><table class="info-table"><tbody>${rows}</tbody></table></div>`;
}

/** 리액션 — 언어와 무관하게 글 슬러그 단위로 집계됩니다 */
function reactionsHTML(slug, t) {
  if (!site.supabase.url || !site.supabase.anonKey) return '';
  const buttons = site.reactions.map(r => {
    const label = (t.reactionLabels && t.reactionLabels[r.key]) || r.key;
    return `        <button class="reaction" type="button" data-key="${r.key}" aria-pressed="false" title="${escapeHtml(label)}">
          <span class="reaction-emoji">${r.emoji}</span>
          <span class="reaction-label">${escapeHtml(label)}</span>
          <span class="reaction-count" data-count="${r.key}">0</span>
        </button>`;
  }).join('\n');

  return `<section class="reactions" data-slug="${escapeHtml(slug)}"
      data-msg-error="${escapeHtml(t.reactionError)}" data-msg-load-error="${escapeHtml(t.reactionLoadError)}">
    <h2 class="reactions-title">${escapeHtml(t.reactionTitle)}</h2>
    <div class="reaction-list">
${buttons}
    </div>
    <p class="reactions-note">${escapeHtml(t.reactionNote)}</p>
  </section>`;
}

function adSlotHTML(name) {
  if (site.adsensePublisherId) {
    return `<div class="ad-slot live" data-ad="${name}">
      <!-- 광고 단위 코드 자리 (자동 광고를 쓰면 비워두어도 됩니다) -->
    </div>`;
  }
  if (site.showAdPlaceholders) return `<div class="ad-slot" data-ad="${name}">AD · ${name}</div>`;
  return '';
}

function adsenseHTML() {
  if (!site.adsensePublisherId) return '<!-- 애드센스 미설정 -->';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsensePublisherId}" crossorigin="anonymous"></script>`;
}

/** 지역색을 CSS 변수로 (style.css 는 이 변수만 참조합니다) */
function regionVarsCSS() {
  const light = site.regions.map(r => `  --region-${r.slug}:${r.color};`).join('\n');
  const dark  = site.regions.map(r => `  --region-${r.slug}:${r.colorDark};`).join('\n');
  return `<style>
:root{
${light}
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
${dark}
}}
:root[data-theme="dark"]{
${dark}
}
</style>`;
}

/* ==========================================================================
   7. 페이지 조립
   ========================================================================== */

const T = {
  base:   readTemplate('base.html'),
  home:   readTemplate('home.html'),
  region: readTemplate('region.html'),
  list:   readTemplate('list.html'),
  post:   readTemplate('post.html'),
  page:   readTemplate('page.html')
};

function renderPage(o) {
  const base = baseOf(o.out);
  const loc  = site.locales.find(l => l.code === o.code);
  return fill(T.base, {
    lang:        loc.htmlLang,
    title:       escapeHtml(o.title),
    description: escapeHtml(o.description || I18N[o.code].siteDesc),
    // 홈은 .../index.html 이 아니라 .../ 로 통일 (canonical·hreflang·sitemap 모두 같은 형태여야 함)
    canonical:   `${SITE_URL}/${o.out.replace(/index\.html$/, '')}`,
    ogType:      o.ogType || 'website',
    ogLocale:    loc.htmlLang.replace('-', '_'),
    siteName:    escapeHtml(siteName(o.code)),
    base:        base,                                  // 최상단까지 (assets 용)
    lbase:       base + localeDir(o.code),              // 그 언어의 최상단까지 (페이지 링크용)
    homeHref:    base + localeDir(o.code) + 'index.html',
    nav:         navHTML(o.current, base, o.code, I18N[o.code]),
    langs:       langSwitchHTML(base, o.code, o.availability || {}, I18N[o.code]),
    hreflang:    hreflangHTML(o.availability || {}),
    regionVars:  regionVarsCSS(),
    adsense:     adsenseHTML(),
    headExtra:   o.headExtra || '',
    body:        o.body,
    year:        new Date().getFullYear(),
    noindex:     o.noindex ? '<meta name="robots" content="noindex">' : '',
    skip:        escapeHtml(I18N[o.code].skip),
    menuOpen:    escapeHtml(I18N[o.code].menuOpen),
    footAbout:   escapeHtml(I18N[o.code].footerAbout),
    footContact: escapeHtml(I18N[o.code].footerContact),
    footPrivacy: escapeHtml(I18N[o.code].footerPrivacy),
    supabaseUrl: site.supabase.url,
    supabaseKey: site.supabase.anonKey
  });
}

/* ==========================================================================
   8. 실행
   ========================================================================== */

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 언어별 글/페이지를 먼저 전부 읽습니다 (hreflang 계산에 필요)
  const byLocale = {};
  for (const l of LOCALES) {
    byLocale[l.code] = { posts: loadPosts(l.code), pages: readWithLegacy('pages', l.code) };

    // 푸터가 항상 링크하는 3개 문서가 그 언어에 있는지 확인
    // (없으면 방문자가 푸터를 눌렀을 때 404 를 만납니다)
    for (const need of ['about', 'contact', 'privacy']) {
      if (!byLocale[l.code].pages.some(p => p.slug === need)) {
        warnings.push(`content/pages/${l.code}/${need}.md 가 없습니다 — 푸터 링크가 404 가 됩니다`);
      }
    }
  }

  /** 어떤 페이지가 어떤 언어로 존재하는지 → { ko:'posts/x.html', en:'en/posts/x.html' } */
  const availFor = (relBuilder, existsIn) => {
    // index.html 은 주소에서 떼어냅니다 (canonical 과 형태를 맞추기 위해)
    const rel = relBuilder.replace(/index\.html$/, '');
    const a = {};
    for (const l of LOCALES) if (existsIn(l.code)) a[l.code] = localeDir(l.code) + rel;
    return a;
  };

  const urls = [];   // sitemap

  for (const l of LOCALES) {
    const code = l.code, d = l.dir, t = I18N[code];
    const posts = byLocale[code].posts;
    const pages = byLocale[code].pages;

    const hasPost = (slug, c) => byLocale[c].posts.some(p => p.slug === slug);
    const hasPage = (slug, c) => byLocale[c].pages.some(p => p.slug === slug);

    /* ---- 홈 (지역 인덱스) ---- */
    const regionCards = site.regions.map(r => {
      const counts = {};
      for (const c of site.categories) {
        counts[c.slug] = posts.filter(p => p.meta.region === r.slug && p.meta.cat === c.slug).length;
      }
      return regionCardHTML(r, baseOf(d + 'index.html'), code, counts, t);
    }).join('\n');

    const homeAvail = availFor('index.html', () => true);
    writeFile(d + 'index.html', renderPage({
      out: d + 'index.html', code, current: 'home',
      title: `${siteName(code)} — ${t.tagline}`, description: t.description,
      availability: homeAvail,
      body: fill(T.home, {
        tagline: escapeHtml(t.tagline),
        description: escapeHtml(t.description),
        searchPlaceholder: escapeHtml(t.searchPlaceholder),
        findByRegion: escapeHtml(t.findByRegion),
        regionCount: escapeHtml(t.regionCount(site.regions.length)),
        regions: regionCards,
        latestTitle: escapeHtml(t.latest),
        latest: posts.map(p => cardHTML(p, baseOf(d + 'index.html'), code, t)).join('\n'),
        noResult: escapeHtml(t.noResult),
        adTop: adSlotHTML('home-top'), adBottom: adSlotHTML('home-bottom')
      })
    }));
    urls.push({ loc: d, pri: '1.0', freq: 'daily' });

    /* ---- 지역 페이지 ---- */
    for (const r of site.regions) {
      const inRegion = posts.filter(p => p.meta.region === r.slug);
      const out = d + `region/${r.slug}.html`;
      const base = baseOf(out);
      const name = regionName(r.slug, code);

      const tabs = [{ slug: 'all', label: t.all, n: inRegion.length }]
        .concat(site.categories.map(c => ({
          slug: c.slug, label: t.category[c.slug], n: inRegion.filter(p => p.meta.cat === c.slug).length
        })))
        .map((x, i) => `<button class="rtab${i === 0 ? ' on' : ''}" type="button" data-cat="${x.slug}">${escapeHtml(x.label)}<span class="n">${x.n}</span></button>`)
        .join('\n        ');

      writeFile(out, renderPage({
        out, code, current: 'home',
        title: `${name} — ${siteName(code)}`,
        description: `${name} · ${t.siteDesc}`,
        availability: availFor(`region/${r.slug}.html`, () => true),
        body: fill(T.region, {
          regionSlug: r.slug,
          regionName: escapeHtml(name),
          regionEn: escapeHtml(r.slug),
          tabs: tabs,
          cards: inRegion.length
            ? inRegion.map(p => cardHTML(p, base, code, t)).join('\n')
            : `        <p class="empty" style="grid-column:1/-1">${escapeHtml(t.empty)}</p>`,
          noResult: escapeHtml(t.noResult),
          adTop: adSlotHTML('region-top'), adBottom: adSlotHTML('region-bottom')
        })
      }));
      if (inRegion.length) urls.push({ loc: d + `region/${r.slug}.html`, pri: '0.9', freq: 'weekly' });
    }

    /* ---- 카테고리 목록 (여행지 / 맛집) ---- */
    for (const c of site.categories) {
      const inCat = posts.filter(p => p.meta.cat === c.slug);
      const out = d + `${c.slug}.html`;
      const base = baseOf(out);
      const regionsHere = ['all', ...new Set(inCat.map(p => p.meta.region))];

      writeFile(out, renderPage({
        out, code, current: c.slug,
        title: `${t.categoryTitle[c.slug]} — ${siteName(code)}`,
        description: t.categoryDesc[c.slug],
        availability: availFor(`${c.slug}.html`, () => true),
        body: fill(T.list, {
          heading: escapeHtml(t.categoryTitle[c.slug]),
          desc: escapeHtml(t.categoryDesc[c.slug]),
          searchPlaceholder: escapeHtml(t.searchPlaceholder),
          chips: inCat.length ? regionsHere.map((rs, i) =>
            `<button class="chip${i === 0 ? ' active' : ''}" type="button" data-region="${rs}">${escapeHtml(rs === 'all' ? t.all : regionName(rs, code))}</button>`
          ).join('\n        ') : '',
          cards: inCat.length
            ? inCat.map(p => cardHTML(p, base, code, t)).join('\n')
            : `        <p class="empty" style="grid-column:1/-1">${escapeHtml(t.empty)}</p>`,
          noResult: escapeHtml(t.noResult),
          adTop: adSlotHTML('list-top'), adBottom: adSlotHTML('list-bottom')
        })
      }));
      urls.push({ loc: d + `${c.slug}.html`, pri: '0.8', freq: 'daily' });
    }

    /* ---- 글 상세 ---- */
    for (const p of posts) {
      const m = p.meta;
      const out = d + `posts/${p.slug}.html`;
      const base = baseOf(out);
      const rname = regionName(m.region, code);
      const related = posts.filter(x => x.meta.region === m.region && x.slug !== p.slug).slice(0, 3);
      const relatedFallback = posts.filter(x => x.meta.cat === m.cat && x.slug !== p.slug).slice(0, 3);
      const rel = (related.length ? related : relatedFallback);

      const availability = availFor(`posts/${p.slug}.html`, c => hasPost(p.slug, c));

      const jsonLd = {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: m.title, description: m.excerpt,
        datePublished: m.date, dateModified: m.updated || m.date,
        inLanguage: l.htmlLang,
        author: { '@type': 'Person', name: siteName(code) },
        publisher: { '@type': 'Organization', name: siteName(code) },
        mainEntityOfPage: `${SITE_URL}/${out}`
      };

      writeFile(out, renderPage({
        out, code, current: m.cat, ogType: 'article',
        title: `${m.title} | ${siteName(code)}`, description: m.excerpt,
        availability,
        headExtra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
        body: fill(T.post, {
          regionSlug: m.region,
          kicker: `${escapeHtml(t.category[m.cat] || m.cat)} · ${escapeHtml(rname)}`,
          regionHref: `${base}${d}region/${m.region}.html`,
          title: escapeHtml(m.title),
          meta: `${String(m.date).replace(/-/g, '.')} ${escapeHtml(t.published)}${m.visited ? ` · ${escapeHtml(t.visited(m.visited))}` : ''}`,
          infoTable: infoTableHTML(m.info),
          content: markdown(p.body),
          adTop: adSlotHTML('post-top'), adBottom: adSlotHTML('post-bottom'),
          reactions: reactionsHTML(p.slug, t),
          related: rel.length ? `<section class="related">
    <div class="section-head"><h2>${escapeHtml(t.related)}</h2></div>
    <div class="grid">\n${rel.map(x => cardHTML(x, base, code, t)).join('\n')}\n    </div>
  </section>` : ''
        })
      }));
      urls.push({ loc: out, pri: '0.8', lastmod: m.updated || m.date });
    }

    /* ---- 소개 / 문의 / 개인정보처리방침 ---- */
    for (const pg of pages) {
      const out = d + `${pg.slug}.html`;
      const bodyMd = pg.body
        .replace(/\{\{email\}\}/g, site.email)
        .replace(/\{\{siteName\}\}/g, siteName(code));

      writeFile(out, renderPage({
        out, code, current: pg.slug,
        title: `${pg.meta.title} — ${siteName(code)}`,
        description: pg.meta.description || I18N[code].siteDesc,
        availability: availFor(`${pg.slug}.html`, c => hasPage(pg.slug, c)),
        body: fill(T.page, {
          title: escapeHtml(pg.meta.title || pg.slug),
          updated: pg.meta.updated ? escapeHtml(pg.meta.updated) : '',
          content: markdown(bodyMd)
        })
      }));
      urls.push({ loc: out, pri: '0.3' });
    }

    /* ---- 404 (언어별) ---- */
    const out404 = d + '404.html';
    writeFile(out404, renderPage({
      out: out404, code, noindex: true,
      title: `${t.notFoundTitle} — ${siteName(code)}`,
      availability: {},
      body: `  <section class="hero">
    <div class="wrap">
      <h1>${escapeHtml(t.notFoundTitle)} 🧭</h1>
      <p>${escapeHtml(t.notFoundDesc)}</p>
      <p style="margin-top:20px;"><a class="more" href="${baseOf(out404)}${d}index.html">${escapeHtml(t.backHome)} →</a></p>
    </div>
  </section>`
    }));
  }

  /* ---- sitemap ---- */
  writeFile('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u =>
      `  <url><loc>${SITE_URL}/${u.loc}</loc>` +
      (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
      (u.freq ? `<changefreq>${u.freq}</changefreq>` : '') +
      `<priority>${u.pri}</priority></url>`
    ).join('\n') + `\n</urlset>\n`
  );

  writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  if (site.adsensePublisherId) {
    writeFile('ads.txt', `google.com, ${site.adsensePublisherId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
  }

  copyDir(STATIC, DIST);

  /* ---- 요약 ---- */
  console.log('\n✅ 빌드 완료');
  for (const l of LOCALES) {
    const ps = byLocale[l.code].posts;
    const demo = ps.filter(p => DEMO_POSTS.has(p.slug)).length;
    console.log(`   [${l.code}] 글 ${ps.length}개 (실제 ${ps.length - demo} · 예시 ${demo}) · 문서 ${byLocale[l.code].pages.length}개`);
  }
  console.log(`   지역 ${site.regions.length}개 · 주소 ${urls.length}개`);

  if (warnings.length) {
    console.log('\n⚠ 건너뛴 파일');
    warnings.forEach(w => console.log('   · ' + w));
  }
  if (!site.supabase.url) console.log('\n⚠ Supabase 미설정 — 리액션 버튼이 표시되지 않습니다');
  if (!site.adsensePublisherId) console.log('⚠ 애드센스 미설정 — 광고 코드가 들어가지 않았습니다');
  if (SITE_URL.includes('example')) console.log('⚠ site.config.js 의 url 이 아직 예시 주소입니다');
}

module.exports = { markdown, parseFrontMatter, inline, escapeHtml, fill, baseOf };

if (require.main === module) build();
