/* ==========================================================================
   저장한 곳 (즐겨찾기)
   --------------------------------------------------------------------------
   방문자 기기의 localStorage 에만 저장합니다.
   서버로 아무것도 보내지 않고 로그인도 없습니다.

   저장 단위는 "글 슬러그" 입니다. 그래서 한국어 페이지에서 저장한 곳이
   영어·일본어·중국어 페이지의 목록에도 그대로 보입니다.

   화면에서 손대는 곳 세 군데
     1) 헤더의 "저장한 곳" 링크 — 개수 배지
     2) 저장 버튼 — 글 상세(글자 포함) · 카드 위의 별
     3) 페이지 최하단 목록 · /saved 페이지 — 저장한 것만 보이기
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'kfoodtrip.saved';

  /* 사생활 보호 모드처럼 저장 공간이 막힌 브라우저에서도
     오류로 페이지가 멈추지 않도록 전부 감싸둡니다. */
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(v)) return [];
      return v.filter(function (s) { return typeof s === 'string' && s; });
    } catch (e) { return []; }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function up(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(sel)) return el;
      el = el.parentNode;
    }
    return null;
  }

  var link = document.querySelector('.saved-link');
  var countTpl = link ? (link.getAttribute('data-tpl') || '') : '';
  var tpl = function (n) { return countTpl.replace('{n}', n); };

  /** 저장한 것만 남기고 저장한 순서(최근 먼저)대로 다시 늘어놓습니다.
   *  최하단 목록과 /saved 페이지가 같은 방식이라 함수 하나로 씁니다. */
  function showOnlySaved(box, sel, list) {
    var els = box ? box.querySelectorAll(sel) : [];
    var keep = {}, found = 0;
    for (var i = 0; i < els.length; i++) {
      var slug = els[i].getAttribute('data-slug');
      var on = list.indexOf(slug) !== -1;
      els[i].hidden = !on;
      if (on) { keep[slug] = els[i]; found++; }
    }
    for (var j = 0; j < list.length; j++) {
      if (keep[list[j]]) box.appendChild(keep[list[j]]);
    }
    return found;
  }

  /* ---- 1. 헤더의 개수 ---- */
  function paintHeader(list) {
    if (!link) return;
    var badge = link.querySelector('.saved-n');
    if (badge) {
      badge.textContent = list.length;
      badge.hidden = list.length === 0;
    }
    link.setAttribute('aria-label', tpl(list.length));
    link.setAttribute('title', tpl(list.length));
    link.classList.toggle('has-items', list.length > 0);
  }

  /* ---- 2. 저장 버튼 ---- */
  function paintButtons(list) {
    var btns = document.querySelectorAll('[data-save]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = list.indexOf(b.getAttribute('data-save')) !== -1;
      var word = on ? b.getAttribute('data-done') : b.getAttribute('data-add');

      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');

      var ico = b.querySelector('.save-ico');
      if (ico) ico.textContent = on ? '★' : '☆';

      if (b.classList.contains('st-x')) continue;   // × 버튼은 이름을 그대로 둡니다

      var txt = b.querySelector('.save-txt');
      if (txt) txt.textContent = word;              // 글 상세: 보이는 글자를 바꿉니다
      else b.setAttribute('aria-label', word);      // 카드의 별: 읽어주는 이름으로
      b.setAttribute('title', word);
    }
  }

  /* ---- 3-1. 페이지 최하단 목록 ---- */
  function paintStrip(list) {
    var strip = document.getElementById('saved-strip');
    if (!strip) return;

    var found = showOnlySaved(strip.querySelector('.saved-strip-list'), 'li[data-slug]', list);

    var n = strip.querySelector('.saved-strip-n');
    if (n) n.textContent = found;

    strip.hidden = found === 0;    // 담은 게 없으면 구역 자체를 감춥니다
  }

  /* ---- 3-2. /saved 페이지 ----
     저장한 것은 위 칸에, 나머지는 아래 "아직 저장하지 않은 글" 칸으로 옮깁니다.
     저장 목록만 보여주면 그 페이지에서 다른 글로 갈 수가 없어 막다른 길이 됩니다. */
  function paintSavedPage(list) {
    var page = document.getElementById('saved-page');
    if (!page) return;

    var mine = page.querySelector('#saved-grid');
    var rest = page.querySelector('#saved-rest-grid');
    var cards = page.querySelectorAll('.card[data-slug]');   // 두 칸에 흩어져 있을 수 있습니다
    var keep = {}, others = [], found = 0;

    for (var i = 0; i < cards.length; i++) {
      cards[i].hidden = false;             // 이 페이지에서는 어떤 카드도 감추지 않습니다
      var slug = cards[i].getAttribute('data-slug');
      if (list.indexOf(slug) !== -1) { keep[slug] = cards[i]; found++; }
      else others.push(cards[i]);
    }

    // 저장한 곳 — 최근에 저장한 것이 위로
    if (mine) {
      for (var j = 0; j < list.length; j++) {
        if (keep[list[j]]) mine.appendChild(keep[list[j]]);
      }
    }
    // 나머지 — 원래 순서(최신순) 그대로
    if (rest) {
      for (var k = 0; k < others.length; k++) rest.appendChild(others[k]);
    }

    var empty = page.querySelector('.saved-empty');
    if (empty) empty.hidden = found > 0;

    var clear = page.querySelector('.saved-clear');
    if (clear) clear.hidden = found === 0;

    var count = page.querySelector('.saved-count');
    if (count) count.textContent = found ? tpl(found) : '';

    var restBox = page.querySelector('#saved-rest');
    if (restBox) restBox.hidden = others.length === 0;
  }

  function paint() {
    var list = read();
    paintHeader(list);
    paintButtons(list);
    paintStrip(list);
    paintSavedPage(list);
    paintRoute(list);
  }

  document.addEventListener('click', function (e) {
    var btn = up(e.target, '[data-save]');
    if (btn) {
      // 카드 전체가 링크라서, 별을 눌렀을 때 글로 넘어가지 않게 막습니다
      e.preventDefault();
      e.stopPropagation();
      var slug = btn.getAttribute('data-save');
      var list = read();
      var i = list.indexOf(slug);
      if (i === -1) list.unshift(slug); else list.splice(i, 1);
      write(list);
      paint();
      return;
    }

    var clear = up(e.target, '.saved-clear');
    if (clear) {
      e.preventDefault();
      var ask = clear.getAttribute('data-ask');
      if (!ask || window.confirm(ask)) { write([]); paint(); }
    }
  });

  // 다른 탭에서 저장/취소했을 때도 화면을 맞춰줍니다
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === KEY || e.key === RKEY || e.key === OKEY) paint();
  });


  /* ========================================================================
     동선 (/saved 페이지)
     ------------------------------------------------------------------------
     구글 지도는 한국에서 여러 지점을 한 번에 이어주지 못합니다.
     자동차 길찾기 자체를 제공하지 않고(지도 데이터 규제), 여러 지점 경유는
     자동차·도보에서만 되는 기능이기 때문입니다. 대중교통은 두 지점만 됩니다.
     그래서 전체를 한 링크로 묶지 않고 구간마다 링크를 만듭니다.
     지하철을 타는 방문자에게는 오히려 이 편이 낫습니다.

     좌표가 있으면 좌표를 쓰고(언어 무관·오인식 없음), 없으면 주소를 씁니다.
     주소는 한국어로 넣어도 구글이 링크의 hl= 에 맞춰 그 언어로 보여줍니다.
     ======================================================================== */
  var RKEY = 'kfoodtrip.route';
  var DAYKEY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

  function rRead() {
    try {
      var v = JSON.parse(localStorage.getItem(RKEY) || '[]');
      return Array.isArray(v) ? v.filter(function (x) { return x && (x.t === 'p' || x.t === 'c'); }) : [];
    } catch (e) { return []; }
  }
  function rWrite(v) { try { localStorage.setItem(RKEY, JSON.stringify(v)); } catch (e) {} }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 카드에서 글 정보를 꺼냅니다. /saved 페이지에는 모든 글 카드가 들어 있습니다. */
  function postItem(slug) {
    var c = document.querySelector('.card[data-slug="' + String(slug).replace(/"/g, '') + '"]');
    if (!c) return null;
    var h3 = c.querySelector('h3');
    var a  = c.querySelector('a');
    return {
      t: 'p', s: slug,
      n: h3 ? h3.textContent.trim() : slug,
      a: c.getAttribute('data-addr') || '',
      lat: c.getAttribute('data-lat') || '',
      lng: c.getAttribute('data-lng') || '',
      closed: c.getAttribute('data-closed') || '',
      href: a ? a.getAttribute('href') : ''
    };
  }

  /** 저장 목록과 동선을 맞춥니다.
   *  저장했는데 동선에 없으면 뒤에 붙이고, 저장을 취소했으면 동선에서 뺍니다.
   *  직접 추가한 지점은 저장 목록과 무관하므로 자리를 그대로 지킵니다. */
  function rSync(saved) {
    var route = rRead(), seen = {}, out = [], i;
    for (i = 0; i < route.length; i++) {
      if (route[i].t === 'c') { out.push(route[i]); continue; }
      if (saved.indexOf(route[i].s) === -1 || seen[route[i].s]) continue;
      seen[route[i].s] = 1; out.push(route[i]);
    }
    for (i = 0; i < saved.length; i++) if (!seen[saved[i]]) out.push({ t: 'p', s: saved[i] });
    rWrite(out);
    return out;
  }

  /* ---- 거리 (하버사인). 가까운 순서로 정렬과 구간 거리 표시에 씁니다 ---- */
  function km(a, b) {
    if (!a || !b) return null;
    var R = 6371, rad = Math.PI / 180;
    var dLa = (b.lat - a.lat) * rad, dLo = (b.lng - a.lng) * rad;
    var h = Math.sin(dLa / 2) * Math.sin(dLa / 2)
          + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return R * 2 * Math.asin(Math.sqrt(h));
  }
  function geo(it) {
    if (!it || !it.lat || !it.lng) return null;
    var la = parseFloat(it.lat), ln = parseFloat(it.lng);
    return (isFinite(la) && isFinite(ln)) ? { lat: la, lng: ln } : null;
  }

  /* ---- 길찾기 링크. 좌표가 있으면 좌표, 없으면 주소, 없으면 이름 ---- */
  function pointOf(it) { return (it.lat && it.lng) ? (it.lat + ',' + it.lng) : (it.a || it.n || ''); }

  function dirUrl(from, to, hl) {
    return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(pointOf(from))
      + '&destination=' + encodeURIComponent(pointOf(to))
      + '&travelmode=transit&hl=' + encodeURIComponent(hl);
  }
  function searchUrl(q, hl) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q)
      + '&hl=' + encodeURIComponent(hl);
  }

  function dayLabels(closed, box) {
    var names = (box.getAttribute('data-t-days') || '').split(',');
    var parts = String(closed).split(','), out = [];
    for (var i = 0; i < parts.length; i++) {
      var d = DAYKEY[parts[i].replace(/^\s+|\s+$/g, '')];
      if (d !== undefined && names[d]) out.push(names[d]);
    }
    return out.join(' / ');
  }

  /* ---- 붙여넣은 값 해석 ------------------------------------------------
     1) 구글 지도 주소창  → 좌표를 뽑습니다 (정확하고 거리 계산까지 됩니다)
     2) 도로명주소        → 그대로 씁니다
     3) 이름만            → 쓰기는 하지만 경고합니다.
        "경복궁" 을 넣으면 구글이 "경복궁 목동점"(고깃집)을 잡는 일이 실제로
        있습니다. 그래서 지도에서 확인하라고 알려줍니다.
     휴대폰 공유 링크(maps.app.goo.gl)에는 좌표가 없어서 주소를 받게 됩니다. */
  function parsePlace(text) {
    var s = String(text || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    if (!s) return null;
    var lat = '', lng = '', name = '';

    var m = s.match(/!3d(-?\d{1,3}\.\d{3,})!4d(-?\d{1,3}\.\d{3,})/);
    if (!m) m = s.match(/@(-?\d{1,3}\.\d{3,}),(-?\d{1,3}\.\d{3,})/);
    if (!m) m = s.match(/^(-?\d{1,3}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})$/);
    if (m) { lat = m[1]; lng = m[2]; }

    var pm = s.match(/\/maps\/place\/([^\/@?]+)/);
    if (pm) {
      try { name = decodeURIComponent(pm[1].replace(/\+/g, ' ')); } catch (e) { name = pm[1]; }
    }

    var isUrl = /^https?:\/\//i.test(s) || s.indexOf('/maps/') !== -1;
    var addr = isUrl ? '' : s;
    if (!name) name = addr || (lat ? (lat + ', ' + lng) : s);

    // 번지 앞에 로/길/가/동/읍/면/리 가 오면 도로명주소로 봅니다
    var looksAddr = /(로|길|가|동|읍|면|리)\s*\d/.test(addr) || /\d+-\d+/.test(addr);
    return {
      t: 'c', n: name.slice(0, 60), a: addr.slice(0, 120),
      lat: lat, lng: lng, closed: '',
      warn: (!lat && !looksAddr) ? 1 : 0
    };
  }

  /* ---- 그리기 ---- */
  function paintRoute(saved) {
    var box = document.getElementById('route');
    if (!box) return;
    var listEl = box.querySelector('.route-list');
    var route = rSync(saved), items = [], i;

    // 글 항목은 카드에서 최신 정보를 다시 읽습니다 (제목·주소·휴무가 바뀔 수 있음)
    for (i = 0; i < route.length; i++) {
      if (route[i].t === 'c') { items.push(route[i]); continue; }
      var p = postItem(route[i].s);
      if (p) items.push(p);
    }

    box.hidden = items.length === 0;
    syncOriginInput();
    if (!listEl) return;
    if (!items.length) { listEl.innerHTML = ''; setSkipped(box, 0); return; }

    var hl    = box.getAttribute('data-hl') || 'ko';
    var tDir  = box.getAttribute('data-t-dir') || '';
    var tUp   = box.getAttribute('data-t-up') || '';
    var tDn   = box.getAttribute('data-t-down') || '';
    var tDrop = box.getAttribute('data-t-drop') || '';
    var tCopy = box.getAttribute('data-t-copy') || '';
    var tUnk  = box.getAttribute('data-t-unknown') || '';
    var tWarn = box.getAttribute('data-t-namewarn') || '';
    var tOrg  = box.getAttribute('data-t-origin') || '';

    // 출발지가 있으면 1번이 되고 저장한 곳은 2번부터 시작합니다.
    // 화면 번호와 내려받는 파일의 번호를 똑같이 맞추기 위해서입니다.
    var org = oRead();
    var start = org ? 2 : 1;
    var html = '';

    if (org) {
      html += '<li class="route-item is-origin">'
        + '<span class="route-num">1</span>'
        + '<div class="route-body">'
        + '<span class="route-tag">' + esc(tOrg) + '</span>'
        + '<span class="route-name">' + esc(org.n || org.a) + '</span>'
        + (org.a && org.a !== org.n ? ('<span class="route-sub">' + esc(org.a) + '</span>') : '')
        + (org.warn ? ('<span class="route-warnrow">' + esc(tWarn)
            + ' <a href="' + esc(searchUrl(org.n, hl)) + '" target="_blank" rel="noopener">&#8599;</a></span>') : '')
        + '</div>'
        + '<div class="route-move">'
        + '<button class="route-origin-clear" type="button" aria-label="' + esc(tDrop) + '">&#10005;</button>'
        + '</div></li>';
      html += legHtml(org, items[0], hl, tDir);
    }

    for (i = 0; i < items.length; i++) {
      var it = items[i], nxt = items[i + 1], sub = [];
      if (it.a) sub.push(esc(it.a));
      if (it.closed === 'unknown') sub.push(esc(tUnk));

      html += '<li class="route-item">'
        + '<span class="route-num">' + (i + start) + '</span>'
        + '<div class="route-body">'
        + '<span class="route-name">'
        + (it.href ? ('<a href="' + esc(it.href) + '">' + esc(it.n) + '</a>') : esc(it.n))
        + '</span>'
        + (sub.length ? '<span class="route-sub">' + sub.join(' · ') + '</span>' : '')
        + ((it.closed && it.closed !== 'none' && it.closed !== 'unknown')
            ? '<span class="route-closed">' + esc(dayLabels(it.closed, box)) + '</span>' : '')
        + (it.warn ? ('<span class="route-warnrow">' + esc(tWarn)
            + ' <a href="' + esc(searchUrl(it.n, hl)) + '" target="_blank" rel="noopener">&#8599;</a></span>') : '')
        + (it.a ? ('<button class="route-copy" type="button" data-copy="' + esc(it.a) + '">' + esc(tCopy) + '</button>') : '')
        + '</div>'
        + '<div class="route-move">'
        + '<button class="route-up" type="button" data-i="' + i + '" aria-label="' + esc(tUp) + '"' + (i === 0 ? ' disabled' : '') + '>&#9650;</button>'
        + '<button class="route-down" type="button" data-i="' + i + '" aria-label="' + esc(tDn) + '"' + (i === items.length - 1 ? ' disabled' : '') + '>&#9660;</button>'
        + '<button class="route-drop" type="button" data-i="' + i + '" aria-label="' + esc(tDrop) + '">&#10005;</button>'
        + '</div></li>';

      if (nxt) html += legHtml(it, nxt, hl, tDir);
    }

    listEl.innerHTML = html;
    paintRouteWarn(items, box);

    // 화면 번호를 붙여서 그림을 그립니다 (목록의 번호와 같아야 합니다)
    var numbered = [], nn = 1;
    if (org) numbered.push(shallow(org, nn++));
    for (i = 0; i < items.length; i++) numbered.push(shallow(items[i], nn++));
    paintRouteMap(numbered, box);

    // 파일에서 빠지는 지점(좌표 없음) 개수를 미리 알려줍니다
    var all = org ? [org].concat(items) : items;
    var noGeo = 0;
    for (i = 0; i < all.length; i++) if (!geo(all[i])) noGeo++;
    setSkipped(box, noGeo);
  }

  /** 두 지점 사이 한 칸 — 직선거리와 대중교통 길찾기 링크 */

  /* ---- 동선 그림 ---------------------------------------------------------
     한국에서는 구글 지도가 여러 지점을 한 번에 그려주지 못합니다.
     자동차 길찾기를 제공하지 않아서(지도 데이터 규제) 여러 지점 경유가 막히고,
     Embed API 는 지점 하나만 됩니다. KML 은 구글 내 지도로 가져가야 하는데
     그 두 단계를 거칠 사람은 많지 않습니다.

     그래서 위·경도로 위치 관계를 직접 그립니다. 실제 지도가 아니라
     "몇 번을 어떤 순서로 도는지"를 바로 보여주는 그림입니다.
     (홈의 대한민국 지도와 같은 방식입니다)
     경도 1도는 위도 1도보다 짧아서 cos(위도) 로 x 를 줄입니다.       */
  function paintRouteMap(items, box) {
    var wrap = box.querySelector('.route-map');
    if (!wrap) return;

    var pts = [], i;
    for (i = 0; i < items.length; i++) {
      var g = geo(items[i]);
      if (g) pts.push({ n: items[i].num || (i + 1), name: items[i].n || '', g: g });
    }
    if (pts.length < 2) { wrap.hidden = true; wrap.innerHTML = ''; return; }
    wrap.hidden = false;

    var minLa = 90, maxLa = -90, minLn = 180, maxLn = -180;
    for (i = 0; i < pts.length; i++) {
      minLa = Math.min(minLa, pts[i].g.lat); maxLa = Math.max(maxLa, pts[i].g.lat);
      minLn = Math.min(minLn, pts[i].g.lng); maxLn = Math.max(maxLn, pts[i].g.lng);
    }
    var midLa = (minLa + maxLa) / 2;
    var kx = Math.cos(midLa * Math.PI / 180);
    var spanX = Math.max((maxLn - minLn) * kx, 0.0001);
    var spanY = Math.max(maxLa - minLa, 0.0001);

    // 가로세로 비율을 유지하면서 화면에 채웁니다
    var W = 600, H = 420, PAD = 58;
    var s = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
    var offX = (W - spanX * s) / 2, offY = (H - spanY * s) / 2;
    for (i = 0; i < pts.length; i++) {
      pts[i].x = offX + ((pts[i].g.lng - minLn) * kx) * s;
      pts[i].y = offY + (maxLa - pts[i].g.lat) * s;   // 위쪽이 북쪽
    }

    var seg = '', dots = '', labels = '';
    for (i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (i < pts.length - 1) {
        var q = pts[i + 1];
        // 원에 가려지지 않게 양 끝을 조금 잘라냅니다
        var dx = q.x - p.x, dy = q.y - p.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / len, uy = dy / len, cut = 17;
        seg += '<line class="rm-line" x1="' + (p.x + ux * cut).toFixed(1) + '" y1="' + (p.y + uy * cut).toFixed(1)
             + '" x2="' + (q.x - ux * cut).toFixed(1) + '" y2="' + (q.y - uy * cut).toFixed(1) + '"/>';
      }
      dots += '<circle class="rm-dot" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="13"/>'
            + '<text class="rm-num" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '" dy="0.35em">' + p.n + '</text>';
      // 이름은 점 위쪽에, 화면 밖으로 나가지 않게 좌우 정렬을 바꿉니다
      var anchor = p.x < 80 ? 'start' : (p.x > W - 80 ? 'end' : 'middle');
      labels += '<text class="rm-label" x="' + p.x.toFixed(1) + '" y="' + (p.y - 19).toFixed(1)
             + '" text-anchor="' + anchor + '">' + esc(shortName(p.name)) + '</text>';
    }

    wrap.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="'
      + esc(box.getAttribute('data-t-maplabel') || '') + '">'
      + '<defs><marker id="rm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">'
      + '<path d="M0,0 L10,5 L0,10 z"/></marker></defs>'
      + seg + dots + labels
      + '</svg>';
  }

  /** 지도 이름표는 짧아야 읽힙니다. 글 제목에서 설명 부분을 떼어냅니다. */
  function shortName(s) {
    return String(s || '').split(' — ')[0].split(' - ')[0].slice(0, 18);
  }
  function legHtml(a, b, hl, tDir) {
    var d = km(geo(a), geo(b));
    return '<li class="route-leg">'
      + (d !== null ? ('<span class="route-km">' + (d < 1 ? (Math.round(d * 1000) + ' m') : (d.toFixed(1) + ' km')) + '</span>') : '')
      + '<a class="route-dir" href="' + esc(dirUrl(a, b, hl)) + '" target="_blank" rel="noopener">' + esc(tDir) + '</a>'
      + '</li>';
  }

  function setSkipped(box, n) {
    var el = box.querySelector('.route-skipped');
    if (!el) return;
    el.hidden = n === 0;
    if (n > 0) el.textContent = (el.getAttribute('data-tpl') || '').replace('{n}', String(n));
  }

  function syncOriginInput() {
    var input = document.getElementById('route-origin-input');
    if (!input || input === document.activeElement) return;
    var org = oRead();
    input.value = org ? (org.a || org.n || '') : '';
  }
  /** "일요일에 가면 3곳이 문을 닫습니다" — 이 사이트만 할 수 있는 안내입니다.
   *  구글 지도는 여러 곳의 휴무를 한 번에 알려주지 않습니다. */
  function paintRouteWarn(items, box) {
    var el = box.querySelector('.route-warn');
    if (!el) return;
    var names = (box.getAttribute('data-t-days') || '').split(',');
    var tpl = box.getAttribute('data-t-closedwarn') || '';
    var count = [0, 0, 0, 0, 0, 0, 0], i, j;
    for (i = 0; i < items.length; i++) {
      var parts = String(items[i].closed || '').split(',');
      for (j = 0; j < parts.length; j++) {
        var d = DAYKEY[parts[j].replace(/^\s+|\s+$/g, '')];
        if (d !== undefined) count[d]++;
      }
    }
    var lines = [];
    for (i = 0; i < 7; i++) {
      if (count[i] > 0 && names[i]) {
        lines.push(tpl.replace('{day}', names[i]).replace('{n}', String(count[i])));
      }
    }
    el.hidden = lines.length === 0;
    el.textContent = lines.join('   ·   ');
  }

  /* ---- 조작 ---- */
  function routeMove(from, to) {
    var r = rRead();
    if (from < 0 || from >= r.length || to < 0 || to >= r.length) return;
    r.splice(to, 0, r.splice(from, 1)[0]);
    rWrite(r);
    paint();
  }

  function routeRemove(i) {
    var r = rRead();
    if (i < 0 || i >= r.length) return;
    var it = r[i];
    r.splice(i, 1);
    rWrite(r);
    // 글 항목이면 저장 목록에서도 뺍니다 (카드의 별과 어긋나지 않게)
    if (it && it.t === 'p') {
      var s = read(), k = s.indexOf(it.s);
      if (k !== -1) { s.splice(k, 1); write(s); }
    }
    paint();
  }

  /** 가까운 순서로 — 첫 지점에서 시작해 가장 가까운 곳을 계속 고릅니다.
   *  좌표가 없는 지점은 순서를 건드리지 않고 뒤에 그대로 둡니다. */
  function routeSort() {
    var r = rRead(), withGeo = [], without = [], i;
    for (i = 0; i < r.length; i++) {
      var src = (r[i].t === 'p') ? postItem(r[i].s) : r[i];
      var g = geo(src);
      if (g) withGeo.push({ it: r[i], g: g }); else without.push(r[i]);
    }
    if (withGeo.length < 3) return;
    var order = [withGeo.shift()];
    while (withGeo.length) {
      var last = order[order.length - 1], best = 0, bd = Infinity;
      for (i = 0; i < withGeo.length; i++) {
        var d = km(last.g, withGeo[i].g);
        if (d !== null && d < bd) { bd = d; best = i; }
      }
      order.push(withGeo.splice(best, 1)[0]);
    }
    var out = [];
    for (i = 0; i < order.length; i++) out.push(order[i].it);
    rWrite(out.concat(without));
    paint();
  }

  function routeAdd(box) {
    var input = document.getElementById('route-add-input');
    if (!input) return;
    var item = parsePlace(input.value);
    if (!item) return;
    var r = rRead();
    r.push(item);
    rWrite(r);
    input.value = '';
    paint();
  }

  document.addEventListener('click', function (e) {
    var box = document.getElementById('route');
    if (!box) return;

    var b = up(e.target, '.route-up, .route-down, .route-drop, .route-copy, .route-sort, .route-add-btn, .route-export-btn, .route-origin-clear');
    if (!b) return;
    e.preventDefault();
    var i = parseInt(b.getAttribute('data-i'), 10);

    if (b.classList.contains('route-up'))   { routeMove(i, i - 1); return; }
    if (b.classList.contains('route-down')) { routeMove(i, i + 1); return; }
    if (b.classList.contains('route-drop')) { routeRemove(i); return; }
    if (b.classList.contains('route-sort')) { routeSort(); return; }
    if (b.classList.contains("route-add-btn")) { routeAdd(box); return; }
    if (b.classList.contains("route-export-btn")) { exportKml(); return; }
    if (b.classList.contains("route-origin-clear")) { oWrite(null); paint(); return; }

    if (b.classList.contains('route-copy')) {
      var txt = b.getAttribute('data-copy') || '';
      var done = function () {
        var old = b.textContent;
        b.textContent = box.getAttribute('data-t-copied') || old;
        setTimeout(function () { b.textContent = old; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    }
  });

  // 입력칸에서 엔터로도 추가되게 합니다
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (!t) return;
    if (t.id === 'route-origin-input') { e.preventDefault(); t.blur(); return; }
    if (t.id !== 'route-add-input') return;
    e.preventDefault();
    routeAdd(document.getElementById('route'));
  });

  /* ---- 출발지 ------------------------------------------------------------
     숙소를 넣어두면 첫 구간이 여기서 시작합니다. 동선과 따로 저장합니다 —
     저장한 곳을 다 지워도 숙소는 그대로 남아 있어야 편합니다. */
  var OKEY = 'kfoodtrip.origin';

  function oRead() {
    try {
      var v = JSON.parse(localStorage.getItem(OKEY) || 'null');
      return (v && typeof v === 'object' && (v.a || v.n || v.lat)) ? v : null;
    } catch (e) { return null; }
  }
  function oWrite(v) {
    try {
      if (v) localStorage.setItem(OKEY, JSON.stringify(v));
      else localStorage.removeItem(OKEY);
    } catch (e) {}
  }

  /* ---- 구글 내 지도로 가져갈 KML -----------------------------------------
     구글 지도 앱은 KML 을 직접 열지 못합니다. 구글 내 지도(mymaps.google.com)
     에서 "가져오기" 하면 번호가 붙은 지점과 이어진 선이 생기고, 그 지도가
     구글 지도 앱의 저장됨 목록에도 나타납니다.

     KML 의 좌표 순서는 위도,경도가 아니라 경도,위도 입니다. 자주 틀리는 곳입니다.
     좌표가 없는 지점(주소만 넣은 곳)은 넣을 수 없어서 건너뛰고 몇 곳인지 알립니다. */
  function kmlEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


  /** 번호만 붙인 사본. 원본 항목을 건드리지 않기 위해서입니다. */
  function shallow(it, num) {
    return { t: it.t, n: it.n, a: it.a, lat: it.lat, lng: it.lng, closed: it.closed, num: num };
  }
  function buildKml(items, title) {
    var pts = [], i, skipped = 0;
    for (i = 0; i < items.length; i++) {
      var g = geo(items[i]);
      if (g) pts.push({ it: items[i], g: g }); else skipped++;
    }
    if (!pts.length) return { xml: '', skipped: skipped, n: 0 };

    var marks = '', line = [];
    for (i = 0; i < pts.length; i++) {
      var it = pts[i].it, g2 = pts[i].g;
      var label = (it.num ? it.num : (i + 1)) + '. ' + (it.n || '');
      marks += '  <Placemark>\n'
        + '    <name>' + kmlEsc(label) + '</name>\n'
        + (it.a ? ('    <description>' + kmlEsc(it.a) + '</description>\n') : '')
        + '    <styleUrl>#stop</styleUrl>\n'
        + '    <Point><coordinates>' + g2.lng + ',' + g2.lat + ',0</coordinates></Point>\n'
        + '  </Placemark>\n';
      line.push(g2.lng + ',' + g2.lat + ',0');
    }

    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n'
      + '  <name>' + kmlEsc(title) + '</name>\n'
      + '  <Style id="stop"><IconStyle><scale>1.1</scale></IconStyle></Style>\n'
      + '  <Style id="path"><LineStyle><color>ff2b7ce0</color><width>4</width></LineStyle></Style>\n'
      + marks
      + (line.length > 1
          ? ('  <Placemark>\n    <name>' + kmlEsc(title) + '</name>\n'
             + '    <styleUrl>#path</styleUrl>\n'
             + '    <LineString><tessellate>1</tessellate>\n'
             + '      <coordinates>' + line.join(' ') + '</coordinates>\n'
             + '    </LineString>\n  </Placemark>\n')
          : '')
      + '</Document>\n</kml>\n';

    return { xml: xml, skipped: skipped, n: pts.length };
  }

  function download(name, text) {
    try {
      var blob = new Blob([text], { type: 'application/vnd.google-earth.kml+xml' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return true;
    } catch (e) { return false; }
  }

  function setOriginFromInput() {
    var input = document.getElementById('route-origin-input');
    if (!input) return;
    var v = String(input.value || '').replace(/^\s+|\s+$/g, '');
    if (!v) { oWrite(null); paint(); return; }
    var it = parsePlace(v);
    if (!it) return;
    oWrite(it);
    paint();
  }

  function exportKml() {
    var box = document.getElementById('route');
    if (!box) return;
    var route = rSync(read()), items = [], i;
    for (i = 0; i < route.length; i++) {
      if (route[i].t === 'c') { items.push(route[i]); continue; }
      var p = postItem(route[i].s);
      if (p) items.push(p);
    }
    var org = oRead();
    var all = org ? [org].concat(items) : items;
    if (!all.length) return;

    // 화면에 보이는 번호를 그대로 파일에 씁니다.
    // 좌표가 없어 빠지는 지점이 있으면 번호가 중간에 비는데,
    // 화면과 파일의 번호가 어긋나는 것보다 이게 낫습니다.
    for (i = 0; i < all.length; i++) all[i] = shallow(all[i], i + 1);

    var head = document.querySelector('.route-head h2');
    var title = head ? head.textContent.replace(/^\s+|\s+$/g, '') : 'route';
    var out = buildKml(all, title);
    if (!out.n) return;
    download('kfoodtrip-route.kml', out.xml);
  }

  // 출발지는 입력칸에서 포커스가 빠질 때 저장합니다.
  // change 만 쓰면 붙여넣고 바로 다른 곳을 눌렀을 때 놓칩니다.
  document.addEventListener('focusout', function (e) {
    if (e.target && e.target.id === 'route-origin-input') setOriginFromInput();
  });
  paint();
})();
