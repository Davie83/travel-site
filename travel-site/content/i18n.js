/* ==========================================================================
   화면에 나오는 고정 문구 — 언어별 사전
   --------------------------------------------------------------------------
   글 내용이 아니라 버튼·제목 같은 "틀"의 문구입니다.
   새 언어를 추가하려면 여기에 같은 모양으로 한 덩어리를 더하고,
   site.config.js 의 locales 에서 enabled: true 로 바꾸면 됩니다.
   ========================================================================== */

module.exports = {

  ko: {
    tagline:     '어디로 가세요?',
    description: '한국인이 직접 다녀온 경험 및 맛집 후기 정리합니다. 동선, 예산, 교통, 붐비는 시간대까지 가기 전에 알면 좋은 정보 위주입니다.',
    siteDesc:    '한국 여행지와 맛집 정보. 지역별로 정리했습니다.',

    nav:       { regions: '지역', travel: '여행지', food: '맛집', about: '소개', contact: '문의' },
    category:  { travel: '여행지', food: '맛집' },
    categoryTitle: { travel: '여행지', food: '맛집' },
    categoryDesc:  {
      travel: '어디를 갈지보다 어떻게 돌지가 더 어렵습니다. 코스와 동선 위주로 정리했습니다.',
      food:   '줄 서기 전에 알아야 할 가격대, 주문 방법, 웨이팅을 함께 적었습니다.'
    },

    findByRegion: '지역으로 찾기',
    regionCount:  n => `전체 ${n}개 지역`,
    latest:       '최근 올라온 글',
    more:         '더 보기',
    all:          '전체',
    comingSoon:   '준비 중',
    empty:        '아직 등록된 글이 없습니다. 준비되는 대로 채워집니다.',
    noResult:     '조건에 맞는 글이 없습니다. 다른 키워드로 찾아보세요.',
    searchPlaceholder: '지역이나 키워드로 찾기',

    suggestMsg: '이 페이지는 한국어로도 볼 수 있습니다',
    suggestGo:  '한국어로 보기',

    needsCheck: '잦은 변동으로 확인 필요',
    mapLabel:   '지도',
    openMap:    '구글 지도에서 열기',

    published:  '발행',
    visited:    v => `방문 기준 ${v}`,
    related:    '함께 보면 좋은 글',

    reactionTitle: '이 글, 어떠셨나요?',
    reactionNote:  '로그인 없이 누를 수 있습니다. 다시 누르면 취소됩니다.',
    reactionError: '반응을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
    reactionLoadError: '반응 수를 불러오지 못했습니다. 잠시 후 새로고침 해주세요.',
    reactionLabels: { like: '좋아요', wantgo: '가보고싶다', yummy: '맛있겠다', wow: '몰랐어요', thanks: '도움됐어요', fun: '재밌네요' },

    skip:      '본문 바로가기',
    menuOpen:  '메뉴 열기',
    menuClose: '메뉴 닫기',
    langLabel: '언어 선택',

    footerAbout:   '사이트 소개',
    footerContact: '문의하기',
    footerPrivacy: '개인정보처리방침',

    notFoundTitle: '길을 잘못 드셨네요',
    notFoundDesc:  '찾으시는 페이지가 없거나 주소가 바뀌었습니다.',
    backHome:      '홈으로 돌아가기',
    savedNav:      '저장한 곳',
    savedTitle:    '저장한 곳',
    savedDesc:     '가고 싶은 곳을 저장해 두세요. 이 기기에만 저장되고, 로그인은 필요 없습니다.',
    savedEmpty:    '아직 저장한 곳이 없습니다. 글에서 ☆ 저장을 누르면 여기에 모입니다.',
    savedClear:    '전체 비우기',
    savedClearAsk: '저장한 곳을 전부 지울까요?',
    saveAdd:       '저장',
    saveDone:      '저장됨',
    savedCountTpl: '저장한 곳 {n}곳',
    savedSeeAll:   '전체 보기',
    savedRemove:   '목록에서 지우기'
  },

  en: {
    tagline:     'Where are you headed?',
    description: 'Written by a Korean who actually goes to these places — routes, budgets, transit, and when to avoid the crowds. The things worth knowing before you go.',
    siteDesc:    'Honest guides to places and food across Korea, organised by region.',

    nav:       { regions: 'Regions', travel: 'Places', food: 'Food', about: 'About', contact: 'Contact' },
    category:  { travel: 'Place', food: 'Food' },
    categoryTitle: { travel: 'Places to visit', food: 'Where to eat' },
    categoryDesc:  {
      travel: 'Choosing where to go is the easy part. These guides focus on the order to walk it in and how long it actually takes.',
      food:   'Prices, how to order, and how long the queue really is — before you join it.'
    },

    findByRegion: 'Browse by region',
    regionCount:  n => `${n} regions`,
    latest:       'Latest guides',
    more:         'See all',
    all:          'All',
    comingSoon:   'Coming soon',
    empty:        'No guides here yet. This region is on the way.',
    noResult:     'Nothing matched. Try a different word.',
    searchPlaceholder: 'Search a region or keyword',

    suggestMsg: 'This page is also available in English',
    suggestGo:  'Read in English',

    needsCheck: 'changes often — please verify',
    mapLabel:   'Map',
    openMap:    'Open in Google Maps',

    published:  'Published',
    visited:    v => `Visited ${v}`,
    related:    'Read next',

    reactionTitle: 'Was this useful?',
    reactionNote:  'No sign-in needed. Tap again to undo.',
    reactionError: "Couldn't save that. Please try again in a moment.",
    reactionLoadError: "Couldn't load reactions. Please refresh in a moment.",
    reactionLabels: { like: 'Nice', wantgo: 'Want to go', yummy: 'Looks tasty', wow: 'Did not know', thanks: 'Helpful', fun: 'Fun' },

    skip:      'Skip to content',
    menuOpen:  'Open menu',
    menuClose: 'Close menu',
    langLabel: 'Choose language',

    footerAbout:   'About',
    footerContact: 'Contact',
    footerPrivacy: 'Privacy policy',

    notFoundTitle: 'This page took a wrong turn',
    notFoundDesc:  "That page doesn't exist, or its address changed.",
    backHome:      'Back to home',
    savedNav:      'Saved',
    savedTitle:    'Saved places',
    savedDesc:     'Keep a list of the places you want to visit. It is stored on this device only — no account needed.',
    savedEmpty:    'Nothing saved yet. Tap ☆ Save on any post and it will show up here.',
    savedClear:    'Clear all',
    savedClearAsk: 'Remove everything from your saved list?',
    saveAdd:       'Save',
    saveDone:      'Saved',
    savedCountTpl: '{n} saved',
    savedSeeAll:   'See all',
    savedRemove:   'Remove from list'
  },

  ja: {
    tagline:     'どこへ行きますか？',
    description: '韓国人が実際に足を運んでまとめています。ルート、予算、交通、混む時間帯まで、行く前に知っておきたいことを中心に。',
    siteDesc:    '地域別にまとめた韓国の観光地とグルメ情報。',

    nav:       { regions: '地域', travel: '観光地', food: 'グルメ', about: 'このサイト', contact: 'お問い合わせ' },
    category:  { travel: '観光地', food: 'グルメ' },
    categoryTitle: { travel: '観光地', food: 'グルメ' },
    categoryDesc:  {
      travel: 'どこへ行くかより、どう回るかが難しい。ルートと所要時間を中心にまとめました。',
      food:   '並ぶ前に知っておきたい価格帯、注文方法、待ち時間をまとめています。'
    },

    findByRegion: '地域から探す',
    regionCount:  n => `全${n}地域`,
    latest:       '最新の記事',
    more:         'すべて見る',
    all:          'すべて',
    comingSoon:   '準備中',
    empty:        'まだ記事がありません。順次追加します。',
    noResult:     '該当する記事がありません。別のキーワードでお試しください。',
    searchPlaceholder: '地域やキーワードで検索',

    suggestMsg: 'このページは日本語でもご覧いただけます',
    suggestGo:  '日本語で読む',

    needsCheck: '変動が多いため要確認',
    mapLabel:   '地図',
    openMap:    'Google マップで開く',

    published:  '公開',
    visited:    v => `訪問時期 ${v}`,
    related:    'あわせて読みたい',

    reactionTitle: 'この記事はいかがでしたか？',
    reactionNote:  'ログイン不要です。もう一度押すと取り消せます。',
    reactionError: '保存できませんでした。しばらくしてからお試しください。',
    reactionLoadError: 'リアクションを読み込めませんでした。再読み込みしてください。',
    reactionLabels: { like: 'いいね', wantgo: '行きたい', yummy: 'おいしそう', wow: '知らなかった', thanks: '役に立った', fun: '楽しい' },

    skip:      '本文へskip',
    menuOpen:  'メニューを開く',
    menuClose: 'メニューを閉じる',
    langLabel: '言語を選択',

    footerAbout:   'このサイトについて',
    footerContact: 'お問い合わせ',
    footerPrivacy: 'プライバシーポリシー',

    notFoundTitle: 'ページが見つかりません',
    notFoundDesc:  'お探しのページは存在しないか、アドレスが変更されました。',
    backHome:      'ホームへ戻る',
    savedNav:      '保存した場所',
    savedTitle:    '保存した場所',
    savedDesc:     '行きたい場所を保存しておけます。この端末にのみ保存され、ログインは不要です。',
    savedEmpty:    'まだ保存がありません。記事の ☆保存 を押すとここに集まります。',
    savedClear:    'すべて削除',
    savedClearAsk: '保存した場所をすべて削除しますか？',
    saveAdd:       '保存',
    saveDone:      '保存済み',
    savedCountTpl: '保存 {n}件',
    savedSeeAll:   'すべて見る',
    savedRemove:   'リストから削除'
  },

  zh: {
    tagline:     '想去哪里？',
    description: '由韩国本地人亲自走过后整理。路线、预算、交通、避开人潮的时间，都是出发前值得知道的事。',
    siteDesc:    '按地区整理的韩国景点与美食指南。',

    nav:       { regions: '地区', travel: '景点', food: '美食', about: '关于', contact: '联系' },
    category:  { travel: '景点', food: '美食' },
    categoryTitle: { travel: '景点', food: '美食' },
    categoryDesc:  {
      travel: '去哪里不难，难的是怎么走。这里以路线和实际所需时间为主。',
      food:   '排队之前该知道的价格、点单方式和等候时间。'
    },

    findByRegion: '按地区浏览',
    regionCount:  n => `共 ${n} 个地区`,
    latest:       '最新文章',
    more:         '查看全部',
    all:          '全部',
    comingSoon:   '筹备中',
    empty:        '这个地区还没有文章，正在陆续补充。',
    noResult:     '没有找到匹配的文章，换个关键词试试。',
    searchPlaceholder: '搜索地区或关键词',

    suggestMsg: '本页也有简体中文版',
    suggestGo:  '查看简体中文',

    needsCheck: '变动频繁，请再确认',
    mapLabel:   '地图',
    openMap:    '在谷歌地图中打开',

    published:  '发布',
    visited:    v => `到访时间 ${v}`,
    related:    '延伸阅读',

    reactionTitle: '这篇有帮助吗？',
    reactionNote:  '无需登录。再点一次可取消。',
    reactionError: '保存失败，请稍后再试。',
    reactionLoadError: '无法加载反应数，请稍后刷新。',
    reactionLabels: { like: '赞', wantgo: '想去', yummy: '看着好吃', wow: '涨知识', thanks: '有帮助', fun: '有趣' },

    skip:      '跳到正文',
    menuOpen:  '打开菜单',
    menuClose: '关闭菜单',
    langLabel: '选择语言',

    footerAbout:   '关于本站',
    footerContact: '联系我们',
    footerPrivacy: '隐私政策',

    notFoundTitle: '没有找到这个页面',
    notFoundDesc:  '页面不存在，或者地址已经变了。',
    backHome:      '返回首页',
    savedNav:      '收藏',
    savedTitle:    '收藏的地方',
    savedDesc:     '把想去的地方存起来。只保存在这台设备上，不需要登录。',
    savedEmpty:    '还没有收藏。在文章里点 ☆收藏，就会出现在这里。',
    savedClear:    '全部清除',
    savedClearAsk: '要清除所有收藏吗？',
    saveAdd:       '收藏',
    saveDone:      '已收藏',
    savedCountTpl: '收藏 {n} 个',
    savedSeeAll:   '查看全部',
    savedRemove:   '从列表中移除'
  }
};
