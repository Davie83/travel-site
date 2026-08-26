/* ==========================================================================
   사이트 설정 — 여기 값만 바꾸면 사이트 전체에 반영됩니다.
   ========================================================================== */

module.exports = {

  /* ---- 기본 ------------------------------------------------------------
     name 은 언어별로 다르게 쓸 수 있습니다.
     영어 페이지에 한글 로고가 뜨면 관광객은 읽지 못하므로 분리했습니다.
     (전 언어 공통으로 쓰려면 name: 'Korea Trips' 처럼 문자열 하나로 두면 됩니다) */
  name: {
    ko: '여행한입',
    en: 'Korea Trips',
    ja: 'Korea Trips',
    zh: 'Korea Trips'
  },

  // ★ 끝에 / 붙이지 마세요
  url: 'https://kfoodtrip.net',

  email: 'ckqkrdl83@naver.com',

  /* ---- 링크 공유 미리보기 이미지 -------------------------------------
     카카오톡·페이스북·X 에서 링크를 붙였을 때 보이는 대표 이미지입니다.
     글에는 그 글의 사진이 쓰이고, 홈·지역·소개 페이지에는 이 이미지가 쓰입니다.
     tools\make-og-image.ps1 로 다시 만들 수 있습니다. (1200x630)    */
  ogImage: 'assets/img/og-default.jpg',

  /* ---- 언어 -----------------------------------------------------------
     ko 는 주소에 접두어가 없습니다 (기존 주소 유지).
     나머지는 /en/ /ja/ /zh/ 아래에 만들어집니다.

     enabled: false 로 두면 그 언어는 아예 생성되지 않습니다.
     번역 글(.md)을 준비한 뒤 true 로 바꾸세요.

     htmlLang / hreflang 은 검색엔진에 알려줄 언어 코드입니다.  */
  locales: [
    { code: 'ko', dir: '',    label: '한국어',  short: 'KO', htmlLang: 'ko',      hreflang: 'ko',      enabled: true  },
    { code: 'en', dir: 'en/', label: 'English', short: 'EN', htmlLang: 'en',      hreflang: 'en',      enabled: true  },
    { code: 'ja', dir: 'ja/', label: '日本語',  short: 'JA', htmlLang: 'ja',      hreflang: 'ja',      enabled: true  },
    { code: 'zh', dir: 'zh/', label: '简体中文', short: 'ZH', htmlLang: 'zh-Hans', hreflang: 'zh-Hans', enabled: true  }
  ],

  // 언어를 못 정한 검색엔진/방문자에게 보여줄 기본 언어 (관광객 대상이라 영어)
  defaultLocale: 'en',

  /* ---- 지역 8개 --------------------------------------------------------
     slug 이 주소가 됩니다: /region/seoul.html
     color/colorDark 는 그 지역을 대표하는 색입니다.
     글의 region: 값에는 slug 를 씁니다 (예: region: seoul).        */
  /* 색은 지도에서 서로 맞닿는 지역끼리 최대한 멀어지도록 색상환에 배치했습니다.
     (예전 팔레트는 서울·경기·강원이 모두 파란 계열이라 구분이 안 됐습니다)
     인접한 지역 간 색 차이를 수치로 검증한 값이니 임의로 바꾸면
     붙어 있는 지역이 같은 색으로 보일 수 있습니다.                */
  regions: [
    { slug: 'seoul',       color: '#312a7e', colorDark: '#827adc',   // 남색
      names: { ko: '서울',      en: 'Seoul',              ja: 'ソウル',   zh: '首尔' },
      areas: [
        { slug: 'yeouido',      names: { ko: '여의도',     en: 'Yeouido',                ja: '汝矣島',        zh: '汝矣岛' } },
        { slug: 'myeongdong',   names: { ko: '명동·남대문', en: 'Myeongdong & Namdaemun', ja: '明洞・南大門',  zh: '明洞·南大门' } },
        { slug: 'gwanghwamun',  names: { ko: '광화문',     en: 'Gwanghwamun',            ja: '光化門',        zh: '光化门' } },
        { slug: 'jongno',       names: { ko: '종로',       en: 'Jongno',                 ja: '鍾路',          zh: '钟路' } },
        { slug: 'yeongdeungpo', names: { ko: '영등포',     en: 'Yeongdeungpo',           ja: '永登浦',        zh: '永登浦' } },
        { slug: 'hongdae',      names: { ko: '홍대',       en: 'Hongdae',                ja: '弘大',          zh: '弘大' } },
        { slug: 'mapo',         names: { ko: '마포',       en: 'Mapo',                   ja: '麻浦',          zh: '麻浦' } }
      ] },
    { slug: 'gyeonggi',    color: '#884096', colorDark: '#d5a4df',   // 보라
      names: { ko: '경기·인천', en: 'Gyeonggi & Incheon', ja: '京畿・仁川', zh: '京畿·仁川' },
      areas: [
        { slug: 'incheon', names: { ko: '인천', en: 'Incheon', ja: '仁川', zh: '仁川' } }
      ] },
    { slug: 'gangwon',     color: '#2a6984', colorDark: '#7cc1de',   // 청록
      names: { ko: '강원',      en: 'Gangwon',            ja: '江原',     zh: '江原' },
      areas: [
        { slug: 'cheorwon', names: { ko: '철원', en: 'Cheorwon', ja: '鉄原', zh: '铁原' } }
      ] },
    { slug: 'chungcheong', color: '#498235', colorDark: '#9fd98c',   // 초록
      names: { ko: '충청',      en: 'Chungcheong',        ja: '忠清',     zh: '忠清' },
      areas: [
        { slug: 'daejeon', names: { ko: '대전', en: 'Daejeon', ja: '大田', zh: '大田' } }
      ] },
    { slug: 'jeolla',      color: '#998329', colorDark: '#e7d488',   // 황금
      names: { ko: '전라',      en: 'Jeolla',             ja: '全羅',     zh: '全罗' },
      areas: [
        { slug: 'jeonbuk', names: { ko: '전북', en: 'Jeonbuk', ja: '全北', zh: '全北' } },
        { slug: 'jeonnam', names: { ko: '전남', en: 'Jeonnam', ja: '全南', zh: '全南' } }
      ] },
    { slug: 'gyeongsang',  color: '#993633', colorDark: '#e39996',   // 벽돌
      names: { ko: '경상',      en: 'Gyeongsang',         ja: '慶尚',     zh: '庆尚' },
      areas: [
        { slug: 'gyeongju', names: { ko: '경주', en: 'Gyeongju', ja: '慶州', zh: '庆州' } },
        { slug: 'geoje',    names: { ko: '거제', en: 'Geoje',    ja: '巨済', zh: '巨济' } },
        { slug: 'jinhae',   names: { ko: '진해', en: 'Jinhae',   ja: '鎮海', zh: '镇海' } }
      ] },
    { slug: 'busan',       color: '#257e77', colorDark: '#72dfd6',   // 바다
      names: { ko: '부산',      en: 'Busan',              ja: '釜山',     zh: '釜山' },
      areas: [
        { slug: 'dongnae',   names: { ko: '동래',   en: 'Dongnae',   ja: '東莱',   zh: '东莱' } },
        { slug: 'gwangalli', names: { ko: '광안리', en: 'Gwangalli', ja: '広安里', zh: '广安里' } }
      ] },
    { slug: 'jeju',        color: '#c25e10', colorDark: '#f5a45a',   // 감귤
      names: { ko: '제주',      en: 'Jeju',               ja: '済州',     zh: '济州' },
      areas: [
        { slug: 'jejusi',   names: { ko: '제주시',  en: 'Jeju City', ja: '済州市',  zh: '济州市' } },
        { slug: 'aewol',    names: { ko: '애월',    en: 'Aewol',     ja: '涯月',    zh: '涯月' } },
        { slug: 'seogwipo', names: { ko: '서귀포',  en: 'Seogwipo',  ja: '西帰浦',  zh: '西归浦' } },
        { slug: 'seongsan',  names: { ko: '성산',    en: 'Seongsan',  ja: '城山',    zh: '城山' } }
      ] }
  ],

  /* 예전 글이 쓰던 한글 지역명 → 새 slug 로 자동 변환.
     기존 .md 파일을 안 고쳐도 되도록 두는 표입니다.               */
  regionAliases: {
    '서울': 'seoul',   '경기': 'gyeonggi', '인천': 'gyeonggi',
    '강원': 'gangwon', '충북': 'chungcheong', '충남': 'chungcheong', '대전': 'chungcheong', '세종': 'chungcheong',
    '전북': 'jeolla',  '전남': 'jeolla',  '광주': 'jeolla',
    '경북': 'gyeongsang', '경남': 'gyeongsang', '대구': 'gyeongsang', '울산': 'gyeongsang',
    '부산': 'busan',   '제주': 'jeju'
  },


  /* ---- 추천 코스 -------------------------------------------------------
     동선 기능을 처음 쓰는 사람이 한 곳씩 담지 않아도 되도록
     실제로 붙어 있는 곳들을 순서대로 묶어둡니다.
     stops 는 글의 파일 이름(slug)입니다. 없는 이름을 적으면 빌드가 경고합니다. */
  routes: [
    { slug: 'yeouido-lunch',
      names: { ko: '여의도 — 점심 한 끼와 한강뷰 카페',
               en: 'Yeouido — lunch, then a Han River cafe',
               ja: '汝矣島 — 昼ごはんと漢江ビューのカフェ',
               zh: '汝矣岛 — 午餐加汉江景观咖啡' },
      stops: ['seoul-hadongkwan', 'seoul-gangbyeon-seojae'] },

    { slug: 'myeongdong-namsan',
      names: { ko: '명동·남산 — 시장 냉면에서 남산 비빔밥까지',
               en: 'Myeongdong & Namsan — market noodles to mountain bibimbap',
               ja: '明洞・南山 — 市場の冷麺から南山のビビンバまで',
               zh: '明洞·南山 — 从市场冷面到南山拌饭' },
      stops: ['seoul-buwon-myeonok', 'seoul-mokmyeoksanbang', 'seoul-myeongdong-shindonggung'] },

    { slug: 'jongno-evening',
      names: { ko: '종로·익선동 — 커피, 디저트, 그리고 밤',
               en: 'Jongno & Ikseondong — coffee, dessert, then night',
               ja: '鍾路・益善洞 — コーヒー、デザート、そして夜',
               zh: '钟路·益善洞 — 咖啡、甜点，然后是夜晚' },
      stops: ['seoul-dozo-coffee', 'seoul-dongbaek-yanggwajeom', 'seoul-gongpyeongdong-kkomjangeo'] },

    { slug: 'jeju-west',
      names: { ko: '제주 서쪽 — 애월 막국수와 오일장',
               en: 'West Jeju — Aewol noodles and the five-day market',
               ja: '済州西部 — 涯月のマッククスと五日市',
               zh: '济州西部 — 涯月拌面与五日集市' },
      stops: ['jeju-aewol-makguksu', 'jeju-oiljang'] }
  ],

  /* ---- 태그 칩 ---------------------------------------------------------
     글 하단에 보여줄 태그만 여기에 골라둡니다.

     왜 이렇게 하는가
       전에는 태그를 언어별 글마다 따로 적었습니다. 그래서 같은 글인데
       한국어는 칩 3개, 일본어는 0개가 되는 일이 41개 중 30개에서 생겼습니다.
       (영어는 "노포"를 old restaurant / long-running 두 단어로 쓰기도 했습니다)
       이제 분류 키는 한국어 글의 tags 하나만 보고, 화면에 보일 이름만
       여기에서 언어별로 정합니다. 언어별로 어긋날 수가 없습니다.

     고르는 기준
       - 판정 기준이 분명한 것만 (영업시간 · 예약제 · 재료 · 음식 이름)
       - 지역·동네 이름은 넣지 않습니다 — 지역 칩과 동네 칩이 이미 합니다
       - 랜드마크(국회의사당 등)와 "제철"은 빼두었습니다 (제철은 배지가 합니다)
       - 여기 없는 태그는 검색에만 쓰이고 칩으로는 안 나옵니다        */
  tagChips: [
    /* 상황 · 성격 — 관광객에게 가장 쓸모 있는 축입니다 */
    { key: '심야',     names: { ko: '심야',     en: 'Late night',      ja: '深夜',         zh: '深夜' } },
    { key: '아침식사', names: { ko: '아침식사', en: 'Breakfast',       ja: '朝食',         zh: '早餐' } },
    { key: '예약필수', names: { ko: '예약필수', en: 'Booking needed',  ja: '予約必須',     zh: '需要预约' } },
    { key: '채식',     names: { ko: '채식',     en: 'Vegetarian-ok',   ja: 'ベジタリアン', zh: '素食可' } },

    /* 자리 성격 */
    { key: '카페',     names: { ko: '카페',     en: 'Cafe',            ja: 'カフェ',       zh: '咖啡馆' } },
    { key: '술집',     names: { ko: '술집',     en: 'Drinking spot',   ja: '居酒屋',       zh: '酒馆' } },
    { key: '막걸리',   names: { ko: '막걸리',   en: 'Makgeolli',       ja: 'マッコリ',     zh: '马格利酒' } },
    { key: '드립커피', names: { ko: '드립커피', en: 'Pour-over',       ja: 'ドリップ',     zh: '手冲咖啡' } },

    /* 음식 종류 */
    { key: '국밥',     names: { ko: '국밥',     en: 'Gukbap',          ja: 'クッパ',       zh: '汤饭' } },
    { key: '곰탕',     names: { ko: '곰탕',     en: 'Gomtang',         ja: 'コムタン',     zh: '牛肉汤' } },
    { key: '돼지국밥', names: { ko: '돼지국밥', en: 'Pork gukbap',     ja: 'テジクッパ',   zh: '猪肉汤饭' } },
    { key: '국수',     names: { ko: '국수',     en: 'Noodles',         ja: '麺',           zh: '面食' } },
    { key: '콩국수',   names: { ko: '콩국수',   en: 'Kongguksu',       ja: 'コングクス',   zh: '豆浆面' } },
    { key: '막국수',   names: { ko: '막국수',   en: 'Makguksu',        ja: 'マッククス',   zh: '荞麦拌面' } },
    { key: '라멘',     names: { ko: '라멘',     en: 'Ramen',           ja: 'ラーメン',     zh: '拉面' } },
    { key: '수육',     names: { ko: '수육',     en: 'Suyuk',           ja: 'スユク',       zh: '水煮肉' } },
    { key: '정식',     names: { ko: '정식',     en: 'Set meal',        ja: '定食',         zh: '套餐' } },
    { key: '해산물',   names: { ko: '해산물',   en: 'Seafood',         ja: '魚介',         zh: '海鲜' } },
    { key: '물회',     names: { ko: '물회',     en: 'Mulhoe',          ja: 'ムルフェ',     zh: '冷汤生鱼' } },
    { key: '회덮밥',   names: { ko: '회덮밥',   en: 'Sashimi bowl',    ja: '海鮮丼',       zh: '生鱼盖饭' } },

    /* 요리 계통 */
    { key: '일식',     names: { ko: '일식',     en: 'Japanese',        ja: '和食',         zh: '日本料理' } },
    { key: '중식',     names: { ko: '중식',     en: 'Chinese',         ja: '中華',         zh: '中餐' } }
  ],
  /* ---- 카테고리 --------------------------------------------------------
     slug 이 주소가 됩니다: /travel.html · /food.html
     화면에 보이는 이름은 content/i18n.js 에 언어별로 있습니다.        */
  categories: [
    { slug: 'travel' },   // 여행지 / Places
    { slug: 'food'   }    // 맛집  / Food
  ],

  /* 예전 글의 cat 값을 바꿨을 때 쓰는 변환표 (지금은 바꿀 것이 없습니다) */
  categoryAliases: { places: 'travel' },

  /* ---- 예시글: 목록 맨 뒤로 밀기 ---------------------------------------
     실제 글로 교체하거나 지운 뒤에는 여기서도 지워주세요.        */
  demoPosts: [],

  /* ---- Supabase (이모지 리액션) ---------------------------------------
     Project Settings > API Keys 의 'Publishable key' (sb_publishable_...)
     ★ secret / service_role 키는 절대 넣지 마세요.
     리액션은 언어와 무관하게 글 단위로 합산됩니다.               */
  supabase: {
    url:     'https://sseaofsrnacjoecohout.supabase.co',
    anonKey: 'sb_publishable_lZ6Z6w_HOl5VOyzlaIhtsw_qM7DmhtG'
  },

  /* ---- 글쓴이 ---------------------------------------------------------
     구글 지도 기여 프로필. 검색엔진에 "이 글을 쓴 사람이 누구인지" 알려주는
     용도입니다 (JSON-LD 의 sameAs). 로그아웃 상태에서도 공개로 보이는지
     확인한 주소만 넣으세요. mapsProfile 을 비우면 사이트에 아무것도
     표시되지 않습니다.

     photoViewsFloor 는 "이 숫자 이상"이라는 뜻으로 씁니다. 조회수는 API 로
     가져올 수 없어 수동 갱신인데, 정확한 숫자를 박아두면 다음 달에 틀린 값이
     됩니다. 늘어나도 계속 참인 표현을 쓰려고 내림값만 둡니다.
     2026-08-23 확인: 레벨 6 · 사진 102장 · 조회수 216,779회               */
  author: {
    name:            'Davie',
    mapsProfile:     'https://www.google.com/maps/contrib/108511658203720708025',
    guideLevel:      6,
    photoViewsFloor: 210000
  },

  /* ---- 구글 애드센스 ---------------------------------------------------
     예: 'ca-pub-1234567890123456'  (비우면 광고 코드가 들어가지 않습니다) */
  adsensePublisherId: 'ca-pub-8309886055219569',

  // 광고 자리를 점선 박스로 미리 보기 (방문자에게도 보입니다)
  showAdPlaceholders: false,

  /* ---- 리액션 이모지 ---------------------------------------------------
     key 는 DB에 저장되는 값이라 바꾸면 기존 기록과 끊깁니다.
     라벨은 언어별로 content/i18n.js 에 있습니다.                 */
  reactions: [
    { key: 'like',   emoji: '👍' },
    { key: 'wantgo', emoji: '😍' },
    { key: 'yummy',  emoji: '😋' },
    { key: 'wow',    emoji: '😮' },
    { key: 'thanks', emoji: '🙏' },
    { key: 'fun',    emoji: '😂' }
  ]
};
