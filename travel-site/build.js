/* ==========================================================================
   빌드 스크립트 — Markdown 글을 다국어 정적 사이트로 만듭니다.
   --------------------------------------------------------------------------
   외부 라이브러리를 하나도 쓰지 않습니다.

   실행:  node build.js        결과: dist/
   Cloudflare Pages 가 dist 폴더를 배포합니다.

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
const crypto = require('crypto');

const ROOT      = __dirname;
const CONTENT   = path.join(ROOT, 'content');
const TEMPLATES = path.join(ROOT, 'templates');
const STATIC    = path.join(ROOT, 'static');
const DIST      = path.join(ROOT, 'dist');

const site = require('./site.config.js');
const I18N = require('./content/i18n.js');

const SITE_URL   = site.url.replace(/\/+$/, '');
const DEMO_POSTS = new Set(site.demoPosts || []);

/* CSS·JS 파일이 바뀌면 주소도 바뀌게 하는 짧은 해시.
   /assets/* 는 브라우저가 길게 캐시하므로, 주소가 그대로면
   글을 새로 올려도 방문자는 옛 CSS·옛 JS 를 계속 씁니다.
   (실제로 저장 기능을 올렸을 때 옛 CSS 가 걸려 스타일이 빠졌습니다) */
function assetVersion() {
  const files = ['assets/style.css', 'assets/filter.js', 'assets/reactions.js', 'assets/saved.js', 'assets/totop.js'];
  const h = crypto.createHash('sha1');
  for (const f of files) {
    const p = path.join(STATIC, f);
    if (fs.existsSync(p)) h.update(fs.readFileSync(p));
  }
  return h.digest('hex').slice(0, 8);
}
const ASSET_V = assetVersion();

const LOCALES    = site.locales.filter(l => l.enabled);

/* 음식 장르 — 영어권 검색어 축 (Korean BBQ 등). site.config.js 의 genres 참고.
   글이 이 개수 이상인 장르만 검색에 노출되는 페이지로 만듭니다 (그 미만은 noindex). */
const GENRES = Array.isArray(site.genres) ? site.genres : [];
const GENRE_PAGE_MIN = Number.isInteger(site.genrePageMin) ? site.genrePageMin : 3;

/* 여행 팁: 이 슬러그의 섹션만 개별 페이지를 검색에 노출합니다 (나머지는 noindex). */
const TIPS_PAGES = new Set(Array.isArray(site.tipsPages) ? site.tipsPages : []);

/* 동네 페이지: 글이 이 개수 이상인 동네만 색인에 노출합니다. */
const AREA_PAGE_MIN = Number.isInteger(site.areaPageMin) ? site.areaPageMin : 2;

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

/* Cloudflare Pages 는 /foo.html 을 /foo 로 308 리다이렉트합니다.
   그래서 파일은 .html 로 만들지만, 링크·canonical·sitemap 은 확장자를 뗍니다.
   그러지 않으면 "정식 주소는 .html" 이라고 알리면서 실제로는 다른 주소로
   튕기게 되어 색인에 혼란을 줍니다. index.html 은 폴더 주소(/)로 바뀝니다. */
const cleanUrl = p => String(p).replace(/index[.]html$/, '').replace(/[.]html$/, '');


/* 빈 주소('')는 브라우저가 "현재 페이지"로 해석합니다.
   그래서 /travel 에서 로고나 '지역' 을 누르면 홈이 아니라 /travel 로 다시 갔습니다.
   (한국어는 접두어가 없어서 base 와 언어폴더가 둘 다 빈 문자열이 됩니다)
   빈 값은 './' 로 바꿔 그 폴더 = 사이트 최상단을 가리키게 합니다. */
const linkTo = p => (p === '' ? './' : p);
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

/* 동네(구역) — 지역 안에서 한 번 더 나눈 단위입니다.
   서울처럼 범위가 넓은 곳은 "여의도 · 명동" 처럼 갈라야 찾기 쉽습니다.
   site.config.js 의 각 region 안 areas 에 정의합니다. */
const areasOf = slug => (regionOf(slug) || {}).areas || [];
const areaName = (regionSlug, areaSlug, code) => {
  const a = areasOf(regionSlug).find(x => x.slug === areaSlug);
  return a ? (a.names[code] || a.names.en || a.slug) : '';
};

/* 음식 장르 (Korean BBQ 등). 판정 키는 한국어 글의 tags 하나만 봅니다
   (applyGeo 가 모든 언어 글에 tagKeys 로 심어줍니다). config 의 나열 순서가
   우선순위입니다 — 한 글이 여러 장르에 걸리면 먼저 나오는 장르를 씁니다. */
const genreOfSlug = slug => GENRES.find(g => g.slug === slug);
const genreName = (g, code) => {
  const x = typeof g === 'string' ? genreOfSlug(g) : g;
  return x ? (x.names[code] || x.names.en || x.slug) : (typeof g === 'string' ? g : '');
};
function genreOf(m) {
  if (m.cat !== 'food') return null;
  const keys = new Set((m.tagKeys || []).map(String));
  return GENRES.find(g => (g.tags || []).some(k => keys.has(String(k)))) || null;
}

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
      (_, alt, src) => `<img src="${src}${/^\/?assets\/img\//.test(src) ? imgVer(src) : ''}" alt="${alt}" loading="lazy">`)
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
      /* "## 제목 {#transport}" 처럼 쓰면 그 제목에 id 가 붙습니다 (앵커 링크·목차용).
         한국어·일본어 제목을 자동으로 슬러그로 만들면 읽을 수 없는 id 가 되므로
         필요한 곳에만 직접 적게 했습니다. 안 적으면 예전과 똑같이 동작합니다. */
      let text = h[2].trim(), id = '';
      const anchor = text.match(/\s*\{#([A-Za-z0-9_-]+)\}$/);
      if (anchor) { id = ` id="${anchor[1]}"`; text = text.slice(0, anchor.index).trim(); }
      out.push(`<h${lv}${id}>${inline(escapeHtml(text))}</h${lv}>`);
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


/* ---- 위치 정보는 한국어 글에만 적습니다 -----------------------------------
   lat / lng / addr / closed 는 언어가 달라도 같은 값입니다. 주소도 그렇습니다 —
   구글 지도가 링크의 hl= 에 맞춰 "서울 마포구 독막로19길 43" 을
   "43 Dongmak-ro 19-gil, Mapo-gu, Seoul" 로 알아서 바꿔서 보여줍니다.
   4개 언어 파일에 나눠 적으면 한 곳만 고치고 나머지를 잊게 되므로,
   한국어 글을 원본으로 두고 여기서 나머지 언어로 복사합니다.          */
const GEO_KEYS = ['lat', 'lng', 'addr', 'closed', 'spicy', 'order', 'orderRoman', 'season', 'seasonMode'];

function applyGeo(byLocale) {
  const base = {};
  for (const p of (byLocale.ko ? byLocale.ko.posts : [])) {
    const g = {};
    for (const k of GEO_KEYS) if (p.meta[k] !== undefined && p.meta[k] !== '') g[k] = p.meta[k];
    g.__tags = Array.isArray(p.meta.tags) ? p.meta.tags : [];   // 칩 분류 키 (한국어 기준)
    if (g.lat === undefined || g.lng === undefined) {
      warnings.push(`content/posts/ko/${p.slug}.md — lat / lng 가 없습니다 (동선 기능에서 빠집니다)`);
    }
    base[p.slug] = g;
  }
  for (const code of Object.keys(byLocale)) {
    for (const p of byLocale[code].posts) {
      const g = base[p.slug];
      if (!g) {
        if (code !== 'ko') {
          warnings.push(`content/posts/${code}/${p.slug}.md — 같은 이름의 한국어 글이 없어 위치 정보를 가져올 수 없습니다`);
        }
        continue;
      }
      for (const k of GEO_KEYS) if (p.meta[k] === undefined && g[k] !== undefined) p.meta[k] = g[k];
      /* 태그 칩의 분류 키는 한국어 글의 tags 하나만 씁니다.
         번역본의 tags 는 그 언어 검색에 계속 쓰이므로 건드리지 않고,
         칩용으로만 tagKeys 를 따로 심습니다.
         이렇게 해야 같은 글의 칩이 언어마다 달라지는 일이 없습니다. */
      p.meta.tagKeys = g.__tags || [];
    }
  }
}
/* ==========================================================================
   6. 조각 HTML
   ========================================================================== */

/** 언어 전환 버튼 — 그 페이지가 실제로 존재하는 언어만 보여줍니다 */
function langSwitchHTML(base, current, availability, t) {
  // 한국어 홈의 경로는 빈 문자열('')입니다. 빈 문자열은 거짓으로 취급되므로
  // 값의 유무는 반드시 undefined 로 판별해야 합니다. (홈에서만 버튼이 사라지던 원인)
  const items = LOCALES.filter(l => availability[l.code] !== undefined);
  if (items.length < 2) return '';
  // 넓은 화면: 각 언어를 그 언어 문자로 (한국어 · English · 日本語 · 繁體中文) — "여러 언어를 한다"는 신호.
  // 좁은 화면: 자리 부족으로 약어(KO·EN…)만 보입니다. (CSS 가 .lang-full / .lang-abbr 를 전환)
  const inner = l => `<span class="lang-full">${escapeHtml(l.label)}</span>`
    + `<span class="lang-abbr">${escapeHtml(l.short)}</span>`;
  return `<div class="langs" role="group" aria-label="${escapeHtml(t.langLabel)}">
      <span class="langs-ico" aria-hidden="true">🌐</span>
      ${items.map(l => l.code === current
        ? `<span class="lang on" lang="${l.htmlLang}" aria-current="true">${inner(l)}</span>`
        : `<a class="lang" href="${linkTo(base + availability[l.code])}" hreflang="${l.hreflang}" lang="${l.htmlLang}">${inner(l)}</a>`
      ).join('\n      ')}
    </div>`;
}

/** 언어 제안 배너
 *  방문자 브라우저 언어가 현재 페이지와 다르면 얇은 띠로 알려줍니다.
 *  ★ 자동 리다이렉트가 아닙니다. 구글 크롤러는 미국에서 접속하므로
 *    강제 이동시키면 한국어·일본어·중국어 페이지가 색인되지 않을 수 있습니다.
 *    그래서 안내만 하고 이동은 방문자가 선택합니다. */
function langSuggestHTML(base, current, availability) {
  const opts = {};
  for (const l of LOCALES) {
    if (l.code === current || availability[l.code] === undefined) continue;
    const t2 = I18N[l.code];
    opts[l.code] = { href: base + availability[l.code], msg: t2.suggestMsg, go: t2.suggestGo };
  }
  if (!Object.keys(opts).length) return '';
  return `<div class="lang-suggest" hidden data-locales="${escapeHtml(JSON.stringify(opts))}">
    <div class="wrap ls-inner">
      <span class="ls-msg"></span>
      <a class="ls-go" href="#"></a>
      <button class="ls-close" type="button" aria-label="close">✕</button>
    </div>
  </div>`;
}

/** hreflang — 같은 글의 다른 언어판을 검색엔진에 알립니다 */
function hreflangHTML(availability) {
  // 위와 같은 이유로 undefined 로 판별합니다 (한국어 홈 경로 = '')
  const rows = LOCALES.filter(l => availability[l.code] !== undefined).map(l =>
    `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}/${availability[l.code]}">`
  );
  const def = availability[site.defaultLocale] !== undefined
    ? availability[site.defaultLocale]
    : availability[LOCALES[0] && LOCALES[0].code];
  if (def !== undefined && rows.length > 1) {
    rows.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${def}">`);
  }
  return rows.join('\n');
}

function navHTML(current, base, code, t) {
  const d = localeDir(code);
  // 카테고리는 site.config.js 에서 그대로 가져옵니다 (한 곳만 고치면 메뉴도 따라옵니다)
  const items = [
    { href: '', label: t.nav.regions, key: 'home' },
    ...site.categories.map(c => ({ href: c.slug, label: t.category[c.slug], key: c.slug })),
    { href: 'tips',    label: t.nav.tips,    key: 'tips' },
    { href: 'about',   label: t.nav.about,   key: 'about' },
    { href: 'contact', label: t.nav.contact, key: 'contact' }
  ];
  return items.map(it =>
    `<a href="${linkTo(base + d + it.href)}"${it.key === current ? ' aria-current="page"' : ''}>${escapeHtml(it.label)}</a>`
  ).join('\n      ');
}

/** 지역 카드 (홈)
 *  카테고리 이름은 site.config.js 에서 그대로 가져옵니다.
 *  (전에 'places' 로 직접 적어두었다가 카테고리 이름을 바꾸면서
 *   화면에 undefined 가 찍혔습니다. 다시는 하드코딩하지 않습니다) */
function regionCardHTML(region, base, code, counts, t) {
  const d = localeDir(code);
  const total = site.categories.reduce((s, c) => s + (counts[c.slug] || 0), 0);
  const name = regionName(region.slug, code);

  // 카테고리별 개수는 배지로 나눕니다.
  // 전에는 "여행지 0 · 맛집 1" 처럼 점으로 이었는데, 서로 다른 값이라 점만으로는
  // 어디까지가 한 덩어리인지 읽히지 않았습니다. 0 인 배지는 흐리게 해서
  // "글이 있는 쪽"이 먼저 눈에 들어오게 합니다. (글이 없어도 칸은 그대로 보여줍니다)
  const countBadges = site.categories
    .map(c => {
      const n = counts[c.slug] || 0;
      const label = escapeHtml(t.category[c.slug] || c.slug);
      return `<span class="r-count${n ? '' : ' zero'}">${label}<b>${n}</b></span>`;
    })
    .join('');

  const inner = `<div><span class="r-name">${escapeHtml(name)}</span><span class="r-en">${escapeHtml(region.slug)}</span></div>
          <div class="r-counts">${countBadges}</div>`;

  if (!total) return `        <div class="region empty">\n          ${inner}\n        </div>`;

  return `        <a class="region" href="${base}${d}region/${region.slug}" style="--r:var(--region-${region.slug})">
          ${inner}
        </a>`;
}

/* ---- 대한민국 지도 -------------------------------------------------------
   해안선의 점은 실제 경도·위도를 옮긴 값입니다.
     x = (경도 - 125.9) x cos(36도) x 66 + 8      (경도 1도가 위도 1도보다
     y = (38.75 - 위도) x 66                       짧아서 x축을 압축합니다)
   그래서 태안 반도가 서쪽으로 튀고, 아산만이 안으로 파이고, 호미곶이
   동쪽으로 뾰족하고, 여수·고흥 반도가 남쪽으로 늘어집니다.

   다만 지역 경계는 직선으로 단순화한 그림입니다. 실측 행정 경계 데이터가
   아닙니다 (그 데이터는 수백 KB이고, 이 사이트는 의존성이 하나도 없습니다).
   핀 안의 숫자는 글 개수라 언어와 상관없이 읽힙니다.
   -------------------------------------------------------------------------- */

/* 남한 윤곽 — 바다 쪽 옅은 외곽선(halo)을 그리는 데만 씁니다 */
const KOREA_OUTLINE =
  'M50,61 L72,46 L99,30 L120,20 L139,9 ' +
  'L152,36 L168,66 L183,87 L195,116 L196,147 L204,176 L196,215 L178,241 ' +
  'L153,257 L143,259 L115,261 L106,265 L85,274 L61,287 L41,294 ' +
  'L34,261 L40,229 L51,183 L40,160 L29,135 L59,117 L51,106 L47,86 Z';

/* 지역 조각
   d      = 조각 모양
   label  = 글 개수 핀의 중심      r    = 핀 반지름 (도시는 조금 크게)
   name   = 지역 이름을 적을 자리   city = 서울·부산 — 도(道) 안의 도시라 나중에 그림
   isles  = 섬. ['c',cx,cy,r] 은 원, ['e',cx,cy,rx,ry] 은 타원.
            서해·남해의 섬을 넣지 않으면 한국 지도로 보이지 않습니다. */
const MAP_AREAS = {
  gyeonggi: {
    d: 'M50,61 L72,46 L99,30 L100,116 L59,117 L51,106 L47,86 Z',
    label: [88, 48], name: [80, 68],
    isles: [['e', 38, 68, 6, 7.5], ['c', 32, 85, 3]]          // 강화도, 인천 앞
  },
  gangwon: {
    d: 'M99,30 L120,20 L139,9 L152,36 L168,66 L183,87 L192,113 L137,112 L100,116 Z',
    label: [146, 54], name: [146, 74]
  },
  chungcheong: {
    d: 'M59,117 L100,116 L137,112 L130,150 L122,182 L51,183 L40,160 L29,135 Z',
    label: [85, 148], name: [85, 168],
    isles: [['e', 25, 150, 3.5, 8]]                            // 안면도
  },
  jeolla: {
    d: 'M51,183 L122,182 L112,215 L103,245 L108,262 L106,265 L85,274 L61,287 L41,294 L34,261 L40,229 Z',
    label: [68, 232], name: [68, 252],
    isles: [['c', 28, 250, 2.2], ['c', 19, 259, 3], ['c', 24, 271, 2.5],
            ['e', 26, 286, 5.5, 4], ['c', 46, 301, 4],         // 신안 군도, 진도, 완도
            ['c', 88, 287, 2.6], ['c', 99, 279, 2]]            // 고흥 앞
  },
  gyeongsang: {
    d: 'M137,112 L192,113 L195,116 L196,147 L204,176 L196,215 L178,241 L153,257 L143,259 L115,261 L108,262 L103,245 L112,215 L122,182 L130,150 Z',
    label: [158, 176], name: [158, 196],
    isles: [['e', 112, 268, 6, 4.5], ['e', 152, 265, 5.5, 5]]  // 남해도, 거제도
  },
  jeju: {
    d: 'M19,354 C19,346 30,341 43,341 C57,341 67,346 67,354 C67,362 56,367 43,367 C29,367 19,362 19,354 Z',
    label: [43, 354], name: [43, 379]
  },
  seoul: {
    d: 'M55,80 C55,73 60,70 67,70 C76,70 79,75 79,84 C79,93 74,98 67,98 C58,98 55,89 55,80 Z',
    label: [67, 85], r: 10.5, name: [67, 112], city: true
  },
  busan: {
    d: 'M165,229 C165,223 170,221 176,221 C184,221 187,227 187,236 C187,245 181,249 175,249 C167,249 165,239 165,229 Z',
    label: [175, 236], r: 10, name: [175, 264], city: true
  }
};

function koreaMapHTML(base, code, countsByRegion, t) {
  const d = localeDir(code);

  const isleHTML = a => (a.isles || []).map(i => i[0] === 'c'
    ? `<circle class="map-shape" cx="${i[1]}" cy="${i[2]}" r="${i[3]}"/>`
    : `<ellipse class="map-shape" cx="${i[1]}" cy="${i[2]}" rx="${i[3]}" ry="${i[4]}"/>`
  ).join('');

  // 서울·부산(도시)을 마지막에 그려서 경기·경상에 덮이지 않게 합니다
  const ordered = site.regions
    .filter(r => MAP_AREAS[r.slug])
    .sort((x, y) => (MAP_AREAS[x.slug].city ? 1 : 0) - (MAP_AREAS[y.slug].city ? 1 : 0));

  const areas = ordered.map(r => {
    const a = MAP_AREAS[r.slug];
    const n = countsByRegion[r.slug] || 0;
    const name = regionName(r.slug, code);
    const cls = a.city ? ' is-city' : '';

    // 조각 → 자기 경계선 → 섬 순서. 경계선은 배경색이라 바다 쪽에서는 안 보입니다.
    const body = `<path class="map-shape" d="${a.d}"/>`
      + `<path class="map-edge" d="${a.d}"/>`
      + isleHTML(a);

    // 글이 없는 지역도 자기 색을 옅게 유지합니다.
    // 전부 회색으로 칠하면 붙어 있는 빈 지역끼리 한 덩어리로 보입니다.
    if (!n) {
      return `      <g class="map-area is-empty${cls}" style="--r:var(--region-${r.slug})">
        <title>${escapeHtml(name)} 0</title>
        ${body}
      </g>`;
    }

    return `      <a class="map-area${cls}" href="${base}${d}region/${r.slug}" style="--r:var(--region-${r.slug})">
        <title>${escapeHtml(name)} ${n}</title>
        ${body}
        <circle class="map-pin" cx="${a.label[0]}" cy="${a.label[1]}" r="${a.r || 9.5}"/>
        <text class="map-count" x="${a.label[0]}" y="${a.label[1]}" dy="0.35em">${n}</text>
      </a>`;
  }).join('\n');

  /* 지역 이름은 지도 맨 위에 한 겹으로 따로 그립니다.
     각 지역의 <a> 안에 두었더니, 나중에 그려지는 옆 지역의 색이 이름 뒷부분을
     덮었습니다 ("경기·인천" 이 강원 경계에서 "경기·인" 으로 잘려 보였습니다).
     여기로 빼면 어느 지역 위로 넘어가도 글자가 온전히 남습니다.
     읽히게 하는 것은 CSS 의 paint-order:stroke — 글자 뒤에 배경색 테두리를 깝니다. */
  const names = ordered.map(r => {
    const a = MAP_AREAS[r.slug];
    const dim = (countsByRegion[r.slug] || 0) ? '' : ' is-dim';
    return `        <text class="map-name${dim}" x="${a.name[0]}" y="${a.name[1]}">${escapeHtml(regionName(r.slug, code))}</text>`;
  }).join('\n');

  // 바다 쪽 옅은 외곽선 — 그라데이션 없이 지도처럼 보이게 하는 값싼 방법입니다
  const halo = [KOREA_OUTLINE, MAP_AREAS.jeju.d]
    .map(p => `      <path class="map-halo h1" d="${p}"/>\n      <path class="map-halo h2" d="${p}"/>`)
    .join('\n');

  // 언어별 클래스 — 영어 지역명은 길어서(Gyeonggi & Incheon) CSS 로 조금 줄입니다
  return `<div class="hero-map">
    <svg class="map-lang-${code}" viewBox="8 -8 208 398" role="img" aria-label="${escapeHtml(t.findByRegion)}" xmlns="http://www.w3.org/2000/svg">
${halo}
${areas}
      <g class="map-names">
${names}
      </g>
    </svg>
  </div>`;
}

/** 글 카드 */
/** 글쓴이 한 줄.
 *  site.config.js 의 author.mapsProfile 이 비어 있으면 아무것도 안 나옵니다.
 *  조회수는 언어별로 단위가 달라서(만 / 万 / thousand) 숫자를 그대로 쓰고
 *  "이상 / 以上 / +" 을 붙입니다. 부풀린 값으로 읽히지 않게 내림값만 씁니다. */
/** 매운맛 배지 — 고추 5개 중 spicy 개수만 켭니다.
    외국인 방문자가 글을 열자마자 판단할 수 있어야 해서 상세 맨 위에 둡니다.
    맛집(food) 글에만 나옵니다. spicy 값이 없으면 아무것도 그리지 않습니다.
    기준은 "나오는 그대로" 입니다 — 따로 나오는 다대기·청양고추는 세지 않습니다. */
function spicyHTML(m, t) {
  if (m.cat !== 'food') return '';
  const n = Number(m.spicy);
  if (!Number.isInteger(n) || n < 0 || n > 5) return '';
  const name = (t.spicyNames || [])[n] || '';
  const peppers = Array.from({ length: 5 }, (_, i) =>
    `<b class="${i < n ? 'on' : 'off'}">🌶</b>`).join('');
  const aria = typeof t.spicyAria === 'function' ? t.spicyAria(n, name) : `${t.spicyLabel} ${n}/5`;
  return `      <p class="spicy spicy-${n}" role="img" aria-label="${escapeHtml(aria)}">` +
    `<span class="spicy-label">${escapeHtml(t.spicyLabel)}</span>` +
    `<span class="spicy-peppers" aria-hidden="true">${peppers}</span>` +
    `<span class="spicy-name">${escapeHtml(name)}</span></p>`;
}
/** 주문 카드 — 가게에서 직원에게 그대로 보여주는 한 문장.
    읽는 언어가 무엇이든 한글이 주인공입니다. 로마자는 발음 보조입니다.
    (영어 글의 메뉴 표기가 로마자뿐이라 정작 주문을 못 하는 문제를 메웁니다) */
function orderHTML(m, t) {
  if (m.cat !== 'food' || !m.order) return '';
  const roman = m.orderRoman
    ? `<span class="order-roman">${escapeHtml(m.orderRoman)}</span>` : '';
  // 듣기 버튼은 기본으로 숨겨 두고, 브라우저가 음성합성을 지원할 때만 filter.js 가 켭니다
  // (지원하지 않는 곳에서 눌러도 반응 없는 버튼이 보이지 않도록).
  const say = t.orderSay
    ? `<button class="order-say" type="button" hidden data-say="${escapeHtml(m.order)}"` +
      ` aria-label="${escapeHtml(t.orderSay)}">🔊 <span>${escapeHtml(t.orderSay)}</span></button>`
    : '';
  return `      <div class="order-card">` +
    `<span class="order-label">${escapeHtml(t.orderLabel)}</span>` +
    `<strong class="order-ko" lang="ko">${escapeHtml(m.order)}</strong>` +
    roman + say +
    `<span class="order-hint">${escapeHtml(t.orderHint)}</span></div>`;
}
/** 추천 코스 버튼 — 동선을 처음 쓰는 사람이 한 곳씩 담지 않아도 되게 합니다.
    실제로 글이 있는 곳만 남깁니다. 없는 slug 는 경고로 알립니다. */
function presetsHTML(posts, code, t) {
  const list = site.routes || [];
  if (!list.length) return '';
  const have = new Set(posts.map(p => p.slug));
  const cards = list.map(r => {
    const stops = (r.stops || []).filter(s => {
      if (have.has(s)) return true;
      warnings.push(`site.config.js 추천 코스 "${r.slug}" — ${s} 글이 없어 건너뜁니다`);
      return false;
    });
    if (stops.length < 2) return '';
    const name = (r.names && (r.names[code] || r.names.en)) || r.slug;
    return `        <button class="preset" type="button" data-stops="${escapeHtml(stops.join(','))}">` +
      `<span class="preset-name">${escapeHtml(name)}</span>` +
      `<span class="preset-n">${escapeHtml(t.presetStops(stops.length))}</span>` +
      `<span class="preset-go">${escapeHtml(t.presetAdd)} +</span></button>`;
  }).filter(Boolean).join('\n');
  if (!cards) return '';
  return `      <section class="presets">
        <div class="presets-head"><h2>${escapeHtml(t.presetTitle)}</h2>` +
    `<span class="presets-hint">${escapeHtml(t.presetHint)}</span></div>
        <div class="preset-list">
${cards}
        </div>
      </section>`;
}
/** 제철 배지.
    season      = 제철인 달 (쉼표. 예: 12,1,2)
    seasonMode  = only : 그 철에만 나옵니다  ·  best : 그때가 가장 좋습니다
    두 가지를 나눈 이유 — "못 먹을 수 있음"과 "그때가 제일 좋음"을 같이 표시하면
    가을에 벚꽃 카페를 보고 "제철 아님"이라 여겨 안 가는 일이 생깁니다.
    지금이 제철인지는 방문자 브라우저가 판단합니다 (빌드는 캐시되므로 "지금"을 모릅니다). */
function seasonHTML(m, t) {
  const raw = String(m.season || '').trim();
  if (!raw) return '';
  const months = raw.split(',')
    .map(x => parseInt(x, 10))
    .filter(n => n >= 1 && n <= 12);
  if (!months.length) return '';
  const mode = m.seasonMode === 'only' ? 'only' : 'best';
  const names = String(t.monthNames || '').split(',');
  const nm = n => names[n - 1] || String(n);
  // 12,1,2 처럼 해를 넘기는 경우가 있어 정렬하지 않고 적은 순서의 처음·끝을 씁니다.
  // 한 달이면 그 달만, 여러 달이면 "12월 ~ 2월" 처럼 범위로 보여줍니다.
  const label = months.length === 1
    ? nm(months[0])
    : t.monthRange(nm(months[0]), nm(months[months.length - 1]));
  const line = mode === 'only' ? t.seasonOnly(label) : t.seasonBest(label);
  return `      <p class="season season-${mode}" data-months="${months.join(',')}" data-mode="${mode}"` +
    ` data-t-off="${escapeHtml(t.seasonOff)}" data-t-now="${escapeHtml(t.seasonNow)}">` +
    `<span class="season-label">${escapeHtml(t.seasonLabel)}</span>` +
    `<span class="season-when">${escapeHtml(line)}</span>` +
    `<span class="season-now" hidden></span></p>`;
}
/** JPEG 파일의 실제 가로·세로를 읽습니다 (외부 라이브러리 없이 헤더만 파싱).
    왜 필요한가 — og:image:width/height 를 1600x1200 으로 고정해 두었는데
    실제 사진의 절반이 세로(1200x1600)라, 카카오톡·페이스북 미리보기가
    엉뚱하게 잘렸습니다. 실제 값을 넣어야 미리보기가 제대로 나옵니다.
    형식: SOI(FFD8) 뒤로 마커를 따라가다 SOF0/1/2 에서 크기를 읽습니다. */
const jpegSizeCache = {};
function jpegSize(relPath) {
  if (relPath in jpegSizeCache) return jpegSizeCache[relPath];
  let out = null;
  try {
    const buf = fs.readFileSync(path.join(STATIC, relPath));
    if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xFF) { i++; continue; }          // 마커 시작을 찾습니다
        const marker = buf[i + 1];
        if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { i += 2; continue; }
        const len = buf.readUInt16BE(i + 2);
        // SOF0(베이스라인) · SOF1 · SOF2(프로그레시브) 에 크기가 들어 있습니다
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          out = { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
          break;
        }
        i += 2 + len;
      }
    }
  } catch (e) { /* 파일이 없거나 형식이 다르면 그냥 넘어갑니다 */ }
  jpegSizeCache[relPath] = out;
  return out;
}

/** 이미지 주소 뒤에 ?v=<파일해시> 를 붙입니다.
    같은 파일명으로 사진 내용만 바꿔도 주소가 달라지므로, _headers 의
    'Cache-Control: immutable' 로 1년 고정 캐시된 브라우저·CDN 도 새 그림을 받습니다.
    CSS·JS 는 base.html 에서 ?v={{v}} 로 이미 처리되지만 이미지는 빠져 있었습니다. */
const _imgVer = {};
function imgVer(rel) {
  if (!rel) return '';
  const key = String(rel).replace(/[?#].*$/, '').replace(/^\//, '');
  if (key in _imgVer) return _imgVer[key];
  let v = '';
  try {
    v = '?v=' + crypto.createHash('sha1').update(fs.readFileSync(path.join(STATIC, key))).digest('hex').slice(0, 8);
  } catch (e) { /* 파일이 없으면 버전 없이 둡니다 */ }
  _imgVer[key] = v;
  return v;
}

/** 목록 카드용 작은 사진 (assets/img/sm/…). tools/optimize-images.ps1 이 만듭니다.
    카드는 화면에 255~350px 로 그려지는데 원본(1200~1600px)을 그대로 보내면
    홈을 끝까지 스크롤할 때 썸네일만 12MB 였습니다. 파일이 없으면 원본을 씁니다. */
function cardThumbPath(thumb) {
  if (!thumb) return null;
  const m = String(thumb).match(/^(.*\/)([^\/]+)$/);
  if (!m) return null;
  const small = `${m[1]}sm/${m[2]}`;
  try {
    fs.accessSync(path.join(STATIC, small));
    return small;
  } catch (e) { return null; }
}
/** 글 하단 태그 칩.
    --------------------------------------------------------------------------
    분류 키는 한국어 글의 tags 하나만 봅니다 (applyGeo 가 tagKeys 로 심어줍니다).
    그중 site.config.js 의 tagChips 에 등록된 것만 칩으로 나오고,
    화면에 보이는 이름은 그 언어의 names 를 씁니다.

    전에는 언어별 글마다 태그를 따로 적어서, 같은 글인데 한국어는 칩 3개,
    일본어는 0개가 되는 일이 41개 중 30개에서 생겼습니다. 이제 구조상 불가능합니다.

    칩은 태그별 페이지를 만들지 않고 홈 검색으로 보냅니다 (/?q=심야).
    글 한두 개짜리 얇은 페이지를 늘리면 색인에 불리하기 때문입니다. */
const TAG_CHIPS = Array.isArray(site.tagChips) ? site.tagChips : [];
const TAG_BY_KEY = new Map(TAG_CHIPS.map(x => [String(x.key), x]));

/** 그 언어에서 보여줄 태그 이름 (없으면 한국어 키를 그대로) */
function tagName(entry, code) {
  return (entry.names && (entry.names[code] || entry.names.ko)) || entry.key;
}

/** 이 글에 붙는 칩 목록 — 등록된 순서를 따릅니다 (글마다 순서가 흔들리지 않게) */
function chipsOf(m) {
  const keys = new Set((m.tagKeys || []).map(x => String(x).trim()));
  return TAG_CHIPS.filter(e => keys.has(e.key));
}

function tagChipsHTML(m, base, code, t) {
  const list = chipsOf(m).slice(0, 6);   // 너무 많으면 칩이 지저분해집니다
  if (!list.length) return '';
  const d = localeDir(code);
  const chips = list.map(e => {
    const name = tagName(e, code);
    return `<a class="tagchip" href="${linkTo(base + d)}?q=${encodeURIComponent(name)}">${escapeHtml(name)}</a>`;
  }).join('');
  return `    <nav class="tagchips" aria-label="${escapeHtml(t.tagLabel)}">` +
    `<span class="tagchips-label">${escapeHtml(t.tagLabel)}</span>${chips}</nav>`;
}

/** 글 하단 "이 근처 같이 가기 좋은 곳" 추천.
 *  같은 동네 → 같은 지역(다른 동네) 순으로 지리적 이웃을 먼저 모으고,
 *  3개가 안 되면 같은 분류(맛집/여행지)에서 채웁니다. 최대 4개.
 *  각 묶음 안에서는 반대 분류를 먼저 놓습니다 — 맛집 글엔 근처 여행지가,
 *  여행지 글엔 근처 맛집이 먼저 보이게. 그다음 최신순.
 *  지리적 이웃이 하나라도 있으면 geo:true → "이 근처" 제목을 씁니다. */
function nearbyPosts(p, all) {
  const m = p.meta;
  const rest = all.filter(x => x.slug !== p.slug);
  const mix = arr => {
    const a = arr.slice().sort((x, y) => String(y.meta.date).localeCompare(String(x.meta.date)));
    return [...a.filter(x => x.meta.cat !== m.cat), ...a.filter(x => x.meta.cat === m.cat)];
  };
  const sameArea = m.area
    ? mix(rest.filter(x => x.meta.region === m.region && x.meta.area === m.area))
    : [];
  const sameRegion = mix(rest.filter(x =>
    x.meta.region === m.region && (!m.area || x.meta.area !== m.area)));
  const geo = [];
  for (const x of [...sameArea, ...sameRegion]) if (!geo.includes(x)) geo.push(x);
  const list = geo.slice(0, 4);
  if (list.length < 3) {
    const seen = new Set(list.map(x => x.slug));
    for (const x of mix(rest.filter(x => x.meta.cat === m.cat))) {
      if (list.length >= 4) break;
      if (!seen.has(x.slug)) { list.push(x); seen.add(x.slug); }
    }
  }
  return { list, geo: geo.length > 0 };
}

/** 목록·지역·동네·장르·카테고리 페이지 상단의 소개 문단 블록.
 *  text: 줄바꿈으로 문단을 나눈 평문 (**굵게**·[글자](주소) 허용). 비어 있으면 블록 자체를 만들지 않습니다.
 *  이런 페이지가 "제목 + 카드 목록"만 있으면 검색엔진이 알맹이 없는 페이지로 봅니다. */
function pageIntroHTML(text, accentSlug) {
  const paras = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!paras.length) return '';
  const style = accentSlug ? ` style="--r:var(--region-${accentSlug})"` : '';
  return `  <div class="wrap page-intro"${style}>\n`
    + paras.map(p => `    <p>${inline(escapeHtml(p))}</p>`).join('\n')
    + '\n  </div>\n';
}

/** "내 주변" 위젯 — 버튼 + 상시 안내문 + 지도 모달을 한 덩어리로 만듭니다.
 *  홈·카테고리·지역·동네·장르 페이지에서 같은 마크업을 씁니다 (예전에는 홈 템플릿에만 인라인으로 있었습니다).
 *  filter.js 의 near IIFE 가 .near[data-target] → 그 id 의 .grid 를 찾아 동작합니다.
 *  gridId: 홈=latest-grid, 카테고리/장르/동네=list-grid, 지역=region-grid. */
function nearWidgetHTML(t, code, gridId) {
  const e = escapeHtml;
  return `  <div class="nearbar">
    <div class="near" data-target="${e(gridId)}"
         data-t-busy="${e(t.nearBusy)}" data-t-done="${e(t.nearDone)}" data-t-deny="${e(t.nearDeny)}"
         data-t-far="${e(t.nearFar)}" data-t-none="${e(t.nearNone)}"
         data-t-me="${e(t.nearMe)}" data-t-empty="${e(t.nearEmpty('{n}'))}" data-t-count="${e(t.nearCount('{n}'))}"
         data-hl="${e(code)}">
      <button class="near-btn" type="button" title="${e(t.nearTitle)}">
        <span class="near-btn-ico" aria-hidden="true">📍</span><span class="near-btn-tx">${e(t.nearTitle)}</span>
      </button>
      <span class="near-msg" aria-live="polite"></span>
    </div>
    <p class="near-hint">${e(t.nearHint)}</p>
  </div>
  <div class="nearmodal" hidden role="dialog" aria-modal="true" aria-label="${e(t.nearTitle)}">
    <div class="nm-panel">
      <div class="nm-head">
        <strong class="nm-title">📍 ${e(t.nearTitle)}</strong>
        <span class="nm-msg" aria-live="polite"></span>
        <button class="nm-close" type="button" aria-label="${e(t.nearClose)}">✕</button>
      </div>
      <div class="nm-radius" role="group">
        <button type="button" data-km="1">1km</button>
        <button type="button" data-km="3" class="on">3km</button>
        <button type="button" data-km="10">10km</button>
        <button type="button" data-km="0">${e(t.nearAll)}</button>
      </div>
      <div class="nm-mapwrap">
        <div class="nm-map"></div>
        <div class="nm-zoom">
          <button class="nm-in" type="button" aria-label="${e(t.nearZoomIn)}">+</button>
          <button class="nm-out" type="button" aria-label="${e(t.nearZoomOut)}">−</button>
        </div>
      </div>
      <ul class="nm-list"></ul>
    </div>
  </div>
`;
}

/* 동네 페이지 소개 문장 — 데이터(글 수·분류·장르)로 조립해 페이지마다 다르게 나옵니다.
   손으로 쓴 것처럼 읽히도록 언어별로 문장을 따로 뒀습니다. */
const AREA_INTRO = {
  ko: {
    lead: (r, a, n, f, tv) =>
      (f && tv) ? `${r} ${a}에서 직접 다녀와 적은 곳이 모두 ${n}곳 있습니다. 먹을 곳과 볼 곳이 섞여 있습니다.`
      : tv      ? `${r} ${a}에서 직접 다녀와 적은 여행지가 ${n}곳 있습니다.`
      :           `${r} ${a}에서 직접 다녀와 적은 맛집이 ${n}곳 있습니다.`,
    food:   gs => `${gs.join(', ')} 쪽이 많습니다.`,
    travel:     `대체로 걸으면서 둘러보기 좋은 곳들입니다.`,
    closers: [
      `가격대와 주문 방법, 붐비는 시간대까지 가기 전에 알면 좋은 것 위주로 적었습니다.`,
      `관광객이 실제로 편한지, 어떻게 주문하는지를 함께 적었습니다.`,
      `아래 목록에서 각 글로 들어가면 지도와 동선을 확인할 수 있습니다.`,
    ],
  },
  en: {
    lead: (r, a, n, f, tv) =>
      (f && tv) ? `${n} places in ${a}, ${r}, that we visited in person — a mix of where to eat and what to see.`
      : tv      ? `${n} places to visit in ${a}, ${r}, that we went to in person.`
      :           `${n} restaurants in ${a}, ${r}, that we ate at in person.`,
    food:   gs => `Mostly ${gs.join(', ')}.`,
    travel:     `Most of them are spots you take in on foot.`,
    closers: [
      `We note the price range, how to order, and when it gets busy — the things worth knowing before you go.`,
      `Each write-up covers how tourist-friendly the place is and how ordering works.`,
      `Open any entry below for its map and how it fits into a route.`,
    ],
  },
  ja: {
    lead: (r, a, n, f, tv) =>
      (f && tv) ? `${r}・${a}で実際に足を運んで書いた場所が全部で${n}か所あります。食べる所と見る所が混ざっています。`
      : tv      ? `${r}・${a}で実際に足を運んで書いた観光スポットが${n}か所あります。`
      :           `${r}・${a}で実際に食べて書いた店が${n}軒あります。`,
    food:   gs => `${gs.join('・')}が多めです。`,
    travel:     `だいたいは歩いて回れる場所です。`,
    closers: [
      `価格帯・注文方法・混む時間帯まで、行く前に知っておくと楽なことを中心に書きました。`,
      `観光客にとって使いやすいか、どう注文するかも一緒に書いています。`,
      `下の一覧から各記事に入ると、地図と動線を確認できます。`,
    ],
  },
  zh: {
    lead: (r, a, n, f, tv) =>
      (f && tv) ? `在${r}${a}親自跑過、寫下來的地方共有${n}處，吃的和逛的都有。`
      : tv      ? `在${r}${a}親自去過、寫下來的景點有${n}處。`
      :           `在${r}${a}親自吃過、寫下來的餐廳有${n}家。`,
    food:   gs => `以${gs.join('、')}居多。`,
    travel:     `大多是可以邊走邊看的地方。`,
    closers: [
      `價位、點餐方式、什麼時候人多 —— 這些出發前知道會比較輕鬆的事，都寫進去了。`,
      `每一篇也都寫了對遊客友不友善、怎麼點餐。`,
      `從下面的清單點進各篇，可以看到地圖和動線。`,
    ],
  },
};

/** 동네 페이지 소개 문단(평문). renderPage 전에 pageIntroHTML 로 감쌉니다. */
function areaIntroText(rSlug, aSlug, code, inArea) {
  const L = AREA_INTRO[code] || AREA_INTRO.en;
  const rName = regionName(rSlug, code);
  const aName = areaName(rSlug, aSlug, code);
  const food = inArea.filter(p => p.meta.cat === 'food');
  const travel = inArea.filter(p => p.meta.cat === 'travel');

  const gset = new Set();
  for (const p of food) { const g = genreOf(p.meta); if (g) gset.add(g.slug); }
  const gNames = GENRES.filter(g => gset.has(g.slug)).slice(0, 3).map(g => genreName(g, code));

  const parts = [L.lead(rName, aName, inArea.length, food.length, travel.length)];
  if (food.length && gNames.length) parts.push(L.food(gNames));
  else if (travel.length && !food.length) parts.push(L.travel);
  parts.push(L.closers[aSlug.length % L.closers.length]);
  return parts.join(' ');
}

const NAME_SEP = { ko: ' · ', ja: '・', zh: '、', en: ', ' };

/** 장르 페이지 소개 문단(평문). i18n 의 genreIntroTpl 에 글 수·지역을 채웁니다. */
function genreIntroText(g, code, inGenre) {
  const t = I18N[code];
  const tpl = t.genreIntroTpl || t.genreDescTpl || '';
  const regionNames = [...new Set(inGenre.map(p => p.meta.region))].map(rs => regionName(rs, code));
  return String(tpl)
    .replace('{name}', genreName(g, code))
    .replace('{count}', String(inGenre.length))
    .replace('{regions}', regionNames.join(NAME_SEP[code] || ', '));
}

function bylineHTML(t) {
  const a = site.author || {};
  if (!a.mapsProfile) return '';
  const cred = String(t.authorCred || '')
    .replace('{level}', String(a.guideLevel || ''))
    .replace('{views}', Number(a.photoViewsFloor || 0).toLocaleString('en-US'));
  return `<p class="byline">${escapeHtml(t.authorBy)} `
    + `<a href="${escapeHtml(a.mapsProfile)}" rel="author noopener" target="_blank">`
    + `${escapeHtml(a.name)}</a>`
    + `<span class="byline-cred">${escapeHtml(cred)}</span></p>`;
}

/** JSON-LD 의 글쓴이. sameAs 로 구글 지도 기여 프로필을 가리켜서
 *  "이 글을 쓴 사람"이 검색엔진에서 하나의 실체로 잡히게 합니다. */
function authorLd(code) {
  const a = site.author || {};
  if (!a.mapsProfile) return { '@type': 'Person', name: siteName(code) };
  return { '@type': 'Person', name: a.name, url: a.mapsProfile, sameAs: [a.mapsProfile] };
}

/** 제목에서 앞부분(가게·장소 이름)만 뽑습니다.
 *  글 제목은 "철원막국수 — 비빔메밀면, 간이…" 처럼 "이름 — 설명" 형태라,
 *  빵부스러기 마지막 칸에는 설명을 떼고 이름만 보여줍니다.
 *  대시 뒤에는 항상 공백이 있고, 앞에는 없을 수도 있습니다
 *  (일부 일본어·중국어 제목은 "河東館）— 설명" 처럼 괄호에 붙습니다).
 *  구분자(— 또는 –)가 없으면 제목을 그대로 씁니다. */
function titleParts(title) {
  const s = String(title);
  const sep = s.match(/\s*[—–]\s+/);
  if (!sep || sep.index === 0) return { name: s.trim(), sub: '' };
  return { name: s.slice(0, sep.index).trim(), sub: s.slice(sep.index + sep[0].length).trim() };
}
function shortTitle(title) {
  return titleParts(title).name || String(title);
}
/** 제목을 화면용 두 조각 HTML 로 — 이름(대시 앞)은 크게, 설명(대시 뒤)은 작게.
    <title>·OG 등 메타에는 쓰지 않습니다. 거기서는 원래 제목 문자열을 그대로 씁니다. */
function titleHTML(title) {
  const { name, sub } = titleParts(title);
  return sub
    ? `<span class="t-name">${escapeHtml(name)}</span><span class="t-sub">${escapeHtml(sub)}</span>`
    : `<span class="t-name">${escapeHtml(name)}</span>`;
}

/** 이 글이 소개하는 실제 장소 (구조화 데이터).
 *  food → Restaurant, 여행지(travel) → TouristAttraction. 둘 다 schema.org Place 하위입니다.
 *  프론트매터에 이미 있는 값(주소·좌표·지도·사진·전화)만 씁니다.
 *  영업시간·가격처럼 "잦은 변동으로 확인 필요"가 붙는 값과 별점(aggregateRating)은 넣지 않습니다 —
 *  확인되지 않은 것을 사실처럼 구조화하지 않는다는 사이트 원칙과 같고,
 *  검증 불가한 자체 별점은 구글 정책 위반 위험이 있습니다. */
function placeLd(m, pageUrl) {
  const node = {
    '@type': m.cat === 'food' ? 'Restaurant' : 'TouristAttraction',
    '@id':   pageUrl + '#place',
    name:    m.title,
    url:     pageUrl
  };
  if (m.excerpt) node.description = m.excerpt;
  if (m.thumb)   node.image = `${SITE_URL}/${m.thumb}${imgVer(m.thumb)}`;

  if (m.addr) {
    node.address = { '@type': 'PostalAddress', streetAddress: m.addr, addressCountry: 'KR' };
  }
  const lat = parseFloat(m.lat), lng = parseFloat(m.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    node.geo = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
  }
  if (m.map) node.hasMap = m.map;

  // 전화번호는 info 표 안에 자유 텍스트로만 있습니다 (언어별 라벨은 달라도 숫자는 같음).
  const tel = (Array.isArray(m.info) ? m.info.join(' ') : '').match(/0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/);
  if (tel) node.telephone = tel[0].replace(/\s+/g, '');

  return node;
}

/** 검색결과에 "사이트 › 맛집 › 서울 › 명동 › 글" 경로를 보여주는 빵부스러기.
 *  맛집 글은 두 번째 단계가 'Food' 대신 음식 장르. 동네(area)가 있으면 지역 다음에 한 단계. */
function breadcrumbLd(m, code, pageUrl) {
  const d = localeDir(code), t = I18N[code];
  const g = genreOf(m);
  const second = g
    ? { name: genreName(g, code),       item: `${SITE_URL}/${d}food/${g.slug}` }
    : { name: t.category[m.cat] || m.cat, item: `${SITE_URL}/${d}${m.cat}` };
  const an = m.area ? areaName(m.region, m.area, code) : '';
  const crumbs = [
    { name: siteName(code),            item: `${SITE_URL}/${d}` },
    second,
    { name: regionName(m.region, code), item: `${SITE_URL}/${d}region/${m.region}` }
  ];
  if (an) crumbs.push({ name: an, item: `${SITE_URL}/${d}${m.region}/${m.area}` });
  crumbs.push({ name: shortTitle(m.title), item: pageUrl });
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: c.item
    }))
  };
}

/** 음식 장르 페이지의 구조화 데이터 — CollectionPage + 글 목록(ItemList) + 빵부스러기. */
function genrePageLd(g, code, list, out) {
  const d = localeDir(code);
  const url = `${SITE_URL}/${cleanUrl(out)}`;
  const gname = genreName(g, code);
  const loc = site.locales.find(l => l.code === code) || {};
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url, url: url,
        name: String(I18N[code].genreTitleTpl).replace('{name}', gname),
        inLanguage: loc.htmlLang,
        isPartOf: { '@type': 'WebSite', name: siteName(code), url: `${SITE_URL}/${d}` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: list.length,
          itemListElement: list.map((p, i) => ({
            '@type': 'ListItem', position: i + 1,
            url: `${SITE_URL}/${cleanUrl(d + 'posts/' + p.slug + '.html')}`,
            name: shortTitle(p.meta.title)
          }))
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { name: siteName(code),                     item: `${SITE_URL}/${d}` },
          { name: I18N[code].category.food || 'Food', item: `${SITE_URL}/${d}food` },
          { name: gname,                              item: url }
        ].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }))
      }
    ]
  };
}

/** 눈에 보이는 빵부스러기 — 글 상단의 "사이트 › 맛집 › 서울 › 명동" 경로.
 *  단계는 breadcrumbLd(JSON-LD) 와 같습니다. 마지막(현재 글)은 링크 없이 텍스트. */
function breadcrumbHTML(m, base, code, t) {
  const d = localeDir(code);
  const sep = '<span class="crumb-sep" aria-hidden="true">›</span>';
  const g = genreOf(m);
  const second = g
    ? `<a href="${base}${d}food/${g.slug}">${escapeHtml(genreName(g, code))}</a>`
    : `<a href="${base}${d}${escapeHtml(m.cat)}">${escapeHtml(t.category[m.cat] || m.cat)}</a>`;
  const links = [
    `<a href="${linkTo(base + d)}">${escapeHtml(siteName(code))}</a>`,
    second,
    `<a href="${base}${d}region/${escapeHtml(m.region)}">${escapeHtml(regionName(m.region, code))}</a>`
  ];
  const an = m.area ? areaName(m.region, m.area, code) : '';
  if (an) links.push(`<a href="${base}${d}${escapeHtml(m.region)}/${escapeHtml(m.area)}">${escapeHtml(an)}</a>`);
  return `<nav class="crumbs" aria-label="${escapeHtml(t.crumbLabel || 'Breadcrumb')}">`
    + links.join(sep) + sep
    + `<span class="crumb-current" aria-current="page">${escapeHtml(shortTitle(m.title))}</span></nav>`;
}

/** 음식 장르 칩 줄 — /food 와 각 장르 페이지 상단에 놓아 서로를 잇습니다
 *  (사람에게는 탐색 경로, 검색엔진에는 크롤 경로).
 *  countsByGenre 에 글이 있는 장르만 보여줍니다. currentSlug 는 눌린 상태로. */
function genreNavHTML(code, base, countsByGenre, currentSlug) {
  const d = localeDir(code);
  const live = GENRES.filter(g => (countsByGenre[g.slug] || 0) > 0);
  if (live.length < 2) return '';
  const items = live.map(g => {
    const name = escapeHtml(genreName(g, code));
    return g.slug === currentSlug
      ? `<span class="chip active" aria-current="page">${name}</span>`
      : `<a class="chip" href="${base}${d}food/${g.slug}">${name}</a>`;
  }).join('');
  return `      <nav class="genre-nav" aria-label="${escapeHtml(I18N[code].nav.food)}">${items}</nav>`;
}

/** tips.md 를 섹션별로 쪼갭니다. "## 제목 {#슬러그}" 를 경계로,
 *  첫 ## 앞은 intro. 반환: { intro, sections:[{slug,title,body}] } */
function splitTipsSections(body) {
  const lines = String(body).replace(/\r\n/g, '\n').split('\n');
  const intro = [];
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(.*?)\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
    if (h) {
      if (cur) sections.push(cur);
      cur = { slug: h[2], title: h[1].trim(), body: [] };
    } else if (cur) {
      cur.body.push(line);
    } else {
      intro.push(line);
    }
  }
  if (cur) sections.push(cur);
  return {
    intro: intro.join('\n').trim(),
    sections: sections.map(s => ({ slug: s.slug, title: s.title, body: s.body.join('\n').trim() }))
  };
}

/** 섹션 제목에서 앞 번호("1. ")를 뗍니다 — 개별 페이지에서는 목록 번호가 의미 없습니다. */
const tipsSectionTitle = raw => String(raw).replace(/^\d+\.\s*/, '').trim();

/** 마크다운을 대충 걷어낸 한 줄 — 개별 팁 페이지의 meta description 용. */
function plainSummary(md, max) {
  const line = String(md).split('\n').map(s => s.trim())
    .find(s => s && !/^[#>|]/.test(s) && !/^[-*]\s/.test(s) && !/^\d+\.\s/.test(s));
  if (!line) return '';
  const txt = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
  return txt.length > max ? txt.slice(0, max - 1).trim() + '…' : txt;
}

/** 여행 팁으로 보내는 한 줄 넛지 — 글·장르 페이지에서 씁니다.
 *  식당을 보다 "가야겠다" 싶은 순간에 도착 첫날 실용 정보로 연결합니다. */
function tipsNudgeHTML(base, code, t) {
  const d = localeDir(code);
  return `    <a class="tips-nudge" href="${base}${d}tips">`
    + `<span class="tips-nudge-ico" aria-hidden="true">🧭</span>`
    + `<span class="tips-nudge-text">${escapeHtml(t.tipsNudge)}</span>`
    + `<span class="tips-nudge-go" aria-hidden="true">→</span></a>`;
}

/** 홈의 "무엇을 먹지?" 블록 — 음식 장르로 바로 들어가는 카드.
 *  글이 있는 장르만, config 순서(우선순위)대로. noindex 장르도 사람은 눌러서 볼 수
 *  있어야 하니 색인 여부와 상관없이 전부 넣습니다. 장르가 3개 미만이면 아예 안 그립니다. */
function homeGenresHTML(base, code, countsByGenre, t) {
  const d = localeDir(code);
  // 홈에서는 글이 2개 이상인 장르만 (한 곳짜리 카드는 빈약해 보입니다).
  // 전체 목록은 /food 상단의 장르 칩 줄에 있습니다.
  const live = GENRES.filter(g => (countsByGenre[g.slug] || 0) >= 2);
  if (live.length < 3) return '';
  const cards = live.map(g => {
    const n = countsByGenre[g.slug] || 0;
    return `        <a class="genre-card" href="${base}${d}food/${g.slug}">
          <span class="genre-emoji" aria-hidden="true">${g.emoji || '🍽'}</span>
          <span class="genre-name">${escapeHtml(genreName(g, code))}</span>
          <span class="genre-sub">${escapeHtml(t.nearCount(n))}</span>
        </a>`;
  }).join('\n');
  return `    <section class="section">
      <div class="section-head">
        <h2>${escapeHtml(t.genreHomeTitle)}</h2>
        <span class="more">${escapeHtml(t.genreHomeHint)}</span>
      </div>
      <div class="genres">
${cards}
      </div>
    </section>`;
}

/** 카테고리 · 지역 · 동네 배지.
 *  전에는 "맛집 · 서울" 처럼 점으로 이었는데, 각각 눌러야 할 정보라 배지로 나눴습니다.
 *  지역만 지역색을 채우고 나머지는 테두리만 둡니다 (색을 더 쓰면 시끄러워집니다).
 *  linked=false 는 카드 안에서 씁니다 — 카드 전체가 링크라 그 안에 링크를 겹칠 수 없습니다. */
function badgesHTML(m, base, code, t, linked) {
  const d   = localeDir(code);
  const rs  = escapeHtml(m.region);
  const rn  = escapeHtml(regionName(m.region, code));
  const an  = escapeHtml(areaName(m.region, m.area, code));
  const rows = [];

  // 첫 배지: 맛집 글은 'Food' 대신 음식 장르(Korean BBQ 등). 장르가 없으면 카테고리.
  const g = genreOf(m);
  if (g) {
    const gn = escapeHtml(genreName(g, code));
    rows.push(linked
      ? `<a class="badge badge-genre" href="${base}${d}food/${g.slug}">${gn}</a>`
      : `<span class="badge badge-genre">${gn}</span>`);
  } else {
    const cat = escapeHtml(t.category[m.cat] || m.cat);
    rows.push(linked
      ? `<a class="badge" href="${base}${d}${escapeHtml(m.cat)}">${cat}</a>`
      : `<span class="badge">${cat}</span>`);
  }
  rows.push(linked
    ? `<a class="badge badge-region" href="${base}${d}region/${rs}" style="--r:var(--region-${rs})">${rn}</a>`
    : `<span class="badge badge-region" style="--r:var(--region-${rs})">${rn}</span>`);
  if (an) rows.push(linked
    ? `<a class="badge" href="${base}${d}${escapeHtml(m.region)}/${escapeHtml(m.area)}">${an}</a>`
    : `<span class="badge">${an}</span>`);
  return `<div class="badges">${rows.join('')}</div>`;
}

/** 카드용 매운맛 칩 — 고추만, 글자 없이. 상세의 spicyHTML 과 같은 기준입니다.
    0(안 매움)과 값 없음은 카드에서 생략합니다 — 칸이 좁고, 칩이 없으면 "매운 집 아님"으로 읽힙니다. */
function cardSpicyHTML(m, t) {
  if (m.cat !== 'food') return '';
  const n = Number(m.spicy);
  if (!Number.isInteger(n) || n < 1 || n > 5) return '';
  const name = (t.spicyNames || [])[n] || '';
  const aria = typeof t.spicyAria === 'function' ? t.spicyAria(n, name) : `${t.spicyLabel} ${n}/5`;
  const peppers = Array.from({ length: 5 }, (_, i) =>
    `<b class="${i < n ? 'on' : 'off'}">🌶</b>`).join('');
  return `<span class="card-spicy spicy-${n}" role="img" aria-label="${escapeHtml(aria)}">${peppers}</span>`;
}

function cardHTML(post, base, code, t) {
  const m = post.meta;
  const d = localeDir(code);
  // 카드에는 작은 사진(sm)을 씁니다. 없으면 원본으로 물러납니다.
  // width/height 를 적어두면 사진이 오기 전에도 칸이 잡혀 화면이 덜 흔들립니다.
  const cardImg = cardThumbPath(m.thumb) || m.thumb;
  const thumb = m.thumb
    ? `<img src="${base}${cardImg}${imgVer(cardImg)}" alt="${escapeHtml(m.title)}" loading="lazy" decoding="async" width="700" height="525">`
    : `<span class="emoji">${m.emoji || '📍'}</span>`;
  const rname = regionName(m.region, code);
  const aname = areaName(m.region, m.area, code);
  // 주소도 검색 대상입니다. 관광객은 "남대문", "와우산로" 처럼 주소로 찾는 일이 많습니다.
  // 칩은 /?q=<그 언어 이름> 으로 보냅니다. 그 이름이 검색에 걸려야 결과가 나옵니다.
  const chipNames = chipsOf(m).map(e => tagName(e, code)).join(' ');
  const search = [m.title, m.excerpt, rname, aname, m.addr, (m.tags || []).join(' '), chipNames].join(' ').toLowerCase();

  return `        <article class="card" data-slug="${post.slug}" data-cat="${escapeHtml(m.cat)}" data-region="${escapeHtml(m.region)}" data-area="${escapeHtml(m.area || '')}" data-lat="${escapeHtml(m.lat || '')}" data-lng="${escapeHtml(m.lng || '')}" data-addr="${escapeHtml(m.addr || '')}" data-closed="${escapeHtml(m.closed || '')}" data-search="${escapeHtml(search)}" style="--r:var(--region-${escapeHtml(m.region)})">
          <a href="${base}${d}posts/${post.slug}">
            <div class="card-thumb${m.thumb ? ' has-photo' : ''}">${thumb}<span class="card-tag">${escapeHtml(t.category[m.cat] || m.cat)}</span></div>
            <div class="card-body">
              <h3>${titleHTML(m.title)}</h3>
              <p>${escapeHtml(m.excerpt)}</p>
              <div class="card-meta"><span class="badge badge-region" style="--r:var(--region-${escapeHtml(m.region)})">${escapeHtml(rname)}</span>${aname ? `<span class="badge">${escapeHtml(aname)}</span>` : ''}${cardSpicyHTML(m, t)}<time class="card-date">${String(m.date).replace(/-/g, '.')}</time></div>
            </div>
          </a>
          ${saveBtnHTML(post.slug, t, false)}
        </article>`;
}

/** 글 상단 정보표.
 *  info: 항목은 "라벨|값" 형태이고, 값 안에 [글자](주소) 링크도 쓸 수 있습니다.
 *  프론트매터에 map: 이 있으면 지도 바로가기 줄이 맨 아래에 자동으로 붙습니다.
 *  (관광객은 주소를 읽기보다 눌러서 지도를 여는 쪽이 훨씬 편합니다) */
function infoTableHTML(info, mapUrl, t) {
  const rows = [];

  // "(확인 필요)" 표시를 눈에 띄는 칩으로 바꿉니다.
  // 확실하지 않은 값은 아는 것처럼 적지 않는다는 원칙을 화면에서도 보이게 합니다.
  const markUnverified = html => {
    if (!t.needsCheck) return html;
    const label = escapeHtml(t.needsCheck);
    return html.split(`(${label})`).join(`<span class="unverified">${label}</span>`);
  };

  if (Array.isArray(info)) {
    for (const row of info) {
      const i = String(row).indexOf('|');
      if (i < 0) continue;
      const th = inline(escapeHtml(row.slice(0, i).trim()));
      const td = markUnverified(inline(escapeHtml(row.slice(i + 1).trim())));
      rows.push(`<tr><th>${th}</th><td>${td}</td></tr>`);
    }
  }

  if (mapUrl) {
    rows.push(`<tr><th>${escapeHtml(t.mapLabel)}</th><td><a class="map-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener">${escapeHtml(t.openMap)} ↗</a></td></tr>`);
  }

  if (!rows.length) return '';
  return `<div class="table-scroll"><table class="info-table"><tbody>${rows.join('')}</tbody></table></div>`;
}

/** 리액션 — 언어와 무관하게 글 슬러그 단위로 집계됩니다 */
/** 저장(즐겨찾기) 버튼.
 *  방문자 기기(localStorage)에만 저장되므로 서버도 로그인도 필요하지 않습니다.
 *  big=true 는 글 상세용(글자까지 표시), false 는 카드용(별만 표시). */
/** 저장 버튼.
 *  big=true (글 상세) 이고 base/code 가 넘어오면 아래에 안내 한 줄을 붙입니다 —
 *  "저장하면 동선을 짤 수 있습니다". 별을 눌러도 무엇에 쓰는지 모르면
 *  아무도 누르지 않습니다. */
function saveBtnHTML(slug, t, big, base, code) {
  const add = escapeHtml(t.saveAdd), done = escapeHtml(t.saveDone);
  const btn = `<button class="save-btn${big ? '' : ' save-sm'}" type="button" data-save="${escapeHtml(slug)}"`
       + ` data-add="${add}" data-done="${done}" aria-pressed="false" aria-label="${add}" title="${add}">`
       + `<span class="save-ico" aria-hidden="true">☆</span>`
       + (big ? `<span class="save-txt">${add}</span>` : '')
       + `</button>`;
  if (!big || base === undefined || !t.saveHint) return btn;
  const d = localeDir(code);
  return btn + `\n      <p class="save-hint"><a href="${base}${d}saved">${escapeHtml(t.saveHint)}</a></p>`;
}

/** 헤더의 "저장한 곳" 링크. 개수는 assets/saved.js 가 채웁니다. */
function savedLinkHTML(base, code, t) {
  const d = localeDir(code), label = escapeHtml(t.savedNav);
  return `<a class="saved-link" href="${base}${d}saved" data-tpl="${escapeHtml(t.savedCountTpl)}" aria-label="${label}" title="${label}">`
       + `<span class="saved-star" aria-hidden="true">★</span>`
       + `<span class="saved-text">${label}</span>`
       + `<span class="saved-n" hidden>0</span></a>`;
}

/** 페이지 최하단의 "저장한 곳" 줄.
 *  방문자가 무엇을 담았는지는 빌드 때 알 수 없으므로 모든 글을 넣어두고
 *  assets/saved.js 가 담은 것만 보여줍니다 (하나도 없으면 구역 자체가 숨습니다).
 *  카드가 아니라 한 줄 목록이라 글이 늘어나도 페이지가 무거워지지 않습니다. */
function savedStripHTML(posts, base, code, t) {
  const d = localeDir(code);
  const items = posts.map(p => {
    const m = p.meta;
    return `        <li data-slug="${escapeHtml(p.slug)}" hidden style="--r:var(--region-${escapeHtml(m.region)})">` +
           `<a href="${base}${d}posts/${p.slug}"><span class="dot"></span>` +
           `<span class="st-t">${escapeHtml(m.title)}</span>` +
           `<span class="st-r">${escapeHtml(regionName(m.region, code))}</span></a>` +
           `<button class="st-x" type="button" data-save="${escapeHtml(p.slug)}" data-add="${escapeHtml(t.saveAdd)}" data-done="${escapeHtml(t.saveDone)}" aria-pressed="true" aria-label="${escapeHtml(t.savedRemove)}" title="${escapeHtml(t.savedRemove)}">×</button></li>`;
  }).join('\n');

  return `  <section class="saved-strip" id="saved-strip" hidden aria-labelledby="saved-strip-h">
    <div class="wrap">
      <div class="saved-strip-head">
        <h2 id="saved-strip-h"><span class="saved-strip-star" aria-hidden="true">★</span>${escapeHtml(t.savedTitle)} <span class="saved-strip-n"></span></h2>
        <a class="saved-strip-all" href="${base}${d}saved">${escapeHtml(t.savedSeeAll)} →</a>
      </div>
      <ul class="saved-strip-list">
${items}
      </ul>
    </div>
  </section>`;
}

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
  // 스니펫 + 계정 메타 태그(보조 확인용). 둘 다 config 의 adsensePublisherId 로 만듭니다.
  return `<meta name="google-adsense-account" content="${site.adsensePublisherId}">\n`
    + `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsensePublisherId}" crossorigin="anonymous"></script>`;
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
  page:   readTemplate('page.html'),
  saved:  readTemplate('saved.html')
};

/* 최하단 "저장한 곳" 목록에 쓸, 지금 만들고 있는 언어의 글 목록.
   renderPage 호출부가 7군데라 매번 넘기지 않고 언어 루프에서 한 번 채웁니다. */
let CURRENT_POSTS = [];

function renderPage(o) {
  const base = baseOf(o.out);
  const loc  = site.locales.find(l => l.code === o.code);
  return fill(T.base, {
    lang:        loc.htmlLang,
    title:       escapeHtml(o.title),
    description: escapeHtml(o.description || I18N[o.code].siteDesc),
    // 홈은 .../index.html 이 아니라 .../ 로 통일 (canonical·hreflang·sitemap 모두 같은 형태여야 함)
    canonical:   `${SITE_URL}/${cleanUrl(o.out)}`,
    ogType:      o.ogType || 'website',
    ogLocale:    loc.htmlLang.replace('-', '_'),
    // 링크 공유 미리보기 이미지 (절대 주소여야 합니다).
    // 글은 그 글의 사진, 그 외 페이지는 대표 이미지를 씁니다.
    // 지정하지 않으면 카카오톡·페이스북이 페이지에서 아무 사진이나 골라 씁니다.
    ogImage:     `${SITE_URL}/${o.ogImage || site.ogImage}${imgVer(o.ogImage || site.ogImage)}`,
    // 사진마다 가로·세로가 달라서 파일에서 직접 읽습니다.
    // (고정값을 쓰던 때는 세로 사진 26개의 미리보기가 잘렸습니다)
    ogImageW:    (jpegSize(o.ogImage || site.ogImage) || { w: 1200 }).w,
    ogImageH:    (jpegSize(o.ogImage || site.ogImage) || { h: 630 }).h,
    siteName:    escapeHtml(siteName(o.code)),
    base:        base,                                  // 최상단까지 (assets 용)
    lbase:       base + localeDir(o.code),              // 그 언어의 최상단까지 (페이지 링크용)
    homeHref:    linkTo(base + localeDir(o.code)),
    themeToggle: escapeHtml(I18N[o.code].themeToggle),
    toTop:       escapeHtml(I18N[o.code].toTop),
    nav:         navHTML(o.current, base, o.code, I18N[o.code]),
    savedLink:   savedLinkHTML(base, o.code, I18N[o.code]),
    v:           ASSET_V,
    savedStrip:  o.noStrip ? '' : savedStripHTML(CURRENT_POSTS, base, o.code, I18N[o.code]),
    langs:       langSwitchHTML(base, o.code, o.availability || {}, I18N[o.code]),
    langSuggest: langSuggestHTML(base, o.code, o.availability || {}),
    hreflang:    hreflangHTML(o.availability || {}),
    regionVars:  regionVarsCSS(),
    adsense:     adsenseHTML(),
    headExtra:   o.headExtra || '',
    body:        o.body,
    year:        new Date().getFullYear(),
    noindex:     o.noindex ? '<meta name="robots" content="noindex">' : '',
    skip:        escapeHtml(I18N[o.code].skip),
    menuOpen:    escapeHtml(I18N[o.code].menuOpen),
    footTips:    escapeHtml(I18N[o.code].nav.tips),
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
    for (const need of ['about', 'contact', 'privacy', 'tips']) {
      if (!byLocale[l.code].pages.some(p => p.slug === need)) {
        warnings.push(`content/pages/${l.code}/${need}.md 가 없습니다 — 푸터 링크가 404 가 됩니다`);
      }
    }
  }

  // 위치 정보(lat/lng/addr/closed)를 한국어 글에서 나머지 언어로 복사합니다
  applyGeo(byLocale);

  // 여행 팁을 섹션별로 쪼개 둡니다 (허브 + 개별 페이지 · hreflang 계산에 필요)
  const tipsSections = {};
  for (const l of LOCALES) {
    const tp = byLocale[l.code].pages.find(p => p.slug === 'tips');
    tipsSections[l.code] = tp ? splitTipsSections(tp.body).sections : [];
  }

  /** 어떤 페이지가 어떤 언어로 존재하는지 → { ko:'posts/x.html', en:'en/posts/x.html' } */
  const availFor = (relBuilder, existsIn) => {
    // index.html 은 주소에서 떼어냅니다 (canonical 과 형태를 맞추기 위해)
    const rel = cleanUrl(relBuilder);
    const a = {};
    for (const l of LOCALES) if (existsIn(l.code)) a[l.code] = localeDir(l.code) + rel;
    return a;
  };

  const urls = [];   // sitemap

  for (const l of LOCALES) {
    const code = l.code, d = l.dir, t = I18N[code];
    const posts = byLocale[code].posts;
    CURRENT_POSTS = posts;
    const pages = byLocale[code].pages;

    const hasPost = (slug, c) => byLocale[c].posts.some(p => p.slug === slug);
    const hasPage = (slug, c) => byLocale[c].pages.some(p => p.slug === slug);

    /* 음식 장르별 글 (주 장르 기준 — 배지·빵부스러기와 정확히 일치).
       한 글은 한 장르 페이지에만 실립니다 (config 순서가 우선순위). */
    const postsByGenre = {};
    for (const g of GENRES) postsByGenre[g.slug] = [];
    for (const p of posts) {
      const g = genreOf(p.meta);
      if (g) postsByGenre[g.slug].push(p);
    }
    const genreCounts = {};
    for (const g of GENRES) genreCounts[g.slug] = postsByGenre[g.slug].length;

    /* ---- 홈 (지역 인덱스) ---- */
    const homeBase = baseOf(d + 'index.html');
    const totalByRegion = {};

    const regionCards = site.regions.map(r => {
      const counts = {};
      for (const c of site.categories) {
        counts[c.slug] = posts.filter(p => p.meta.region === r.slug && p.meta.cat === c.slug).length;
      }
      totalByRegion[r.slug] = Object.values(counts).reduce((a, b) => a + b, 0);
      return regionCardHTML(r, homeBase, code, counts, t);
    }).join('\n');

    const homeAvail = availFor('index.html', () => true);
    writeFile(d + 'index.html', renderPage({
      out: d + 'index.html', code, current: 'home',
      title: `${siteName(code)} — ${t.tagline}`, description: t.description,
      availability: homeAvail,
      body: fill(T.home, {
        tagline: escapeHtml(t.tagline),
        description: escapeHtml(t.description),
        near: nearWidgetHTML(t, code, 'latest-grid'),
        map: koreaMapHTML(homeBase, code, totalByRegion, t),
        searchPlaceholder: escapeHtml(t.searchPlaceholder),
        findByRegion: escapeHtml(t.findByRegion),
        regionCount: escapeHtml(t.regionCount(site.regions.length)),
        regions: regionCards,
        latestTitle: escapeHtml(t.latest),
        searchTitle: escapeHtml(t.searchTitle),
        searchCountTpl: escapeHtml(t.searchCountTpl),
        searchJump: escapeHtml(t.searchJump),
        nearTitle: escapeHtml(t.nearTitle),
        nearBusy:  escapeHtml(t.nearBusy),
        nearDone:  escapeHtml(t.nearDone),
        nearDeny:  escapeHtml(t.nearDeny),
        nearFar:   escapeHtml(t.nearFar),
        nearNone:  escapeHtml(t.nearNone),
        nearReset: escapeHtml(t.nearReset),
        nearMe:    escapeHtml(t.nearMe),
        nearClose: escapeHtml(t.nearClose),
        nearAll:   escapeHtml(t.nearAll),
        nearEmpty: escapeHtml(t.nearEmpty('{n}')),
        nearCount: escapeHtml(t.nearCount('{n}')),
        nearZoomIn:  escapeHtml(t.nearZoomIn),
        nearZoomOut: escapeHtml(t.nearZoomOut),
        hl: escapeHtml(code),
        tipsHref:  linkTo(homeBase + d + 'tips'),
        tipsTitle: escapeHtml(t.tipsTitle),
        tipsDesc:  escapeHtml(t.tipsDesc),
        tipsTags:  escapeHtml(t.tipsTags),
        tipsCta:   escapeHtml(t.tipsCta),
        genreBlock: homeGenresHTML(homeBase, code, genreCounts, t),
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

      /* 동네 줄 — 글이 있는 동네가 2곳 이상일 때만. 이제 필터가 아니라
         각 동네 페이지(/en/seoul/myeongdong)로 가는 링크입니다. */
      const liveAreas = areasOf(r.slug).filter(a => inRegion.some(p => p.meta.area === a.slug));
      const areaChips = liveAreas.length < 2 ? '' :
        liveAreas.map(a =>
          `<a class="chip achip" href="${base}${d}${r.slug}/${a.slug}">${escapeHtml(areaName(r.slug, a.slug, code))}` +
          `<span class="n">${inRegion.filter(p => p.meta.area === a.slug).length}</span></a>`
        ).join('\n        ');

      writeFile(out, renderPage({
        out, code, current: 'home',
        title: `${name} — ${siteName(code)}`,
        description: `${name} · ${t.siteDesc}`,
        availability: availFor(`region/${r.slug}.html`, () => true),
        body: fill(T.region, {
          regionSlug: r.slug,
          regionName: escapeHtml(name),
          regionEn: escapeHtml(r.slug),
          intro: pageIntroHTML((r.intro && r.intro[code]) || '', r.slug),
          near: nearWidgetHTML(t, code, 'region-grid'),
          tabs: tabs,
          areaChips: areaChips,
          cards: inRegion.length
            ? inRegion.map(p => cardHTML(p, base, code, t)).join('\n')
            : `        <p class="empty" style="grid-column:1/-1">${escapeHtml(t.empty)}</p>`,
          noResult: escapeHtml(t.noResult),
          adTop: adSlotHTML('region-top'), adBottom: adSlotHTML('region-bottom')
        })
      }));
      if (inRegion.length) urls.push({ loc: d + `region/${r.slug}.html`, pri: '0.9', freq: 'weekly' });
    }

    /* ---- 동네 페이지 (/en/seoul/myeongdong 등) ----
       지역 안의 동네마다. 글이 AREA_PAGE_MIN 개 이상이면 색인, 그 미만은 noindex.
       region.html 을 재사용합니다 — 색 헤더 + 카테고리 탭이 그대로 붙습니다. */
    for (const r of site.regions) {
      for (const a of areasOf(r.slug)) {
        const inArea = posts.filter(p => p.meta.region === r.slug && p.meta.area === a.slug);
        if (!inArea.length) continue;

        const out   = d + `${r.slug}/${a.slug}.html`;
        const base  = baseOf(out);
        const aName = areaName(r.slug, a.slug, code);
        const rName = regionName(r.slug, code);
        const title = String(t.areaTitleTpl).replace('{area}', aName).replace('{region}', rName);
        const desc  = String(t.areaDescTpl).replace('{area}', aName).replace('{region}', rName);
        const indexed = inArea.length >= AREA_PAGE_MIN;
        const areaUrl = `${SITE_URL}/${cleanUrl(out)}`;

        const tabs = [{ slug: 'all', label: t.all, n: inArea.length }]
          .concat(site.categories.map(c => ({
            slug: c.slug, label: t.category[c.slug], n: inArea.filter(p => p.meta.cat === c.slug).length
          })))
          .map((x, i) => `<button class="rtab${i === 0 ? ' on' : ''}" type="button" data-cat="${x.slug}">${escapeHtml(x.label)}<span class="n">${x.n}</span></button>`)
          .join('\n        ');

        writeFile(out, renderPage({
          out, code, current: 'home', noindex: !indexed,
          title: `${title} — ${siteName(code)}`,
          description: desc,
          availability: availFor(`${r.slug}/${a.slug}.html`,
            c => byLocale[c].posts.some(p => p.meta.region === r.slug && p.meta.area === a.slug)),
          headExtra: `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'CollectionPage', '@id': areaUrl, url: areaUrl, name: title,
                inLanguage: l.htmlLang,
                isPartOf: { '@type': 'WebSite', name: siteName(code), url: `${SITE_URL}/${d}` } },
              { '@type': 'BreadcrumbList', itemListElement: [
                  { name: siteName(code), item: `${SITE_URL}/${d}` },
                  { name: rName,          item: `${SITE_URL}/${d}region/${r.slug}` },
                  { name: aName,          item: areaUrl }
                ].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) }
            ]
          })}</script>`,
          body: fill(T.region, {
            regionSlug: r.slug,
            regionName: escapeHtml(aName),
            regionEn: escapeHtml(a.slug),
            intro: pageIntroHTML(inArea.length >= 2 ? areaIntroText(r.slug, a.slug, code, inArea) : '', r.slug),
            near: nearWidgetHTML(t, code, 'region-grid'),
            tabs: tabs,
            areaChips: '',
            cards: inArea.map(p => cardHTML(p, base, code, t)).join('\n'),
            noResult: escapeHtml(t.noResult),
            adTop: adSlotHTML('area-top'), adBottom: adSlotHTML('area-bottom')
          })
        }));
        if (indexed) urls.push({ loc: out, pri: '0.75', freq: 'weekly' });
      }
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
          intro: pageIntroHTML((t.categoryIntro && t.categoryIntro[c.slug]) || ''),
          near: nearWidgetHTML(t, code, 'list-grid'),
          searchPlaceholder: escapeHtml(t.searchPlaceholder),
          genreNav: c.slug === 'food' ? genreNavHTML(code, base, genreCounts, null) : '',
          tipsNudge: '',
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

    /* ---- 음식 장르 페이지 (Korean BBQ · Korean Soup …) ----
       영어권은 "명동 맛집" 이 아니라 음식 종류로 검색합니다.
       글이 GENRE_PAGE_MIN 개 이상인 장르만 색인에 노출합니다 (그 미만은 noindex). */
    for (const g of GENRES) {
      const inGenre = postsByGenre[g.slug] || [];
      if (!inGenre.length) continue;                 // 이 언어에 글이 없으면 만들지 않습니다

      const out   = d + `food/${g.slug}.html`;
      const base  = baseOf(out);
      const gname = genreName(g, code);
      const heading = String(t.genreTitleTpl).replace('{name}', gname);
      const desc    = String(t.genreDescTpl).replace('{name}', gname);
      const indexed = inGenre.length >= GENRE_PAGE_MIN;
      const regionsHere = ['all', ...new Set(inGenre.map(p => p.meta.region))];

      writeFile(out, renderPage({
        out, code, current: 'food', noindex: !indexed,
        title: `${heading} — ${siteName(code)}`,
        description: desc,
        availability: availFor(`food/${g.slug}.html`,
          c => byLocale[c].posts.some(p => genreOf(p.meta) === g)),
        headExtra: `<script type="application/ld+json">${JSON.stringify(genrePageLd(g, code, inGenre, out))}</script>`,
        body: fill(T.list, {
          heading: escapeHtml(heading),
          desc: escapeHtml(desc),
          intro: pageIntroHTML(indexed ? genreIntroText(g, code, inGenre) : ''),
          near: nearWidgetHTML(t, code, 'list-grid'),
          searchPlaceholder: escapeHtml(t.searchPlaceholder),
          genreNav: genreNavHTML(code, base, genreCounts, g.slug),
          tipsNudge: tipsNudgeHTML(base, code, t),
          chips: regionsHere.map((rs, i) =>
            `<button class="chip${i === 0 ? ' active' : ''}" type="button" data-region="${rs}">${escapeHtml(rs === 'all' ? t.all : regionName(rs, code))}</button>`
          ).join('\n        '),
          cards: inGenre.map(p => cardHTML(p, base, code, t)).join('\n'),
          noResult: escapeHtml(t.noResult),
          adTop: adSlotHTML('genre-top'), adBottom: adSlotHTML('genre-bottom')
        })
      }));
      if (indexed) urls.push({ loc: out, pri: '0.7', freq: 'weekly' });
    }

    /* ---- 글 상세 ---- */
    for (const p of posts) {
      const m = p.meta;
      const out = d + `posts/${p.slug}.html`;
      const base = baseOf(out);
      const rname = regionName(m.region, code);
      const { list: rel, geo: relGeo } = nearbyPosts(p, posts);
      const relHeading = relGeo ? t.nearby : t.related;

      const availability = availFor(`posts/${p.slug}.html`, c => hasPost(p.slug, c));

      const pageUrl = `${SITE_URL}/${cleanUrl(out)}`;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          placeLd(m, pageUrl),
          breadcrumbLd(m, code, pageUrl),
          {
            '@type': 'Article',
            headline: m.title, description: m.excerpt,
            datePublished: m.date, dateModified: m.updated || m.date,
            inLanguage: l.htmlLang,
            author: authorLd(code),
            publisher: { '@type': 'Organization', name: siteName(code) },
            image: m.thumb ? `${SITE_URL}/${m.thumb}${imgVer(m.thumb)}` : undefined,
            mainEntityOfPage: pageUrl,
            about: { '@id': pageUrl + '#place' }
          }
        ]
      };

      writeFile(out, renderPage({
        out, code, current: m.cat, ogType: 'article',
        title: `${m.title} | ${siteName(code)}`, description: m.excerpt,
        ogImage: m.thumb || null,   // 글 사진이 있으면 그걸 미리보기로
        availability,
        headExtra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
        body: fill(T.post, {
          regionSlug: m.region,
          saveBtn: saveBtnHTML(p.slug, t, true, base, code),
          breadcrumb: breadcrumbHTML(m, base, code, t),
          tipsNudge: tipsNudgeHTML(base, code, t),
          badges: badgesHTML(m, base, code, t, true),
          byline: bylineHTML(t),
          spicy: spicyHTML(m, t),
          order: orderHTML(m, t),
          season: seasonHTML(m, t),
          tagChips: tagChipsHTML(m, base, code, t),
          closed: escapeHtml(m.closed || ''),
          dayNames: escapeHtml(t.routeDayNames),
          closedTodayTpl: escapeHtml(t.closedTodayTpl),
          regionHref: `${base}${d}region/${m.region}`,
          title: titleHTML(m.title),
          // 방문 시점은 표기하지 않습니다.
          // 대신 확실하지 않은 항목에 (잦은 변동으로 확인 필요) 를 붙입니다.
          meta: `${String(m.date).replace(/-/g, '.')} ${escapeHtml(t.published)}`,
          infoTable: infoTableHTML(m.info, m.map, t),
          content: markdown(p.body),
          adTop: adSlotHTML('post-top'), adBottom: adSlotHTML('post-bottom'),
          reactions: reactionsHTML(p.slug, t),
          related: rel.length ? `<section class="related">
    <div class="section-head"><h2>${escapeHtml(relHeading)}</h2></div>
    <div class="grid">\n${rel.map(x => cardHTML(x, base, code, t)).join('\n')}\n    </div>
  </section>` : ''
        })
      }));
      urls.push({ loc: out, pri: '0.8', lastmod: m.updated || m.date });
    }

    /* ---- 소개 / 문의 / 개인정보처리방침 / 여행 팁 ---- */
    for (const pg of pages) {
      const bodyMd = pg.body
        .replace(/\{\{email\}\}/g, site.email)
        .replace(/\{\{siteName\}\}/g, siteName(code));

      /* 여행 팁 = 허브(/tips: intro + 항목별 목차) + 섹션별 개별 페이지(/tips/transport 등).
         한 파일(tips.md)에서 나오며, 섹션 본문은 개별 페이지에만 둡니다 (중복 콘텐츠 방지). */
      if (pg.slug === 'tips') {
        const { intro, sections } = splitTipsSections(bodyMd);

        const hubOut  = d + 'tips.html';
        const hubBase = baseOf(hubOut);
        const tocList = sections.map(s =>
          `        <li id="${s.slug}"><a href="${hubBase}${d}tips/${s.slug}">${escapeHtml(tipsSectionTitle(s.title))}</a></li>`
        ).join('\n');
        const toc = `    <nav class="tips-toc" aria-label="${escapeHtml(t.nav.tips)}">
      <h2>${escapeHtml(t.tipsTocHeading)}</h2>
      <ol>
${tocList}
      </ol>
    </nav>`;

        writeFile(hubOut, renderPage({
          out: hubOut, code, current: 'tips',
          title: `${pg.meta.title} — ${siteName(code)}`,
          description: pg.meta.description || I18N[code].siteDesc,
          availability: availFor('tips.html', c => hasPage('tips', c)),
          headExtra: `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
              { name: siteName(code),      item: `${SITE_URL}/${d}` },
              { name: I18N[code].nav.tips, item: `${SITE_URL}/${d}tips` }
            ].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }))
          })}</script>`,
          body: fill(T.page, {
            crumbs: '',
            title: escapeHtml(pg.meta.title || 'tips'),
            updated: pg.meta.updated ? escapeHtml(pg.meta.updated) : '',
            content: markdown(intro) + '\n' + toc
          })
        }));
        urls.push({ loc: hubOut, pri: '0.7', freq: 'monthly' });

        for (const s of sections) {
          const secOut   = d + `tips/${s.slug}.html`;
          const secBase  = baseOf(secOut);
          const clean    = tipsSectionTitle(s.title);
          const secBody  = s.body.replace(/^#(?=\s)/gm, '##');   // 섹션 안 h1 → h2
          const indexed  = TIPS_PAGES.has(s.slug);
          const secUrl   = `${SITE_URL}/${cleanUrl(secOut)}`;
          const summary  = plainSummary(s.body, 155);
          const crumb = `    <nav class="crumbs" aria-label="${escapeHtml(t.crumbLabel || 'Breadcrumb')}">`
            + `<a href="${linkTo(secBase + d)}">${escapeHtml(siteName(code))}</a>`
            + `<span class="crumb-sep" aria-hidden="true">›</span>`
            + `<a href="${secBase}${d}tips">${escapeHtml(t.nav.tips)}</a>`
            + `<span class="crumb-sep" aria-hidden="true">›</span>`
            + `<span class="crumb-current" aria-current="page">${escapeHtml(shortTitle(clean))}</span></nav>`;
          const back = `    <p class="doc-more"><a href="${secBase}${d}tips">${escapeHtml(t.tipsAllLabel)}</a></p>`;

          writeFile(secOut, renderPage({
            out: secOut, code, current: 'tips', noindex: !indexed,
            title: `${shortTitle(clean)} — ${siteName(code)}`,
            description: summary || pg.meta.description || I18N[code].siteDesc,
            availability: availFor(`tips/${s.slug}.html`,
              c => (tipsSections[c] || []).some(x => x.slug === s.slug)),
            headExtra: `<script type="application/ld+json">${JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Article',
                  headline: clean,
                  description: summary || undefined,
                  inLanguage: l.htmlLang,
                  author: authorLd(code),
                  publisher: { '@type': 'Organization', name: siteName(code) },
                  mainEntityOfPage: secUrl,
                  isPartOf: { '@type': 'WebPage', name: pg.meta.title, url: `${SITE_URL}/${d}tips` }
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { name: siteName(code),        item: `${SITE_URL}/${d}` },
                    { name: I18N[code].nav.tips,   item: `${SITE_URL}/${d}tips` },
                    { name: shortTitle(clean),     item: secUrl }
                  ].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }))
                }
              ]
            })}</script>`,
            body: fill(T.page, {
              crumbs: crumb,
              title: escapeHtml(clean),
              updated: pg.meta.updated ? escapeHtml(pg.meta.updated) : '',
              content: markdown(secBody) + '\n' + back
            })
          }));
          if (indexed) urls.push({ loc: secOut, pri: '0.6', freq: 'monthly' });
        }
        continue;
      }

      // ---- 일반 문서 (소개 / 문의 / 개인정보처리방침) ----
      const out = d + `${pg.slug}.html`;
      writeFile(out, renderPage({
        out, code, current: pg.slug,
        title: `${pg.meta.title} — ${siteName(code)}`,
        description: pg.meta.description || I18N[code].siteDesc,
        availability: availFor(`${pg.slug}.html`, c => hasPage(pg.slug, c)),
        body: fill(T.page, {
          crumbs: '',
          title: escapeHtml(pg.meta.title || pg.slug),
          updated: pg.meta.updated ? escapeHtml(pg.meta.updated) : '',
          content: markdown(bodyMd)
        })
      }));
      urls.push({ loc: out, pri: '0.3' });
    }

    /* ---- 저장한 곳 (즐겨찾기) ----
       무엇을 저장했는지는 방문자 기기(localStorage)에만 있습니다.
       빌드 때는 알 수 없으니 모든 카드를 넣어두고
       assets/saved.js 가 저장된 것만 보여줍니다.
       개인 목록이라 검색엔진에는 올리지 않습니다 (noindex · sitemap 제외). */
    const outSaved = d + 'saved.html';
    writeFile(outSaved, renderPage({
      out: outSaved, code, current: 'saved', noindex: true, noStrip: true,
      title: `${t.savedTitle} — ${siteName(code)}`,
      description: t.savedDesc,
      availability: availFor('saved.html', () => true),
      body: fill(T.saved, {
        title:    escapeHtml(t.savedTitle),
        presets:  presetsHTML(posts, code, t),
        desc:     escapeHtml(t.savedDesc),
        clear:    escapeHtml(t.savedClear),
        clearAsk: escapeHtml(t.savedClearAsk),
        empty:    escapeHtml(t.savedEmpty),
        others:   escapeHtml(t.savedOthers),
        // 동선 칸. hl 은 구글 지도 길찾기 링크의 표시 언어입니다 —
        // 한국어 주소를 넣어도 구글이 이 언어로 바꿔서 보여줍니다.
        hl:              escapeHtml(code),
        routeTitle:      escapeHtml(t.routeTitle),
        routeHint:       escapeHtml(t.routeHint),
        routeSort:       escapeHtml(t.routeSort),
        routeDir:        escapeHtml(t.routeDir),
        routeUp:         escapeHtml(t.routeUp),
        routeDown:       escapeHtml(t.routeDown),
        routeDrop:       escapeHtml(t.routeDrop),
        routeAddLabel:   escapeHtml(t.routeAddLabel),
        routeAddPh:      escapeHtml(t.routeAddPh),
        routeAdd:        escapeHtml(t.routeAdd),
        routeNameWarn:   escapeHtml(t.routeNameWarn),
        routeCopy:       escapeHtml(t.routeCopy),
        routeCopied:     escapeHtml(t.routeCopied),
        routeClosedWarn: escapeHtml(t.routeClosedWarn),
        routeDayNames:   escapeHtml(t.routeDayNames),
        routeUnknown:    escapeHtml(t.routeUnknown),
        routeClosedBadge: escapeHtml(t.routeClosedBadge),
        routeFinding:    escapeHtml(t.routeFinding),
        routeNoCoord:    escapeHtml(t.routeNoCoord),
        routeOrigin:     escapeHtml(t.routeOrigin),
        routeOriginPh:   escapeHtml(t.routeOriginPh),
        routeExport:     escapeHtml(t.routeExport),
        routeExportHint: escapeHtml(t.routeExportHint),
        routeSkipped:    escapeHtml(t.routeSkipped),
        routeMapNote:    escapeHtml(t.routeMapNote),
        cards:    posts.map(p => cardHTML(p, baseOf(outSaved), code, t)).join('\n')
      })
    }));

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
      <p style="margin-top:20px;"><a class="more" href="${linkTo(baseOf(out404) + d)}">${escapeHtml(t.backHome)} →</a></p>
    </div>
  </section>`
    }));
  }

  /* ---- sitemap ---- */
  writeFile('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u =>
      `  <url><loc>${SITE_URL}/${cleanUrl(u.loc)}</loc>` +
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
