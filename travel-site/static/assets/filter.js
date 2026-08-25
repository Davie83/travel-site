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

    if (areaBox) {
      areaBox.addEventListener('click', e => {
        const btn = e.target.closest('.achip');
        if (!btn) return;
        areaBox.querySelectorAll('.achip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        state.area = btn.dataset.area;
        apply();
      });
    }

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
   글 카드에는 이미 data-lat / data-lng 가 전부(38/38) 들어 있습니다.
   브라우저 위치만 받아서 거리로 다시 정렬하면 됩니다. 서버는 쓰지 않습니다.
   위치는 어디에도 보내지 않고 이 페이지 안에서만 씁니다.
   ========================================================================== */
(function () {
  'use strict';
  var box = document.querySelector('.near');
  if (!box) return;
  var btn   = box.querySelector('.near-btn');
  var msg   = box.querySelector('.near-msg');
  var reset = box.querySelector('.near-reset');
  var gridId = box.getAttribute('data-target') || '';
  var grid = document.getElementById(gridId);
  if (!btn || !grid) return;

  var T = {
    busy:  box.getAttribute('data-t-busy')  || '',
    done:  box.getAttribute('data-t-done')  || '',
    deny:  box.getAttribute('data-t-deny')  || '',
    far:   box.getAttribute('data-t-far')   || '',
    none:  box.getAttribute('data-t-none')  || ''
  };

  // 원래 순서를 기억해 둡니다 (되돌리기용)
  var original = [].slice.call(grid.children);

  /* 하버사인. saved.js 의 것과 같은 식입니다 (각 파일이 독립적으로 돌아야 해서 따로 둡니다) */
  function km(la1, ln1, la2, ln2) {
    var R = 6371, d = Math.PI / 180;
    var dLa = (la2 - la1) * d, dLn = (ln2 - ln1) * d;
    var h = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
      Math.cos(la1 * d) * Math.cos(la2 * d) * Math.sin(dLn / 2) * Math.sin(dLn / 2);
    return R * 2 * Math.asin(Math.sqrt(h));
  }

  function fmt(k) {
    return k < 1 ? (Math.round(k * 1000) + 'm') : (k < 10 ? k.toFixed(1) : Math.round(k)) + 'km';
  }

  function clearBadges() {
    var old = grid.querySelectorAll('.card-dist');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }

  function restore() {
    clearBadges();
    for (var i = 0; i < original.length; i++) grid.appendChild(original[i]);
    grid.classList.add('limit-4');
    grid.removeAttribute('data-near');
    msg.textContent = '';
    reset.hidden = true;
  }

  function sortBy(lat, lng) {
    var cards = [].slice.call(grid.children);
    var rows = [];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var la = parseFloat(c.getAttribute('data-lat'));
      var ln = parseFloat(c.getAttribute('data-lng'));
      if (!isFinite(la) || !isFinite(ln)) continue;
      rows.push({ el: c, d: km(lat, lng, la, ln) });
    }
    if (!rows.length) return 0;
    rows.sort(function (a, b) { return a.d - b.d; });
    clearBadges();
    for (var j = 0; j < rows.length; j++) {
      grid.appendChild(rows[j].el);
      var tag = document.createElement('span');
      tag.className = 'card-dist';
      tag.textContent = fmt(rows[j].d);
      var body = rows[j].el.querySelector('.card-body') || rows[j].el;
      body.insertBefore(tag, body.firstChild);
    }
    // 가까운 순서를 보여주는 것이 목적이므로 4개 제한을 풉니다
    grid.classList.remove('limit-4');
    grid.setAttribute('data-near', '1');
    return rows.length;
  }

  btn.addEventListener('click', function () {
    if (!navigator.geolocation) { msg.textContent = T.none; return; }
    msg.textContent = T.busy;
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (pos) {
      btn.disabled = false;
      var la = pos.coords.latitude, ln = pos.coords.longitude;
      // 한국 밖에서 누르면 결과가 의미 없습니다. 대략 한국 중심에서 700km 로 자릅니다.
      if (km(la, ln, 36.5, 127.9) > 700) { msg.textContent = T.far; return; }
      var n = sortBy(la, ln);
      msg.textContent = n ? T.done : '';
      reset.hidden = !n;
    }, function () {
      btn.disabled = false;
      msg.textContent = T.deny;
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
  });

  reset.addEventListener('click', restore);
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
