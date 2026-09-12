/* ==========================================================================
   약식 지도 — 지역/동네 페이지의 목록 옆(데스크톱) 또는 오버레이(모바일)에
   보여주는 점 배치도. 실제 지도 타일이 아니라 lat/lng 로 계산한 상대 위치입니다.
   --------------------------------------------------------------------------
   할 일
     1) filter.js 가 카드를 숨기면(.card[hidden]) 지도 점도 같이 숨깁니다
        — 카드 hidden 속성을 MutationObserver 로 지켜봅니다.
     2) 카드 ↔ 점 서로 호버하면 상대편도 강조합니다.
     3) 점을 누르면 카드로 스크롤하고 잠깐 반짝여 위치를 알려줍니다.
     4) 모바일에서는 버튼으로 지도 패널을 열고 닫습니다.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('.schematic-map').forEach(function (map) {
    var gridId = map.getAttribute('data-target');
    var grid = gridId ? document.getElementById(gridId) : null;
    if (!grid) return;

    var dots = Array.prototype.slice.call(map.querySelectorAll('.smap-dot'));
    if (!dots.length) return;

    var dotBySlug = {};
    dots.forEach(function (dot) { dotBySlug[dot.getAttribute('data-slug')] = dot; });

    function syncVisibility() {
      grid.querySelectorAll('.card[data-slug]').forEach(function (card) {
        var dot = dotBySlug[card.getAttribute('data-slug')];
        if (dot) dot.hidden = card.hidden;
      });
    }
    syncVisibility();

    new MutationObserver(syncVisibility).observe(grid, {
      subtree: true, attributes: true, attributeFilter: ['hidden']
    });

    // 카드 ↔ 점 서로 호버 강조
    grid.querySelectorAll('.card[data-slug]').forEach(function (card) {
      var dot = dotBySlug[card.getAttribute('data-slug')];
      if (!dot) return;
      card.addEventListener('mouseenter', function () { dot.classList.add('is-active'); });
      card.addEventListener('mouseleave', function () { dot.classList.remove('is-active'); });
    });
    dots.forEach(function (dot) {
      var card = grid.querySelector('.card[data-slug="' + dot.getAttribute('data-slug') + '"]');
      if (!card) return;
      dot.addEventListener('mouseenter', function () { card.classList.add('is-map-hover'); });
      dot.addEventListener('mouseleave', function () { card.classList.remove('is-map-hover'); });
    });

    // 점 클릭 → 해당 카드로 스크롤 + 잠깐 반짝임
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        var card = grid.querySelector('.card[data-slug="' + dot.getAttribute('data-slug') + '"]');
        if (!card || card.hidden) return;
        e.preventDefault();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('is-map-hover');
        setTimeout(function () { card.classList.remove('is-map-hover'); }, 1200);
        closePanel();
      });
    });

    // 모바일 오버레이 열기/닫기
    var panel = map.closest('.region-map-panel');
    var toggleBtn = panel ? document.querySelector('.region-map-toggle[data-panel="' + panel.id + '"]') : null;
    var closeBtn = panel ? panel.querySelector('.region-map-close') : null;

    function openPanel() {
      if (!panel) return;
      panel.classList.add('is-open');
      document.body.classList.add('map-panel-open');
    }
    function closePanel() {
      if (!panel || window.innerWidth > 860) return;
      panel.classList.remove('is-open');
      document.body.classList.remove('map-panel-open');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
  });
})();
