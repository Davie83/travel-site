# Korea Trips — 운영 안내서

Markdown 파일로 글을 쓰면 Netlify가 다국어 정적 사이트를 만들어 배포합니다.

| 역할 | 담당 |
|---|---|
| 글 | `content/posts/<언어>/*.md` |
| 사이트 생성·배포 | Netlify (자동) |
| 이모지 리액션 | Supabase |
| 광고 | Google AdSense |

- 사이트: https://koreatrips.netlify.app
- 저장소: GitHub `Davie83/travel-site` (Private)
- ⚠️ **저장소 안에서 파일이 `travel-site/` 폴더 한 겹 아래에 있습니다.** Netlify의 Base directory가 `travel-site`로 잡혀 있습니다. 경로를 찾을 때 이 한 겹을 잊지 마세요.

---

## 폴더 구조

```
travel-site/
├── content/
│   ├── posts/
│   │   ├── ko/   한국어 글      ★ 여기에 .md 추가
│   │   ├── en/   영어 글
│   │   ├── ja/   일본어 글
│   │   └── zh/   중국어 글
│   ├── pages/<언어>/   소개·문의·개인정보처리방침
│   └── i18n.js         버튼·제목 등 고정 문구 사전
├── site.config.js      ★ 주소·언어·지역·키 설정
├── templates/          페이지 뼈대 6개
├── static/
│   └── assets/         style.css · filter.js · reactions.js · img/
├── supabase/schema.sql
├── build.js            Markdown → HTML 변환기 (열어볼 일 없음)
├── netlify.toml
└── dist/               빌드 결과 (자동 생성. 직접 만들지 않음)
```

---

## 주소 규칙

| 언어 | 주소 |
|---|---|
| 한국어 | `/` · `/posts/xxx.html` · `/region/seoul.html` |
| 영어 | `/en/` · `/en/posts/xxx.html` · `/en/region/seoul.html` |
| 일본어 | `/ja/...` |
| 중국어 | `/zh/...` |

한국어만 접두어가 없습니다. 기존 주소를 그대로 유지하기 위해서입니다.

---

# 글 하나 추가하기

## 1) Claude에게 요청

> 구글 지도 링크 + 내 후기를 주고 "이걸로 md 만들어줘"

Claude가 지도에서 주소·영업시간을 확인하고 언어별 `.md`를 만들어 줍니다.

## 2) GitHub에 올리기

`travel-site` → `content` → `posts` → **해당 언어 폴더** → Add file → Upload files → Commit

## 3) 끝

1~2분 뒤 자동 반영됩니다. 목록·지역 페이지·검색·sitemap·hreflang은 전부 자동입니다.

---

## 프론트매터 (파일 맨 위)

```markdown
---
title: 명동 신동궁 뼈숯불구이 — 24시간 영업
cat: food                   # places(여행지) 또는 food(맛집)
region: seoul               # 아래 8개 중 하나
date: 2026-08-17            # YYYY-MM-DD, 정렬 기준
visited: 2026년 8월          # (선택) 방문 시점
emoji: 🍖                    # 사진 없을 때 썸네일
thumb: assets/img/xxx.jpg   # (선택) 사진 경로
excerpt: 목록에 보일 두 줄 요약.
tags: [명동, 뼈구이, 24시간]
info:                       # (선택) 글 상단 정보표
  - 주소|서울 중구 명동9길 43
  - 영업시간|24시간
draft: true                 # (선택) 넣으면 발행되지 않음
---
```

| 항목 | 필수 |
|---|---|
| `title` `cat` `region` `date` `excerpt` | ✅ 하나라도 빠지면 그 글은 건너뜁니다 |
| 나머지 | 선택 |

### region 값 (8개)

```
seoul  gyeonggi  gangwon  chungcheong  jeolla  gyeongsang  busan  jeju
```

`서울` `부산` 같은 예전 한글 표기를 써도 `site.config.js`의 `regionAliases`가 자동 변환합니다.

### 파일명 규칙

**영문 소문자·숫자·하이픈만, 80자 이내.** 한글·공백·대문자는 안 됩니다.
어기면 배포는 되지만 **리액션이 저장되지 않습니다.** (Supabase 제약과 동일한 규칙)

**같은 글의 다른 언어판은 파일명이 같아야 합니다.** 그래야 언어 전환 버튼이 연결됩니다.

```
content/posts/ko/seoul-myeongdong-shindonggung.md
content/posts/en/seoul-myeongdong-shindonggung.md   ← 같은 이름
```

---

## 본문 문법

| 쓰는 법 | 결과 |
|---|---|
| `## 소제목` | 큰 소제목 (지역색 막대) |
| `**굵게**` `*기울임*` | 강조 |
| `- 항목` / `1. 항목` | 목록 |
| `> 내용` | 강조 박스 |
| `[글자](주소)` | 링크 (외부는 새 탭) |
| `![설명](assets/img/a.jpg)` | 사진 |
| `\|A\|B\|` + `\|---\|---\|` | 표 |

사진은 `static/assets/img/`에 올리고 `assets/img/파일명.jpg`로 씁니다.

---

# 언어 추가하기 (일본어·중국어)

지금 `ja`·`zh`는 **엔진만 준비되고 꺼져 있습니다.**

1. `content/posts/ja/`, `content/pages/ja/`에 번역 `.md`를 넣습니다
   (`about` `contact` `privacy` 3개는 **반드시** 있어야 합니다. 없으면 푸터가 404)
2. `site.config.js`에서 해당 언어를 `enabled: true`로 변경
3. Commit → 자동 배포

---

# 설정 바꾸기 (`site.config.js`)

| 항목 | 설명 |
|---|---|
| `url` | 사이트 주소. canonical·sitemap·hreflang에 쓰임 |
| `email` | 문의용 이메일 |
| `locales` | 언어 목록. `enabled`로 켜고 끔 |
| `regions` | 지역 8개. `color`/`colorDark`가 그 지역의 색 |
| `supabase` | `sb_publishable_`로 시작하는 키만 사용 |
| `adsensePublisherId` | 승인 후 입력하면 광고·`ads.txt` 자동 생성 |
| `showAdPlaceholders` | 광고 자리 점선 미리보기 (평소 `false`) |
| `demoPosts` | 여기 적힌 글은 항상 목록 맨 뒤 |

⚠️ **이 파일은 Claude가 만든 버전으로 덮어쓰지 마세요.** 주소·이메일·Supabase 키가 들어 있습니다. GitHub에서 필요한 줄만 고치세요.

---

# 되돌리기

| 상황 | 방법 |
|---|---|
| 배포를 되돌리고 싶다 | Netlify → Deploys → 이전 배포 → **Publish deploy** |
| 파일 수정을 되돌리고 싶다 | GitHub → 파일 → History → 이전 버전 → Revert |
| 글 하나만 내리고 싶다 | `.md` 맨 위에 `draft: true` 추가 |

---

# 문제가 생겼을 때

**Netlify → Deploys → 최신 배포 → 로그 맨 아래**를 보세요. 빌드가 성공하면 이렇게 나옵니다.

```
✅ 빌드 완료
   [ko] 글 7개 (실제 1 · 예시 6) · 문서 3개
   [en] 글 1개 (실제 1 · 예시 0) · 문서 3개
   지역 8개 · 주소 40개
```

빠진 파일이 있으면 아래에 이유가 찍힙니다.

```
⚠ 건너뛴 파일
   · en/xxx.md — 빠진 항목: excerpt
   · ko/한글파일.md — 파일명은 영문 소문자·숫자·하이픈만
```

| 증상 | 원인 |
|---|---|
| 글이 안 보임 | `draft: true`가 남아 있거나 필수 항목 누락 — 로그 확인 |
| 언어 전환 버튼이 안 보임 | 그 언어에 같은 파일명의 글이 없음 |
| 푸터 링크가 404 | `content/pages/<언어>/`에 3개 문서가 없음 |
| 리액션이 안 눌림 | Supabase 키가 구형(`eyJ...`)이거나 `schema.sql` 미실행 |
| 디자인이 깨짐 | `static/assets/style.css` 업로드 누락 |

---

# 애드센스

1. 실제 글 **15~20개** 확보 (지금 실제 글은 1개)
2. [adsense.google.com](https://adsense.google.com) 신청
3. 승인 후 `site.config.js`의 `adsensePublisherId` 입력 → 광고·`ads.txt` 자동 생성

승인 전까지 광고 자리는 **아예 표시되지 않습니다.** 정상입니다.

**주의**
- 예시글 6개는 실제 확인한 정보가 아닙니다. 신청 전에 교체하거나 삭제하세요.
- 사진은 직접 찍은 것만 사용하세요.
- 영어권 트래픽은 광고 단가가 높은 편이라, 영어 글을 늘리는 것이 수익에 유리합니다.
