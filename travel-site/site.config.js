/* ==========================================================================
   사이트 설정 — 여기 값만 바꾸면 사이트 전체에 반영됩니다.
   ========================================================================== */

module.exports = {

  /* ---- 기본 ------------------------------------------------------------
     name 은 언어별로 다르게 쓸 수 있습니다.
     영어 페이지에 한글 로고가 뜨면 관광객은 읽지 못하므로 분리했습니다.
     (전 언어 공통으로 쓰려면 name: "Davie's K-Food Trip" 처럼 문자열 하나로 두면 됩니다) */
  name: {
    ko: "Davie's K-식도락",
    en: "Davie's K-Food Trip",
    ja: "Davie's K-Food Trip",
    zh: "Davie's K-Food Trip"
  },

  // ★ 끝에 / 붙이지 마세요
  url: 'https://kfoodtrip.net',

  email: 'ckqkrdl83@gmail.com',

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
      seoTitle: { ko: '서울 맛집·여행 가이드', en: 'Seoul Food & Travel Guide', ja: 'ソウルのグルメ・観光ガイド', zh: '首爾美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '서울은 이 사이트에서 가장 많이 기록한 지역으로, 동네별로 직접 다녀온 맛집과 여행지를 정리했습니다. 동네마다 먹는 결이 다릅니다 — **여의도**는 직장인 점심(곰탕·콩국수·쌀국수)과 국회 앞 한강뷰 카페, **명동**은 노포 칼국수·뼈숯불구이에 남산 비빔밥, **남대문**은 시장 냉면과 갈치조림, **을지로·종로**는 순대국·LA갈비 노포와 익선동 한옥 디저트, **마포**는 마포역 고깃집·곱창과 양옥 카페, **홍대**는 새벽까지 하는 라멘과 카페, **영등포**는 문래 골목과 영등포역 노포, **강남·서초**는 역삼역 테헤란로의 드립커피·수제버거·부대찌개, **이태원·한남**은 한우 코스, **광화문·서대문**은 노포 닭곰탕과 서촌 제철 해산물입니다.\n대부분 지하철로 닿고 걸어서 10분 안쪽이라 하루에 두세 곳을 묶기 좋습니다. 아래 동네 버튼으로 좁히거나, 마음에 드는 곳을 저장해 순서대로 동선을 짜 보세요 — 저장 페이지에 서울 추천 코스도 있습니다.',
        en: 'Seoul is the most-covered region on this site — the restaurants and sights below are all places we have actually been, sorted by neighbourhood. Each area eats differently: **Yeouido** is office lunches (gomtang, cold soybean noodles, pho) and a Han-River-view cafe by the National Assembly; **Myeongdong** is veteran kalguksu and grilled pork bones, plus bibimbap up Namsan; **Namdaemun** is market naengmyeon and braised hairtail; **Euljiro & Jongno** is veteran sundae-guk and LA-galbi houses with hanok dessert in Ikseondong; **Mapo** is grill houses and offal near Mapo Station and a cafe in a converted house; **Hongdae** is ramen and cafes open past midnight; **Yeongdeungpo** is the Mullae alleys and old spots by Yeongdeungpo Station; **Gangnam & Seocho** is drip coffee, burgers and budae-jjigae along Teheran-ro by Yeoksam Station; **Itaewon & Hannam** is a Korean-beef course; **Gwanghwamun & Seodaemun** is veteran chicken gomtang and seasonal seafood in Seochon.\nMost are a subway ride and a ten-minute walk apart, so two or three fit in a day. Narrow down with the neighbourhood buttons below, or save the places you like and put them in order to build a route — the Saved page also has ready-made Seoul routes.',
        ja: 'ソウルはこのサイトで最も記録が多い地域で、下の店や見どころはすべて実際に足を運んだ場所を地区別にまとめたものです。地区ごとに食べる色が違います — **汝矣島**は会社員のランチ（コムタン・コングクス・フォー）と国会前の漢江ビューのカフェ、**明洞**は老舗カルグクス・骨付きカルビ炭火焼きに南山のビビンバ、**南大門**は市場の冷麺と太刀魚の煮付け、**乙支路・鍾路**はスンデクッパやLAカルビの老舗と益善洞の韓屋デザート、**麻浦**は麻浦駅の焼肉・ホルモンと洋館を改装したカフェ、**弘大**は夜遅くまでやっているラーメンとカフェ、**永登浦**は文来の路地と永登浦駅の老舗、**江南・瑞草**は駅三駅・テヘラン路のドリップコーヒーやハンバーガー、プデチゲ、**梨泰院・漢南**は韓牛コース、**光化門・西大門**は老舗の鶏コムタンと西村の旬の海鮮です。\n多くは地下鉄で行けて徒歩10分以内なので、1日に2〜3か所まとめやすいです。下の地区ボタンで絞るか、気に入った場所を保存して順番に並べれば動線ができます — 保存ページにはソウルのおすすめコースもあります。',
        zh: '首爾是本站記錄最多的地區，下面的餐廳和景點都是我們親自去過的地方，按街區整理。每個街區吃的味道都不同 —— **汝矣島**是上班族午餐（牛肉湯、豆漿麵、河粉）加國會前的漢江景觀咖啡館；**明洞**是老店刀切麵、炭烤豬脊骨加南山的拌飯；**南大門**是市場冷麵和燉白帶魚；**乙支路·鍾路**是血腸湯、LA排骨的老店加益善洞的韓屋甜點；**麻浦**是麻浦站的烤肉、牛腸和老洋房改的咖啡館；**弘大**是營業到深夜的拉麵和咖啡館；**永登浦**是文來的巷子和永登浦站的老店；**江南·瑞草**是驛三站德黑蘭路一帶的手沖咖啡、漢堡和部隊鍋；**梨泰院·漢南**是韓牛套餐；**光化門·西大門**是老店雞肉湯和西村的當季海鮮。\n大多搭地鐵到得了、步行十分鐘內，一天排兩三處剛好。用下面的街區按鈕篩選，或把喜歡的地方存起來、排好順序就成了動線 —— 「已存」頁面也有現成的首爾推薦路線。' },
      areas: [
        { slug: 'yeouido',      names: { ko: '여의도',     en: 'Yeouido',                ja: '汝矣島',        zh: '汝矣島' },
          intro: {
            ko: '여의도는 서울에서 이 사이트가 가장 많이 기록한 동네로, 직장인 점심 노포와 한강뷰 카페가 모여 있습니다. 서여의도(국회 쪽)는 하동관 곰탕·진주집 콩국수·권수산 회덮밥 같은 점심 노포와 국회 안 한강뷰 베이커리 강변서재, 국회의사당역 앞 비욘드비엣남 쌀국수가 있고, 동여의도·IFC 쪽은 무탄의 트러플자장면, 진진만두국의 세 가지 국물 만두, 콘타이 태국식과 신승반점 중식이 있습니다. 대부분 평일 점심에 줄이 서니 12시 전이나 1시 반 이후가 편합니다.',
            en: 'Yeouido is the Seoul neighbourhood this site covers most — office-lunch veterans and Han-River-view cafes, around the National Assembly and IFC. West Yeouido has lunch veterans like Hadongkwan (clear gomtang), Jinjujip (cold soybean noodles) and Gwonsusan (sashimi rice bowl), Gangbyeon Seojae — a Han-River-view bakery inside the Assembly grounds — and pho at Beyond Vietnam by National Assembly Station; the IFC side has truffle-jjajang at Mutan, three-broth dumpling soup at Jinjin Mandu-guk, Konthai (Thai) and Sinseung Banjeom (Chinese-Korean). Most queue at weekday lunch, so aim for before noon or after 1:30.',
            ja: '汝矣島はこのサイトがソウルで最も多く記録した地区で、国会とIFC周辺に会社員ランチの老舗と漢江ビューのカフェが集まっています。西汝矣島（国会側）はハドングァンのコムタン、チンジュジプのコングクス、クォンスサンの海鮮丼といったランチの老舗、国会敷地内の漢江ビューのベーカリー、カンビョンソジェ、国会議事堂駅前のビヨンドベトナムのフォーがあります。IFC側には無炭（ムタン）のトリュフジャージャー麺、チンジンマンドゥグクの3種スープの餃子、タイ料理のコンタイ、中華の新勝飯店があります。多くは平日ランチに並ぶので、正午前か13時半以降が楽です。',
            zh: '汝矣島是本站在首爾記錄最多的街區，國會和 IFC 周邊聚集了上班族午餐老店和漢江景觀咖啡館。西汝矣島（國會一帶）是午餐老店 —— 河東館的清燉牛肉湯、晉州家的豆漿麵、權水山的生魚片蓋飯，還有國會園區裡的漢江景觀烘焙坊江邊書齋，以及國會議事堂站前 Beyond Vietnam 的河粉；IFC 一側有無炭的松露炸醬麵、珍珍餃子湯的三湯底手工餃子、泰式的 Konthai、韓式中餐的新勝飯店。大多在平日午餐時段要排隊，中午前或一點半後比較從容。' } },
        { slug: 'myeongdong',   names: { ko: '명동',   en: 'Myeongdong', ja: '明洞',   zh: '明洞' },
          intro: {
            ko: '명동은 관광객으로 늘 붐비는 쇼핑가지만, 그 안에 노포와 오래된 맛집이 곳곳에 남아 있습니다. 명동교자 칼국수, 24시간 여는 신동궁 뼈숯불구이, 오사카식 오코노미야끼 쯔루하시 후게츠가 있고, 한국은행 옆 테일러커피와 남산 자락 목멱산방의 자극적이지 않은 나물 비빔밥까지 묶으면 하루가 알찹니다.',
            en: 'Myeongdong is a shopping district that\'s always crowded with tourists, but veteran restaurants and old favourites still hold on inside it. There\'s kalguksu at Myeongdong Gyoja, 24-hour grilled-pork-bones at Sindonggung, and Osaka-style okonomiyaki at Tsuruhashi Fugetsu; round the day out with coffee at Tailor Coffee by the Bank of Korea, or mild namul bibimbap at Mongmyeoksanbang on the slope of Namsan.',
            ja: '明洞は観光客でいつも賑わうショッピング街ですが、その中に老舗や昔からの人気店がところどころ残っています。明洞餃子のカルグクス、24時間営業のシンドングンのポークリブ炭火焼き、大阪風お好み焼きの鶴橋風月があり、韓国銀行のそばのテイラーコーヒーや、南山のふもとのモンミョクサンバンの薄味のナムルビビンバまで組み合わせれば一日が充実します。',
            zh: '明洞是總是擠滿遊客的購物街，但裡面還是散落著一些老店和老字號美食。有明洞餃子的刀切麵、24小時營業的新東宮炭烤豬脊骨、大阪風御好燒鶴橋風月，再加上韓國銀行旁的 Tailor Coffee、南山山腳下明洞山房清淡的野菜拌飯，安排一整天很充實。' } },
        { slug: 'namdaemun',    names: { ko: '남대문', en: 'Namdaemun', ja: '南大門', zh: '南大門' },
          intro: {
            ko: '남대문은 남대문시장 노포들이 모인 동네로, 냉면·백반·갈치조림·회정식이 시장 골목 곳곳에 있습니다. 시장 안에는 부원면옥(2층 냉면·만둣국), 우정식당(백반), 호남식당(갈치조림 골목), 막내횟집(평일 점심 한정 회정식)이 있고, 시장 초입 세종대로 쪽에는 한국 재료로 만든 양식집 심퍼티쿠시가 있습니다. 시장 골목은 처음엔 찾기 어려우니 지도에서 상호를 확인하고 들어가세요.',
            en: 'Namdaemun is built around the veterans of Namdaemun Market — naengmyeon, home-style set meals, braised hairtail and sashimi sets scattered through the market alleys. Inside are Buwon Myeonok (second-floor naengmyeon and dumpling soup), Ujeong Sikdang (home-style set meals), Honam Sikdang in the braised-hairtail alley, and Maknae Hoejip (a sashimi set served only at weekday lunch); toward the market\'s Sejong-daero entrance there\'s Szimpatikus, Korean-ingredient Western food. The market alleys are hard to find the first time — check the name on the map before you go in.',
            ja: '南大門は南大門市場の老舗が集まる地区で、冷麺・ペクバン・太刀魚の煮付け・刺身定食が市場の路地に点在しています。市場の中にはプウォンミョノク（2階の冷麺・餃子スープ）、ウジョンシクタン（ペクバン）、太刀魚の煮付け横丁のホナムシクタン、平日ランチだけのマンネフェッチプ（刺身定食）があり、市場の世宗大路側の入口には韓国食材の洋食シンポティクシがあります。市場の路地は最初は見つけにくいので、地図で店名を確認してから入ってください。',
            zh: '南大門是南大門市場老店聚集的地方，冷麵、家常定食、燉白帶魚、生魚片定食散落在市場巷子裡。市場裡有富元麵屋（二樓的冷麵、餃子湯）、友情食堂（家常定食）、燉白帶魚巷的湖南食堂，還有只在平日午餐供應的老么生魚片家（生魚片定食）；市場世宗大路一側的入口有用韓國食材做的西餐 SZIMPATIKUS。市場巷子第一次不好找，進去前先在地圖上確認店名。' } },
        { slug: 'gwanghwamun',  names: { ko: '광화문·서대문', en: 'Gwanghwamun & Seodaemun', ja: '光化門・西大門', zh: '光化門·西大門' },
          intro: {
            ko: '광화문·서대문은 정동길과 서대문역, 서촌, 광화문 일대를 아우릅니다. 코리아나호텔 25층 루프탑의 달빛야장(한돈세트 4인 15만 원, 2026.10 기준), 정동길의 양식당 어반가든, 서대문역 가까운 막썰이회와 돈의문 도조커피, 서대문 백년가게 평양옥의 닭곰탕, 서촌 골목의 해산물집 서촌계단집을 다녀왔습니다.\n**동선 팁** — 낮에는 막썰이회의 점심정식이나 평양옥의 닭곰탕, 식후 커피는 도조커피로 이어가고, 밤에는 달빛야장에서 광화문 야경을 보며 한잔하는 흐름이 가능합니다. 도조커피는 직장인 상권이라 혼자 조용히 있기는 어렵습니다.',
            en: 'Gwanghwamun & Seodaemun covers Jeongdong-gil, Seodaemun Station, Seochon and the Gwanghwamun area. I have visited Dalbit Yajang on the 25th-floor rooftop of Koreana Hotel (the Hando pork set is 150,000 KRW for four, as of Oct 2026), Urban Garden, a Western restaurant on Jeongdong-gil, Maksseorihoe near Seodaemun Station and Dozo Coffee in Donuimun, the chicken gomtang at Pyeongyangok, a Seodaemun shop certified by Seoul as a Baengnyeon Gage (long-established shop), and Seochon Gyedanjip, a seafood place in a Seochon alley.\n**Route tips** — by day you can have the lunch set at Maksseorihoe or the chicken gomtang at Pyeongyangok and follow with coffee at Dozo Coffee, and at night have a drink at Dalbit Yajang with the Gwanghwamun night view. Dozo Coffee is in an office district, so a quiet seat alone is hard to find.',
            ja: '光化門・西大門は貞洞路、西大門駅、西村、光化門エリアを含みます。コリアナホテル25階ルーフトップのダルビッ・ヤジャン（韓豚セット4人15万ウォン、2026年10月時点）、貞洞路の洋食店アーバンガーデン、西大門駅近くのマクソリフェ西大門と敦義門のDOZO COFFEE 敦義門店、西大門の百年店ピョンヤンオクの鶏コムタン、西村の路地の海鮮店ソチョン階段家に行きました。\n**動線のヒント** — 昼はマクソリフェのランチ定食やピョンヤンオクの鶏コムタン、食後のコーヒーはDOZO COFFEEへ、夜はダルビッ・ヤジャンで光化門の夜景を見ながら一杯、という流れが可能です。DOZO COFFEEはオフィス街なので、一人で静かに過ごすのは難しいです。',
            zh: '光化門·西大門涵蓋貞洞路、西大門站、西村與光化門一帶。我去過的有：코리아나호텔 달빛야장（Koreana Hotel Dalbit Yajang）25 樓頂樓的韓豚套餐（4 人 15 萬韓元，截至2026年10月）、貞洞路的西餐廳 Urban Garden、西大門站附近的 막썰이회（Maksseorihoe）、敦義門的 DOZO COFFEE 敦義門店、西大門獲首爾市認證為「百年店鋪」的平壤屋的雞肉곰탕，以及西村巷弄裡的海鮮店西村階梯家。\n**動線小提醒** — 白天可以吃 막썰이회的午餐套餐或平壤屋的雞肉곰탕，飯後去 DOZO COFFEE 喝咖啡；晚上到 달빛야장一邊看光化門夜景一邊小酌。DOZO COFFEE 位於上班族商圈，很難一個人安靜地坐著。'
          } },
        { slug: 'jongno',       names: { ko: '종로·을지로', en: 'Jongno & Euljiro',       ja: '鍾路・乙支路',  zh: '鍾路·乙支路' },
          intro: {
            ko: '종로·을지로는 을지로3가 노포와 익선동 한옥 골목이 붙어 있는 구간으로, 순대국·LA갈비 같은 노포와 한옥 디저트, 꼼장어 소금구이가 함께 있습니다. 산수갑산 순대국, 시골집 LA갈비처럼 오래된 집에서 저녁을 먹고 익선동 동백양과점에서 수플레로 마무리하거나, 종각역 앞 공평동꼼장어에서 자정까지 소주 한잔 걸치는 식으로 묶기 좋습니다. 을지로 골목은 간판이 작으니 상호를 확인하고 찾으세요.',
            en: 'Jongno & Euljiro runs from the veteran sundae-guk and LA-galbi houses of Euljiro 3-ga into the hanok dessert alleys of Ikseondong, with salt-grilled hagfish (kkomjangeo) thrown in. It pairs well: dinner at an old place — Sansu Gapsan for sundae-guk, Sigoljip for LA-galbi — then either soufflé pancakes at Dongbaek Yanggwajeom in Ikseondong, or grilled hagfish and soju until midnight at Gongpyeongdong Kkomjangeo by Jonggak Station. Euljiro signs are small, so go by the name.',
            ja: '鍾路・乙支路は乙支路3街の老舗と益善洞の韓屋路地が隣り合う区間で、スンデクッパやLAカルビの老舗、韓屋のデザートに加えてヌタウナギ（コムジャンオ）の塩焼きもあります。サンスガプサンのスンデクッパ、シゴルジプのLAカルビといった古い店で夕食をとり、益善洞のトンベク洋菓子店でスフレをしめにするか、鍾閣駅前の公平洞コムジャンオで深夜0時まで一杯やる組み方がしやすいです。乙支路の路地は看板が小さいので、店名で探してください。',
            zh: '鍾路·乙支路是乙支路3街老店和益善洞韓屋巷子相鄰的一段，有血腸湯、LA排骨的老店和韓屋甜點，還有鹽烤盲鰻。在山水甲山（血腸湯）、鄉下家（LA排骨）這些老店吃晚餐，再到益善洞的冬柏洋菓子店用舒芙蕾收尾，或是到鐘閣站前的公平洞盲鰻配燒酒喝到半夜，都很好安排。乙支路的巷子招牌很小，請認店名找。' } },
        { slug: 'yeongdeungpo', names: { ko: '영등포',     en: 'Yeongdeungpo',           ja: '永登浦',        zh: '永登浦' },
          intro: {
            ko: '영등포는 문래동 골목과 영등포역·당산 일대로 나뉘며, 순대국·짬뽕·쌀국수·숙성회가 흩어져 있습니다. 문래에는 오복순대국(부드러운 수육)과 갓잇의 파히타·타코 세트, 영등포역 쪽에는 땀 쏟는 송죽장 짬뽕과 50년 노포 대한옥의 꼬리수육, 성게알까지 곁들인 도림항의 숙성회 모둠이 있고, 당산에는 쌀국수 포옹남이 있고 바로 앞이 한강공원과 이어집니다. 대부분 지하철 2호선·1호선으로 닿습니다.',
            en: 'Yeongdeungpo splits between the Mullae-dong alleys and the area around Yeongdeungpo Station and Dangsan, with sundae-guk, jjamppong, pho and aged sashimi scattered across it. Mullae has Obok Sundae-guk (very tender boiled pork) and Got Eat\'s fajita-and-taco set; near the station is Songjukjang\'s sweat-inducing jjamppong, Daehanok — a 50-year veteran — for ox-tail suyuk, and Dorimhang for an aged sashimi platter that runs to sea urchin; in Dangsan, Pho Ong Nam sits right where the Han River park begins. Most are reachable on subway lines 1 and 2.',
            ja: '永登浦は文来洞の路地と永登浦駅・堂山エリアに分かれ、スンデクッパ・チャンポン・フォー・熟成刺身が点在しています。文来にはオボクスンデクッパ（やわらかいスユク）とガットイットのファヒータ・タコスのセット、永登浦駅側は汗をかくソンジュクチャンのチャンポン、50年続く老舗テハノクの牛テールスユク、ウニまで乗る道林港の熟成刺身盛り合わせがあり、堂山にはフォーのポオンナムがあり、すぐ前が漢江公園につながっています。多くは地下鉄1号線・2号線で行けます。',
            zh: '永登浦分成文來洞的巷子和永登浦站、堂山一帶，散落著血腸湯、炒碼麵、河粉和熟成生魚片。文來有五福血腸湯（很嫩的水煮肉）和 Got Eat 的法士達、塔可套餐；永登浦站這側是會讓人流汗的松竹莊炒碼麵、開業近50年的大韓屋牛尾水煮肉，還有連海膽都上桌的道林港熟成生魚片拼盤；堂山有河粉店抱擁南，門口就接著漢江公園。大多搭地鐵1號線、2號線到得了。' } },
        { slug: 'hongdae',      names: { ko: '홍대',       en: 'Hongdae',                ja: '弘大',          zh: '弘大' },
          intro: {
            ko: '홍대는 새벽까지 여는 라멘집과 카페가 강점인 동네로, 20년 넘은 노포 라멘과 대게 코스, 고양이카페가 있습니다. 하카타분코는 새벽 3시까지 하는 라멘집이고, 부탄츄는 면과 육수 농도를 골라 먹는 라멘, 김앤김은 대게 코스를 합니다. 상수 쪽에는 오픈 전부터 줄서는 숙성회 이자카야 요코스카 쓰나미, 합정 쪽에는 초벌구이로 나오는 록갈비가 있어 저녁 술자리로 묶기 좋습니다. 낮에는 루프캣미 고양이카페처럼 쉬어 가는 곳도 있습니다.',
            en: 'Hongdae\'s strength is places open late — a ramen shop of over twenty years running to 3 a.m., a build-your-own ramen, a snow-crab course, and a cat cafe by day. Hakata Bunko runs until 3 a.m.; Butanchu lets you pick the noodle and broth density; Kim & Kim does a snow-crab course. Toward Sangsu there\'s Yokosuka Tsunami, an aged-sashimi izakaya with a line before opening, and toward Hapjeong there\'s Rokgalbi for pre-grilled spicy pork ribs — good for an evening drinking run. By day there are places to pause, like the Roofcatme cat cafe.',
            ja: '弘大は深夜まで開いている店が強みの地区で、20年以上の老舗ラーメン、濃さを選べるラーメン、ズワイガニのコース、猫カフェがあります。ハカタブンコは深夜3時までやっているラーメン店、ブタンチュは麺とスープの濃さを選べるラーメン、キム＆キムはズワイガニのコースをやっています。上水側には開店前から並ぶ熟成刺身の居酒屋ヨコスカ津波、合井側には下焼き済みで出てくるロクカルビがあり、夜の一杯を組み合わせやすいです。昼はループキャットミーの猫カフェのように休める場所もあります。',
            zh: '弘大的強項是營業到很晚的店，有超過20年的老拉麵店、可自選濃度的拉麵、松葉蟹套餐，還有貓咖啡。博多文庫開到凌晨3點；Butanchu 可以自己選麵和湯頭的濃度；Kim & Kim 做松葉蟹套餐。上水一側有開店前就排隊的熟成生魚片居酒屋橫須賀海嘯，合井一側有先烤過一輪才上桌的洛排骨，很適合安排晚上小酌。白天也有像 Roofcatme 貓咖啡這種可以歇腳的地方。' } },
        { slug: 'mapo',         names: { ko: '마포',       en: 'Mapo',                   ja: '麻浦',          zh: '麻浦' },
          intro: {
            ko: '마포는 마포역·공덕 일대의 고깃집과 곱창집, 양옥을 고친 카페가 모인 동네입니다. 마포갈비골목의 청춘구락부(양대창), 마포역 어반뭉티기(두툼한 생소고기), 공덕의 홍박아구찜과 마포양지설렁탕이 있고, 예약제 간장게장 정식 서산꽃게와 채수 육수로 깔끔한 청어람 곱창전골도 있습니다. 양옥을 고친 프릳츠 도화점에서 커피로 마무리하면 됩니다. 마포소금구이·청어람·홍박아구찜은 일요일에 쉽니다.',
            en: 'Mapo centres on the grill houses, offal spots and converted-house cafes around Mapo Station and Gongdeok. There is Cheongchun Gurakbu (beef tripe and intestine) in the Mapo galbi alley, Urban Mungtigi (thick-cut raw beef) by Mapo Station, and Hongbak Agujjim and Mapo Yangji Seolleongtang in Gongdeok, plus Seosan Kkotge for a booking-only soy-marinated crab set and Cheongeoram for beef tripe hot pot with a clean vegetable broth — then coffee at Fritz Dohwa, in a converted Western-style house. Mapo Sogeumgui, Cheongeoram and Hongbak Agujjim are closed Sundays.',
            ja: '麻浦は麻浦駅・孔徳エリアの焼肉店やホルモン店、洋館を改装したカフェが集まる地区です。麻浦カルビ横丁のチョンチュングラクブ（ヤン・テチャン）、麻浦駅のオーバンムンティギ（厚切りの生牛肉）、孔徳のホンバクアグチムと麻浦ヤンジソルロンタン、予約制のカンジャンケジャン定食ソサンコッケ、野菜だしですっきりしたコプチャン鍋のチョンオラムがあり、洋館を改装したフリッツ桃花店でコーヒーをしめにできます。麻浦塩焼き・チョンオラム・ホンバクアグチムは日曜が休みです。',
            zh: '麻浦以麻浦站、孔德一帶的烤肉店、牛腸店和老洋房改的咖啡館為主。麻浦排骨巷的青春俱樂部（牛腸、牛肚），麻浦站的 Urban Mungtigi（厚切生牛肉），孔德的洪博鮟鱇魚和麻浦陽支雪濃湯，還有需要預約的醬油蟹套餐瑞山花蟹、湯頭靠蔬菜熬得清爽的青於藍牛腸火鍋，最後可以在老洋房改的 Fritz 桃花店喝杯咖啡收尾。麻浦鹽烤、青於藍、洪博鮟鱇魚週日公休。' } },
        { slug: 'gwangjin',     names: { ko: '광진·건대',  en: 'Gwangjin & Konkuk Univ.', ja: '広津・建大',   zh: '廣津·建大' } },
        { slug: 'seongdong',    names: { ko: '성동·왕십리', en: 'Seongdong & Wangsimni',  ja: '城東・往十里',  zh: '城東·往十里' } },
        { slug: 'itaewon',      names: { ko: '이태원·한남', en: 'Itaewon & Hannam',       ja: '梨泰院・漢南',  zh: '梨泰院·漢南' } },
        { slug: 'gangnam',      names: { ko: '강남·서초',  en: 'Gangnam & Seocho',       ja: '江南・瑞草',    zh: '江南·瑞草' },
          intro: {
            ko: '강남·서초는 역삼역과 테헤란로 일대가 중심이고, 신사동과 서초·양재까지 이어집니다. 센터필드 지하의 한국집(1952년부터 이어온 전주비빔밥)과 바로 옆 테라로사, 역삼 논현로 골목의 르와조(산미 없이 진한 드립커피), 테헤란로의 대우부대찌개, 역삼역 3번 출구 인근의 바스버거, 진상횟집의 와다백반, 바게트케이의 바게트, 신사동 파 니엔테, 양재의 영동족발까지 직접 다녀왔습니다.\n**동선 팁** — 점심은 한국집·대우부대찌개·진상횟집이 역삼역 일대에 모여 있고, 식후 커피는 테라로사나 르와조로 이어가기 좋습니다. 바게트케이는 아침 7시부터 열고, 진상횟집은 일요일에 쉽니다(2026.10 기준).',
            en: 'Gangnam & Seocho centres on Yeoksam Station and Teheran-ro, and reaches out to Sinsa-dong, Seocho and Yangjae. I have visited Hankookjip (Jeonju bibimbap, a tradition since 1952) in the Centerfield basement and Terarosa next door, Loiseau on a Nonhyeon-ro side street (rich drip coffee without acidity), Daewoo Budae-jjigae on Teheran-ro, Bas Burger near Exit 3 of Yeoksam Station, the wada baekban at Jinsang Hoetjip, the baguettes at Baguette K, Far Niente in Sinsa-dong and Yeongdong Jokbal in Yangjae.\n**Route tips** — Hankookjip, Daewoo Budae-jjigae and Jinsang Hoetjip are close together around Yeoksam Station for lunch, and Terarosa or Loiseau work for coffee afterwards. Baguette K opens at 7:00 AM and Jinsang Hoetjip is closed on Sundays (as of Oct 2026).',
            ja: '江南・瑞草は駅三駅とテヘラン路周辺が中心で、新沙洞、瑞草、良才まで続きます。センターフィールド地下のハングッチプ（1952年から続く全州ビビンバ）とすぐ隣のテラロサ、ノニョン路の路地のロワゾー（酸味がなく濃いドリップコーヒー）、テヘラン路のテウ部隊チゲ、駅三駅3番出口近くのバスバーガー、チンサンフェッチプのワダペクパン、バゲット・ケーのバゲット、新沙洞のファー・ニエンテ、良才のヨンドンチョッパルまで実際に行きました。\n**動線のヒント** — ランチはハングッチプ・テウ部隊チゲ・チンサンフェッチプが駅三駅周辺に集まっていて、食後のコーヒーはテラロサやロワゾーがおすすめです。バゲット・ケーは午前7時から開き、チンサンフェッチプは日曜休みです（2026年10月時点）。',
            zh: '江南·瑞草以驛三站和德黑蘭路一帶為中心，延伸到新沙洞、瑞草與良才。我親自去過 Centerfield 地下的韓國家（한국집，1952年起的全州拌飯）和隔壁的 TERAROSA、論峴路巷子裡的 L’OISEAU（不酸而濃郁的手沖咖啡）、德黑蘭路的大宇部隊鍋、驛三站3號出口附近的 BAS BURGER、진상횟집（Jinsang Hoetjip）的 와다백반、바게트케이（Baguette K）的法棍、新沙洞的 Far Niente，以及良才的 영동족발（Yeongdong Jokbal）。\n**動線小提醒** — 午餐的韓國家、大宇部隊鍋和 진상횟집都集中在驛三站一帶，飯後的咖啡可以接著去 TERAROSA 或 L’OISEAU。바게트케이 7:00 開門，진상횟집週日公休（截至2026年10月）。'
          } },
        { slug: 'magok',        names: { ko: '강서·마곡',  en: 'Gangseo & Magok',        ja: '江西・麻谷',    zh: '江西·麻谷' } },
        { slug: 'gangbuk',      names: { ko: '강북',       en: 'Gangbuk',                ja: '江北',          zh: '江北' } }
      ] },
    { slug: 'gyeonggi',    color: '#884096', colorDark: '#d5a4df',   // 보라
      names: { ko: '경기·인천', en: 'Gyeonggi & Incheon', ja: '京畿・仁川', zh: '京畿·仁川' },
      seoTitle: { ko: '경기·인천 맛집·여행 가이드', en: 'Gyeonggi & Incheon Food and Travel Guide', ja: '京畿・仁川のグルメ・観光ガイド', zh: '京畿·仁川美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '서울 바깥으로 반나절이면 닿는 경기·인천을 모았습니다. 인천 연안부두 오성식당의 밴댕이회무침, 영종도 파라다이스시티의 스파 씨메르, 강화도의 숯불 생선구이·강화풍물시장·동막해수욕장, 김포 대곶의 약산손두부, 가평의 잣순두부, 고양의 장작 통닭구이처럼 그 지역에서만 제대로 먹는 음식과 시간을 보내기 좋은 곳이 있습니다.\n**동선 팁** — 강화도는 섬이라 대중교통보다 차가 훨씬 편합니다. 초지대교를 건너기 전에 약산손두부에서 아침을 먹고, 섬 초입의 생선구이로 점심을 이으면 동선이 자연스럽습니다. 인천 연안부두는 지하철이 없어 인천역에서 버스로 가거나 자차·택시가 편합니다.',
        en: 'Gyeonggi and Incheon are places within about half a day of Seoul. There is food you only really get in the area — bandaengi salad at Oseong Sikdang on Yeonan Pier, the grilled fish and Ganghwa Pungmul Market on Ganghwa Island, Yaksan Sondubu in Daegot, Gimpo, pine-nut sundubu in Gapyeong and wood-fired chicken in Goyang — and places to spend time, such as the Cimer spa in Paradise City on Yeongjongdo and Dongmak Beach on Ganghwa.\n**Route tips** — Ganghwa is an island, and a car is far easier than public transport. Breakfast at Yaksan Sondubu before Chojidaegyo Bridge and lunch at the grilled-fish place just inside the island makes a natural route. Yeonan Pier has no subway, so take a bus from Incheon Station or go by car or taxi.',
        ja: 'ソウルの外へ、半日で行ける京畿・仁川をまとめました。沿岸埠頭のオソン食堂のバンデンイ刺身和え、永宗島パラダイスシティのスパ シメール、江華島の炭火焼き魚・江華プンムル市場・トンマク海水浴場、金浦・大串のヤクサン・ソンドゥブ、加平の松の実スンドゥブ、高陽の薪焼きチキンなど、その土地ならではの料理と過ごしやすい場所があります。\n**動線のヒント** — 江華島は島なので、公共交通より車のほうがずっと楽です。草芝大橋を渡る前にヤクサン・ソンドゥブで朝ごはんを食べ、島の入口の焼き魚でランチをつなぐと動線が自然です。仁川の沿岸埠頭は地下鉄がなく、仁川駅からバスか、車・タクシーが便利です。',
        zh: '這裡收錄從首爾出發半天內可到的京畿與仁川。有只有在當地才吃得到的料理 —— 沿岸碼頭 오성식당（Oseong Sikdang）的生拌斑鰶、江華島的炭烤魚與 강화풍물시장（Ganghwa Pungmul Market）、金浦大串的 약산손두부（Yaksan Sondubu）、加平的松子嫩豆腐鍋、高陽的柴燒烤雞 —— 也有適合消磨時間的地方，例如永宗島百樂達斯城的水療 Cimer 和江華島的東幕海水浴場。\n**動線小提醒** — 江華島是島，開車比搭大眾交通方便得多。過草芝大橋前先到 약산손두부吃早餐，再到島嶼入口的烤魚店吃午餐，動線很自然。仁川沿岸碼頭沒有地鐵，可從仁川站搭公車，或自駕、搭計程車。' },
      areas: [
        { slug: 'incheon',  names: { ko: '인천',   en: 'Incheon',        ja: '仁川',   zh: '仁川' }, seoTitle: { en: 'Where to Eat in Incheon' },
          intro: {
            ko: '인천은 연안부두와 영종도, 시내 분식집까지 이어집니다. 연안부두 해양센터 2층의 오성식당(생물 밴댕이회무침), 인천공항 옆 영종도 파라다이스시티의 스파·사우나 씨메르, 미추홀구의 청해김밥(계란말이김밥)을 다녀왔습니다.\n**동선 팁** — 오성식당이 있는 연안부두는 지하철이 없어 인천역에서 버스로 가거나 자차·택시가 편합니다. 씨메르는 인천공항이 바로 옆이라 공항을 오가는 길에 들르기 좋습니다.',
            en: 'Incheon runs from Yeonan Pier to Yeongjongdo and city-centre snack shops. I have been to Oseong Sikdang on the second floor of the Haeyang Centre building at Yeonan Pier (fresh raw shad salad), Cimer, the spa and sauna inside Paradise City on Yeongjongdo next to Incheon Airport, and Cheonghae Gimbap in Michuhol-gu (rolled-omelette gimbap).\n**Route tips** — Yeonan Pier has no subway, so take a bus from Incheon Station, or go by car or taxi. Cimer is right next to Incheon Airport, so it is easy to fit in on the way to or from a flight.',
            ja: '仁川は沿岸埠頭から永宗島、市内の粉食店までつながります。沿岸埠頭の海洋センタービル2階のオソン食堂（生のバンデンイ刺身和え）、仁川空港のすぐ隣、永宗島のパラダイスシティにあるスパ・サウナのシメール、彌鄒忽区のチョンヘキンパ（卵焼きキンパ）に行きました。\n**動線のヒント** — オソン食堂がある沿岸埠頭は地下鉄がなく、仁川駅からバスか、車・タクシーが便利です。シメールは仁川空港のすぐ隣なので、空港の行き帰りに立ち寄りやすい場所です。',
            zh: '仁川從沿岸碼頭延伸到永宗島，還有市區的小吃店。去過的有：沿岸碼頭海洋中心 2 樓的 오성식당（Oseong Sikdang，生拌斑鰶）、緊鄰仁川機場的永宗島百樂達斯城內的水療桑拿 Cimer，以及彌鄒忽區的青海海苔飯捲（蛋捲海苔飯捲）。\n**動線小提醒** — 오성식당所在的沿岸碼頭沒有地鐵，可以從仁川站搭公車，或自駕、搭計程車。Cimer 就在仁川機場旁邊，往返機場的路上很適合順道去。'
          } },
        { slug: 'gapyeong', names: { ko: '가평',   en: 'Gapyeong',       ja: '加平',   zh: '加平' } },
        { slug: 'ganghwa',  names: { ko: '강화도', en: 'Ganghwa Island', ja: '江華島', zh: '江華島' },
          intro: {
            ko: '강화도는 서울에서 차로 반나절이면 닿는 섬으로, 대중교통보다 차가 훨씬 편합니다. 초지대교를 건너 섬 초입에 있는 숯불생선구이, 강화읍의 강화풍물시장(1층 시장, 2층 밴댕이 정식), 남쪽 동막해수욕장(소나무 숲 야영장과 갯벌)을 다녀왔습니다.\n**동선 팁** — 다리를 건너기 전 김포 대곶의 약산손두부에서 아침을 먹고, 섬 초입의 생선구이로 점심을 잇는 식으로 들어가면 동선이 자연스럽습니다. 시장은 강화읍, 동막해수욕장은 화도면이라 위치가 서로 다르니 동선을 미리 보고 정하세요.',
            en: 'Ganghwa Island is about half a day from Seoul by car, and a car is far easier than public transport. I have been to the charcoal-grilled fish place at the entrance to the island just over Chojidaegyo Bridge, Ganghwa Pungmul Market in Ganghwa-eup (a market on the first floor, bandaengi set meals on the second) and Dongmak Beach in the south, with its pine-forest campsite and mudflat.\n**Route tips** — breakfast at Yaksan Sondubu in Daegot, Gimpo, before the bridge, then lunch at the grilled-fish place just inside the island, makes a natural way in. The market is in Ganghwa-eup and Dongmak Beach is in Hwado-myeon, so check the route before you plan around them.',
            ja: '江華島はソウルから車で半日ほどの島で、公共交通より車のほうがずっと楽です。草芝大橋を渡った島の入口にある炭火焼き魚、江華邑の江華プンムル市場（1階が市場、2階はパンデンイ定食）、南側のトンマク海水浴場（松林のキャンプ場と干潟）に行きました。\n**動線のヒント** — 橋を渡る前に金浦・大串のヤクサン・ソンドゥブで朝ごはんを食べ、島の入口の焼き魚でランチをつなぐ流れだと自然です。市場は江華邑、トンマク海水浴場は花島面で場所が違うので、動線を先に確認して決めましょう。',
            zh: '江華島距離首爾開車約半天，開車比搭大眾交通方便得多。去過的有：過了草芝大橋、位於島嶼入口的炭烤魚、江華邑的 강화풍물시장（Ganghwa Pungmul Market，一樓是市場，二樓是밴댕이套餐美食街），以及南邊的東幕海水浴場（松林露營區與灘塗）。\n**動線小提醒** — 過橋前先到金浦大串的 약산손두부（Yaksan Sondubu）吃早餐，再到島嶼入口的烤魚店吃午餐，這樣進島的動線很自然。市場在江華邑，東幕海水浴場在花島面，位置不同，建議先確認動線再決定。'
          } },
        { slug: 'goyang',   names: { ko: '고양',   en: 'Goyang',         ja: '高陽',   zh: '高陽' } },
        { slug: 'gimpo',    names: { ko: '김포',   en: 'Gimpo',          ja: '金浦',   zh: '金浦' } }
      ] },
    { slug: 'gangwon',     color: '#2a6984', colorDark: '#7cc1de',   // 청록
      names: { ko: '강원',      en: 'Gangwon',            ja: '江原',     zh: '江原' },
      seoTitle: { ko: '강원 맛집·여행 가이드', en: 'Gangwon Food & Travel Guide', ja: '江原のグルメ・観光ガイド', zh: '江原美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '강원은 동해 바다와 태백산맥 사이에 걸쳐 있어, 같은 도(道) 안에서도 바다 쪽과 산 쪽의 분위기가 꽤 다릅니다. 강릉은 초당순두부 마을의 짬뽕순두부와 리틀다이너의 팬케이크 번 버거, 주문진은 파도식당의 복지리, 양양은 동해막국수 분점, 철원은 비빔막국수, 속초는 ㅅㅊ 조형물이 있는 속초해수욕장과 손으로 당겨 건너는 아바이마을 갯배를 다룹니다.\n**동선 팁** — 서울에서 강릉까지는 KTX로 두 시간이고 경포·안목해변 일정과 묶기 좋습니다. 막국수는 철원이 간이 세지 않고 살짝 매콤한 비빔 쪽이고, 양양의 동해막국수 분점은 본점이 같은 양양군 동해대로에 따로 있습니다.',
        en: 'Gangwon lies between the East Sea and the Taebaek Mountains, so the feel of the sea side and the mountain side differ quite a lot within one province. Gangneung covers jjamppong sundubu in the Chodang sundubu village and the pancake-bun burger at Little Diner, Jumunjin covers the pufferfish soup at Pado Sikdang, Yangyang a branch of Donghae Makguksu, Cheorwon its bibim makguksu, and Sokcho the beach with its giant letter sculpture and the Abai Village ferry you pull across by hand.\n**Route tips** — Gangneung is two hours from Seoul by KTX and fits well with a Gyeongpo and Anmok beach plan. Cheorwon makguksu is the mildly seasoned bibim kind with a little heat, and the Donghae Makguksu in Yangyang is a branch, with the main shop elsewhere on Donghae-daero in Yangyang County.',
        ja: '江原は東海（日本海）と太白山脈の間にまたがっていて、同じ道の中でも海側と山側の雰囲気がかなり違います。江陵は草堂スンドゥブ村のチャンポンスンドゥブとリトルダイナーのパンケーキバンバーガー、注文津はパドシクタンのフグ汁、襄陽はトンヘマッククス分店、鉄原はビビンマッククス、束草は大きな文字のオブジェがある束草海水浴場と手でたぐって渡るアバイ村の渡し船を取り上げています。\n**動線のヒント** — ソウルから江陵までは KTX で2時間で、鏡浦・安木海岸の日程と組み合わせやすいです。鉄原のマッククスはしょっぱくなく少しピリ辛のビビン系で、襄陽のトンヘマッククス分店は、本店が同じ襄陽郡の東海大路に別にあります。',
        zh: '江原位在東海與太白山脈之間，同一個道裡，海邊和山區的氛圍差別很大。江陵有草堂豆腐村的炒碼嫩豆腐鍋和 Little Diner 的鬆餅漢堡，注文津有 파도식당（Pado Sikdang）的河豚湯，襄陽有東海蕎麥麵分店，鐵原有拌蕎麥涼麵，束草則有立著大型字母雕塑的束草海水浴場，以及用手拉繩渡河的阿爸村渡船。\n**動線小提醒** — 從首爾到江陵搭 KTX 約兩小時，很適合和鏡浦、安木海灘的行程搭配。鐵原蕎麥涼麵是調味不重、微微帶辣的拌麵，襄陽的東海蕎麥麵是分店，本店另在襄陽郡東海大路上。' },
      areas: [
        { slug: 'sokcho',    names: { ko: '속초', en: 'Sokcho',    ja: '束草', zh: '束草' } },
        { slug: 'cheorwon',  names: { ko: '철원', en: 'Cheorwon',  ja: '鉄原', zh: '鐵原' } },
        { slug: 'gangneung', names: { ko: '강릉', en: 'Gangneung', ja: '江陵', zh: '江陵' } },
        { slug: 'yangyang',  names: { ko: '양양', en: 'Yangyang',  ja: '襄陽', zh: '襄陽' } },
        { slug: 'jumunjin',  names: { ko: '주문진', en: 'Jumunjin', ja: '注文津', zh: '注文津' } }
      ] },
    { slug: 'chungcheong', color: '#498235', colorDark: '#9fd98c',   // 초록
      names: { ko: '충청',      en: 'Chungcheong',        ja: '忠清',     zh: '忠清' },
      seoTitle: { ko: '충청 맛집·여행 가이드', en: 'Chungcheong Food & Travel Guide', ja: '忠清のグルメ・観光ガイド', zh: '忠清美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '충청은 서울과 부산 사이, 내륙 한가운데입니다. 대전 대성콩국수의 연한 콩국수, 보령 자연쌈밥식당의 직접 키운 쌈채소 쌈밥, 청풍호반을 내려다보는 제천 청풍리조트와 근처 떡갈비집, 아산 삽교천 옆 한옥을 고친 인주카페처럼 한 끼와 잠깐 쉬어 가는 곳을 다룹니다.\n**동선 팁** — 고속도로로 지나는 길에 한 끼, 혹은 단양·충주를 묶은 내륙 호수 여행에 넣기 좋습니다. 대성콩국수는 점심·저녁에 대기가 있고, 자연쌈밥식당은 자연쌈밥 11,000원, 돌솥쌈밥 13,000원입니다(2026.10 기준).',
        en: 'Chungcheong sits in the middle of the country, between Seoul and Busan. It covers a meal or a short rest stop: the light kongguksu at Daeseong Kongguksu in Daejeon, ssambap with home-grown leaf vegetables at Jayeon Ssambap Restaurant in Boryeong, the Cheongpung resort overlooking the lake in Jecheon with a tteok-galbi place nearby, and Inju Cafe in Asan, a converted hanok by the Sapgyo stream.\n**Route tips** — it suits a meal on the way along the expressway, or an inland-lake trip taking in Danyang and Chungju. Daeseong Kongguksu has a queue at lunch and dinner, and at Jayeon Ssambap Restaurant the Jayeon ssambap is 11,000 KRW and the stone-pot ssambap 13,000 KRW (as of Oct 2026).',
        ja: '忠清はソウルと釜山の間、内陸のど真ん中です。大田テソンコングクスの薄めのコングクス、保寧ジャヨンサムパプ食堂の自家栽培の葉野菜のサムパプ、清風湖畔を見下ろす堤川の清風リゾートとその近くのトッカルビの店、牙山の挿橋川のそばにある韓屋を改装したインジュカフェなど、食事と一休みの場所を取り上げています。\n**動線のヒント** — 高速道路で通る途中の一食や、丹陽・忠州を組み合わせた内陸の湖の旅に入れやすいです。テソンコングクスは昼・夜に行列があり、ジャヨンサムパプ食堂はジャヨンサムパプ11,000ウォン、石鍋サムパプ13,000ウォンです（2026年10月時点）。',
        zh: '忠清位在首爾與釜山之間，是內陸的正中央。介紹的是一餐與短暫歇腳的地方：大田大成豆漿涼麵（대성콩국수）偏淡的豆漿麵、保寧 자연쌈밥식당（Jayeon Ssambap Sikdang）自家種生菜的包飯、俯瞰清風湖畔的堤川清風渡假村與附近的肉餅排店，以及牙山插橋川旁、改建自韓屋的仁州咖啡 韓屋店。\n**動線小提醒** — 適合在高速公路途中吃一餐，或排進結合丹陽、忠州的內陸湖泊旅行。大成豆漿涼麵午餐與晚餐時段要排隊，자연쌈밥식당的 자연쌈밥是 11,000 韓元，石鍋包飯是 13,000 韓元（截至2026年10月）。' },
      areas: [
        { slug: 'daejeon',  names: { ko: '대전', en: 'Daejeon',  ja: '大田', zh: '大田' } },
        { slug: 'chungbuk', names: { ko: '충북', en: 'Chungbuk', ja: '忠北', zh: '忠北' } },
        { slug: 'chungnam', names: { ko: '충남', en: 'Chungnam', ja: '忠南', zh: '忠南' } }
      ] },
    { slug: 'jeolla',      color: '#998329', colorDark: '#e7d488',   // 황금
      names: { ko: '전라',      en: 'Jeolla',             ja: '全羅',     zh: '全羅' },
      seoTitle: { ko: '전라 맛집·여행 가이드', en: 'Jeolla Food & Travel Guide', ja: '全羅のグルメ・観光ガイド', zh: '全羅美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '전라는 남도 음식의 고장으로 불립니다. 부안 할매피순대, 나주곰탕 하얀집, 광주 송정역 근처 떡갈비 골목의 형제송정떡갈비처럼 지역 이름이 그대로 음식 이름이 되는 곳들이 많고, 전주 한옥마을에는 콩나물을 리필할 수 있는 왱이콩나물국밥과 반찬이 화려한 교동석갈비가 있습니다.\n**동선 팁** — 부안 할매피순대는 아침 7시, 나주곰탕 하얀집은 오전 8시에 열어 이른 시간에 먹기 좋고, 나주는 대기를 감안해야 합니다(2026.08 기준). 전남과 광주가 행정구역상 전남광주로 통합되면서 주소 표기도 바뀌었는데, 글에는 바뀐 기준으로 적었습니다.',
        en: 'Jeolla is called the home of southern Korean food. Many places here carry the town name as the name of the dish, such as Buan Halmae Pisundae, Naju Gomtang Hayanjip and Hyeongje Songjeong Tteok-galbi in the tteok-galbi alley near Gwangju Songjeong Station, and in Jeonju Hanok Village you will find Waengi bean-sprout gukbap, where you can refill the bean sprouts, and Gyodong Seokgalbi with its lavish side dishes.\n**Route tips** — Buan Halmae Pisundae opens at 7:00 AM and Naju Gomtang Hayanjip at 8:00 AM, so both suit an early start, and in Naju you should allow for a wait (as of Aug 2026). Jeonnam and Gwangju have been merged administratively into Jeonnam-Gwangju, which changed the way addresses are written, and the guides use the new form.',
        ja: '全羅は南道料理の本場と呼ばれます。扶安 ハルメピスンデ、羅州コムタン ハヤンチプ、光州の松汀駅近くのトッカルビ通りにある兄弟松汀トッカルビのように、地名がそのまま料理名になる店が多く、全州の韓屋村にはもやしのおかわりができるウェンイのコンナムルクッパと、おかずが華やかな校洞石カルビがあります。\n**動線のヒント** — 扶安ハルメピスンデは午前7時、羅州ハヤンチプは8時に開くので早い時間に食べやすく、羅州は待ち時間を見込んでおく必要があります（2026年8月時点）。全南と光州が行政区域上「全南光州」に統合されて住所の表記も変わりましたが、記事には新しい基準で書いています。',
        zh: '全羅被稱為南道美食之鄉。有很多地名直接成為料理名的店，例如 扶安 奶奶血腸、羅州牛肉湯 하얀집（Hayanjip）、光州松汀站附近肉餅排巷的 형제송정떡갈비（Hyeongje Songjeong Tteok-galbi）；全州韓屋村則有黃豆芽可以續加的 전주왱이콩나물국밥（Jeonju Waengi Kongnamul-gukbap），以及小菜豐盛的 교동석갈비（Gyodong Seokgalbi）。\n**動線小提醒** — 扶安 奶奶血腸 7:00 開門，羅州 하얀집 8:00 開門，都適合早點去，羅州要預留排隊時間（截至2026年8月）。全南與光州在行政上合併為「全南光州」，地址寫法也隨之改變，文章中採用新的寫法。' },
      areas: [
        { slug: 'jeonbuk', names: { ko: '전북', en: 'Jeonbuk', ja: '全北', zh: '全北' },
          intro: {
            ko: '전북은 전주와 부안에서 먹어 본 곳입니다. 전주에서는 한옥마을 일대의 교동석갈비와 동문길의 왱이 콩나물국밥(콩나물 리필 가능)을, 부안에서는 아침 7시부터 여는 할매피순대를 다녀왔습니다.\n**동선 팁** — 전주는 한옥마을을 걷다 허기질 때 석갈비집에 들를 수 있고, 콩나물국밥은 전주에 갈 때마다 가장 먼저 들르는 집입니다. 부안 할매피순대는 이른 아침에 먹기 좋고, 냄새는 거의 없습니다.',
            en: 'Jeonbuk is places I have eaten in Jeonju and Buan. In Jeonju I have been to Gyodong Seokgalbi around Hanok Village and Waengi bean-sprout gukbap on Dongmun-gil (you can refill the bean sprouts), and in Buan to Halmae Pisundae, which opens at 7:00 AM.\n**Route tips** — in Jeonju you can stop at the stone-grilled galbi place when you get hungry walking through Hanok Village, and the bean-sprout gukbap is the shop I go to as soon as I arrive. Buan Halmae Pisundae suits an early morning, and the smell is almost absent.',
            ja: '全北は全州と扶安で食べた店です。全州では韓屋村周辺の校洞石カルビと東門路の全州ウェンイコンナムルクッパ専門店（もやしのおかわりができます）、扶安では午前7時から開く扶安 ハルメピスンデに行きました。\n**動線のヒント** — 全州は韓屋村を歩いていてお腹がすいたときに石カルビの店に立ち寄れ、もやしクッパは全州に行くたびに最初に立ち寄る店です。扶安ハルメピスンデは早朝に食べやすく、においはほとんどありません。',
            zh: '全北是在全州與扶安吃過的店。在全州去過韓屋村一帶的 교동석갈비（Gyodong Seokgalbi）和東門路的 전주왱이콩나물국밥（Jeonju Waengi Kongnamul-gukbap，黃豆芽可以續加），在扶安則去過 7:00 開門的 扶安 奶奶血腸。\n**動線小提醒** — 在全州走逛韓屋村餓了時，可以到石烤排骨店用餐；黃豆芽湯飯是每次到全州都會先去的店。扶安 奶奶血腸適合一大早去，味道幾乎沒有腥臭。'
          } },
        { slug: 'jeonnam', names: { ko: '전남광주', en: 'Jeonnam-Gwangju', ja: '全南光州', zh: '全南光州' } }
      ] },
    { slug: 'gyeongsang',  color: '#993633', colorDark: '#e39996',   // 벽돌
      names: { ko: '경상',      en: 'Gyeongsang',         ja: '慶尚',     zh: '慶尚' },
      seoTitle: { ko: '경상 맛집·여행 가이드', en: 'Gyeongsang Food & Travel Guide', ja: '慶尚のグルメ・観光ガイド', zh: '慶尚美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '경상은 신라의 옛 수도 경주부터 남해안의 거제·진해까지 폭이 넓습니다. 낮에 불국사·석굴암을 보고 밤에 첨성대·동궁과 월지를 걷는 경주, 바람의 언덕과 해금강 사이를 걷는 거제, 이리의 크리미한 맛이 인상적인 진해 용원의 생대구탕이 있습니다.\n**동선 팁** — 대부분 부산 일정에 하루씩 이어 붙이기 좋습니다. 용원횟집의 생대구탕은 겨울이 제철이니 철에 맞춰 가세요.',
        en: 'Gyeongsang is wide, from Gyeongju, the old Silla capital, to Geoje and Jinhae on the south coast. In Gyeongju you see Bulguksa and Seokguram by day and walk Cheomseongdae and Donggung Palace and Wolji Pond at night, in Geoje you hike between Wind Hill and Haegeumgang, and in Jinhae there is the fresh cod soup at Yongwon Hoetjip, whose creamy cod milt is what stays with you.\n**Route tips** — most of these fit one day each on top of a Busan trip. The fresh cod soup at Yongwon Hoetjip is a winter dish, so time your visit to the season.',
        ja: '慶尚は新羅の古都・慶州から南海岸の巨済・鎮海まで幅があります。昼に仏国寺・石窟庵を見て夜に瞻星台・東宮と月池を歩く慶州、風の丘と海金剛の間を歩く巨済、タラの白子（イリ）のクリーミーな味が印象的な鎮海・龍院の生タラ鍋があります。\n**動線のヒント** — ほとんどが釜山の日程に1日ずつ足しやすい場所です。ヨンウォンフェッチプの生タラ鍋は冬が旬なので、時期に合わせて行ってください。',
        zh: '慶尚的範圍很廣，從新羅古都慶州，到南海岸的巨濟、鎮海。白天看佛國寺與石窟庵、晚上走瞻星台與東宮月池的慶州，走在風之丘與海金剛之間的巨濟，還有鎮海龍院 용원횟집（Yongwon Hoetjip）以鱈魚白子的綿密口感令人印象深刻的生鱈魚湯。\n**動線小提醒** — 大多適合在釜山行程之外各加一天。용원횟집的生鱈魚湯以冬季為盛產期，請配合季節前往。' },
      areas: [
        { slug: 'gyeongju', names: { ko: '경주', en: 'Gyeongju', ja: '慶州', zh: '慶州' } },
        { slug: 'geoje',    names: { ko: '거제', en: 'Geoje',    ja: '巨済', zh: '巨濟' } },
        { slug: 'jinhae',   names: { ko: '진해', en: 'Jinhae',   ja: '鎮海', zh: '鎮海' } }
      ] },
    { slug: 'busan',       color: '#257e77', colorDark: '#72dfd6',   // 바다
      names: { ko: '부산',      en: 'Busan',              ja: '釜山',     zh: '釜山' },
      seoTitle: { ko: '부산 맛집·여행 가이드', en: 'Busan Food & Travel Guide', ja: '釜山のグルメ・観光ガイド', zh: '釜山美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '부산은 국물 요리부터 채웠습니다. 동래의 두미촌돼지국밥(자정까지)과 금수복국(오전 8시 오픈), 광안리 남천동의 안목(미쉐린 빕 구르망 2년 연속)처럼, 부산 사람들이 아침 일찍부터 뚝배기를 비우는 음식들입니다.\n**동선 팁** — 돼지국밥이 처음이라면 잡내가 덜한 집이 어디인지, 새우젓·부추를 어떻게 넣는지도 글에 적어 뒀습니다. 안목은 밥을 국에 넣을지 주문할 때 정하고, 광안리 바다와도 가깝습니다(2026.08 기준).',
        en: 'Busan is filled in with soups first. Dumichon Dwaeji-gukbap (open until midnight) and Geumsu Bokguk (opens at 8:00 AM) in Dongnae, and Anmok in Namcheon-dong, Gwangalli (a Michelin Bib Gourmand two years running), are the dishes Busan people empty an earthenware bowl of from early in the morning.\n**Route tips** — if pork gukbap is new to you, each guide says which shop has the least gamey edge and how to add salted shrimp and chives. At Anmok you decide when you order whether the rice goes into the soup, and it is close to the Gwangalli sea (as of Aug 2026).',
        ja: '釜山はスープ料理から埋めました。東莱のトゥミチョン・テジクッパ（深夜0時まで）とクムスボックク（午前8時オープン）、広安里・南川洞のアンモク（ミシュラン ビブグルマン2年連続）など、釜山の人たちが朝早くから土鍋を空にする料理です。\n**動線のヒント** — 豚クッパが初めてなら、臭みの少ない店はどこか、塩辛やニラの入れ方も記事に書いてあります。アンモクではご飯をスープに入れるか注文時に決め、広安里の海も近いです（2026年8月時点）。',
        zh: '釜山先從湯品補起。東萊的 두미촌돼지국밥（Dumichon Dwaeji-gukbap，營業到午夜）和 금수복국（Geumsu Bokguk，8:00 開門），以及廣安里南川洞的 안목（Anmok，連續兩年入選米其林必比登），都是釜山人一大早就會把整鍋喝光的料理。\n**動線小提醒** — 如果是第一次吃豬肉湯飯，哪家比較沒有異味、蝦醬和韭菜怎麼放，文章裡都有寫。안목要在點餐時決定飯是否泡進湯裡，離廣安里的海邊也很近（截至2026年8月）。' },
      areas: [
        { slug: 'dongnae',   names: { ko: '동래',   en: 'Dongnae',   ja: '東莱',   zh: '東萊' } },
        { slug: 'gwangalli', names: { ko: '광안리', en: 'Gwangalli', ja: '広安里', zh: '廣安里' } }
      ] },
    { slug: 'jeju',        color: '#c25e10', colorDark: '#f5a45a',   // 감귤
      names: { ko: '제주',      en: 'Jeju',               ja: '済州',     zh: '濟州' },
      seoTitle: { ko: '제주 맛집·여행 가이드', en: 'Jeju Food & Travel Guide', ja: '済州のグルメ・観光ガイド', zh: '濟州美食與景點指南' },   // <title> 전용 (Oct 2026 — 지역 제목에 검색 의도 추가). H1 은 그대로
      intro: {
        ko: '제주는 렌터카로 도는 걸 전제로 정리했습니다. 제주시의 해장국(대춘·미풍·함덕골목)과 애월의 우니덮밥·막국수, 서귀포 모슬포항 주변의 할망밥상·돈지식당·큰돈가, 남원의 공천포식당 전복죽 같은 한 끼와, 성산일출봉·광치기해변·모슬포 해안도로 같은 풍경, 금능·함덕·이호테우 해변까지 있습니다.\n**동선 팁** — 공항에서 시작해 서쪽 또는 동쪽으로 도는 이틀 동선에 자연스럽게 들어갑니다. 여름 한치회덮밥·봄 유채꽃처럼 철을 타는 메뉴와 풍경은 글에 표시해 뒀고, 제주 해장국은 간마늘을 듬뿍 넣어 먹습니다.',
        en: 'The Jeju guides assume you are getting around by rental car. They cover meals such as hangover soup in Jeju City (Daechun, Mipung and Hamdeok Golmok), sea urchin rice bowls and makguksu in Aewol, Halmang Bapsang, Donji Sikdang and Keundonga around Moseulpo Port in Seogwipo, and the abalone porridge at Gongcheonpo Sikdang in Namwon, plus scenery such as Seongsan Ilchulbong, Gwangchigi Beach and the Moseulpo coastal road, and the beaches at Geumneung, Hamdeok and Iho Tewoo.\n**Route tips** — they fit naturally into a two-day route that starts at the airport and goes west or east. Seasonal dishes and views, such as the summer cuttlefish sashimi rice bowl and the spring rape blossoms, are marked in the guides, and on Jeju hangover soup is eaten with plenty of ground garlic.',
        ja: '済州はレンタカーで回ることを前提にまとめました。済州市のヘジャンクク（テチュン・ミプン・ハムドクゴルモク）と涯月のウニ丼・マッククス、西帰浦の摹瑟浦港周辺のハルマンパプサン・トンジ食堂・クンドンガ、南元の孔泉浦食堂のアワビ粥といった食事に加え、城山日出峰・広峙其海岸・摹瑟浦の海岸道路などの風景、クムヌン・咸徳・梨湖テウのビーチまであります。\n**動線のヒント** — 空港から出発して西か東へ回る2日間の動線に自然に収まります。夏のイカ刺し丼、春の菜の花のように、季節で決まるメニューや風景は記事に表示してあり、済州のヘジャンククにはすりおろしニンニクをたっぷり入れて食べます。',
        zh: '濟州以租車自駕為前提來整理。濟州市有解酒湯（대춘（Daechun）、미풍（Mipung）、함덕골목（Hamdeok Golmok））、涯月有海膽蓋飯與蕎麥涼麵、西歸浦摹瑟浦港周邊有 할망밥상（Halmang Bapsang）、敦地食堂與 큰돈가（Keundonga），南元有孔泉浦食堂的鮑魚粥，還有城山日出峰、廣置其海灘、摹瑟浦海岸道路等風景，以及金陵、咸德、梨湖的海水浴場。\n**動線小提醒** — 很適合排進從機場出發、往西或往東的兩天行程。夏季的小卷生魚片蓋飯、春季的油菜花這類依季節的菜色與風景，文章裡都有標示；濟州的解酒湯要放大量蒜泥才對味。' },
      areas: [
        { slug: 'jejusi',   names: { ko: '제주시',  en: 'Jeju City', ja: '済州市',  zh: '濟州市' },
          intro: {
            ko: '제주시는 해장국집과 오일시장, 해변이 가까이 모여 있는 곳입니다. 대춘해장국·미풍해장국·함덕골목의 해장국과 내장탕, 장모식탁의 전복솥밥 정식, 이재모피자가 있고, 제주민속오일시장과 이호테우·함덕·금능 해수욕장도 다녀왔습니다.\n**동선 팁** — 제주 해장국은 간마늘을 듬뿍 넣어 먹고, 함덕골목은 포장이 안 되고 매장에서만 먹을 수 있습니다. 제주민속오일시장은 끝자리 2일과 7일에 열리니 날짜를 맞춰 가세요. 이호테우해수욕장은 공항과 가까워 도착이나 출발 전후에 잠깐 들르기 좋습니다.',
            en: 'Jeju City packs hangover-soup shops, the five-day market and beaches close together. It has the hangover soups and offal soup at Daechun, Mipung and Hamdeok Golmok, the abalone pot-rice set at Jangmo Siktak and Ijaemo Pizza, and I have also been to the Jeju Folk Five-Day Market and the beaches at Iho Tewoo, Hamdeok and Geumneung.\n**Route tips** — on Jeju, hangover soup is eaten with plenty of ground garlic, and Hamdeok Golmok does not do takeaway, so you eat in. The Jeju Folk Five-Day Market runs on days ending in 2 or 7, so time your visit. Iho Tewoo Beach is close to the airport and an easy short stop on arrival or departure.',
            ja: '済州市は、ヘジャンクク（二日酔いスープ）の店と五日市場、ビーチが近くに集まっている地区です。テチュン・ミプン・ハムドクゴルモクのヘジャンククと内臓スープ、チャンモシクタクのアワビ釜飯定食、イジェモピザがあり、済州民俗五日市場や梨湖テウ・咸徳・クムヌンの海水浴場にも行きました。\n**動線のヒント** — 済州のヘジャンククはすりおろしニンニクをたっぷり入れて食べます。ハムドクゴルモクは持ち帰りができず店内のみです。済州民俗五日市場は末尾が2と7の日に開くので日付を合わせてください。梨湖テウ海水浴場は空港に近く、到着や出発の前後に立ち寄りやすい場所です。',
            zh: '濟州市是解酒湯店、五日市集與海灘彼此很近的地方。有 대춘（Daechun）、미풍（Mipung）、함덕골목（Hamdeok Golmok）的解酒湯與內臟湯、장모식탁（Jangmo Siktak）的鮑魚鍋飯定食、Lee Jaemo Pizza，也去過濟州民俗五日市場，以及梨湖、咸德、金陵的海水浴場。\n**動線小提醒** — 濟州的解酒湯要放大量蒜泥才對味，함덕골목不提供外帶，只能在店內吃。濟州民俗五日市場在尾數為 2 或 7 的日子開市，要配合日期前往。梨湖 Tewoo 海水浴場離機場近，抵達或出發前後很適合順道去一下。'
          } },
        { slug: 'aewol',    names: { ko: '애월',    en: 'Aewol',     ja: '涯月',    zh: '涯月' },
          intro: {
            ko: '애월은 제주 북서쪽 해안도로를 따라 식당이 모여 있는 동네입니다. 해녀의집(해산물 한상과 마무리 해물라면), 우니담(우니 덮밥), 애월리순메밀막국수(들기름막국수·물막국수), 제주나기(나고야식 히츠마부시)를 다녀왔습니다.\n**동선 팁** — 우니담의 우니동은 우니의 그램 수에 따라 소·대로 나뉘고, 애월리순메밀막국수는 전혀 맵지 않습니다. 제주나기의 히츠마부시는 날이 좋아 포장해서 먹었습니다.',
            en: 'Aewol is where restaurants line the coastal road on the northwest of Jeju. I have been to Haenyeoui Jip (a seafood spread finished with seafood ramyeon), Unidam (sea urchin rice bowl), Aewolli Sun Memil Makguksu (perilla-oil and water makguksu) and Jejunagi (Nagoya-style hitsumabushi).\n**Route tips** — the sea urchin bowl at Unidam comes in small and large by the grams of uni, and the makguksu at Aewolli Sun Memil is not spicy at all. The hitsumabushi at Jejunagi was taken away to eat on a sunny day.',
            ja: '涯月は済州の北西側、海岸道路に沿って食堂が集まる地区です。海女の家（海鮮の膳と仕上げの海鮮ラーメン）、ウニダム（ウニ丼）、涯月里純そばマッククス（エゴマ油マッククス・水マッククス）、チェジュナギ（名古屋風ひつまぶし）に行きました。\n**動線のヒント** — ウニダムのウニ丼はウニのグラム数で小と大に分かれ、涯月里のマッククスはまったく辛くありません。チェジュナギのひつまぶしは、天気がよかったので持ち帰って食べました。',
            zh: '涯月是濟州西北部沿著海岸道路聚集餐廳的地方。去過的有：海女之家 涯月（海鮮一桌，最後吃海鮮拉麵收尾）、Unidam 涯月店（海膽蓋飯）、애월리순메밀막국수（Aewolli Sun Memil Makguksu，香油蕎麥涼麵與水蕎麥涼麵）、Jejunagi（名古屋風鰻魚三吃）。\n**動線小提醒** — Unidam 的海膽丼依海膽克數分小份與大份，애월리순메밀막국수完全不辣。Jejunagi 的鰻魚三吃因為天氣好，外帶回去吃。'
          } },
        { slug: 'seogwipo', names: { ko: '서귀포시',en: 'Seogwipo City', ja: '西帰浦市', zh: '西歸浦市' },
          intro: {
            ko: '서귀포시는 제주 서남쪽 모슬포항과 산방산, 남원 일대입니다. 모슬포항 주변의 제주할망밥상, 돈지식당(한치회덮밥은 여름 한정), 큰돈가 서쪽대표(직원이 구워 주는 오겹살·목살), 남원의 공천포식당(전복죽)과 함께, 모슬포항에서 산방산으로 이어지는 해안도로, 추사 김정희 유배지, 카멜리아힐을 다녀왔습니다.\n**동선 팁** — 모슬포항 근처에 식당이 모여 있어 해안도로와 유배지, 산방산을 묶어 하루 동선을 짜기 좋습니다. 공천포식당은 오후 3시 30분에 닫고 목요일에 쉬니 시간을 맞춰 가세요.',
            en: 'Seogwipo City covers the southwest of Jeju: Moseulpo Port, Sanbangsan and Namwon. Around Moseulpo Port there are Jeju Halmang Bapsang, Donji Sikdang (the cuttlefish sashimi rice bowl is summer only) and Keundonga Seojjok Daepyo, where staff grill the pork belly and neck for you, and in Namwon there is Gongcheonpo Sikdang for abalone porridge. I have also been to the coastal road from Moseulpo Port to Sanbangsan, the Chusa Kim Jeong-hui exile site and Camellia Hill.\n**Route tips** — restaurants cluster near Moseulpo Port, so the coastal road, the exile site and Sanbangsan fit into one day plan. Gongcheonpo Sikdang closes at 3:30 PM and is closed on Thursdays, so time your visit.',
            ja: '西帰浦市は済州の南西側、摹瑟浦港と山房山、南元一帯です。摹瑟浦港周辺の済州ハルマンパプサン、トンジ食堂（イカ刺し丼は夏限定）、クンドンガ ソッチョクデピョ（店員が焼いてくれる豚バラと首肉）、南元の孔泉浦食堂（アワビ粥）に加え、摹瑟浦港から山房山へ続く海岸道路、秋史 金正喜の流配地、カメリアヒルにも行きました。\n**動線のヒント** — 摹瑟浦港の近くに食堂が集まっているので、海岸道路と流配地、山房山を一日の動線にまとめやすいです。孔泉浦食堂は午後3時30分に閉まり、木曜が休みなので時間を合わせてください。',
            zh: '西歸浦市位在濟州西南部，涵蓋摹瑟浦港、山房山與南元一帶。摹瑟浦港周邊有 제주할망밥상（Jeju Halmang Bapsang）、敦地食堂（돈지식당，小卷生魚片蓋飯只在夏季）、큰돈가 서쪽대표（Keundonga Seojjok Daepyo，店員代烤五花肉與梅花肉），南元有孔泉浦食堂的鮑魚粥；也走過從摹瑟浦港到山房山的海岸道路、秋史金正喜流放地和山茶花之丘（Camellia Hill）。\n**動線小提醒** — 餐廳集中在摹瑟浦港附近，可以把海岸道路、流放地與山房山排進同一天的行程。孔泉浦食堂 15:30 打烊、週四公休，要配合時間前往。'
          } },
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
    { slug: 'yeouido-west',
      names: { ko: '여의도 서여의도 — 곰탕 점심, 한강뷰 카페, 저녁 자장면',
               en: 'West Yeouido — gomtang lunch, a Han River cafe, then jjajang for dinner',
               ja: '西汝矣島 — コムタンのランチ、漢江ビューのカフェ、夜はジャージャー麺',
               zh: '西汝矣島 — 牛肉湯午餐、漢江景觀咖啡、晚餐炸醬麵' },
      stops: ['seoul-hadongkwan', 'seoul-gangbyeon-seojae', 'seoul-mutan'] },

    { slug: 'yeouido-ifc',
      names: { ko: '여의도·IFC — 콩국수 점심과 여의도 저녁 한 상',
               en: 'Yeouido & IFC — cold-noodle lunch, then dinner around the mall',
               ja: '汝矣島・IFC — コングクスのランチ、夜はモール周辺で一膳',
               zh: '汝矣島·IFC — 豆漿麵午餐，晚餐在商場周邊' },
      stops: ['seoul-jinjujip-kongguksu', 'seoul-konthai-yeouido', 'seoul-sinseung-banjeom'] },

    { slug: 'myeongdong-namsan',
      names: { ko: '명동·남산 — 점심 나물비빔밥, 카페, 저녁 칼국수, 야식 뼈숯불',
               en: 'Myeongdong & Namsan — bibimbap lunch, a cafe stop, kalguksu for dinner, then grilled bones late-night',
               ja: '明洞・南山 — 昼はナムルビビンバ、カフェ、夜はカルグクス、深夜は骨付き炭火',
               zh: '明洞·南山 — 午餐野菜拌飯、咖啡、晚餐刀切麵、消夜骨頭炭烤' },
      stops: ['seoul-mokmyeoksanbang', 'seoul-tailor-coffee', 'seoul-myeongdong-gyoja', 'seoul-myeongdong-shindonggung'] },

    { slug: 'namdaemun-market',
      names: { ko: '남대문시장 — 아침 갈치조림, 점심 회정식, 저녁 전 냉면 한 그릇',
               en: 'Namdaemun Market — braised hairtail for breakfast, a sashimi set for lunch, then naengmyeon before dinner',
               ja: '南大門市場 — 朝は太刀魚の煮付け、昼は刺身定食、夕方は冷麺で一息',
               zh: '南大門市場 — 早餐燉白帶魚、午餐生魚片定食、晚餐前來碗冷麵' },
      stops: ['seoul-honam-sikdang', 'seoul-maknae-hoejip', 'seoul-buwon-myeonok'] },

    { slug: 'mapo-station',
      names: { ko: '마포 — 마포역 고깃집·생소고기와 양옥 카페',
               en: 'Mapo — grills and raw beef by Mapo Station, then a converted-house cafe',
               ja: '麻浦 — 麻浦駅の焼肉・生牛肉と洋館カフェ',
               zh: '麻浦 — 麻浦站的烤肉、生牛肉，加老洋房咖啡' },
      stops: ['seoul-cheongchun-gurakbu', 'seoul-urban-mungtigi', 'seoul-fritz-dohwa'] },

    { slug: 'euljiro-ikseon',
      names: { ko: '을지로·익선동 — 노포 순대국·LA갈비에서 익선동 디저트',
               en: 'Euljiro & Ikseondong — veteran sundae-guk and LA-galbi, then Ikseondong dessert',
               ja: '乙支路・益善洞 — 老舗のスンデクッパ・LAカルビから益善洞のデザート',
               zh: '乙支路·益善洞 — 老店血腸湯、LA排骨，再到益善洞甜點' },
      stops: ['seoul-sansu-gapsan', 'seoul-sigoljip', 'seoul-dongbaek-yanggwajeom'] },

    { slug: 'yeoksam-teheran',
      names: { ko: '역삼 테헤란로 — 점심 비빔밥, 커피 한 잔, 저녁 수제버거',
               en: 'Yeoksam, Teheran-ro — bibimbap lunch, a coffee break, then burgers for dinner',
               ja: '駅三・テヘラン路 — 昼はビビンバ、コーヒー休憩、夜はハンバーガー',
               zh: '驛三・德黑蘭路 — 午餐拌飯、咖啡小憩、晚餐手作漢堡' },
      stops: ['seoul-hankookjip-centerfield', 'seoul-terarosa-yeoksam', 'seoul-basburger-yeoksam'] },

    { slug: 'hongdae-night',
      names: { ko: '홍대 — 낮엔 고양이카페, 밤엔 대게, 새벽엔 라멘',
               en: 'Hongdae — cat cafe by day, crab course by night, ramen before dawn',
               ja: '弘大 — 昼は猫カフェ、夜はワタリガニコース、明け方はラーメン',
               zh: '弘大 — 白天貓咖啡，晚上大蟹套餐，凌晨拉麵' },
      stops: ['seoul-roofcatme-hongdae', 'seoul-kimnkim-daege', 'seoul-hakata-bunko'] },

    { slug: 'yeongdeungpo-dangsan',
      names: { ko: '영등포·당산 — 쌀국수와 한강 산책, 저녁 숙성회',
               en: 'Yeongdeungpo & Dangsan — pho, a walk by the Han River, then aged sashimi for dinner',
               ja: '永登浦・堂山 — フォーと漢江散歩、夜は熟成刺身',
               zh: '永登浦·堂山 — 河粉配漢江散步，晚餐熟成生魚片' },
      stops: ['seoul-pho-ong-nam', 'seoul-dorimhang'] },

    { slug: 'jeju-west',
      names: { ko: '제주 서쪽 — 애월 막국수와 오일장',
               en: 'West Jeju — Aewol noodles and the five-day market',
               ja: '済州西部 — 涯月のマッククスと五日市',
               zh: '濟州西部 — 涯月拌麵與五日市集' },
      stops: ['jeju-aewol-makguksu', 'jeju-oiljang'] },

    /* 제주 추천 코스 (Oct 2026) — 글의 좌표·영업시간·휴무일을 확인해 서쪽→동쪽 순서로 묶었습니다.
       휴무: 해녀의집 화 · 추사 유배지 월 · 공천포식당 목 · 장모식탁 일 · 대춘해장국 월 */
    { slug: 'jeju-northwest-coast',
      names: { ko: '제주 서북쪽 해안 — 이호테우 산책, 점심 해산물 한상, 저녁 전 메밀막국수',
               en: 'Northwest Jeju coast — Iho Tewoo, a seafood spread for lunch, buckwheat noodles before dinner',
               ja: '済州北西の海岸 — 梨湖テウ海水浴場の散歩、昼は海鮮の膳、夕方前にそばマッククス',
               zh: '濟州西北海岸 — 梨湖테우（Tewoo）散步、午餐海鮮一桌、晚餐前一碗메밀막국수' },
      stops: ['jeju-iho-tewoo', 'jeju-aewol-haenyeoui-jip', 'jeju-aewol-makguksu'] },

    { slug: 'jeju-aewol-geumneung',
      names: { ko: '애월에서 금능까지 — 히츠마부시 한 끼, 금능해수욕장 산책',
               en: 'From Aewol to Geumneung — a hitsumabushi meal, a walk on Geumneung Beach',
               ja: '涯月から金陵へ — ひつまぶしの食事、クムヌン海水浴場を散歩',
               zh: '從涯月到金陵 — 鰻魚飯（ひつまぶし）一餐、金陵海水浴場散步' },
      stops: ['jeju-jejunagi', 'jeju-geumneung'] },

    { slug: 'jeju-city-market-day',
      names: { ko: '제주시 오일장 날 — 시장 구경, 점심 해장국, 저녁 전복솥밥 정식',
               en: 'Jeju City on a market day — the five-day market, hangover soup for lunch, abalone pot-rice set for dinner',
               ja: '済州市の五日市の日 — 市場散策、昼はヘジャンクク、夜はアワビ釜飯定食',
               zh: '濟州市的市集日 — 逛五日市集、午餐解酒湯、晚餐鮑魚石鍋飯定食' },
      stops: ['jeju-oiljang', 'jeju-mipung-haejangguk', 'jeju-jangmo-siktak'] },

    { slug: 'jeju-hamdeok',
      names: { ko: '함덕 — 오전 해장국, 해수욕장 산책',
               en: 'Hamdeok — hangover soup in the morning, a walk on the beach',
               ja: '咸徳 — 朝はヘジャンクク、海水浴場を散歩',
               zh: '咸德 — 早上解酒湯、海水浴場散步' },
      stops: ['jeju-hamdeok-golmok', 'jeju-hamdeok-beach'] },

    { slug: 'jeju-moseulpo',
      names: { ko: '모슬포 — 오전 추사 유배지, 점심 정식, 산방산 해안도로, 저녁 오겹살',
               en: 'Moseulpo — the Chusa exile site in the morning, a set-meal lunch, the Sanbangsan coastal road, pork belly for dinner',
               ja: '摹瑟浦 — 午前は秋史の流配地、昼は定食、山房山の海岸道路、夜は豚バラ',
               zh: '摹瑟浦 — 上午秋史流放地、午餐定食、山房山海岸道路、晚餐五花肉' },
      stops: ['jeju-chusa-yubaeji', 'jeju-halmang-bapsang', 'jeju-moseulpo-sanbangsan', 'jeju-keundonga-seojjok'] },

    { slug: 'jeju-southeast',
      names: { ko: '제주 동남쪽 — 공천포 전복죽 점심, 쉬어갓 카이막, 성산일출봉',
               en: 'Southeast Jeju — abalone porridge at Gongcheonpo, kaymak at Shwieogat, then Seongsan Ilchulbong',
               ja: '済州南東 — 孔泉浦のアワビ粥の昼、シウォガッのカイマク、城山日出峰',
               zh: '濟州東南 — 孔泉浦鮑魚粥午餐、Shwieogat 的凝脂奶油、城山日出峰' },
      stops: ['jeju-gongcheonpo-sikdang', 'jeju-shwieogat', 'jeju-seongsan-ilchulbong'] }
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
    { key: '베이커리', names: { ko: '베이커리', en: 'Bakery',          ja: 'ベーカリー',   zh: '烘焙坊' } },
    { key: '술집',     names: { ko: '술집',     en: 'Drinking spot',   ja: '居酒屋',       zh: '酒館' } },
    { key: '막걸리',   names: { ko: '막걸리',   en: 'Makgeolli',       ja: 'マッコリ',     zh: '馬格利酒' } },
    { key: '와인',     names: { ko: '와인',     en: 'Wine',            ja: 'ワイン',       zh: '葡萄酒' } },
    { key: '드립커피', names: { ko: '드립커피', en: 'Pour-over',       ja: 'ドリップ',     zh: '手沖咖啡' } },
    { key: '뷔페',     names: { ko: '뷔페',     en: 'Buffet',          ja: 'ビュッフェ',   zh: '自助餐' } },
    { key: '동물카페', names: { ko: '동물카페', en: 'Animal cafe',     ja: '動物カフェ',   zh: '動物咖啡廳' } },

    /* 음식 종류 */
    { key: '국밥',     names: { ko: '국밥',     en: 'Gukbap',          ja: 'クッパ',       zh: '湯飯' } },
    { key: '곰탕',     names: { ko: '곰탕',     en: 'Gomtang',         ja: 'コムタン',     zh: '牛肉湯' } },
    { key: '설렁탕',   names: { ko: '설렁탕',   en: 'Seolleongtang',   ja: 'ソルロンタン', zh: '雪濃湯' } },
    { key: '소꼬리찜', names: { ko: '소꼬리찜', en: 'Braised oxtail',  ja: '牛テール蒸し', zh: '燉牛尾' } },
    { key: '도가니탕', names: { ko: '도가니탕', en: 'Ox-knee soup',    ja: 'トガニタン',   zh: '牛膝軟骨湯' } },
    { key: '복국',     names: { ko: '복국',     en: 'Pufferfish soup', ja: 'フグ汁',       zh: '河豚湯' } },
    { key: '돼지국밥', names: { ko: '돼지국밥', en: 'Pork gukbap',     ja: 'テジクッパ',   zh: '豬肉湯飯' } },
    { key: '콩나물국밥', names: { ko: '콩나물국밥', en: 'Kongnamul gukbap', ja: 'コンナムルクッパ', zh: '豆芽湯飯' } },
    { key: '순대국',   names: { ko: '순대국',   en: 'Sundae-guk',      ja: 'スンデクッパ', zh: '血腸湯' } },
    { key: '부대찌개', names: { ko: '부대찌개', en: 'Budae-jjigae',    ja: 'プデチゲ',     zh: '部隊鍋' } },
    { key: '국수',     names: { ko: '국수',     en: 'Noodles',         ja: '麺',           zh: '麵食' } },
    { key: '칼국수',   names: { ko: '칼국수',   en: 'Kalguksu',        ja: 'カルグクス',   zh: '刀切麵' } },
    { key: '쌀국수',   names: { ko: '쌀국수',   en: 'Rice noodles',    ja: '米麺',         zh: '米線' } },
    { key: '짬뽕',     names: { ko: '짬뽕',     en: 'Jjamppong',       ja: 'チャンポン',   zh: '炒碼麵' } },
    { key: '순두부',   names: { ko: '순두부',   en: 'Sundubu',         ja: 'スンドゥブ',   zh: '嫩豆腐' } },
    { key: '백반',     names: { ko: '백반',     en: 'Home-style set',  ja: 'ペクバン',     zh: '家常定食' } },
    { key: '제육볶음', names: { ko: '제육볶음', en: 'Spicy pork',      ja: 'チェユク炒め', zh: '辣炒豬肉' } },
    { key: '오징어볶음', names: { ko: '오징어볶음', en: 'Spicy squid',  ja: 'イカ炒め',     zh: '辣炒魷魚' } },
    { key: '콩국수',   names: { ko: '콩국수',   en: 'Kongguksu',       ja: 'コングクス',   zh: '豆漿麵' } },
    { key: '막국수',   names: { ko: '막국수',   en: 'Makguksu',        ja: 'マッククス',   zh: '蕎麥拌麵' } },
    { key: '라멘',     names: { ko: '라멘',     en: 'Ramen',           ja: 'ラーメン',     zh: '拉麵' } },
    { key: '냉면',     names: { ko: '냉면',     en: 'Naengmyeon',      ja: '冷麺',         zh: '冷麵' } },
    { key: '감자탕',   names: { ko: '감자탕',   en: 'Gamjatang',       ja: 'カムジャタン', zh: '馬鈴薯排骨湯' } },
    { key: '생대구탕', names: { ko: '생대구탕', en: 'Fresh cod stew',  ja: '生タラ鍋',     zh: '鮮鱈魚湯' } },
    { key: '게장',     names: { ko: '게장',     en: 'Gejang (marinated crab)', ja: 'ケジャン', zh: '醬蟹' } },
    { key: '솥밥',     names: { ko: '솥밥',     en: 'Stone-pot rice',  ja: '釜飯',         zh: '石鍋飯' } },
    { key: '대게',     names: { ko: '대게',     en: 'Snow crab',       ja: 'ズワイガニ',   zh: '雪蟹' } },
    { key: '수육',     names: { ko: '수육',     en: 'Suyuk',           ja: 'スユク',       zh: '水煮肉' } },
    { key: '꼬리수육', names: { ko: '꼬리수육', en: 'Ox-tail suyuk',   ja: '牛テールスユク', zh: '牛尾水煮肉' } },
    { key: '한우',     names: { ko: '한우',     en: 'Hanwoo beef',     ja: '韓牛',         zh: '韓牛' } },
    { key: '갈비',     names: { ko: '갈비',     en: 'Galbi',           ja: 'カルビ',       zh: '牛排骨' } },
    { key: '곱창',     names: { ko: '곱창',     en: 'Grilled offal',   ja: 'ホルモン焼き', zh: '烤牛腸' } },
    { key: '곱창전골', names: { ko: '곱창전골', en: 'Beef tripe hot pot', ja: 'ホルモン鍋', zh: '牛腸鍋' } },
    { key: '껍데기',   names: { ko: '껍데기',   en: 'Grilled pork skin', ja: 'コプデギ', zh: '豬皮' } },
    { key: '정식',     names: { ko: '정식',     en: 'Set meal',        ja: '定食',         zh: '套餐' } },
    { key: '비빔밥',   names: { ko: '비빔밥',   en: 'Bibimbap',        ja: 'ビビンバ',     zh: '拌飯' } },
    { key: '족발',     names: { ko: '족발',     en: 'Jokbal',          ja: 'チョッパル',   zh: '豬腳' } },
    { key: '육회',     names: { ko: '육회',     en: 'Yukhoe',          ja: 'ユッケ',       zh: '生牛肉' } },
    { key: '떡갈비',   names: { ko: '떡갈비',   en: 'Tteok-galbi',     ja: 'トッカルビ',   zh: '떡갈비' } },
    { key: '삼겹살',   names: { ko: '삼겹살',   en: 'Samgyeopsal',    ja: 'サムギョプサル', zh: '五花肉' } },
    { key: '흑돼지',   names: { ko: '흑돼지',   en: 'Black pork',     ja: '黒豚',         zh: '黑豬肉' } },
    { key: '치킨',     names: { ko: '치킨',     en: 'Chicken',         ja: 'チキン',       zh: '雞肉' } },
    { key: '김밥',     names: { ko: '김밥',     en: 'Gimbap',          ja: 'キンパ',       zh: '海苔飯捲' } },
    { key: '분식',     names: { ko: '분식',     en: 'Bunsik',          ja: '粉食',         zh: '韓式小吃' } },
    { key: '장어',     names: { ko: '장어',     en: 'Grilled eel',     ja: 'うなぎ',       zh: '鰻魚' } },
    { key: '돈까스',   names: { ko: '돈까스',   en: 'Donkkaseu',       ja: 'トンカツ',     zh: '豬排' } },
    { key: '버거',     names: { ko: '버거',     en: 'Burger',          ja: 'バーガー',     zh: '漢堡' } },
    { key: '피자',     names: { ko: '피자',     en: 'Pizza',           ja: 'ピザ',         zh: '披薩' } },
    { key: '브런치',   names: { ko: '브런치',   en: 'Brunch',          ja: 'ブランチ',     zh: '早午餐' } },
    { key: '해산물',   names: { ko: '해산물',   en: 'Seafood',         ja: '魚介',         zh: '海鮮' } },
    { key: '생선구이', names: { ko: '생선구이', en: 'Grilled fish',    ja: '焼き魚',       zh: '烤魚' } },
    { key: '갈치조림', names: { ko: '갈치조림', en: 'Braised hairtail', ja: '太刀魚の煮付け', zh: '燉白帶魚' } },
    { key: '물회',     names: { ko: '물회',     en: 'Mulhoe',          ja: 'ムルフェ',     zh: '冷湯生魚' } },
    { key: '회덮밥',   names: { ko: '회덮밥',   en: 'Sashimi bowl',    ja: '海鮮丼',       zh: '生魚蓋飯' } },
    { key: '디저트',   names: { ko: '디저트',   en: 'Dessert',         ja: 'デザート',     zh: '甜點' } },
    { key: '파스타',   names: { ko: '파스타',   en: 'Pasta',           ja: 'パスタ',       zh: '義大利麵' } },
    { key: '스테이크', names: { ko: '스테이크', en: 'Steak',           ja: 'ステーキ',     zh: '牛排' } },
    { key: '타코',     names: { ko: '타코',     en: 'Tacos',           ja: 'タコス',       zh: '塔可' } },

    /* 요리 계통 */
    { key: '일식',     names: { ko: '일식',     en: 'Japanese',        ja: '和食',         zh: '日本料理' } },
    { key: '중식',     names: { ko: '중식',     en: 'Chinese',         ja: '中華',         zh: '中餐' } },
    { key: '양식',     names: { ko: '양식',     en: 'Western',         ja: '洋食',         zh: '西餐' } },

    /* 여행지 · 풍경 — travel 글에도 하단 칩이 붙도록 하는 축 */
    { key: '스파',     names: { ko: '스파',     en: 'Spa',             ja: 'スパ',         zh: '水療' } },
    { key: '해변',     names: { ko: '해변',     en: 'Beach',           ja: 'ビーチ',       zh: '海灘' } },
    { key: '갯벌',     names: { ko: '갯벌',     en: 'Mudflat',         ja: '干潟',         zh: '灘塗' } },
    { key: '캠핑',     names: { ko: '캠핑',     en: 'Camping',         ja: 'キャンプ',     zh: '露營' } },
    { key: '호수',     names: { ko: '호수',     en: 'Lake',            ja: '湖',           zh: '湖' } },
    { key: '계곡',     names: { ko: '계곡',     en: 'Valley stream',   ja: '渓谷',         zh: '溪谷' } },
    { key: '드라이브', names: { ko: '드라이브', en: 'Scenic drive',    ja: 'ドライブ',     zh: '自駕兜風' } },
    { key: '전망대',   names: { ko: '전망대',   en: 'Lookout',         ja: '展望台',       zh: '觀景台' } },
    { key: '유적',     names: { ko: '유적',     en: 'Historic site',   ja: '史跡',         zh: '古蹟' } },
    { key: '수목원',   names: { ko: '수목원',   en: 'Arboretum',       ja: '樹木園',       zh: '樹木園' } },
    { key: '공원',     names: { ko: '공원',     en: 'Park',            ja: '公園',         zh: '公園' } },
    { key: '뱃놀이',   names: { ko: '뱃놀이',   en: 'Boat ride',       ja: '船遊び',       zh: '船遊' } },
    { key: '시장',     names: { ko: '시장',     en: 'Market',          ja: '市場',         zh: '市場' } },
    { key: '하이킹',   names: { ko: '하이킹',   en: 'Hiking',          ja: 'ハイキング',   zh: '健行' } }
  ],

  /* ---- 홈 히어로 "인기 검색어" 칩 ---------------------------------------
     tagChips 와 달리 동네·지역 이름도 섞을 수 있습니다 — 첫 화면에서 바로
     눌러볼 만한 구체적인 검색어를 보여주는 게 목적이라, 음식 종류든 동네든
     상관없습니다. 클릭하면 홈 검색(/?q=)으로 가므로 등록되지 않은 자유
     텍스트도 됩니다.
     아래 7개는 감으로 고른 게 아니라 서치 콘솔 실적 리포트(2026-09-21 기준,
     최근 3개월·전체 289개 검색어)를 음식 종류별로 합산해서 뽑은 것입니다.
     같은 소재의 검색어(표기·언어가 달라도)는 노출수를 더해서 비교했고,
     "OO 근처"처럼 의도가 안 맞아 클릭 0·순위 50위 밖으로 묻힌 광역 쿼리는
     제외했습니다 (예: "ramen tonkotsu near me" 527노출은 라멘 수요가 아니라
     "내 근처" 검색이라 뺐고, 대신 순위 6~11위로 실제 노출된 文庫拉麵 등
     라멘 관련 쿼리 합산으로 넣었습니다). 검색 트렌드가 바뀌면 이 목록도
     주기적으로 다시 뽑아야 합니다.
     아구찜(15노출) 대신 카페(21노출 — Dozo Coffee·익선동 수플레·루프캣미·
     Tailor Coffee 합산, Sep 2026 교체)를 넣었습니다.
     막국수(22노출) 대신 고기구이를 넣었습니다 — 이건 검색량 근거가 아니라
     신규 글(록갈비 합정점) 노출 목적의 예외입니다. 실제 갈비·고기·삼겹살류
     검색 신호는 약합니다(순위 5~10위권 4노출 정도 — 제천 떡갈비·황금떡갈비).
     록갈비 글이 자체 검색 데이터를 쌓으면 다시 데이터 기준으로 재검토하세요
     (Sep 2026, 사용자 확인 후 교체). */
  /* (Oct 2026, 사용자 요청) 위 서치 콘솔 기준 7개를 "음식 장르별 글 수 상위 7개"로 교체했습니다.
     장르 글 수(2026-10-07, 맛집 95개 중): 해산물 20 · 국밥·탕 17 · 고기구이 10 ·
     카페·디저트 9 · 양식·레스토랑 9 · 냉면·국수 7 · 라멘·일식 4 (중식·한식 3 / 비빔밥 2 / 만두 1 은 제외).
     칩 문구는 장르 이름이 그대로 검색에 걸리는 말로 골랐습니다 — 국밥·탕/냉면·국수는 searchNames 가 비어
     있어서 "국밥·탕" 을 검색하면 0건이라 "국밥"/"국수" 로, 라멘·일식은 기존 "라멘" 칩을 유지했습니다.
     글이 늘어 순위가 바뀌면 이 목록도 다시 뽑으세요. */
  homePopularSearches: [
    { ko: '해산물',     en: 'Seafood',           ja: '海鮮',         zh: '海鮮' },
    { ko: '국밥',       en: 'Gukbap',            ja: 'クッパ',       zh: '湯飯' },
    { ko: '고기구이',   en: 'Korean BBQ',        ja: '韓国式BBQ',    zh: '韓式烤肉' },
    { ko: '카페',       en: 'Cafes',             ja: 'カフェ',       zh: '咖啡廳' },
    { ko: '양식',       en: 'Western',           ja: '洋食',         zh: '西餐' },
    { ko: '국수',       en: 'Noodles',           ja: '麺',           zh: '涼麵' },
    { ko: '라멘',       en: 'Ramen',             ja: 'ラーメン',     zh: '拉麵' }
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
  tipsPages: ['visa', 'transport', 'money', 'maps', 'help', 'dining'],

  genres: [
    /* korean-seafood 는 korean-bbq 보다 앞에 둡니다 — 꼼장어처럼 "소금구이·양념구이"로
       먹는 해산물이, 장르 태그 목록에 겹치는 조리법 태그(소금구이) 때문에 고기구이로
       잘못 분류되는 걸 막기 위해서입니다 (Sep 2026, 공평동꼼장어 오분류 발견). 재료
       태그(꼼장어 등)가 조리법 태그보다 먼저 매칭되게 합니다. */
    { slug: 'korean-seafood',   emoji: '🦑',
      names: { ko: '해산물',     en: 'Korean Seafood',    ja: '韓国の魚介',    zh: '韓式海鮮' },
      tags:  ['해산물', '물회', '회덮밥', '숙성회', '모둠회', '대게', '킹크랩', '생대구탕', '밴댕이', '전복죽', '아구찜', '간장게장', '게장', '생선구이', '갈치조림', '꼼장어'] },
    { slug: 'korean-bbq',       emoji: '🍖',
      names: { ko: '고기구이',   en: 'Korean BBQ',        ja: '韓国式BBQ',      zh: '韓式烤肉' },
      tags:  ['소금구이', '고기집', '뼈구이', '껍데기', '숯불', '갈비', '삼겹살', '목살', '한우', '곱창', '대창', '막창'] },
    /* korean-soup · korean-noodles: 표시 이름("국밥·탕", "냉면·국수")이 서로 다른
       여러 음식을 묶은 복합어라, 이 두 장르에 한해 searchNames 를 비워 둡니다
       (검색 텍스트에서 장르명 전체를 빼고 글 자체 태그만 봄 — 위 genreSearchLabel
       참고). "국밥"·"냉면" 검색에 복국·부대찌개·막국수·칼국수 같은 남남인
       글까지 걸리는 걸 막기 위해서입니다. 화면 표시(제목·배지)는 그대로 "국밥·탕"
       "냉면·국수" 를 씁니다 — names 는 안 건드립니다. */
    { slug: 'korean-soup',      emoji: '🍲',
      names: { ko: '국밥·탕',    en: 'Korean Soup & Gukbap', ja: 'クッパ・スープ', zh: '湯飯' },
      searchNames: { ko: '', en: '', ja: '', zh: '' },
      tags:  ['국밥', '곰탕', '돼지국밥', '순대국', '순대국밥', '복국', '감자탕', '해장', '설렁탕', '도가니탕', '부대찌개', '콩나물국밥'] },
    { slug: 'korean-noodles',   emoji: '🍜',
      names: { ko: '냉면·국수',  en: 'Korean Noodles',    ja: '韓国の麺',      zh: '韓式麵食' },
      searchNames: { ko: '', en: '', ja: '', zh: '' },
      tags:  ['냉면', '막국수', '콩국수', '국수', '칼국수', '퍼'] },
    { slug: 'chinese-korean',   emoji: '🥢',
      names: { ko: '중식',       en: 'Chinese-Korean',    ja: '韓国式中華',    zh: '韓式中餐' },
      tags:  ['중식', '자장면', '짬뽕', '유린기'] },
    /* japanese-in-korea: "라멘·일식" 전체가 아니라 진짜 공통 상위어인 "일식"만
       검색 텍스트로 씁니다 — 라멘이 아닌 히츠마부시·오코노미야끼 글이
       "라멘" 검색에 걸리는 걸 막습니다 (Sep 2026, 홈 히어로 인기검색어
       칩 추가하면서 제주나기·쯔루하시 후게츠가 걸리는 걸 발견). */
    { slug: 'japanese-in-korea', emoji: '🍥',
      names: { ko: '라멘·일식',  en: 'Ramen & Japanese',  ja: 'ラーメン・和食', zh: '拉麵·日料' },
      searchNames: { ko: '일식', en: 'Japanese', ja: '和食', zh: '日式' },
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
      tags:  ['양식', '파스타', '뇨끼', '리조또', '그라탕', '스테이크', '멕시칸', '타코', '파히타', '와인뷔페', '퓨전', '피자'] },
    { slug: 'cafe-dessert',     emoji: '☕',
      names: { ko: '카페·디저트', en: 'Cafes & Dessert',  ja: 'カフェ・スイーツ', zh: '咖啡·甜點' },
      tags:  ['카페', '드립커피', '디저트', '베이커리', '수플레', '팬케이크'] },
    /* 한식 — 특정 장르에 안 걸리는 한식 몇 개(곱창전골·시장 음식)를 담습니다.
       slug 는 예전 주소를 살리려고 그대로 둡니다 (표시 이름만 '한식'). */
    { slug: 'bars-makgeolli',   emoji: '🥘',
      names: { ko: '한식', en: 'Korean', ja: '韓国料理', zh: '韓式料理' },
      tags:  ['곱창전골', '전골', '술안주', '막걸리', '소꼬리찜'] },
    /* 새 허브 (Oct 2026) — 목록 맨 뒤에 둡니다. 이미 장르가 있는 글의 배지는 그대로이고
       (배지는 첫 번째 장르 genreOf), 이 허브들은 한 글이 여러 장르에 걸리는 genresOf 로
       기존 글을 그대로 모읍니다. 새 글을 쓸 때 ko tags 에 아래 태그가 있으면 자동으로 실립니다. */
    { slug: 'korean-hangover-soup', emoji: '🥣',
      names: { ko: '해장국', en: 'Korean Hangover Soup', ja: '二日酔いスープ', zh: '解酒湯' },
      tags:  ['해장국', '해장', '내장탕'] },
    { slug: 'korean-sashimi',       emoji: '🐟',
      names: { ko: '회·횟집', en: 'Korean Sashimi', ja: '刺身・活魚', zh: '生魚片' },
      searchNames: { ko: '회', en: 'Sashimi', ja: '刺身', zh: '生魚片' },
      tags:  ['회', '숙성회', '모둠회', '회덮밥', '횟집', '물회', '사시미', '우니'] },
    { slug: 'gomtang-seolleongtang', emoji: '🍜',
      names: { ko: '곰탕·설렁탕', en: 'Gomtang & Seolleongtang', ja: 'コムタン・ソルロンタン', zh: '牛骨湯' },
      searchNames: { ko: '', en: '', ja: '', zh: '' },
      tags:  ['곰탕', '설렁탕', '도가니탕'] },
    { slug: 'korean-set-meals',     emoji: '🍱',
      names: { ko: '백반·정식', en: 'Korean Set Meals', ja: '韓国の定食', zh: '韓式定食' },
      searchNames: { ko: '', en: '', ja: '', zh: '' },
      tags:  ['백반', '정식', '쌈밥'] }

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

  /* ---- Geoapify (동네 지도 배경 이미지) ---------------------------------
     지역/동네 페이지의 "동네 지도"에 쓰는 배경 지도 이미지를 빌드할 때마다
     한 번씩 받아옵니다 — 방문자 브라우저는 이 요청과 전혀 관계없고, 이미
     저장된 이미지 파일만 받습니다(무료 티어, 회원가입 계정: geoapify.com).
     비워두면 배경 지도 없이 격자 무늬로만 표시됩니다(오류 아님).
     ★ 이 키는 빌드(Node) 에서만 쓰이고 방문자에게 보이는 페이지/JS 에는
       절대 나가지 않습니다. */
  geoapifyKey: '9e2152f828f0405baf991ae798944f8f',

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
