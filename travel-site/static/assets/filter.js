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
    const input    = document.querySelector(`input[data-target="${grid.id}"]`);
    const chipBox  = document.querySelector(`.chips[data-target="${grid.id}"]`);
    const tabBox   = document.querySelector(`.rtabs[data-target="${grid.id}"]`);

    if (!input && !chipBox && !tabBox) return;   // 관련 글 목록 등은 그대로 둡니다

    // 검색어 · 지역 · 카테고리를 함께 기억합니다 (하나를 바꿔도 나머지가 풀리지 않음)
    const state = { keyword: '', region: 'all', cat: 'all' };
    const hasLimit = grid.classList.contains('limit-6');

    function apply() {
      const kw = state.keyword.trim().toLowerCase();
      const filtering = !!kw || state.region !== 'all' || state.cat !== 'all';
      let shown = 0;

      cards.forEach(card => {
        const okRegion = state.region === 'all' || card.dataset.region === state.region;
        const okCat    = state.cat    === 'all' || card.dataset.cat    === state.cat;
        const okKw     = !kw || (card.dataset.search || '').includes(kw);
        const visible  = okRegion && okCat && okKw;
        card.hidden = !visible;
        if (visible) shown++;
      });

      // 홈 목록은 평소 6개만 보이지만, 검색 중에는 전체를 대상으로 합니다
      if (hasLimit) grid.classList.toggle('limit-6', !filtering);
      if (emptyMsg) emptyMsg.hidden = shown > 0;
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
