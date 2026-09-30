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

    // 확대/축소 — 실제 지도 타일이 아니라 사전 렌더 이미지 + 좌표 점이라, 팬(드래그
    // 이동)까지는 지원하지 않고 가운데를 기준으로 커지는 간단한 버튼식 줌만 둡니다.
    var frame = map.closest('.schematic-map-frame');
    var zoomInBtn = frame ? frame.querySelector('.smap-zoom-in') : null;
    var zoomOutBtn = frame ? frame.querySelector('.smap-zoom-out') : null;
    var ZOOM_STEPS = [1, 1.5, 2, 2.75];
    var zoomIdx = 0;
    function applyZoom() {
      map.style.transform = zoomIdx === 0 ? '' : 'scale(' + ZOOM_STEPS[zoomIdx] + ')';
      if (zoomInBtn) zoomInBtn.disabled = zoomIdx === ZOOM_STEPS.length - 1;
      if (zoomOutBtn) zoomOutBtn.disabled = zoomIdx === 0;
    }
    if (zoomInBtn) zoomInBtn.addEventListener('click', function () {
      if (zoomIdx < ZOOM_STEPS.length - 1) { zoomIdx++; applyZoom(); }
    });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () {
      if (zoomIdx > 0) { zoomIdx--; applyZoom(); }
    });
    applyZoom();

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

    // 점 클릭 → 해당 카드로 스크롤 + 잠깐 반짝임.
    // is-active 를 여기서도 켜두는 이유: 터치 기기는 :hover 가 없어서, 이름표를
    // "선택했을 때만" 보이게 하려면 클릭 자체가 선택 상태를 만들어줘야 합니다.
    // 다른 점을 클릭하면 이전 점의 이름표는 다시 숨깁니다.
    var activeDot = null;
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        var card = grid.querySelector('.card[data-slug="' + dot.getAttribute('data-slug') + '"]');
        if (!card || card.hidden) return;
        e.preventDefault();
        if (activeDot && activeDot !== dot) activeDot.classList.remove('is-active');
        dot.classList.add('is-active');
        activeDot = dot;
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
