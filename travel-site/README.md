# 여행한입 — 여행/맛집 소개 사이트

Markdown 파일로 글을 쓰면 Netlify가 자동으로 HTML 사이트를 만들어 배포합니다.
방문자는 로그인 없이 각 글에 이모지 반응을 남길 수 있습니다.

| 역할 | 담당 |
|---|---|
| 글 내용 | `content/posts/` 의 `.md` 파일 |
| 사이트 생성·배포 | Netlify (무료) |
| 이모지 리액션 저장 | Supabase (무료) |
| 광고 | Google AdSense |

**글을 쓸 수 있는 사람은 운영자 한 명뿐입니다.** 별도의 관리자 로그인 기능이 없기 때문에
비밀번호가 유출될 일도, 관리자 페이지가 뚫릴 일도 없습니다.
GitHub 저장소에 파일을 올릴 수 있는 사람 = 마스터 입니다.

---

## 전체 흐름

```
   [내 PC]                    [GitHub]              [Netlify]
Claude가 .md 작성  ──올림──▶  파일 보관  ──자동──▶  HTML 생성 후 공개
                                                        │
                                              방문자가 이모지 클릭
                                                        ▼
                                                   [Supabase]
                                                   반응 저장
```

---

## 폴더 구조

```
travel-site/
├── content/
│   ├── posts/          ★ 글. 여기에 .md 파일을 넣으면 끝
│   │   ├── seoul-ikseondong.md
│   │   └── ...
│   └── pages/          소개 / 문의 / 개인정보처리방침
├── site.config.js      ★ 사이트 이름, 주소, 키, 이모지 설정
├── templates/          페이지 뼈대 (디자인 구조를 바꿀 때만)
├── static/assets/      style.css(디자인) · filter.js · reactions.js
├── supabase/schema.sql Supabase에 한 번 붙여넣을 SQL
├── build.js            Markdown → HTML 변환기 (열어볼 일 없음)
├── netlify.toml        Netlify 설정
└── dist/               빌드 결과 (자동 생성. 직접 만들지 않습니다)
```

---

# 처음 한 번만 하는 설정

아래 5단계를 순서대로 하면 됩니다. 전부 무료이고, 카드 등록도 필요 없습니다.
**약 40분** 걸립니다.

---

## STEP 1 — GitHub에 파일 올리기 (약 15분)

GitHub는 파일을 보관하는 창고입니다. Netlify가 여기를 보고 사이트를 만듭니다.

### 1-1. 계정 만들기

1. [github.com](https://github.com) 접속 → 우측 상단 **Sign up**
2. 이메일 / 비밀번호 / 아이디(영문) 입력
3. 메일로 온 인증 코드 입력하면 완료

### 1-2. 저장소(Repository) 만들기

1. 로그인 후 우측 상단 **+** → **New repository**
2. 아래처럼 입력합니다

   | 항목 | 값 |
   |---|---|
   | Repository name | `travel-site` (영문 소문자) |
   | 공개 범위 | **Private** 선택 (비공개여도 Netlify 배포는 됩니다) |
   | Add a README file | 체크 **해제** |

3. **Create repository** 클릭

### 1-3. 파일 올리기

1. 만들어진 화면에서 **uploading an existing file** 링크 클릭
   (안 보이면 **Add file** → **Upload files**)
2. 탐색기에서 `C:\Users\USER\Documents\add\travel-site` 폴더를 엽니다
3. ⚠️ **폴더 자체가 아니라 폴더 "안의 내용물" 을 전부 선택**해서 끌어다 놓습니다
   - `Ctrl + A` 로 전체 선택 후 드래그하면 됩니다
   - `travel-site` 폴더째로 올리면 경로가 한 겹 깊어져서 빌드가 실패합니다
4. 아래 **Commit changes** 버튼 클릭

> `.gitignore` 파일이 숨김 처리돼 안 보일 수 있습니다.
> 탐색기 상단 **보기 → 숨긴 항목** 을 체크하면 나타납니다. 없어도 배포는 됩니다.

---

## STEP 2 — Netlify 연결 (약 10분)

1. [netlify.com](https://netlify.com) 접속 → **Sign up** → **Sign up with GitHub** 선택
   (GitHub 계정으로 바로 가입됩니다)
2. 로그인 후 **Add new site** → **Import an existing project**
3. **Deploy with GitHub** 클릭 → 권한 허용
4. 저장소 목록에서 **travel-site** 선택
5. 빌드 설정 화면이 나옵니다. `netlify.toml` 이 있으므로 **아래 값이 자동으로 채워져 있습니다.**
   비어 있다면 직접 입력하세요.

   | 항목 | 값 |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

6. **Deploy** 클릭 → 1~2분 후 `무작위이름.netlify.app` 주소가 생깁니다

### 주소 바꾸기 (선택)

**Site configuration → Change site name** 에서 원하는 이름으로 바꿀 수 있습니다.
예: `yeohaeng-hanip.netlify.app`

---

## STEP 3 — 사이트 주소를 설정에 반영

주소가 정해졌으니 알려줘야 합니다. (검색엔진 등록과 공유 미리보기에 쓰입니다)

1. GitHub 저장소에서 `site.config.js` 클릭
2. 오른쪽 위 **연필 아이콘(Edit)** 클릭
3. `url:` 값을 실제 주소로 변경 — **끝에 `/` 를 붙이지 마세요**

   ```js
   url: 'https://yeohaeng-hanip.netlify.app',
   ```

4. 같은 파일에서 이메일도 함께 수정

   ```js
   email: '실제이메일@example.com',
   ```

5. 아래 **Commit changes** 클릭 → Netlify가 자동으로 다시 배포합니다

---

## STEP 4 — Supabase 연결 (이모지 리액션, 약 15분)

이 단계를 건너뛰어도 사이트는 정상 동작합니다. **리액션 버튼만 표시되지 않습니다.**

### 4-1. 프로젝트 만들기

1. [supabase.com](https://supabase.com) → **Start your project** → GitHub 계정으로 로그인
2. **New project** 클릭

   | 항목 | 값 |
   |---|---|
   | Name | `travel-site` |
   | Database Password | 아무 값이나 (**따로 적어두세요**) |
   | Region | **Northeast Asia (Seoul)** — 한국 방문자에게 가장 빠름 |

3. **Create new project** → 준비되는 데 1~2분 걸립니다

### 4-2. 테이블 만들기

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 이 폴더의 `supabase/schema.sql` 파일을 메모장으로 열어 **전체 복사**
3. 붙여넣고 오른쪽 아래 **Run** 클릭
4. `Success. No rows returned` 가 나오면 성공입니다

### 4-3. 키 복사해서 넣기

1. 왼쪽 메뉴 맨 아래 **Project Settings** → **API** (또는 **Data API**)
2. 두 값을 복사합니다

   | 항목 | 설명 |
   |---|---|
   | **Project URL** | `https://xxxxx.supabase.co` |
   | **anon / public** key | `eyJ...` 로 시작하는 긴 문자열 |

3. GitHub에서 `site.config.js` 를 편집해 붙여넣습니다

   ```js
   supabase: {
     url:     'https://xxxxx.supabase.co',
     anonKey: 'eyJhbGciOi...'
   },
   ```

4. **Commit changes** → 자동 배포 → 글 아래에 이모지 버튼이 나타납니다

> ⚠️ **`service_role` key 는 절대 넣지 마세요.**
> `anon` key 는 브라우저에 공개되도록 설계된 키라서 노출돼도 안전합니다.
> `service_role` 은 모든 데이터를 마음대로 지울 수 있는 키입니다.

---

## STEP 5 — 검색엔진 등록

1. [구글 서치콘솔](https://search.google.com/search-console) 접속
2. **URL 접두어** 에 사이트 주소 입력
3. 소유권 확인: **HTML 태그** 방식 선택 → 나오는 `<meta ...>` 한 줄 복사
4. `templates/base.html` 을 GitHub에서 편집 → `</head>` 바로 위에 붙여넣기 → Commit
5. 배포된 후 서치콘솔에서 **확인** 클릭
6. 왼쪽 메뉴 **Sitemaps** → `sitemap.xml` 입력 후 제출

---

# 평소 작업 — 글 하나 추가하기

## 방법 (2단계로 끝납니다)

### 1) Claude에게 글을 만들어 달라고 합니다

이렇게 요청하면 됩니다.

> 여기 재료 있어. 이걸로 `content/posts/` 에 들어갈 md 파일 하나 만들어줘.
> 파일명은 `busan-gamcheon.md`

Claude가 프론트매터(맨 위 설정)까지 채워서 파일을 만들어 줍니다.

### 2) GitHub에 올립니다

1. GitHub 저장소 → `content` → `posts` 폴더 클릭
2. **Add file** → **Upload files**
3. 만들어진 `.md` 파일을 끌어다 놓고 **Commit changes**
4. 1~2분 뒤 사이트에 자동 반영됩니다

**목록 페이지, 지역 필터, sitemap.xml, 관련 글은 전부 자동으로 갱신됩니다.**
따로 손댈 곳이 없습니다.

---

## .md 파일 맨 위 설정 (프론트매터)

```markdown
---
title: 감천문화마을 사진 찍기 좋은 골목
cat: travel                 # travel 또는 food
region: 부산                 # 지역 필터 버튼이 자동 생성됨
date: 2026-08-20            # 최신순 정렬 기준
visited: 2026년 8월          # (선택) 방문 시점 표기
emoji: 🎨                    # 사진 없을 때 썸네일
thumb:                      # (선택) 'assets/img/파일명.jpg'
excerpt: 목록에 보일 두 줄 요약입니다.
tags: [부산, 감천, 사진]
info:                       # (선택) 글 상단 정보 요약표
  - 위치|부산 사하구 감내2로 203
  - 주차|마을 입구 공영주차장
  - 예상 비용|1인 5,000원
draft: true                 # (선택) 넣으면 발행되지 않습니다
---

여기부터 본문입니다.
```

| 항목 | 필수 | 설명 |
|---|---|---|
| `title` `cat` `region` `date` `excerpt` | ✅ | 하나라도 빠지면 그 글은 건너뜁니다 |
| `visited` `emoji` `thumb` `tags` `info` | | 없어도 됩니다 |
| `draft: true` | | 아직 공개하고 싶지 않을 때 |

### 파일명 규칙

- 영문 소문자, 숫자, 하이픈(`-`)만 사용 — 예: `busan-gamcheon.md`
- **한글·공백·대문자는 사용하지 마세요.** 주소가 깨지고 리액션이 저장되지 않습니다.

---

## 본문에 쓸 수 있는 문법

| 쓰는 법 | 결과 |
|---|---|
| `## 소제목` | 큰 소제목 (왼쪽에 색 막대) |
| `### 작은제목` | 작은 소제목 |
| `**굵게**` | **굵게** |
| `*기울임*` | *기울임* |
| `- 항목` | 글머리 목록 |
| `1. 항목` | 번호 목록 |
| `> 내용` | 강조 박스 (연한 배경) |
| `[글자](주소)` | 링크 (외부 링크는 새 탭) |
| `![설명](assets/img/a.jpg)` | 사진 |
| `\|A\|B\|` + `\|---\|---\|` | 표 |
| `---` | 가로 구분선 |

사진을 쓰려면 `static/assets/img/` 폴더에 올리고 `assets/img/파일명.jpg` 로 씁니다.

---

# 애드센스 붙이기

1. 글을 **15~20개 이상** 채웁니다 (가장 중요합니다. 6개로는 대부분 반려됩니다)
2. [adsense.google.com](https://adsense.google.com) 에서 신청
3. 승인되면 발급받은 게시자 ID를 `site.config.js` 에 입력

   ```js
   adsensePublisherId: 'ca-pub-1234567890123456',
   ```

4. Commit → 자동 배포
   - 모든 페이지 `<head>` 에 애드센스 코드가 자동 삽입됩니다
   - `ads.txt` 파일도 자동으로 만들어집니다

광고가 들어갈 자리는 이미 잡혀 있습니다 (`.ad-slot`).
승인 전에는 점선 박스로 보이는 것이 정상입니다.

### 승인에서 자주 걸리는 것

- **콘텐츠 부족** — 글 하나당 1,000자 이상, 15개 이상 권장
- **복사 콘텐츠** — 다른 블로그에서 가져온 글은 즉시 반려
- **사진 저작권** — 직접 찍은 사진만 쓰세요
- **필수 페이지 없음** — 소개 / 문의 / 개인정보처리방침 (이미 포함되어 있습니다)

---

# 되돌리기 (롤백)

## 배포를 되돌리려면 — 버튼 하나

1. Netlify → **Deploys** 탭
2. 되돌리고 싶은 이전 배포 클릭
3. **Publish deploy** 클릭 → 즉시 그 버전으로 돌아갑니다

## 파일 수정을 되돌리려면

GitHub에서 파일 → **History** → 이전 버전 → 우측 **⋯** → **Revert**

## 글 하나만 내리려면

해당 `.md` 파일 맨 위에 `draft: true` 를 추가하고 Commit 하면 사이트에서 사라집니다.
(파일은 남아 있으므로 나중에 다시 올릴 수 있습니다)

---

# 문제가 생겼을 때

| 증상 | 원인과 해결 |
|---|---|
| 배포는 됐는데 글이 안 보임 | 프론트매터 필수 항목 누락. Netlify → **Deploys** → 로그에 `빠진 항목:` 메시지 확인 |
| Netlify 빌드 실패 (빨간색) | 로그를 열어 마지막 줄 확인. 대개 `.md` 파일의 `---` 세 개가 빠졌거나 위치가 잘못된 경우 |
| 페이지는 뜨는데 디자인이 깨짐 | `static/assets/style.css` 가 안 올라갔는지 확인 |
| 이모지 버튼이 아예 안 보임 | `site.config.js` 의 supabase url/anonKey 가 비어 있음 |
| 이모지 숫자가 안 올라감 | Supabase에서 `schema.sql` 을 실행하지 않았거나, 프로젝트가 일시정지됨 (아래 참고) |
| 공유 미리보기가 안 나옴 | `site.config.js` 의 `url` 이 실제 주소와 다름 |

### Supabase 무료 플랜 주의

무료 프로젝트는 **1주일 동안 아무 접속이 없으면 일시정지**됩니다.
정지되면 리액션 저장이 실패하고 안내 문구가 뜹니다 (글 읽기는 정상).
Supabase 대시보드에서 **Restore** 버튼 한 번이면 복구됩니다.
방문자가 꾸준히 있으면 정지되지 않습니다.

### 무료 사용량

| 서비스 | 무료 범위 | 개인 사이트 기준 |
|---|---|---|
| Netlify | 월 100GB 전송 / 300분 빌드 | 월 수만 방문까지 충분 |
| Supabase | 500MB DB | 리액션 수백만 건까지 충분 |

---

# 디자인 바꾸기

`static/assets/style.css` 맨 위 3줄만 바꾸면 사이트 전체 톤이 바뀝니다.

```css
--brand:      #0f766e;   /* 메인 색 */
--brand-soft: #ccfbf1;   /* 메인 연한 배경 */
--accent:     #ea580c;   /* 포인트 색 */
```

다크모드는 방문자 OS 설정에 따라 자동 적용됩니다.

## 이모지 종류 바꾸기

`site.config.js` 의 `reactions` 배열을 수정합니다.

```js
{ key: 'like', emoji: '👍', label: '좋아요' },
```

⚠️ `key` 를 추가하거나 바꾸면 **`supabase/schema.sql` 의 허용 목록 2곳도 함께 고쳐야 합니다.**
(`reactions_key_allowed` 제약조건과 `toggle_reaction` 함수 안)
수정한 SQL을 Supabase SQL Editor에서 다시 실행하세요.
`emoji` 와 `label` 만 바꾸는 것은 SQL 수정 없이 가능합니다.

---

# 알아두면 좋은 것

**이모지 리액션 숫자는 정확한 통계가 아닙니다.**
로그인을 요구하지 않기 때문에, 마음먹고 조작하려는 사람은 브라우저 데이터를 지우고
계속 누를 수 있습니다. 어떤 글이 반응이 좋은지 가늠하는 참고 지표로만 쓰세요.
정확한 방문 통계가 필요하면 구글 애널리틱스를 붙이는 편이 낫습니다.

**샘플 글 6개는 구조를 보여주기 위한 초안입니다.**
가격·영업시간·교통편은 실제로 확인한 값이 아니므로, 직접 다녀온 내용으로 교체하세요.
