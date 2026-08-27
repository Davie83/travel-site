/* ==========================================================================
   맨 위로 — 스크롤을 조금 내리면 우측 가운데에 뜨는 버튼. 누르면 페이지 맨 위로.
   --------------------------------------------------------------------------
   부드러운 스크롤은 style.css 의 html{scroll-behavior:smooth} 가 담당하고,
   동작 최소화(prefers-reduced-motion) 설정이면 그 규칙이 자동으로 즉시 이동으로 바뀝니다.
   ========================================================================== */

(function () {
  'use strict';

  var btn = document.querySelector('.to-top');
  if (!btn) return;

  var SHOW_AT = 500;   // 이만큼(px) 내려가면 버튼을 보여줍니다
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    btn.classList.toggle('show', y > SHOW_AT);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  btn.addEventListener('click', function () {
    // behavior 를 지정하지 않으면 CSS 의 scroll-behavior 를 따릅니다
    window.scrollTo(0, 0);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  update();   // 페이지가 이미 내려간 상태로 열렸을 때
})();
