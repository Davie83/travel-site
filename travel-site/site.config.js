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
    { code: 'zh', dir: 'zh/', label: '繁體中文', short: 'ZH', htmlLang: 'zh-Hant', hreflang: 'zh-Hant', enabled: true  }
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
      names: { ko: '서울',      en: 'Seoul',              ja: 'ソウル',   zh: '首爾' },
      areas: [
        { slug: 'yeouido',      names: { ko: '여의도',     en: 'Yeouido',                ja: '汝矣島',        zh: '汝矣島' } },
        { slug: 'myeongdong',   names: { ko: '명동·남대문', en: 'Myeongdong & Namdaemun', ja: '明洞・南大門',  zh: '明洞·南大門' } },
        { slug: 'gwanghwamun',  names: { ko: '광화문',     en: 'Gwanghwamun',            ja: '光化門',        zh: '光化門' } },
        { slug: 'jongno',       names: { ko: '종로',       en: 'Jongno',                 ja: '鍾路',          zh: '鍾路' } },
        { slug: 'yeongdeungpo', names: { ko: '영등포',     en: 'Yeongdeungpo',           ja: '永登浦',        zh: '永登浦' } },
        { slug: 'hongdae',      names: { ko: '홍대',       en: 'Hongdae',                ja: '弘大',          zh: '弘大' } },
        { slug: 'mapo',         names: { ko: '마포',       en: 'Mapo',                   ja: '麻浦',          zh: '麻浦' } },
        { slug: 'gwangjin',     names: { ko: '광진·건대',  en: 'Gwangjin & Konkuk Univ.', ja: '広津・建大',   zh: '廣津·建大' } },
        { slug: 'seongdong',    names: { ko: '성동·왕십리', en: 'Seongdong & Wangsimni',  ja: '城東・往十里',  zh: '城東·往十里' } },
        { slug: 'gangnam',      names: { ko: '강남·서초',  en: 'Gangnam & Seocho',       ja: '江南・瑞草',    zh: '江南·瑞草' } },
        { slug: 'magok',        names: { ko: '강서·마곡',  en: 'Gangseo & Magok',        ja: '江西・麻谷',    zh: '江西·麻谷' } }
      ] },
    { slug: 'gyeonggi',    color: '#884096', colorDark: '#d5a4df',   // 보라
      names: { ko: '경기·인천', en: 'Gyeonggi & Incheon', ja: '京畿・仁川', zh: '京畿·仁川' },
      areas: [
        { slug: 'incheon',  names: { ko: '인천',   en: 'Incheon',        ja: '仁川',   zh: '仁川' } },
        { slug: 'gapyeong', names: { ko: '가평',   en: 'Gapyeong',       ja: '加平',   zh: '加平' } },
        { slug: 'ganghwa',  names: { ko: '강화도', en: 'Ganghwa Island', ja: '江華島', zh: '江華島' } }
      ] },
    { slug: 'gangwon',     color: '#2a6984', colorDark: '#7cc1de',   // 청록
      names: { ko: '강원',      en: 'Gangwon',            ja: '江原',     zh: '江原' },
      areas: [
        { slug: 'cheorwon',  names: { ko: '철원', en: 'Cheorwon',  ja: '鉄原', zh: '鐵原' } },
        { slug: 'gangneung', names: { ko: '강릉', en: 'Gangneung', ja: '江陵', zh: '江陵' } }
      ] },
    { slug: 'chungcheong', color: '#498235', colorDark: '#9fd98c',   // 초록
      names: { ko: '충청',      en: 'Chungcheong',        ja: '忠清',     zh: '忠清' },
      areas: [
        { slug: 'daejeon', names: { ko: '대전', en: 'Daejeon', ja: '大田', zh: '大田' } },
        { slug: 'jecheon', names: { ko: '제천', en: 'Jecheon', ja: '堤川', zh: '堤川' } }
      ] },
    { slug: 'jeolla',      color: '#998329', colorDark: '#e7d488',   // 황금
      names: { ko: '전라',      en: 'Jeolla',             ja: '全羅',     zh: '全羅' },
      areas: [
        { slug: 'jeonbuk', names: { ko: '전북', en: 'Jeonbuk', ja: '全北', zh: '全北' } },
        { slug: 'jeonnam', names: { ko: '전남광주', en: 'Jeonnam-Gwangju', ja: '全南光州', zh: '全南光州' } }
      ] },
    { slug: 'gyeongsang',  color: '#993633', colorDark: '#e39996',   // 벽돌
      names: { ko: '경상',      en: 'Gyeongsang',         ja: '慶尚',     zh: '慶尚' },
      areas: [
        { slug: 'gyeongju', names: { ko: '경주', en: 'Gyeongju', ja: '慶州', zh: '慶州' } },
        { slug: 'geoje',    names: { ko: '거제', en: 'Geoje',    ja: '巨済', zh: '巨濟' } },
        { slug: 'jinhae',   names: { ko: '진해', en: 'Jinhae',   ja: '鎮海', zh: '鎮海' } }
      ] },
    { slug: 'busan',       color: '#257e77', colorDark: '#72dfd6',   // 바다
      names: { ko: '부산',      en: 'Busan',              ja: '釜山',     zh: '釜山' },
      areas: [
        { slug: 'dongnae',   names: { ko: '동래',   en: 'Dongnae',   ja: '東莱',   zh: '東萊' } },
        { slug: 'gwangalli', names: { ko: '광안리', en: 'Gwangalli', ja: '広安里', zh: '廣安里' } }
      ] },
    { slug: 'jeju',        color: '#c25e10', colorDark: '#f5a45a',   // 감귤
      names: { ko: '제주',      en: 'Jeju',               ja: '済州',     zh: '濟州' },
      areas: [
        { slug: 'jejusi',   names: { ko: '제주시',  en: 'Jeju City', ja: '済州市',  zh: '濟州市' } },
        { slug: 'aewol',    names: { ko: '애월',    en: 'Aewol',     ja: '涯月',    zh: '涯月' } },
        { slug: 'seogwipo', names: { ko: '서귀포',  en: 'Seogwipo',  ja: '西帰浦',  zh: '西歸浦' } },
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
               zh: '汝矣島 — 午餐加漢江景觀咖啡' },
      stops: ['seoul-hadongkwan', 'seoul-gangbyeon-seojae'] },

    { slug: 'myeongdong-namsan',
      names: { ko: '명동·남산 — 시장 냉면에서 남산 비빔밥까지',
               en: 'Myeongdong & Namsan — market noodles to mountain bibimbap',
               ja: '明洞・南山 — 市場の冷麺から南山のビビンバまで',
               zh: '明洞·南山 — 從市場冷麵到南山拌飯' },
      stops: ['seoul-buwon-myeonok', 'seoul-mokmyeoksanbang', 'seoul-myeongdong-shindonggung'] },

    { slug: 'jongno-evening',
      names: { ko: '종로·익선동 — 커피, 디저트, 그리고 밤',
               en: 'Jongno & Ikseondong — coffee, dessert, then night',
               ja: '鍾路・益善洞 — コーヒー、デザート、そして夜',
               zh: '鍾路·益善洞 — 咖啡、甜點，然後是夜晚' },
      stops: ['seoul-dozo-coffee', 'seoul-dongbaek-yanggwajeom', 'seoul-gongpyeongdong-kkomjangeo'] },

    { slug: 'jeju-west',
      names: { ko: '제주 서쪽 — 애월 막국수와 오일장',
               en: 'West Jeju — Aewol noodles and the five-day market',
               ja: '済州西部 — 涯月のマッククスと五日市',
               zh: '濟州西部 — 涯月拌麵與五日市集' },
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
    { key: '예약필수', names: { ko: '예약필수', en: 'Booking needed',  ja: '予約必須',     zh: '需要預約' } },
    { key: '채식',     names: { ko: '채식',     en: 'Vegetarian-ok',   ja: 'ベジタリアン', zh: '素食可' } },

    /* 자리 성격 */
    { key: '카페',     names: { ko: '카페',     en: 'Cafe',            ja: 'カフェ',       zh: '咖啡館' } },
    { key: '술집',     names: { ko: '술집',     en: 'Drinking spot',   ja: '居酒屋',       zh: '酒館' } },
    { key: '막걸리',   names: { ko: '막걸리',   en: 'Makgeolli',       ja: 'マッコリ',     zh: '馬格利酒' } },
    { key: '와인',     names: { ko: '와인',     en: 'Wine',            ja: 'ワイン',       zh: '葡萄酒' } },
    { key: '드립커피', names: { ko: '드립커피', en: 'Pour-over',       ja: 'ドリップ',     zh: '手沖咖啡' } },
    { key: '뷔페',     names: { ko: '뷔페',     en: 'Buffet',          ja: 'ビュッフェ',   zh: '自助餐' } },
    { key: '동물카페', names: { ko: '동물카페', en: 'Animal cafe',     ja: '動物カフェ',   zh: '動物咖啡廳' } },

    /* 음식 종류 */
    { key: '국밥',     names: { ko: '국밥',     en: 'Gukbap',          ja: 'クッパ',       zh: '湯飯' } },
    { key: '곰탕',     names: { ko: '곰탕',     en: 'Gomtang',         ja: 'コムタン',     zh: '牛肉湯' } },
    { key: '돼지국밥', names: { ko: '돼지국밥', en: 'Pork gukbap',     ja: 'テジクッパ',   zh: '豬肉湯飯' } },
    { key: '국수',     names: { ko: '국수',     en: 'Noodles',         ja: '麺',           zh: '麵食' } },
    { key: '순두부',   names: { ko: '순두부',   en: 'Sundubu',         ja: 'スンドゥブ',   zh: '嫩豆腐' } },
    { key: '백반',     names: { ko: '백반',     en: 'Home-style set',  ja: 'ペクバン',     zh: '家常定食' } },
    { key: '제육볶음', names: { ko: '제육볶음', en: 'Spicy pork',      ja: 'チェユク炒め', zh: '辣炒豬肉' } },
    { key: '오징어볶음', names: { ko: '오징어볶음', en: 'Spicy squid',  ja: 'イカ炒め',     zh: '辣炒魷魚' } },
    { key: '콩국수',   names: { ko: '콩국수',   en: 'Kongguksu',       ja: 'コングクス',   zh: '豆漿麵' } },
    { key: '막국수',   names: { ko: '막국수',   en: 'Makguksu',        ja: 'マッククス',   zh: '蕎麥拌麵' } },
    { key: '라멘',     names: { ko: '라멘',     en: 'Ramen',           ja: 'ラーメン',     zh: '拉麵' } },
    { key: '수육',     names: { ko: '수육',     en: 'Suyuk',           ja: 'スユク',       zh: '水煮肉' } },
    { key: '정식',     names: { ko: '정식',     en: 'Set meal',        ja: '定食',         zh: '套餐' } },
    { key: '족발',     names: { ko: '족발',     en: 'Jokbal',          ja: 'チョッパル',   zh: '豬腳' } },
    { key: '육회',     names: { ko: '육회',     en: 'Yukhoe',          ja: 'ユッケ',       zh: '生牛肉' } },
    { key: '떡갈비',   names: { ko: '떡갈비',   en: 'Tteok-galbi',     ja: 'トッカルビ',   zh: '年糕排骨' } },
    { key: '김밥',     names: { ko: '김밥',     en: 'Gimbap',          ja: 'キンパ',       zh: '海苔飯捲' } },
    { key: '분식',     names: { ko: '분식',     en: 'Bunsik',          ja: '粉食',         zh: '韓式小吃' } },
    { key: '장어',     names: { ko: '장어',     en: 'Grilled eel',     ja: 'うなぎ',       zh: '鰻魚' } },
    { key: '돈까스',   names: { ko: '돈까스',   en: 'Donkkaseu',       ja: 'トンカツ',     zh: '豬排' } },
    { key: '해산물',   names: { ko: '해산물',   en: 'Seafood',         ja: '魚介',         zh: '海鮮' } },
    { key: '생선구이', names: { ko: '생선구이', en: 'Grilled fish',    ja: '焼き魚',       zh: '烤魚' } },
    { key: '물회',     names: { ko: '물회',     en: 'Mulhoe',          ja: 'ムルフェ',     zh: '冷湯生魚' } },
    { key: '회덮밥',   names: { ko: '회덮밥',   en: 'Sashimi bowl',    ja: '海鮮丼',       zh: '生魚蓋飯' } },
    { key: '디저트',   names: { ko: '디저트',   en: 'Dessert',         ja: 'デザート',     zh: '甜點' } },
    { key: '파스타',   names: { ko: '파스타',   en: 'Pasta',           ja: 'パスタ',       zh: '義大利麵' } },

    /* 요리 계통 */
    { key: '일식',     names: { ko: '일식',     en: 'Japanese',        ja: '和食',         zh: '日本料理' } },
    { key: '중식',     names: { ko: '중식',     en: 'Chinese',         ja: '中華',         zh: '中餐' } },
    { key: '양식',     names: { ko: '양식',     en: 'Western',         ja: '洋食',         zh: '西餐' } },

    /* 여행지 · 풍경 — travel 글에도 하단 칩이 붙도록 하는 축 */
    { key: '스파',     names: { ko: '스파',     en: 'Spa',             ja: 'スパ',         zh: '水療' } },
    { key: '해변',     names: { ko: '해변',     en: 'Beach',           ja: 'ビーチ',       zh: '海灘' } },
    { key: '호수',     names: { ko: '호수',     en: 'Lake',            ja: '湖',           zh: '湖' } },
    { key: '계곡',     names: { ko: '계곡',     en: 'Valley stream',   ja: '渓谷',         zh: '溪谷' } },
    { key: '드라이브', names: { ko: '드라이브', en: 'Scenic drive',    ja: 'ドライブ',     zh: '自駕兜風' } },
    { key: '전망대',   names: { ko: '전망대',   en: 'Lookout',         ja: '展望台',       zh: '觀景台' } },
    { key: '유적',     names: { ko: '유적',     en: 'Historic site',   ja: '史跡',         zh: '古蹟' } },
    { key: '수목원',   names: { ko: '수목원',   en: 'Arboretum',       ja: '樹木園',       zh: '樹木園' } },
    { key: '공원',     names: { ko: '공원',     en: 'Park',            ja: '公園',         zh: '公園' } }
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

  /* ---- 음식 장르 (영어권 검색어 축) ----------------------------------
     외국인은 "명동 맛집" 이 아니라 "Korean BBQ", "Korean soup" 처럼
     음식 종류로 검색합니다. 맛집(food) 글을 그 축으로 한 번 더 묶습니다.

     - tags: 한국어 글의 tags 중 하나라도 걸리면 그 장르로 들어갑니다
             (새 태그를 추가할 필요 없이 지금 붙어 있는 태그를 그대로 씁니다).
     - 배지: food 글의 첫 배지가 'Food' 대신 이 장르가 됩니다 (아래 순서 = 우선순위).
             한 글이 여러 장르에 걸리면 먼저 나오는 장르를 씁니다.
     - 페이지: 글이 genrePageMin 개 이상인 장르만 검색에 노출되는 페이지
             (/en/food/korean-bbq 등)로 만들어집니다. 그 미만은 noindex.
     slug 는 영어 검색어에 맞춥니다 (korean-bbq, korean-soup …).            */
  genrePageMin: 3,

  /* ---- 동네(area) 개별 페이지 --------------------------------------
     각 region 안의 areas 마다 /en/seoul/myeongdong 같은 페이지를 만듭니다.
     글이 이 개수 이상인 동네만 검색에 노출합니다 (그 미만은 noindex).
     "명동 맛집" 처럼 관광객은 지역보다 동네로 검색합니다.              */
  areaPageMin: 2,

  /* ---- 여행 팁 개별 페이지 --------------------------------------------
     tips.md 는 한 파일이지만, 빌드가 "## 제목 {#슬러그}" 섹션마다
     /en/tips/transport 같은 개별 페이지를 만듭니다 (허브 = /en/tips).
     아래 슬러그(= tips.md 의 {#...})만 검색에 노출합니다. 나머지 섹션도
     개별 페이지는 생기지만 noindex 라서 허브·빵부스러기 링크로만 닿습니다.
     "이 주제로 검색 유입을 노린다" 싶은 것만 고르세요.                */
  tipsPages: ['transport', 'money', 'maps', 'help', 'dining', 'tipping', 'firstday'],

  genres: [
    { slug: 'korean-bbq',       emoji: '🍖',
      names: { ko: '고기구이',   en: 'Korean BBQ',        ja: '韓国式BBQ',      zh: '韓式烤肉' },
      tags:  ['소금구이', '고기집', '뼈구이', '껍데기', '숯불', '갈비', '삼겹살', '목살'] },
    { slug: 'korean-soup',      emoji: '🍲',
      names: { ko: '국밥·탕',    en: 'Korean Soup & Gukbap', ja: 'クッパ・スープ', zh: '湯飯' },
      tags:  ['국밥', '곰탕', '돼지국밥', '순대국', '순대국밥', '복국', '감자탕', '해장'] },
    { slug: 'korean-noodles',   emoji: '🍜',
      names: { ko: '냉면·국수',  en: 'Korean Noodles',    ja: '韓国の麺',      zh: '韓式麵食' },
      tags:  ['냉면', '막국수', '콩국수', '국수'] },
    { slug: 'korean-seafood',   emoji: '🦑',
      names: { ko: '해산물',     en: 'Korean Seafood',    ja: '韓国の魚介',    zh: '韓式海鮮' },
      tags:  ['해산물', '물회', '회덮밥', '숙성회', '모둠회', '대게', '킹크랩', '생대구탕', '밴댕이', '전복죽', '아구찜', '간장게장', '게장', '생선구이'] },
    { slug: 'chinese-korean',   emoji: '🥢',
      names: { ko: '중식',       en: 'Chinese-Korean',    ja: '韓国式中華',    zh: '韓式中餐' },
      tags:  ['중식', '자장면', '짬뽕', '유린기'] },
    { slug: 'japanese-in-korea', emoji: '🍥',
      names: { ko: '라멘·일식',  en: 'Ramen & Japanese',  ja: 'ラーメン・和食', zh: '拉麵·日料' },
      tags:  ['라멘', '돈코츠', '일식', '오코노미야끼', '야끼소바'] },
    /* 만두 — 만두가 간판인 집만. 라멘집의 '교자', 중식집의 '군만두'(사이드)는 제외하려고
       뒤에 두고 태그도 좁혔습니다. */
    { slug: 'korean-dumplings', emoji: '🥟',
      names: { ko: '만두',       en: 'Korean Dumplings',  ja: '韓国餃子',      zh: '韓式餃子' },
      tags:  ['만두', '만두국'] },
    { slug: 'bibimbap',         emoji: '🍚',
      names: { ko: '비빔밥',     en: 'Bibimbap',          ja: 'ビビンバ',      zh: '拌飯' },
      tags:  ['비빔밥', '육회비빔밥'] },
    { slug: 'western',          emoji: '🍽️',
      names: { ko: '양식·레스토랑', en: 'Western & Restaurants', ja: '洋食・レストラン', zh: '西餐·餐廳' },
      tags:  ['양식', '파스타', '뇨끼', '리조또', '그라탕', '스테이크', '멕시칸', '타코', '파히타', '와인뷔페', '퓨전'] },
    { slug: 'cafe-dessert',     emoji: '☕',
      names: { ko: '카페·디저트', en: 'Cafes & Dessert',  ja: 'カフェ・スイーツ', zh: '咖啡·甜點' },
      tags:  ['카페', '드립커피', '디저트', '베이커리', '수플레', '팬케이크'] },
    /* 한식 — 특정 장르에 안 걸리는 한식 몇 개(곱창전골·시장 음식)를 담습니다.
       slug 는 예전 주소를 살리려고 그대로 둡니다 (표시 이름만 '한식'). */
    { slug: 'bars-makgeolli',   emoji: '🥘',
      names: { ko: '한식', en: 'Korean', ja: '韓国料理', zh: '韓式料理' },
      tags:  ['곱창전골', '전골', '술안주', '막걸리'] }
  ],

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
