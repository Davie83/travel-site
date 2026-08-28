/* ==========================================================================
   목록 필터 (검색 · 지역 칩 · 지역페이지 탭) + 모바일 메뉴
   --------------------------------------------------------------------------
   카드는 빌드할 때 이미 HTML 로 만들어져 있습니다 (검색엔진이 그대로 읽습니다).
   이 스크립트는 만들어진 카드를 보여주거나 숨길 뿐입니다.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('.grid[id]').forEach(setupGrid);

  function setupGrid(grid) {
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (!cards.length) return;

    const section  = grid.closest('.section') || document;
    const emptyMsg = section.querySelector('.empty');
    // 검색 중에 제목·개수를 바꿀 요소들 (없는 페이지도 있어서 전부 선택적입니다)
    const titleEl  = section.querySelector('.section-head h2[data-search]');
    const countEl  = section.querySelector('.search-count');
    const noteEl   = document.querySelector(`.search-note[data-target="${grid.id}"]`);
    const input    = document.querySelector(`input[data-target="${grid.id}"]`);
    const chipBox  = document.querySelector(`.chips[data-target="${grid.id}"]`);
    const tabBox   = document.querySelector(`.rtabs[data-target="${grid.id}"]`);
    const areaBox  = document.querySelector(`.achips-wrap[data-target="${grid.id}"]`);

    if (!input && !chipBox && !tabBox && !areaBox) return;   // 관련 글 목록 등은 그대로 둡니다

    // 검색어 · 지역 · 카테고리를 함께 기억합니다 (하나를 바꿔도 나머지가 풀리지 않음)
    const state = { keyword: '', region: 'all', area: 'all', cat: 'all' };
    const hasLimit = grid.classList.contains('limit-4');

    function apply() {
      const kw = state.keyword.trim().toLowerCase();
      const filtering = !!kw || state.region !== 'all' || state.area !== 'all' || state.cat !== 'all';
      let shown = 0;

      cards.forEach(card => {
        const okRegion = state.region === 'all' || card.dataset.region === state.region;
        const okArea   = state.area   === 'all' || card.dataset.area   === state.area;
        const okCat    = state.cat    === 'all' || card.dataset.cat    === state.cat;
        const okKw     = !kw || (card.dataset.search || '').includes(kw);
        const visible  = okRegion && okArea && okCat && okKw;
        card.hidden = !visible;
        if (visible) shown++;
      });

      // 홈 목록은 평소 한 행(4개)만 보이지만, 검색 중에는 전체를 대상으로 합니다
      if (hasLimit) grid.classList.toggle('limit-4', !filtering);
      if (emptyMsg) emptyMsg.hidden = shown > 0;

      /* 검색 중인데 제목이 "최근 올라온 글" 로 남아 있으면 화면과 말이 안 맞습니다.
         제목을 "검색 결과" 로 바꾸고 개수를 붙입니다. 그리고 검색창 바로 아래에
         "N개가 검색되었습니다" 를 띄워서, 결과가 화면 아래에 있다는 것을 알립니다. */
      if (titleEl) {
        const def = titleEl.getAttribute('data-default') || '';
        const alt = titleEl.getAttribute('data-search') || def;
        if (def) titleEl.textContent = filtering ? alt : def;
      }
      if (countEl) {
        const tpl = noteEl ? (noteEl.getAttribute('data-tpl') || '') : '';
        countEl.hidden = !filtering || shown === 0;
        countEl.textContent = filtering && tpl ? tpl.replace('{n}', String(shown)) : '';
      }
      if (noteEl) {
        noteEl.hidden = !filtering;
        if (filtering) {
          noteEl.innerHTML = '';
          if (shown > 0) {
            const tpl = noteEl.getAttribute('data-tpl') || '';
            noteEl.append(tpl.replace('{n}', String(shown)) + ' ');
            const a = document.createElement('a');
            a.href = '#' + grid.id;
            a.className = 'search-jump';
            a.textContent = (noteEl.getAttribute('data-jump') || '') + ' \u2193';
            noteEl.appendChild(a);
          } else {
            noteEl.textContent = noteEl.getAttribute('data-none') || '';
          }
        }
      }
    }

    if (input) {
      input.addEventListener('input', () => { state.keyword = input.value; apply(); });

      /* 주소에 ?q= 가 있으면 그것으로 시작합니다.
         글 하단 태그 칩이 /?q=노포 로 보내는데, 태그별 페이지를 따로 만들지
         않고도 눌렀을 때 결과가 나오게 하는 방법입니다. */
      try {
        const q = new URLSearchParams(location.search).get('q');
        if (q) {
          input.value = q;
          state.keyword = q;
          apply();
          // 결과가 화면 아래에 있어 못 찾는 일이 있었습니다. 목록으로 옮겨 줍니다.
          if (grid.scrollIntoView) {
            setTimeout(() => grid.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
          }
        }
      } catch (e) { /* 구형 브라우저는 그냥 넘어갑니다 */ }
    }

    if (chipBox) {
      chipBox.addEventListener('click', e => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        chipBox.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        state.region = btn.dataset.region;
        apply();
      });
    }

    // 동네 칩은 이제 필터가 아니라 동네 페이지(/en/seoul/myeongdong)로 가는 링크입니다.

    if (tabBox) {
      tabBox.addEventListener('click', e => {
        const btn = e.target.closest('.rtab');
        if (!btn) return;
        tabBox.querySelectorAll('.rtab').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        state.cat = btn.dataset.cat;
        apply();
      });
    }
  }

  /* ---------------------------------------------------------------------
     모바일 햄버거 메뉴
     --------------------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.nav');

  if (toggle && nav) {
    const openLabel  = toggle.getAttribute('aria-label') || 'Open menu';

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', openLabel);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
})();

/* ==========================================================================
   언어 제안 배너
   --------------------------------------------------------------------------
   방문자 브라우저 언어가 현재 페이지와 다르면 얇은 띠로 알려줍니다.

   ★ 자동 이동이 아닙니다. 구글 크롤러는 미국에서 접속하므로 국가·언어로
     강제 이동시키면 한국어·일본어·중국어 페이지가 색인되지 않을 수 있습니다.
     그래서 안내만 하고, 이동은 방문자가 누를 때만 합니다.
   ========================================================================== */

(function () {
  'use strict';

  var bar = document.querySelector('.lang-suggest');
  if (!bar) return;

  // 한 번 닫으면 다시 띄우지 않습니다
  try { if (localStorage.getItem('langSuggestClosed') === '1') return; } catch (e) {}

  var opts;
  try { opts = JSON.parse(bar.getAttribute('data-locales') || '{}'); } catch (e) { return; }

  var current = document.documentElement.lang || '';

  // 브라우저가 선호하는 언어 순서대로 훑어서 우리가 가진 언어를 찾습니다
  var prefs = (navigator.languages && navigator.languages.length)
    ? navigator.languages : [navigator.language || ''];

  var pick = null;
  for (var i = 0; i < prefs.length; i++) {
    var primary = String(prefs[i]).toLowerCase().split('-')[0];   // 'ja-JP' → 'ja'
    if (primary && primary === current.toLowerCase().split('-')[0]) break;  // 이미 맞는 언어
    if (primary && opts[primary]) { pick = opts[primary]; break; }
  }
  if (!pick) return;

  bar.querySelector('.ls-msg').textContent = pick.msg;
  var go = bar.querySelector('.ls-go');
  go.textContent = pick.go;
  go.setAttribute('href', pick.href);
  bar.hidden = false;

  bar.querySelector('.ls-close').addEventListener('click', function () {
    bar.hidden = true;
    try { localStorage.setItem('langSuggestClosed', '1'); } catch (e) {}
  });
})();


/* ==========================================================================
   내 근처 — 이미 한국에 도착해 서 있는 사람을 위한 기능
   --------------------------------------------------------------------------
   거리 숫자만 나열하면 "4.1km" 가 어느 방향인지 몰라 쓸모가 없습니다.
   그래서 모달을 띄우고 지도에 내 위치와 반경 안의 가게를 함께 찍습니다.

   확대·축소·이동에 대하여
     구글 지도 임베드 위에 좌표를 계산해 핀을 얹는 방식입니다.
     그래서 사용자가 임베드를 직접 확대하면 핀이 따라가지 못해 어긋납니다.
     그 대신 우리가 만든 +/- 버튼으로 확대 단계를 바꾸고, 바꿀 때마다
     지도와 핀을 함께 다시 그립니다. 어긋날 여지가 없습니다.
     끌어서 이동할 때는 지도와 핀이 같은 상자에 담겨 통째로 움직이므로
     끌는 중에도 정렬이 유지되고, 손을 떼면 새 중심으로 다시 그립니다.

   위치는 브라우저 안에서만 쓰고 어디에도 보내지 않습니다.
   ========================================================================== */
(function () {
  'use strict';
  var box = document.querySelector('.near');
  var modal = document.querySelector('.nearmodal');
  if (!box || !modal) return;
  var btn = box.querySelector('.near-btn');
  var msg = document.querySelector('.near-msg');
  var grid = document.getElementById(box.getAttribute('data-target') || '');
  if (!btn || !grid) return;

  var elMap   = modal.querySelector('.nm-map');
  var elLayer = null;                       // 지도+핀을 함께 담는 상자 (끌기용)
  var elList  = modal.querySelector('.nm-list');
  var elMsg   = modal.querySelector('.nm-msg');
  var elClose = modal.querySelector('.nm-close');
  var elIn    = modal.querySelector('.nm-in');
  var elOut   = modal.querySelector('.nm-out');
  var chips   = modal.querySelectorAll('.nm-radius button');
  if (!elMap || !elList) return;

  var T = {
    busy:  box.getAttribute('data-t-busy')  || '',
    deny:  box.getAttribute('data-t-deny')  || '',
    far:   box.getAttribute('data-t-far')   || '',
    none:  box.getAttribute('data-t-none')  || '',
    me:    box.getAttribute('data-t-me')    || '',
    empty: box.getAttribute('data-t-empty') || '',
    count: box.getAttribute('data-t-count') || ''
  };
  var HL = box.getAttribute('data-hl') || 'ko';

  var me = null;        // { lat, lng }
  var radiusKm = 3;     // 기본 반경. 0 이면 전체
  var zoom = null;      // null 이면 반경에 맞춰 자동 계산
  var center = null;    // { lat, lng } — 끌어서 옮기면 바뀝니다
  var shown = [];

  /* ---- 계산 ---- */
  function km(la1, ln1, la2, ln2) {
    var R = 6371, d = Math.PI / 180;
    var dLa = (la2 - la1) * d, dLn = (ln2 - ln1) * d;
    var h = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
      Math.cos(la1 * d) * Math.cos(la2 * d) * Math.sin(dLn / 2) * Math.sin(dLn / 2);
    return R * 2 * Math.asin(Math.sqrt(h));
  }
  function fmt(k) { return k < 1 ? Math.round(k * 1000) + 'm' : (k < 10 ? k.toFixed(1) : Math.round(k)) + 'km'; }
  function esc(x) {
    return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shortName(s) {
    s = String(s || '').split(' — ')[0].split(' - ')[0];
    return s.length > 14 ? s.slice(0, 13) + '…' : s;
  }
  function merX(lng) { return (lng + 180) / 360; }
  function merY(lat) {
    var s = Math.sin(lat * Math.PI / 180);
    return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  }
  function latOfMerY(y) {
    var n = Math.PI - 2 * Math.PI * y;
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  /* ---- 카드에서 좌표를 모읍니다 ---- */
  function collect() {
    var cards = grid.querySelectorAll('.card[data-lat]');
    var rows = [], i;
    for (i = 0; i < cards.length; i++) {
      var c = cards[i];
      var la = parseFloat(c.getAttribute('data-lat'));
      var ln = parseFloat(c.getAttribute('data-lng'));
      if (!isFinite(la) || !isFinite(ln)) continue;
      var a = c.querySelector('a[href]');
      var h3 = c.querySelector('h3');
      rows.push({
        lat: la, lng: ln,
        name: h3 ? h3.textContent : '',
        href: a ? a.getAttribute('href') : '',
        d: km(me.lat, me.lng, la, ln)
      });
    }
    rows.sort(function (a, b) { return a.d - b.d; });
    return rows;
  }

  /* 반경에 맞는 확대 단계를 고릅니다. 반경 원이 지도에 들어오게 잡습니다. */
  function autoZoom(W, H, spanX, spanY) {
    var availW = W - 68, availH = H - 78;
    for (var t = 17; t >= 4; t--) {
      var world = 256 * Math.pow(2, t);
      if (spanX * world <= availW && spanY * world <= availH) return t;
    }
    return 4;
  }

  function draw() {
    if (!me) return;
    var all = collect();
    var rows = radiusKm > 0 ? all.filter(function (r) { return r.d <= radiusKm; }) : all;
    shown = rows;

    var W = Math.round(elMap.clientWidth) || 600;
    var H = Math.round(elMap.clientHeight) || 360;

    // 지도에 담을 범위 — 내 위치 + 보이는 가게들
    var pts = [{ me: 1, lat: me.lat, lng: me.lng }];
    for (var i = 0; i < rows.length; i++) {
      pts.push({ n: i + 1, lat: rows[i].lat, lng: rows[i].lng, d: rows[i].d, name: rows[i].name, href: rows[i].href });
    }
    var minX = 1, maxX = 0, minY = 1, maxY = 0, k;
    for (k = 0; k < pts.length; k++) {
      var mx = merX(pts[k].lng), my = merY(pts[k].lat);
      pts[k].mx = mx; pts[k].my = my;
      if (mx < minX) minX = mx;
      if (mx > maxX) maxX = mx;
      if (my < minY) minY = my;
      if (my > maxY) maxY = my;
    }
    var spanX = Math.max(maxX - minX, 1e-9), spanY = Math.max(maxY - minY, 1e-9);
    if (zoom === null) zoom = autoZoom(W, H, spanX, spanY);
    if (zoom > 18) zoom = 18;
    if (zoom < 4) zoom = 4;
    var worldPx = 256 * Math.pow(2, zoom);

    if (!center) center = { lat: (latOfMerY((minY + maxY) / 2)), lng: ((minX + maxX) / 2) * 360 - 180 };
    var cX = merX(center.lng), cY = merY(center.lat);

    var dots = '', labels = '';
    for (k = 0; k < pts.length; k++) {
      var p = pts[k];
      var x = W / 2 + (p.mx - cX) * worldPx;
      var y = H / 2 + (p.my - cY) * worldPx;
      // 화면 밖 핀은 그리지 않습니다 (넉넉히 여유를 둡니다)
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      var open = p.href ? '<a href="' + esc(p.href) + '">' : '';
      var close = p.href ? '</a>' : '';
      dots += open
           + '<circle class="nm-ring" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="14.5"/>'
           + '<circle class="' + (p.me ? 'nm-me' : 'nm-dot') + '" cx="' + x.toFixed(1)
           + '" cy="' + y.toFixed(1) + '" r="12.5"/>'
           + '<text class="nm-num" x="' + x.toFixed(1) + '" y="' + y.toFixed(1)
           + '" dy="0.35em">' + (p.me ? '●' : p.n) + '</text>'
           + close;
      var anchor = x < 82 ? 'start' : (x > W - 82 ? 'end' : 'middle');
      var lx = Math.max(8, Math.min(W - 8, x));
      var ly = Math.max(15, y - 19);
      var text = p.me ? T.me : (shortName(p.name) + ' ' + fmt(p.d));
      labels += '<text class="nm-label" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1)
             + '" text-anchor="' + anchor + '">' + esc(text) + '</text>';
    }

    var src = 'https://maps.google.com/maps?ll=' + center.lat.toFixed(6) + ',' + center.lng.toFixed(6)
            + '&z=' + zoom + '&output=embed&hl=' + encodeURIComponent(HL);

    /* 지도와 핀을 한 상자(.nm-layer)에 담습니다.
       끌 때 이 상자를 통째로 움직이므로 둘이 어긋나지 않습니다. */
    elMap.innerHTML =
        '<div class="nm-layer">'
      + '<iframe class="nm-frame" src="' + esc(src) + '" width="' + W + '" height="' + H + '"'
      + ' loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="' + esc(T.me) + '"></iframe>'
      + '<svg class="nm-over" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">'
      + dots + labels + '</svg>'
      + '</div>';
    elLayer = elMap.querySelector('.nm-layer');

    // 목록
    var html = '';
    for (var j = 0; j < rows.length; j++) {
      html += '<li><a href="' + esc(rows[j].href) + '">'
           + '<span class="nm-i">' + (j + 1) + '</span>'
           + '<span class="nm-n">' + esc(rows[j].name) + '</span>'
           + '<span class="nm-d">' + fmt(rows[j].d) + '</span></a></li>';
    }
    elList.innerHTML = html;
    if (elMsg) {
      elMsg.textContent = rows.length
        ? (T.count ? T.count.replace('{n}', rows.length) : '')
        : (T.empty ? T.empty.replace('{n}', radiusKm + 'km') : '');
    }
  }

  /* ---- 끌어서 이동 ---- */
  function bindDrag() {
    var sx = 0, sy = 0, dx = 0, dy = 0, on = false;
    function down(e) {
      if (!elLayer) return;
      var t = e.touches ? e.touches[0] : e;
      on = true; sx = t.clientX; sy = t.clientY; dx = 0; dy = 0;
      elMap.classList.add('is-drag');
    }
    function move(e) {
      if (!on || !elLayer) return;
      var t = e.touches ? e.touches[0] : e;
      dx = t.clientX - sx; dy = t.clientY - sy;
      elLayer.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      if (!on) return;
      on = false;
      elMap.classList.remove('is-drag');
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        if (elLayer) elLayer.style.transform = '';
        return;
      }
      // 끈 만큼 중심을 옮깁니다 (픽셀 → 좌표)
      var worldPx = 256 * Math.pow(2, zoom);
      var cX = merX(center.lng) - dx / worldPx;
      var cY = merY(center.lat) - dy / worldPx;
      center = { lat: latOfMerY(cY), lng: cX * 360 - 180 };
      draw();
    }
    elMap.addEventListener('mousedown', down);
    elMap.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move);
    elMap.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    elMap.addEventListener('touchend', up);
  }

  /* ---- 열기 / 닫기 ---- */
  function open() {
    modal.hidden = false;
    document.body.classList.add('nm-open');
    // 상자 크기가 정해진 다음에 그려야 폭·높이가 맞습니다
    requestAnimationFrame(function () { draw(); });
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('nm-open');
    elMap.innerHTML = '';
  }

  btn.addEventListener('click', function () {
    if (!navigator.geolocation) { if (msg) msg.textContent = T.none; return; }
    if (msg) msg.textContent = T.busy;
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (pos) {
      btn.disabled = false;
      if (msg) msg.textContent = '';
      var la = pos.coords.latitude, ln = pos.coords.longitude;
      // 한국 밖에서 누르면 "가장 가까운 곳 900km" 같은 결과가 나와 쓸모가 없습니다
      if (km(la, ln, 36.5, 127.9) > 700) { if (msg) msg.textContent = T.far; return; }
      me = { lat: la, lng: ln };
      zoom = null; center = null;          // 다시 열면 반경에 맞춰 자동으로 잡습니다
      open();
    }, function () {
      btn.disabled = false;
      if (msg) msg.textContent = T.deny;
    }, {
      // enableHighAccuracy: true — GPS/Wi-Fi 로 잡습니다. false 면 한국 모바일 데이터에서
      //   IP 위치(통신사 게이트웨이 = 대부분 서울)로 떨어져, 제주에 있어도 서울로 잡힙니다.
      // maximumAge: 0 — "지금 어디" 를 묻는 기능이라 캐시된 위치는 받지 않습니다.
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  });

  if (elClose) elClose.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (!modal.hidden && (e.key === 'Escape' || e.keyCode === 27)) close();
  });

  if (elIn)  elIn.addEventListener('click',  function () { zoom = (zoom || 14) + 1; draw(); });
  if (elOut) elOut.addEventListener('click', function () { zoom = (zoom || 14) - 1; draw(); });

  for (var ci = 0; ci < chips.length; ci++) {
    chips[ci].addEventListener('click', function (e) {
      for (var q = 0; q < chips.length; q++) chips[q].classList.remove('on');
      e.currentTarget.classList.add('on');
      radiusKm = parseFloat(e.currentTarget.getAttribute('data-km')) || 0;
      zoom = null; center = null;         // 반경이 바뀌면 다시 맞춥니다
      draw();
    });
  }

  /* ---- 마우스 휠 / 트랙패드로 확대·축소 ----------------------------------
     주의: draw() 는 구글 지도 iframe 을 새로 만듭니다. 휠이 굴러가는 대로
     그리면 네트워크 요청이 쏟아지고 지도가 계속 깜빡입니다.
     그래서 이렇게 나눴습니다.
       1) 휠은 즉시 확대 단계만 바꾸고, 화면에는 CSS 확대(scale)로 미리 보여줍니다
       2) 손을 멈춘 뒤(140ms) 한 번만 실제로 다시 그립니다
     또 마우스 아래 지점을 기준으로 확대해야 지도답게 느껴집니다.
     그래서 커서 밑의 좌표가 제자리에 남도록 중심을 함께 옮깁니다. */
  function zoomAt(px, py, dir) {
    if (!me || !center) return;
    var W = Math.round(elMap.clientWidth) || 600;
    var H = Math.round(elMap.clientHeight) || 360;
    var z0 = zoom || 14;
    var z1 = z0 + dir;
    if (z1 > 18) z1 = 18;
    if (z1 < 4) z1 = 4;
    if (z1 === z0) return false;

    var w0 = 256 * Math.pow(2, z0), w1 = 256 * Math.pow(2, z1);
    // 커서 밑의 좌표 (메르카토르)
    var mx = merX(center.lng) + (px - W / 2) / w0;
    var my = merY(center.lat) + (py - H / 2) / w0;
    // 확대 후에도 그 좌표가 같은 화면 위치에 오도록 중심을 옮깁니다
    var cX = mx - (px - W / 2) / w1;
    var cY = my - (py - H / 2) / w1;
    center = { lat: latOfMerY(cY), lng: cX * 360 - 180 };
    zoom = z1;
    return true;
  }

  function bindWheel() {
    var acc = 0, timer = null, preview = 1, ox = 0, oy = 0;
    elMap.addEventListener('wheel', function (e) {
      if (modal.hidden) return;
      // 지도 위에서는 페이지가 스크롤되지 않게 막습니다
      e.preventDefault();
      var r = elMap.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;

      // 트랙패드는 조금씩 여러 번 옵니다. 휠 한 칸(120)이면 한 단계, 트랙패드는 모여서 한 단계 움직입니다.
      var step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      acc += step;
      var moved = 0;
      while (acc <= -100) { acc += 100; moved += 1; }
      while (acc >= 100)  { acc -= 100; moved -= 1; }
      if (!moved) return;

      if (zoomAt(ox, oy, moved)) {
        // 실제로 다시 그리기 전에 눈에 보이는 반응을 먼저 줍니다
        preview *= Math.pow(2, moved);
        if (elLayer) {
          elLayer.style.transformOrigin = ox + 'px ' + oy + 'px';
          elLayer.style.transform = 'scale(' + preview + ')';
        }
      }
      clearTimeout(timer);
      timer = setTimeout(function () {
        preview = 1;
        if (elLayer) { elLayer.style.transform = ''; elLayer.style.transformOrigin = ''; }
        draw();
      }, 140);
    }, { passive: false });
  }

  bindDrag();
  bindWheel();

  var rz = null;
  window.addEventListener('resize', function () {
    if (modal.hidden) return;
    clearTimeout(rz);
    rz = setTimeout(draw, 260);
  });
})();

/* ==========================================================================
   제철 확인 — 빌드 결과는 캐시되므로 "지금"을 방문자 브라우저가 판단합니다
   ========================================================================== */
(function () {
  'use strict';
  var el = document.querySelector('.season[data-months]');
  if (!el) return;
  var months = (el.getAttribute('data-months') || '').split(',').map(Number);
  var now = new Date().getMonth() + 1;
  var inSeason = months.indexOf(now) !== -1;
  var slot = el.querySelector('.season-now');
  if (!slot) return;
  if (inSeason) {
    slot.textContent = el.getAttribute('data-t-now') || '';
    slot.className = 'season-now is-now';
    slot.hidden = false;
    return;
  }
  // 제철이 아닐 때, 경고는 only 인 글에만 붙입니다.
  // best 인 글(예: 벚꽃 카페)은 다른 철에도 정상 영업하므로 경고하면 오해가 됩니다.
  if (el.getAttribute('data-mode') === 'only') {
    slot.textContent = el.getAttribute('data-t-off') || '';
    slot.className = 'season-now is-off';
    slot.hidden = false;
  }
})();


/* ==========================================================================
   테마 전환 (☀ / 🌙)
   --------------------------------------------------------------------------
   기본은 기기 설정을 따릅니다. 버튼을 누른 뒤부터는 고른 값을 기억합니다.
   첫 그림이 그려지기 전의 처리는 base.html 의 인라인 스크립트가 합니다.
   ========================================================================== */
(function () {
  'use strict';
  var btn = document.querySelector('.theme-btn');
  if (!btn) return;

  function current() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    // 아직 고른 적이 없으면 기기 설정이 지금 무엇인지 봅니다
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function paint() {
    var dark = current() === 'dark';
    // 버튼에는 "지금 상태"가 아니라 "누르면 될 상태"를 보여줍니다
    btn.classList.toggle('is-dark', dark);
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('kfoodtrip.theme', next); } catch (e) {}
    paint();
  });

  // 아직 고른 적이 없는 방문자는 기기 설정이 바뀌면 따라갑니다
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
      var saved = null;
      try { saved = localStorage.getItem('kfoodtrip.theme'); } catch (e) {}
      if (!saved) paint();
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  paint();
})();


/* ==========================================================================
   주문 문장 듣기 — 브라우저 내장 음성합성(Web Speech API)
   --------------------------------------------------------------------------
   글 상세의 주문 카드(.order-say)에서만 씁니다. 지원하지 않는 브라우저에서는
   버튼을 숨긴 채로 둡니다. 목소리·오디오는 방문자 기기 것만 쓰고 아무것도 보내지 않습니다.
   ========================================================================== */
(function () {
  'use strict';
  var btn = document.querySelector('.order-say');
  if (!btn) return;

  var synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') return;

  btn.hidden = false;

  var speaking = false;
  function stop() {
    speaking = false;
    btn.classList.remove('is-speaking');
  }

  btn.addEventListener('click', function () {
    var text = btn.getAttribute('data-say') || '';
    if (!text) return;
    // 읽는 중에 다시 누르면 멈춥니다
    synth.cancel();
    if (speaking) { stop(); return; }

    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.9;
    var voices = synth.getVoices() || [];
    for (var i = 0; i < voices.length; i++) {
      if (/^ko(-|_|$)/i.test(voices[i].lang || '')) { u.voice = voices[i]; break; }
    }
    u.onend = stop;
    u.onerror = stop;
    speaking = true;
    btn.classList.add('is-speaking');
    synth.speak(u);
  });

  // 페이지를 떠날 때 읽던 것을 멈춥니다
  window.addEventListener('pagehide', function () {
    try { synth.cancel(); } catch (e) {}
  });
})();
