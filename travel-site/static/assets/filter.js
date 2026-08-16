/* ==========================================================================
   목록 검색 / 지역 필터 + 모바일 메뉴
   --------------------------------------------------------------------------
   카드는 빌드할 때 이미 HTML 로 만들어져 있습니다 (검색엔진이 그대로 읽습니다).
   이 스크립트는 만들어진 카드를 보여주거나 숨길 뿐입니다.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     목록 필터 — 검색어와 지역 조건을 함께 적용합니다
     (하나를 바꿔도 다른 하나가 풀리지 않습니다)
     --------------------------------------------------------------------- */
  document.querySelectorAll('.grid[id]').forEach(setupGrid);

  function setupGrid(grid) {
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (!cards.length) return;

    const section = grid.closest('.section') || document;
    const emptyMsg = section.querySelector('.empty');
    const input = document.querySelector(`input[data-target="${grid.id}"]`);
    const chipBox = document.querySelector(`.chips[data-target="${grid.id}"]`);

    if (!input && !chipBox) return;   // 필터가 붙지 않는 목록(관련 글 등)

    const state = { keyword: '', region: '전체' };

    // 홈 목록은 평소 6개만 보입니다(.limit-6).
    // 검색·필터를 걸면 제한을 풀어서 전체 글을 대상으로 찾습니다.
    const hasLimit = grid.classList.contains('limit-6');

    function apply() {
      const kw = state.keyword.trim().toLowerCase();
      const filtering = !!kw || state.region !== '전체';
      let shown = 0;

      cards.forEach(card => {
        const okRegion = state.region === '전체' || card.dataset.region === state.region;
        const okKeyword = !kw || (card.dataset.search || '').includes(kw);
        const visible = okRegion && okKeyword;
        card.hidden = !visible;
        if (visible) shown++;
      });

      if (hasLimit) grid.classList.toggle('limit-6', !filtering);
      if (emptyMsg) emptyMsg.hidden = shown > 0;
    }

    if (input) {
      input.addEventListener('input', () => {
        state.keyword = input.value;
        apply();
      });
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
  }

  /* ---------------------------------------------------------------------
     모바일 햄버거 메뉴
     --------------------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });

    // 메뉴 밖을 누르면 닫기
    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
    });
  }
})();
