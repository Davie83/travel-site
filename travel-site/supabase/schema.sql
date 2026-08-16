-- ============================================================================
--  이모지 리액션 - Supabase 데이터베이스 설정
-- ----------------------------------------------------------------------------
--  사용법
--    1) Supabase 대시보드 접속
--    2) 왼쪽 메뉴 > SQL Editor > New query
--    3) 이 파일 전체를 복사해서 붙여넣고 [Run] 클릭
--    4) "Success. No rows returned" 가 나오면 성공입니다
--
--  여러 번 실행해도 안전합니다 (이미 있으면 건너뜁니다).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. 리액션 저장 테이블
-- ----------------------------------------------------------------------------
create table if not exists public.reactions (
  id           bigint generated always as identity primary key,
  post_slug    text        not null,   -- 글 파일명 (예: seoul-ikseondong)
  reaction_key text        not null,   -- 이모지 종류 (like, wantgo, ...)
  visitor_id   uuid        not null,   -- 방문자 브라우저에 저장된 임의 식별자
  created_at   timestamptz not null default now(),

  -- 같은 사람이 같은 글에 같은 이모지를 두 번 누를 수 없게 막습니다
  constraint reactions_once_per_visitor unique (post_slug, reaction_key, visitor_id)
);

-- 글 하나당 조회가 빨라지도록
create index if not exists reactions_post_slug_idx on public.reactions (post_slug);
-- 도배 차단 검사용
create index if not exists reactions_visitor_time_idx on public.reactions (visitor_id, created_at);


-- ----------------------------------------------------------------------------
-- 2. 허용값 제한 (쓰레기 데이터가 쌓이지 않도록)
--    ★ site.config.js 의 reactions 목록을 바꾸면 아래 목록도 함께 고쳐야 합니다
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reactions_key_allowed') then
    alter table public.reactions add constraint reactions_key_allowed
      check (reaction_key in ('like','wantgo','yummy','wow','thanks','fun'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'reactions_slug_format') then
    alter table public.reactions add constraint reactions_slug_format
      check (post_slug ~ '^[a-z0-9][a-z0-9-]{0,79}$');
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 3. 보안 — 테이블 직접 접근을 전면 차단합니다
--    방문자는 아래 4번의 함수 두 개로만 접근할 수 있습니다.
--    (테이블을 직접 열어줬다면 누구나 visitor_id 를 긁어가거나
--     남의 리액션을 지울 수 있습니다)
-- ----------------------------------------------------------------------------
alter table public.reactions enable row level security;
-- 정책(policy)을 하나도 만들지 않았으므로 anon 은 select/insert/delete 전부 불가입니다.

revoke all on table public.reactions from anon, authenticated;


-- ----------------------------------------------------------------------------
-- 4-1. 글 하나의 리액션 개수 읽기
-- ----------------------------------------------------------------------------
create or replace function public.get_reactions(p_slug text)
returns table (rkey text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select r.reaction_key, count(*)::bigint
  from public.reactions r
  where r.post_slug = p_slug
  group by r.reaction_key;
$$;


-- ----------------------------------------------------------------------------
-- 4-2. 리액션 누르기 / 취소하기 (같은 함수로 토글)
--      누른 적 없으면 추가, 이미 눌렀으면 취소합니다.
--      결과로 그 글의 최신 집계를 돌려줍니다.
-- ----------------------------------------------------------------------------
create or replace function public.toggle_reaction(
  p_slug    text,
  p_key     text,
  p_visitor uuid
)
returns table (rkey text, total bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
  v_recent  int;
begin
  -- 입력값 검사 (테이블 제약과 별개로 한 번 더)
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'invalid slug';
  end if;
  if p_key not in ('like','wantgo','yummy','wow','thanks','fun') then
    raise exception 'invalid reaction key';
  end if;
  if p_visitor is null then
    raise exception 'invalid visitor';
  end if;

  -- 도배 차단: 한 방문자가 1분에 40번 넘게 누르면 거부
  select count(*) into v_recent
  from public.reactions r
  where r.visitor_id = p_visitor
    and r.created_at > now() - interval '1 minute';

  if v_recent > 40 then
    raise exception 'too many requests';
  end if;

  -- 이미 눌렀으면 취소
  delete from public.reactions r
  where r.post_slug = p_slug
    and r.reaction_key = p_key
    and r.visitor_id = p_visitor;

  get diagnostics v_deleted = row_count;

  -- 없었으면 새로 추가
  if v_deleted = 0 then
    insert into public.reactions (post_slug, reaction_key, visitor_id)
    values (p_slug, p_key, p_visitor)
    on conflict do nothing;
  end if;

  -- 최신 집계 반환
  return query
    select r.reaction_key, count(*)::bigint
    from public.reactions r
    where r.post_slug = p_slug
    group by r.reaction_key;
end;
$$;


-- ----------------------------------------------------------------------------
-- 5. 함수 실행 권한만 열어줍니다
-- ----------------------------------------------------------------------------
revoke all on function public.get_reactions(text)              from public;
revoke all on function public.toggle_reaction(text,text,uuid)  from public;

grant execute on function public.get_reactions(text)             to anon, authenticated;
grant execute on function public.toggle_reaction(text,text,uuid) to anon, authenticated;


-- ============================================================================
--  참고 — 이 방식의 한계
--  방문자 식별자는 브라우저에 저장되는 임의의 값이라, 마음먹고 조작하려는
--  사람은 새 식별자를 계속 만들어 숫자를 올릴 수 있습니다.
--  (로그인을 요구하지 않는 모든 '좋아요' 기능의 공통 한계입니다)
--  이 숫자는 참고용 반응 지표로만 쓰시고, 통계로 쓰지 마세요.
--
--  나중에 조작이 실제로 문제가 되면 대응 방법
--    · site.config.js 에서 리액션 기능을 끄거나
--    · Supabase 대시보드에서 특정 기간 데이터를 지우거나
--    · 로그인(구글 계정 등)을 요구하는 방식으로 바꾸면 됩니다.
-- ============================================================================


-- ============================================================================
--  운영에 쓸 만한 조회 쿼리 (SQL Editor 에 붙여넣어 실행)
-- ----------------------------------------------------------------------------
--  글별 반응 총합 순위
--    select post_slug, count(*) as total
--    from reactions group by post_slug order by total desc;
--
--  최근 24시간 반응
--    select post_slug, reaction_key, count(*)
--    from reactions where created_at > now() - interval '24 hours'
--    group by 1,2 order by 3 desc;
--
--  특정 글 리액션 초기화
--    delete from reactions where post_slug = 'seoul-ikseondong';
-- ============================================================================
