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
      intro: {
        ko: '서울은 이 사이트에서 기록이 가장 많은 지역입니다. 명동·남대문의 노포 칼국수와 냉면, 여의도·영등포의 직장인 점심, 홍대·마포의 고깃집과 카페, 강남·신사의 양식과 디저트까지 — 한 도시 안에서도 동네마다 색이 다릅니다. 대부분 지하철로 닿고 걸어서 10분 안쪽이라, 하루에 두세 곳을 묶기 좋습니다. 아래 동네 버튼으로 좁혀 보세요.',
        en: 'Seoul has the most entries on this site. Old-school kalguksu and naengmyeon in Myeongdong and Namdaemun, office lunches in Yeouido and Yeongdeungpo, grill houses and cafes in Hongdae and Mapo, Western food and dessert in Gangnam and Sinsa — each neighbourhood has its own character. Most are a subway ride and a ten-minute walk away, so two or three fit into a day. Narrow down with the neighbourhood buttons below.',
        ja: 'ソウルはこのサイトで最も記録が多い地域です。明洞・南大門の老舗カルグクスや冷麺、汝矣島・永登浦の会社員ランチ、弘大・麻浦の焼肉店とカフェ、江南・新沙の洋食やデザートまで — 同じ街でも地区ごとに色が違います。多くは地下鉄で行けて徒歩10分以内なので、1日に2〜3か所まとめやすいです。下の地区ボタンで絞ってください。',
        zh: '首爾是本站記錄最多的地區。明洞、南大門的老字號刀切麵和冷麵，汝矣島、永登浦的上班族午餐，弘大、麻浦的烤肉店和咖啡館，江南、新沙的西餐和甜點 —— 同一座城市，每個街區個性都不同。大多搭地鐵到得了、步行十分鐘內，一天排兩三處剛好。用下面的街區按鈕篩選。' },
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
        { slug: 'itaewon',      names: { ko: '이태원·한남', en: 'Itaewon & Hannam',       ja: '梨泰院・漢南',  zh: '梨泰院·漢南' } },
        { slug: 'gangnam',      names: { ko: '강남·서초',  en: 'Gangnam & Seocho',       ja: '江南・瑞草',    zh: '江南·瑞草' } },
        { slug: 'magok',        names: { ko: '강서·마곡',  en: 'Gangseo & Magok',        ja: '江西・麻谷',    zh: '江西·麻谷' } }
      ] },
    { slug: 'gyeonggi',    color: '#884096', colorDark: '#d5a4df',   // 보라
      names: { ko: '경기·인천', en: 'Gyeonggi & Incheon', ja: '京畿・仁川', zh: '京畿·仁川' },
      intro: {
        ko: '서울 바깥으로 반나절이면 닿는 경기·인천을 모았습니다. 인천 연안부두의 밴댕이회무침, 강화도 초입의 숯불 생선구이, 가평의 잣순두부처럼 그 지역에서만 제대로 먹는 음식이 있고, 영종도 파라다이스시티의 스파처럼 공항 근처에서 시간을 보내기 좋은 곳도 있습니다. 강화도는 섬이라, 대중교통보다 차가 훨씬 편합니다.',
        en: 'Gyeonggi and Incheon, all within a half-day of central Seoul. Dishes you only get properly on their home ground — raw banded herring at Incheon’s Yeonan Pier, charcoal-grilled fish at the gateway to Ganghwa Island, pine-nut sundubu in Gapyeong — plus places to pass airport time, like the spa at Paradise City on Yeongjong Island. Ganghwa is an island, so a car beats public transport by a wide margin.',
        ja: 'ソウルの外へ半日で行ける京畿・仁川を集めました。仁川・沿岸埠頭のバンデギ和え、江華島の入口の炭火焼き魚、加平の松の実スンドゥブなど、その土地でこそきちんと食べられる料理があり、永宗島パラダイスシティのスパのように空港近くで時間を過ごせる場所もあります。江華島は島なので、公共交通より車がずっと楽です。',
        zh: '整理了從首爾市中心半天內能到的京畿、仁川。有只有在當地才吃得道地的菜 —— 仁川沿岸碼頭的涼拌斑鰶、江華島入口的炭火烤魚、加平的松子嫩豆腐 —— 也有適合在機場附近打發時間的地方，像永宗島百樂達斯城的水療。江華島是島，開車比大眾運輸方便太多。' },
      areas: [
        { slug: 'incheon',  names: { ko: '인천',   en: 'Incheon',        ja: '仁川',   zh: '仁川' } },
        { slug: 'gapyeong', names: { ko: '가평',   en: 'Gapyeong',       ja: '加平',   zh: '加平' } },
        { slug: 'ganghwa',  names: { ko: '강화도', en: 'Ganghwa Island', ja: '江華島', zh: '江華島' } }
      ] },
    { slug: 'gangwon',     color: '#2a6984', colorDark: '#7cc1de',   // 청록
      names: { ko: '강원',      en: 'Gangwon',            ja: '江原',     zh: '江原' },
      intro: {
        ko: '강원은 동해 바다와 태백산맥 사이에 걸쳐 있어, 같은 도(道) 안에서도 바다 쪽과 산 쪽의 분위기가 꽤 다릅니다. 지금은 강릉 초당순두부 마을의 짬뽕순두부와 철원의 비빔막국수를 다룹니다. 서울에서 강릉까지는 KTX로 두 시간, 경포·안목해변 일정과 묶기 좋습니다.',
        en: 'Gangwon stretches between the East Sea and the Taebaek mountains, so the coast and the highlands feel quite different even within one province. It covers jjamppong sundubu in Gangneung’s Chodang tofu village and bibim-makguksu in Cheorwon. Gangneung is two hours from Seoul by KTX and pairs well with Gyeongpo or Anmok Beach.',
        ja: '江原は東海（日本海）と太白山脈の間にまたがり、同じ道の中でも海側と山側で雰囲気がかなり違います。今は江陵・草堂スンドゥブ村のチャンポンスンドゥブと、鉄原のビビムマッククスを扱っています。ソウルから江陵までKTXで2時間、鏡浦・安木ビーチの行程と組み合わせやすいです。',
        zh: '江原橫跨東海與太白山脈之間，同一個道裡，靠海和靠山的氛圍差很多。目前收錄江陵草堂嫩豆腐村的炒碼嫩豆腐，和鐵原的拌蕎麥麵。從首爾到江陵搭 KTX 兩小時，很適合搭配鏡浦、安木海邊的行程。' },
      areas: [
        { slug: 'cheorwon',  names: { ko: '철원', en: 'Cheorwon',  ja: '鉄原', zh: '鐵原' } },
        { slug: 'gangneung', names: { ko: '강릉', en: 'Gangneung', ja: '江陵', zh: '江陵' } }
      ] },
    { slug: 'chungcheong', color: '#498235', colorDark: '#9fd98c',   // 초록
      names: { ko: '충청',      en: 'Chungcheong',        ja: '忠清',     zh: '忠清' },
      intro: {
        ko: '충청은 서울과 부산 사이, 내륙 한가운데입니다. 대전의 연한 콩국수처럼 담백한 한 끼가 있고, 청풍호반을 내려다보는 제천 청풍리조트와 그 근처 떡갈비집처럼 호수를 끼고 쉬어 가는 코스도 있습니다. 고속도로로 지나는 길에 한 끼, 혹은 단양·충주를 묶은 내륙 호수 여행에 넣기 좋습니다.',
        en: 'Chungcheong sits in the middle of the country, between Seoul and Busan. There is a plain, gentle meal like Daejeon’s mild kongguksu, and a lake-side stop like the Cheongpung resort overlooking the water in Jecheon with a tteok-galbi place nearby. Good for a meal on the drive through, or as part of an inland-lake trip taking in Danyang and Chungju.',
        ja: '忠清はソウルと釜山の間、内陸のちょうど真ん中です。大田の淡いコングクスのようなあっさりした一食があり、清風湖畔を見下ろす堤川の清風リゾートとその近くのトッカルビ店のように、湖のそばで一息つくコースもあります。高速道路で通る道すがらの一食や、丹陽・忠州をまとめた内陸の湖の旅に入れやすいです。',
        zh: '忠清位在首爾和釜山之間，內陸的正中央。有大田清淡的豆漿麵這種爽口的一餐，也有俯瞰清風湖的堤川清風度假村加附近年糕排骨店這種傍著湖休息的行程。適合開高速公路經過時吃一頓，或排進丹陽、忠州串起來的內陸湖泊旅行。' },
      areas: [
        { slug: 'daejeon', names: { ko: '대전', en: 'Daejeon', ja: '大田', zh: '大田' } },
        { slug: 'jecheon', names: { ko: '제천', en: 'Jecheon', ja: '堤川', zh: '堤川' } }
      ] },
    { slug: 'jeolla',      color: '#998329', colorDark: '#e7d488',   // 황금
      names: { ko: '전라',      en: 'Jeolla',             ja: '全羅',     zh: '全羅' },
      intro: {
        ko: '전라는 남도 음식의 고장으로 불립니다. 부안의 피순대, 나주곰탕, 광주 떡갈비 골목처럼 지역 이름이 그대로 음식 이름이 되는 곳들이 많습니다. 전남과 광주가 행정구역상 전남광주로 통합되면서 주소 표기도 바뀌었는데, 글에는 바뀐 기준으로 적었습니다.',
        en: 'Jeolla is known as the home of Namdo cooking. Often the place name is the dish name — pi-sundae in Buan, Naju gomtang, the tteok-galbi alley in Gwangju. With South Jeolla and Gwangju now administratively merged as Jeonnam-Gwangju, addresses have changed too; the write-ups use the new form.',
        ja: '全羅は南道料理の本場として知られます。扶安のピスンデ、羅州コムタン、光州のトッカルビ横丁のように、地名がそのまま料理名になっている場所が多いです。全羅南道と光州が行政上「全南光州」に統合され、住所表記も変わりましたが、記事では変更後の基準で書いています。',
        zh: '全羅被稱為南道料理的發源地。很多地方，地名直接就是菜名 —— 扶安的血腸、羅州牛肉湯、光州的年糕排骨巷。隨著全羅南道和光州在行政上合併為「全南光州」，地址寫法也變了，文章裡採用改制後的寫法。' },
      areas: [
        { slug: 'jeonbuk', names: { ko: '전북', en: 'Jeonbuk', ja: '全北', zh: '全北' } },
        { slug: 'jeonnam', names: { ko: '전남광주', en: 'Jeonnam-Gwangju', ja: '全南光州', zh: '全南光州' } }
      ] },
    { slug: 'gyeongsang',  color: '#993633', colorDark: '#e39996',   // 벽돌
      names: { ko: '경상',      en: 'Gyeongsang',         ja: '慶尚',     zh: '慶尚' },
      intro: {
        ko: '경상은 신라의 옛 수도 경주부터 남해안의 거제·진해까지 폭이 넓습니다. 낮에 불국사·석굴암을 보고 밤에 첨성대·동궁과 월지를 걷는 경주, 바람의 언덕과 해금강 사이를 걷는 거제, 이리(대구 이리)의 크리미한 맛이 인상적인 진해 용원의 생대구탕이 있습니다. 대부분 부산 일정에 하루씩 이어 붙이기 좋습니다.',
        en: 'Gyeongsang runs wide, from Gyeongju — Silla’s old capital — down to Geoje and Jinhae on the south coast. Bulguksa and Seokguram by day and Cheomseongdae and Donggung by night in Gyeongju; the walk between Windy Hill and Haegeumgang on Geoje; saeng-daegu-tang in Jinhae’s Yongwon, memorable for the creamy cod milt. Most add a day onto a Busan trip.',
        ja: '慶尚は新羅の古都・慶州から、南海岸の巨済・鎮海まで幅広いです。昼に仏国寺・石窟庵、夜に瞻星台・東宮と月池を歩く慶州、風の丘と海金剛の間を歩く巨済、白子のクリーミーさが印象的な鎮海・龍院の生タラ鍋。多くは釜山の行程に一日ずつ足すのに向いています。',
        zh: '慶尚幅員很廣，從新羅古都慶州，一路到南海岸的巨濟、鎮海。慶州白天看佛國寺、石窟庵，晚上走瞻星台、東宮與月池；巨濟走風之丘和海金剛之間；鎮海龍院的鮮鱈魚湯，魚白的綿密令人印象深刻。大多適合在釜山行程後面各接一天。' },
      areas: [
        { slug: 'gyeongju', names: { ko: '경주', en: 'Gyeongju', ja: '慶州', zh: '慶州' } },
        { slug: 'geoje',    names: { ko: '거제', en: 'Geoje',    ja: '巨済', zh: '巨濟' } },
        { slug: 'jinhae',   names: { ko: '진해', en: 'Jinhae',   ja: '鎮海', zh: '鎮海' } }
      ] },
    { slug: 'busan',       color: '#257e77', colorDark: '#72dfd6',   // 바다
      names: { ko: '부산',      en: 'Busan',              ja: '釜山',     zh: '釜山' },
      intro: {
        ko: '부산은 국물 요리부터 채웠습니다. 동래의 돼지국밥 두 곳과 복국처럼, 부산 사람들이 아침 일찍부터 뚝배기를 비우는 음식들입니다. 돼지국밥이 처음이라면 잡내가 덜한 집이 어디인지, 새우젓·부추를 어떻게 넣는지도 글에 적어 뒀습니다. 광안리 바다와도 가깝습니다.',
        en: 'Busan starts with soup. Dishes locals empty an earthenware bowl of first thing in the morning — two dwaeji-gukbap places and a bokguk in Dongnae. If dwaeji-gukbap is new to you, the write-ups note which place is the least funky and how to use the salted shrimp and chives. Gwangalli beach is close by, too.',
        ja: '釜山は汁物から埋めました。東莱のテジクッパ2軒やボックク（フグ鍋）のように、釜山の人が朝早くから土鍋を空にする料理です。テジクッパが初めてなら、臭みの少ない店はどこか、アミの塩辛やニラをどう入れるかも記事に書いています。広安里の海も近いです。',
        zh: '釜山先從湯類補起。像東萊兩家豬肉湯飯和一家河豚湯，都是當地人一大早就把砂鍋喝光的菜。第一次吃豬肉湯飯的話，文章裡也寫了哪一家腥味比較少、蝦醬和韭菜怎麼加。離廣安里海邊也很近。' },
      areas: [
        { slug: 'dongnae',   names: { ko: '동래',   en: 'Dongnae',   ja: '東莱',   zh: '東萊' } },
        { slug: 'gwangalli', names: { ko: '광안리', en: 'Gwangalli', ja: '広安里', zh: '廣安里' } }
      ] },
    { slug: 'jeju',        color: '#c25e10', colorDark: '#f5a45a',   // 감귤
      names: { ko: '제주',      en: 'Jeju',               ja: '済州',     zh: '濟州' },
      intro: {
        ko: '제주는 렌터카로 도는 걸 전제로 정리했습니다. 제주식 해장국과 전복죽·물회 같은 한 끼, 성산일출봉·광치기해변·모슬포 해안도로 같은 풍경, 애월·성산의 바다 보이는 카페까지 있습니다. 공항에서 시작해 서쪽 또는 동쪽으로 도는 이틀 동선에 자연스럽게 들어갑니다. 여름 한치·봄 유채꽃처럼 철을 타는 메뉴는 글에 표시해 뒀습니다.',
        en: 'Jeju is organised around driving. Meals like Jeju-style haejangguk, abalone porridge and mulhoe; scenery like Seongsan Ilchulbong, Gwangchigi Beach and the Moseulpo coastal road; sea-view cafes in Aewol and Seongsan. It slots into a two-day loop west or east from the airport. Seasonal items — summer hanchi squid, spring canola — are flagged in each write-up.',
        ja: '済州はレンタカーで回る前提でまとめています。済州式ヘジャングクやアワビ粥・ムルフェといった食事、城山日出峰・光致岐海岸・摹瑟浦の海岸道路といった風景、涯月・城山の海が見えるカフェまで。空港から西または東へ回る二日間の動線に自然に入ります。夏のヤリイカ、春の菜の花など季節ものは各記事に明記しています。',
        zh: '濟州是以租車環島為前提整理的。有濟州式解酒湯、鮑魚粥、水拌生魚這類正餐，城山日出峰、光致岐海邊、摹瑟浦海岸路這些風景，還有涯月、城山看得到海的咖啡館。很自然地能排進從機場出發往西或往東的兩天動線。夏天的長槍烏賊、春天的油菜花這類季節限定，每篇都有標註。' },
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
    { key: '칼국수',   names: { ko: '칼국수',   en: 'Kalguksu',        ja: 'カルグクス',   zh: '刀切麵' } },
    { key: '순두부',   names: { ko: '순두부',   en: 'Sundubu',         ja: 'スンドゥブ',   zh: '嫩豆腐' } },
    { key: '백반',     names: { ko: '백반',     en: 'Home-style set',  ja: 'ペクバン',     zh: '家常定食' } },
    { key: '제육볶음', names: { ko: '제육볶음', en: 'Spicy pork',      ja: 'チェユク炒め', zh: '辣炒豬肉' } },
    { key: '오징어볶음', names: { ko: '오징어볶음', en: 'Spicy squid',  ja: 'イカ炒め',     zh: '辣炒魷魚' } },
    { key: '콩국수',   names: { ko: '콩국수',   en: 'Kongguksu',       ja: 'コングクス',   zh: '豆漿麵' } },
    { key: '막국수',   names: { ko: '막국수',   en: 'Makguksu',        ja: 'マッククス',   zh: '蕎麥拌麵' } },
    { key: '라멘',     names: { ko: '라멘',     en: 'Ramen',           ja: 'ラーメン',     zh: '拉麵' } },
    { key: '수육',     names: { ko: '수육',     en: 'Suyuk',           ja: 'スユク',       zh: '水煮肉' } },
    { key: '한우',     names: { ko: '한우',     en: 'Hanwoo beef',     ja: '韓牛',         zh: '韓牛' } },
    { key: '곱창',     names: { ko: '곱창',     en: 'Grilled offal',   ja: 'ホルモン焼き', zh: '烤牛腸' } },
    { key: '정식',     names: { ko: '정식',     en: 'Set meal',        ja: '定食',         zh: '套餐' } },
    { key: '족발',     names: { ko: '족발',     en: 'Jokbal',          ja: 'チョッパル',   zh: '豬腳' } },
    { key: '육회',     names: { ko: '육회',     en: 'Yukhoe',          ja: 'ユッケ',       zh: '生牛肉' } },
    { key: '떡갈비',   names: { ko: '떡갈비',   en: 'Tteok-galbi',     ja: 'トッカルビ',   zh: '年糕排骨' } },
    { key: '김밥',     names: { ko: '김밥',     en: 'Gimbap',          ja: 'キンパ',       zh: '海苔飯捲' } },
    { key: '분식',     names: { ko: '분식',     en: 'Bunsik',          ja: '粉食',         zh: '韓式小吃' } },
    { key: '장어',     names: { ko: '장어',     en: 'Grilled eel',     ja: 'うなぎ',       zh: '鰻魚' } },
    { key: '돈까스',   names: { ko: '돈까스',   en: 'Donkkaseu',       ja: 'トンカツ',     zh: '豬排' } },
    { key: '버거',     names: { ko: '버거',     en: 'Burger',          ja: 'バーガー',     zh: '漢堡' } },
    { key: '브런치',   names: { ko: '브런치',   en: 'Brunch',          ja: 'ブランチ',     zh: '早午餐' } },
    { key: '해산물',   names: { ko: '해산물',   en: 'Seafood',         ja: '魚介',         zh: '海鮮' } },
    { key: '생선구이', names: { ko: '생선구이', en: 'Grilled fish',    ja: '焼き魚',       zh: '烤魚' } },
    { key: '갈치조림', names: { ko: '갈치조림', en: 'Braised hairtail', ja: '太刀魚の煮付け', zh: '燉白帶魚' } },
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
     "명동 맛집" 처럼 관광객은 지역보다 동네로 검색합니다.
     3 = 글 2개짜리 얇은 동네 페이지는 색인에서 빼둡니다 (글이 늘면 자동 복귀). */
  areaPageMin: 3,

  /* ---- 여행 팁 개별 페이지 --------------------------------------------
     tips.md 는 한 파일이지만, 빌드가 "## 제목 {#슬러그}" 섹션마다
     /en/tips/transport 같은 개별 페이지를 만듭니다 (허브 = /en/tips).
     아래 슬러그(= tips.md 의 {#...})만 검색에 노출합니다. 나머지 섹션도
     개별 페이지는 생기지만 noindex 라서 허브·빵부스러기 링크로만 닿습니다.
     "이 주제로 검색 유입을 노린다" 싶은 것만 고르세요.
     tipping·firstday 는 분량이 짧아 단독 페이지로는 빈약해서 뺐습니다
     (허브 /tips 에서는 계속 보입니다). 내용을 늘리면 다시 넣으세요.        */
  tipsPages: ['transport', 'money', 'maps', 'help', 'dining'],

  genres: [
    { slug: 'korean-bbq',       emoji: '🍖',
      names: { ko: '고기구이',   en: 'Korean BBQ',        ja: '韓国式BBQ',      zh: '韓式烤肉' },
      tags:  ['소금구이', '고기집', '뼈구이', '껍데기', '숯불', '갈비', '삼겹살', '목살', '한우', '곱창', '대창', '막창'] },
    { slug: 'korean-soup',      emoji: '🍲',
      names: { ko: '국밥·탕',    en: 'Korean Soup & Gukbap', ja: 'クッパ・スープ', zh: '湯飯' },
      tags:  ['국밥', '곰탕', '돼지국밥', '순대국', '순대국밥', '복국', '감자탕', '해장'] },
    { slug: 'korean-noodles',   emoji: '🍜',
      names: { ko: '냉면·국수',  en: 'Korean Noodles',    ja: '韓国の麺',      zh: '韓式麵食' },
      tags:  ['냉면', '막국수', '콩국수', '국수', '칼국수'] },
    { slug: 'korean-seafood',   emoji: '🦑',
      names: { ko: '해산물',     en: 'Korean Seafood',    ja: '韓国の魚介',    zh: '韓式海鮮' },
      tags:  ['해산물', '물회', '회덮밥', '숙성회', '모둠회', '대게', '킹크랩', '생대구탕', '밴댕이', '전복죽', '아구찜', '간장게장', '게장', '생선구이', '갈치조림'] },
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
