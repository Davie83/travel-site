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
