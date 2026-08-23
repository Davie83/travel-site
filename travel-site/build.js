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
  const files = ['assets/style.css', 'assets/filter.js', 'assets/reactions.js', 'assets/saved.js'];
  const h = crypto.createHash('sha1');
  for (const f of files) {
    const p = path.join(STATIC, f);
    if (fs.existsSync(p)) h.update(fs.readFileSync(p));
  }
  return h.digest('hex').slice(0, 8);
}
const ASSET_V = assetVersion();

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
  // 한국어 홈의 경로는 빈 문자열('')입니다. 빈 문자열은 거짓으로 취급되므로
  // 값의 유무는 반드시 undefined 로 판별해야 합니다. (홈에서만 버튼이 사라지던 원인)
  const items = LOCALES.filter(l => availability[l.code] !== undefined);
  if (items.length < 2) return '';
  return `<div class="langs" role="group" aria-label="${escapeHtml(t.langLabel)}">
      ${items.map(l => l.code === current
        ? `<span class="lang on" aria-current="true">${escapeHtml(l.short)}</span>`
        : `<a class="lang" href="${linkTo(base + availability[l.code])}" hreflang="${l.hreflang}" lang="${l.htmlLang}">${escapeHtml(l.short)}</a>`
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
/** 카테고리 · 지역 · 동네 배지.
 *  전에는 "맛집 · 서울" 처럼 점으로 이었는데, 각각 눌러야 할 정보라 배지로 나눴습니다.
 *  지역만 지역색을 채우고 나머지는 테두리만 둡니다 (색을 더 쓰면 시끄러워집니다).
 *  linked=false 는 카드 안에서 씁니다 — 카드 전체가 링크라 그 안에 링크를 겹칠 수 없습니다. */
function badgesHTML(m, base, code, t, linked) {
  const d   = localeDir(code);
  const rs  = escapeHtml(m.region);
  const cat = escapeHtml(t.category[m.cat] || m.cat);
  const rn  = escapeHtml(regionName(m.region, code));
  const an  = escapeHtml(areaName(m.region, m.area, code));
  const rows = [];
  rows.push(linked
    ? `<a class="badge" href="${base}${d}${escapeHtml(m.cat)}">${cat}</a>`
    : `<span class="badge">${cat}</span>`);
  rows.push(linked
    ? `<a class="badge badge-region" href="${base}${d}region/${rs}" style="--r:var(--region-${rs})">${rn}</a>`
    : `<span class="badge badge-region" style="--r:var(--region-${rs})">${rn}</span>`);
  if (an) rows.push(`<span class="badge">${an}</span>`);
  return `<div class="badges">${rows.join('')}</div>`;
}

function cardHTML(post, base, code, t) {
  const m = post.meta;
  const d = localeDir(code);
  const thumb = m.thumb
    ? `<img src="${base}${m.thumb}" alt="${escapeHtml(m.title)}" loading="lazy">`
    : `<span class="emoji">${m.emoji || '📍'}</span>`;
  const rname = regionName(m.region, code);
  const aname = areaName(m.region, m.area, code);
  const search = [m.title, m.excerpt, rname, aname, (m.tags || []).join(' ')].join(' ').toLowerCase();

  return `        <article class="card" data-slug="${post.slug}" data-cat="${escapeHtml(m.cat)}" data-region="${escapeHtml(m.region)}" data-area="${escapeHtml(m.area || '')}" data-search="${escapeHtml(search)}" style="--r:var(--region-${escapeHtml(m.region)})">
          <a href="${base}${d}posts/${post.slug}">
            <div class="card-thumb${m.thumb ? ' has-photo' : ''}">${thumb}<span class="card-tag">${escapeHtml(t.category[m.cat] || m.cat)}</span></div>
            <div class="card-body">
              <h3>${escapeHtml(m.title)}</h3>
              <p>${escapeHtml(m.excerpt)}</p>
              <div class="card-meta"><span class="badge badge-region" style="--r:var(--region-${escapeHtml(m.region)})">${escapeHtml(rname)}</span>${aname ? `<span class="badge">${escapeHtml(aname)}</span>` : ''}<time class="card-date">${String(m.date).replace(/-/g, '.')}</time></div>
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
function saveBtnHTML(slug, t, big) {
  const add = escapeHtml(t.saveAdd), done = escapeHtml(t.saveDone);
  return `<button class="save-btn${big ? '' : ' save-sm'}" type="button" data-save="${escapeHtml(slug)}"`
       + ` data-add="${add}" data-done="${done}" aria-pressed="false" aria-label="${add}" title="${add}">`
       + `<span class="save-ico" aria-hidden="true">☆</span>`
       + (big ? `<span class="save-txt">${add}</span>` : '')
       + `</button>`;
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
    ogImage:     `${SITE_URL}/${o.ogImage || site.ogImage}`,
    ogImageW:    o.ogImage ? 1600 : 1200,
    ogImageH:    o.ogImage ? 1200 : 630,
    siteName:    escapeHtml(siteName(o.code)),
    base:        base,                                  // 최상단까지 (assets 용)
    lbase:       base + localeDir(o.code),              // 그 언어의 최상단까지 (페이지 링크용)
    homeHref:    linkTo(base + localeDir(o.code)),
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
        map: koreaMapHTML(homeBase, code, totalByRegion, t),
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

      /* 동네 칩 — 글이 있는 동네가 2곳 이상일 때만 보여줍니다.
         한 곳뿐이면 눌러도 달라지는 게 없어서 자리만 차지합니다. */
      const liveAreas = areasOf(r.slug).filter(a => inRegion.some(p => p.meta.area === a.slug));
      const areaChips = liveAreas.length < 2 ? '' :
        [{ slug: 'all', label: t.all, n: inRegion.length }]
          .concat(liveAreas.map(a => ({
            slug: a.slug, label: areaName(r.slug, a.slug, code),
            n: inRegion.filter(p => p.meta.area === a.slug).length
          })))
          .map((x, i) => `<button class="chip achip${i === 0 ? ' active' : ''}" type="button" data-area="${x.slug}">${escapeHtml(x.label)}<span class="n">${x.n}</span></button>`)
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
        ogImage: m.thumb || null,   // 글 사진이 있으면 그걸 미리보기로
        availability,
        headExtra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
        body: fill(T.post, {
          regionSlug: m.region,
          saveBtn: saveBtnHTML(p.slug, t, true),
          badges: badgesHTML(m, base, code, t, true),
          regionHref: `${base}${d}region/${m.region}`,
          title: escapeHtml(m.title),
          // 방문 시점은 표기하지 않습니다.
          // 대신 확실하지 않은 항목에 (잦은 변동으로 확인 필요) 를 붙입니다.
          meta: `${String(m.date).replace(/-/g, '.')} ${escapeHtml(t.published)}`,
          infoTable: infoTableHTML(m.info, m.map, t),
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
        desc:     escapeHtml(t.savedDesc),
        clear:    escapeHtml(t.savedClear),
        clearAsk: escapeHtml(t.savedClearAsk),
        empty:    escapeHtml(t.savedEmpty),
        others:   escapeHtml(t.savedOthers),
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
