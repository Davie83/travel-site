/* ==========================================================================
   이모지 리액션 — Supabase 연동
   --------------------------------------------------------------------------
   · 로그인 없이 누를 수 있습니다. 다시 누르면 취소됩니다.
   · 방문자 식별자(visitor_id)는 이 브라우저에만 저장되는 임의의 값입니다.
     이름·이메일 같은 개인정보는 전혀 수집하지 않습니다.
   · Supabase 라이브러리를 쓰지 않고 fetch 로 직접 호출합니다 (외부 의존성 0).
   ========================================================================== */

(function () {
  'use strict';

  const root = document.querySelector('.reactions');
  if (!root) return;                       // 리액션 영역이 없는 페이지

  // Supabase 대시보드는 주소를 ".../rest/v1/" 까지 붙여서 보여줍니다.
  // 그대로 복사해 넣어도 동작하도록 뒷부분을 떼어냅니다.
  const SUPABASE_URL = (document.body.dataset.supabaseUrl || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '');
  const SUPABASE_KEY = document.body.dataset.supabaseKey || '';
  if (!SUPABASE_URL || !SUPABASE_KEY) return;   // 설정 전이면 조용히 종료

  const slug = root.dataset.slug;
  const buttons = Array.from(root.querySelectorAll('.reaction'));

  // 오류 문구는 페이지 언어에 맞춰 빌드할 때 심어둡니다
  const MSG_SAVE_ERROR = root.dataset.msgError     || 'Could not save. Please try again.';
  const MSG_LOAD_ERROR = root.dataset.msgLoadError || 'Could not load reactions.';

  /* ---------------------------------------------------------------------
     방문자 식별자 — 없으면 만들어서 브라우저에 보관
     (시크릿 모드나 쿠키 삭제 시 새로 발급됩니다. 정상 동작입니다)
     --------------------------------------------------------------------- */
  function getVisitorId() {
    try {
      let id = localStorage.getItem('visitor_id');
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || fallbackUuid();
        localStorage.setItem('visitor_id', id);
      }
      return id;
    } catch (e) {
      // 브라우저가 localStorage 를 막아둔 경우 — 이번 방문에서만 쓸 임시 식별자
      return fallbackUuid();
    }
  }

  function fallbackUuid() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  /* ---------------------------------------------------------------------
     내가 누른 것 기억 (버튼에 눌림 표시를 하기 위함)
     --------------------------------------------------------------------- */
  const MINE_KEY = 'reacted:' + slug;

  function getMine() {
    try { return new Set(JSON.parse(localStorage.getItem(MINE_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }

  function saveMine(set) {
    try { localStorage.setItem(MINE_KEY, JSON.stringify(Array.from(set))); }
    catch (e) { /* 저장 못해도 동작에는 지장 없음 */ }
  }

  /* ---------------------------------------------------------------------
     Supabase 함수 호출
     --------------------------------------------------------------------- */
  function rpc(fn, params) {
    const headers = {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
    // 구형 anon 키(eyJ... JWT)일 때만 Authorization 헤더를 함께 보냅니다.
    // 신형 publishable 키(sb_publishable_...)는 apikey 헤더만으로 인증됩니다.
    if (SUPABASE_KEY.startsWith('eyJ')) {
      headers['Authorization'] = 'Bearer ' + SUPABASE_KEY;
    }

    return fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    }).then(res => {
      if (!res.ok) throw new Error('rpc ' + fn + ' failed: ' + res.status);
      return res.json();
    });
  }

  /* ---------------------------------------------------------------------
     화면 갱신
     --------------------------------------------------------------------- */
  // 마지막으로 서버에서 받은 집계 — 저장 실패 시 이 값으로 되돌립니다
  let lastRows = [];

  function paint(rows) {
    lastRows = rows || lastRows;
    const counts = {};
    lastRows.forEach(r => { counts[r.rkey] = r.total; });

    const mine = getMine();
    buttons.forEach(btn => {
      const key = btn.dataset.key;
      const n = counts[key] || 0;
      btn.querySelector('.reaction-count').textContent = n;
      btn.classList.toggle('has-count', n > 0);
      const pressed = mine.has(key);
      btn.classList.toggle('pressed', pressed);
      btn.setAttribute('aria-pressed', String(pressed));
    });
  }

  function showError(msg) {
    const note = root.querySelector('.reactions-note');
    if (note) note.textContent = msg;
  }

  /* ---------------------------------------------------------------------
     처음 진입 시 개수 불러오기
     --------------------------------------------------------------------- */
  rpc('get_reactions', { p_slug: slug })
    .then(paint)
    .catch(() => {
      paint([]);
      showError(MSG_LOAD_ERROR);
    });

  /* ---------------------------------------------------------------------
     버튼 클릭 — 누르기 / 취소
     --------------------------------------------------------------------- */
  let busy = false;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      root.classList.add('busy');

      const key = btn.dataset.key;
      const mine = getMine();

      // 서버 응답을 기다리지 않고 먼저 화면을 바꿉니다 (체감 속도)
      if (mine.has(key)) mine.delete(key); else mine.add(key);
      saveMine(mine);
      btn.classList.toggle('pressed', mine.has(key));
      btn.setAttribute('aria-pressed', String(mine.has(key)));
      btn.classList.add('bump');
      setTimeout(() => btn.classList.remove('bump'), 300);

      rpc('toggle_reaction', { p_slug: slug, p_key: key, p_visitor: getVisitorId() })
        .then(paint)
        .catch(() => {
          // 실패했으면 눌림 표시를 되돌리고, 마지막으로 받은 집계를 다시 그립니다
          const back = getMine();
          if (back.has(key)) back.delete(key); else back.add(key);
          saveMine(back);
          paint(null);
          showError(MSG_SAVE_ERROR);
        })
        .finally(() => {
          busy = false;
          root.classList.remove('busy');
        });
    });
  });
})();
