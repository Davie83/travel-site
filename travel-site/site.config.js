/* ==========================================================================
   사이트 설정 — 여기 값만 바꾸면 사이트 전체에 반영됩니다.
   (빌드할 때 build.js 가 이 파일을 읽습니다)
   ========================================================================== */

module.exports = {

  /* ---- 기본 정보 ---------------------------------------------------- */
  name:        '여행한입',
  tagline:     '가기 전에 알았으면 좋았을 것들',
  description: '국내 여행지와 맛집을 직접 다녀와 정리합니다. 동선, 예산, 주차, 붐비는 시간대까지 실제로 쓸모 있는 정보 위주입니다.',

  // ★ Netlify 주소가 나오면 여기를 바꾸세요. 끝에 / 붙이지 마세요.
  //   예: 'https://yeohaeng-hanip.netlify.app'
  url: 'https://koreatrips.netlify.app/',

  // ★ 문의용 이메일
  email: 'p71000864@gmail.com',

  /* ---- Supabase (이모지 리액션용) ------------------------------------
     Supabase 대시보드 > Project Settings > Data API 에서 복사합니다.
     anon key 는 브라우저에 공개되는 것이 정상입니다. 비밀키가 아닙니다.
     (절대 service_role key 를 넣지 마세요)
     값이 비어 있으면 리액션 버튼이 자동으로 숨겨집니다.        */
  supabase: {
    url:     'https://sseaofsrnacjoecohout.supabase.co/',   // 예: 'https://abcdefghijk.supabase.co'
    anonKey: 'sb_publishable_lZ6Z6w_HOl5VOyzlaIhtsw_qM7DmhtG'    // 예: 'eyJhbGciOi...'
  },

  /* ---- 구글 애드센스 --------------------------------------------------
     승인 후 발급받은 게시자 ID 를 넣으면 모든 페이지에 자동 삽입됩니다.
     예: 'ca-pub-1234567890123456'  (비워두면 광고 코드가 들어가지 않습니다) */
  adsensePublisherId: '',

  /* ---- 리액션 이모지 --------------------------------------------------
     개수와 종류를 자유롭게 바꿔도 됩니다.
     key 는 DB에 저장되는 값이라 한 번 정하면 바꾸지 마세요.
     (바꾸면 기존에 쌓인 리액션과 연결이 끊깁니다)
     ★ key 를 추가/변경하면 supabase/schema.sql 의 허용 목록도 함께 고쳐야 합니다 */
  reactions: [
    { key: 'like',    emoji: '👍', label: '좋아요' },
    { key: 'wantgo',  emoji: '😍', label: '가보고싶다' },
    { key: 'yummy',   emoji: '😋', label: '맛있겠다' },
    { key: 'wow',     emoji: '😮', label: '몰랐어요' },
    { key: 'thanks',  emoji: '🙏', label: '도움됐어요' },
    { key: 'fun',     emoji: '😂', label: '재밌네요' }
  ],

  /* ---- 카테고리 -------------------------------------------------------
     slug 는 만들어질 파일 이름입니다 (travel.html, food.html)         */
  categories: [
    { slug: 'travel', label: '여행지', title: '국내 여행지',
      desc: '어디를 갈지보다 어떻게 돌지가 더 어렵습니다. 코스와 동선 위주로 정리했습니다.' },
    { slug: 'food',   label: '맛집',   title: '지역 맛집',
      desc: '줄 서기 전에 알아야 할 가격대, 주문 순서, 웨이팅 상황을 함께 적었습니다.' }
  ]
};
