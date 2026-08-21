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

  /* ---- 3-2. /saved 페이지 ---- */
  function paintSavedPage(list) {
    var page = document.getElementById('saved-page');
    if (!page) return;

    var found = showOnlySaved(page.querySelector('#saved-grid'), '.card[data-slug]', list);

    var empty = page.querySelector('.saved-empty');
    if (empty) empty.hidden = found > 0;

    var clear = page.querySelector('.saved-clear');
    if (clear) clear.hidden = found === 0;

    var count = page.querySelector('.saved-count');
    if (count) count.textContent = found ? tpl(found) : '';
  }

  function paint() {
    var list = read();
    paintHeader(list);
    paintButtons(list);
    paintStrip(list);
    paintSavedPage(list);
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
    if (!e.key || e.key === KEY) paint();
  });

  paint();
})();
