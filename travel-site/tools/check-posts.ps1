# ============================================================================
#  글 점검 — 새 글/고친 글이 사이트 규칙을 지키는지 한 번에 확인합니다.
#  ----------------------------------------------------------------------------
#  실행:  powershell -ExecutionPolicy Bypass -File tools\check-posts.ps1
#         powershell -ExecutionPolicy Bypass -File tools\check-posts.ps1 -Slug jeju-aewol-unidam
#
#  ERROR 는 반드시 고쳐야 하는 것, WARN 은 확인해 볼 것입니다. ERROR 가 있으면 종료 코드 1.
#
#  확인하는 것
#    - 4개 언어(ko/en/ja/zh) 파일이 다 있는지, cat/region/area/date/emoji/thumb 이 같은지
#    - 소제목(##) 수·정보표(info) 줄 수·본문 사진이 4개 언어에서 같은지
#    - 마지막 안내 인용문(> ...)에 "기준 시점"이 있는지 (ko 2026.10 기준 / en as of Oct 2026 /
#      ja 2026年10月時点 / zh 截至2026年10月), 날짜 없는 애매한 표기("변동 가능", "please verify" 등)가 없는지
#    - ko tags 중 하나가 site.config.js 의 tagChips 키와 일치하는지 (아래 태그 칩)
#    - 대표 사진과 sm/ 카드 사진, 본문 사진(앞에 / 가 붙은 경로)이 있는지
#    - 맛집: addr/lat/lng/order/orderRoman/spicy/closed/map, 서울이면 subway
#    - 제목에 " — " 가 있는지, 날짜가 미래가 아닌지, 중국어에 간체 전용 글자가 없는지
#  (제목에 동네가 없으면 빌드가 <title> 에 자동으로 붙여 주므로 여기서는 보지 않습니다.)
# ============================================================================
param([string]$Slug = '')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$posts = Join-Path $root 'content\posts'
$img = Join-Path $root 'static\assets\img'
$config = [IO.File]::ReadAllText((Join-Path $root 'site.config.js'),[Text.Encoding]::UTF8)

function Get-FrontMatter($text){ [regex]::Match($text,'(?s)^---\r?\n(.*?)\r?\n---').Groups[1].Value }
function Get-FmField($front,$key){ [regex]::Match($front,"(?m)^$($key): (.*)$").Groups[1].Value.Trim() }

# tagChips 키 목록 (site.config.js 의 tagChips: [ { key: '...' } ] 부분)
$chipStart = $config.IndexOf('tagChips:')
$chipEnd = $config.IndexOf('homePopularSearches', $chipStart)
$chipKeys = @{}
if($chipStart -ge 0){ foreach($m in [regex]::Matches($config.Substring($chipStart, ($(if($chipEnd -gt $chipStart){$chipEnd}else{$config.Length}) - $chipStart)),"key: '([^']+)'")){ $chipKeys[$m.Groups[1].Value]=1 } }
# areas: region slug -> area slugs
$areaOk = @{}
foreach($m in [regex]::Matches($config,"\{ slug: '([a-z0-9-]+)',\s*names:")){ $areaOk[$m.Groups[1].Value]=1 }

$markerPattern = @{
  ko = '\d{4}\.\d{2} 기준'
  en = 'as of [A-Z][a-z]{2,8} \d{4}'
  ja = '\d{4}年\d{1,2}月時点'
  zh = '截至\d{4}年\d{1,2}月'
}
$vague = @{
  ko = @('확인 시점','변동 가능','확인 필요')
  en = @('please verify','as of research','subject to change','as of when I checked')
  ja = @('要確認','確認時点')
  zh = @('資料查詢時點','查詢時點資訊','確認時點資訊','以查詢當下為準')
}
$simplifiedOnly = '这个们说时为从还对给让没会过后来开关门问间长东车见现发处较别该实应经点样业务动员热爱觉听订预约备优惠国际环节选择价产总结验证'.Replace('惠','')

function Get-Marker-Example($code){ switch($code){ 'ko' {'2026.10 기준'} 'en' {'as of Oct 2026'} 'ja' {'2026年10月時点'} 'zh' {'截至2026年10月'} } }
# 본문 분량 — 영어 350단어 이상이 기본 규칙입니다(Oct 2026). 한·일·중은 같은 글이 길게 나오는 비율에 맞춰
# 글자 수(공백 제외)로 봅니다: ko 650자 / ja 750자 / zh 520자 이상.
function Get-BodyText($raw){
  $x = $raw.Replace("`r`n","`n"); $m = [regex]::Match($x,'(?s)^---\n.*?\n---\n(.*)$'); $b = $m.Groups[1].Value
  $b = [regex]::Replace($b,'!\[[^\]]*\]\([^)]*\)',' '); $b = [regex]::Replace($b,'\[([^\]]*)\]\([^)]*\)','$1'); $b = $b -replace '[#>*`|_-]',' '
  return $b
}
$minChars = @{ ko = 650; ja = 750; zh = 520 }
$minEnWords = 350
$issues = New-Object System.Collections.ArrayList
function Add-Issue($level,$slug,$msg){ $null = $issues.Add([pscustomobject]@{ Level=$level; Slug=$slug; Message=$msg }) }

$slugs = if($Slug){ @($Slug) } else { Get-ChildItem (Join-Path $posts 'ko\*.md') | ForEach-Object { $_.BaseName } }
$codes = 'ko','en','ja','zh'
foreach($s in $slugs){
  $docs = @{}; $missing = $false
  foreach($code in $codes){ $p = Join-Path $posts "$code\$s.md"; if(Test-Path $p){ $docs[$code] = [IO.File]::ReadAllText($p,[Text.Encoding]::UTF8) } else { Add-Issue 'ERROR' $s "$code 파일이 없음"; $missing = $true } }
  if($missing){ continue }
  $fm = @{}; foreach($code in $codes){ $fm[$code] = Get-FrontMatter $docs[$code] }
  $cat = Get-FmField $fm['ko'] 'cat'

  # 공통 frontmatter 일치
  foreach($key in 'cat','region','area','date','emoji','thumb'){
    $kv = Get-FmField $fm['ko'] $key
    if(-not $kv){ Add-Issue 'ERROR' $s "ko 에 $key 가 없음" }
    foreach($code in 'en','ja','zh'){ if((Get-FmField $fm[$code] $key) -ne $kv){ Add-Issue 'ERROR' $s "$code 의 $key 가 ko 와 다름 ($((Get-FmField $fm[$code] $key)) ≠ $kv)" } }
  }
  # 구조 일치
  $h2 = @{}; $info = @{}; $imgs = @{}
  foreach($code in $codes){
    $h2[$code] = ([regex]::Matches($docs[$code],'(?m)^## ')).Count
    $info[$code] = ([regex]::Matches($fm[$code],'(?m)^  - ')).Count
    $imgs[$code] = (([regex]::Matches($docs[$code],'!\[[^\]]*\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value }) -join ',')
  }
  foreach($code in 'en','ja','zh'){
    if($h2[$code] -ne $h2['ko']){ Add-Issue 'ERROR' $s "소제목(##) 수 불일치: ko=$($h2['ko']) $code=$($h2[$code])" }
    if($info[$code] -ne $info['ko']){ Add-Issue 'ERROR' $s "정보표(info) 줄 수 불일치: ko=$($info['ko']) $code=$($info[$code])" }
    if($imgs[$code] -ne $imgs['ko']){ Add-Issue 'ERROR' $s "본문 사진 목록 불일치 ($code)" }
  }
  if($info['ko'] -eq 0){ Add-Issue 'WARN' $s '정보표(info)가 없음' }
  # 제목
  foreach($code in $codes){ $title = Get-FmField $fm[$code] 'title'; if($title -notmatch '\s*[—–]\s+'){ Add-Issue 'WARN' $s "$code 제목에 ' — ' 구분이 없음 (카드 부제가 안 나눠짐)" } }
  # 날짜
  $d = Get-FmField $fm['ko'] 'date'; try { if([datetime]$d -gt (Get-Date)){ Add-Issue 'ERROR' $s "날짜가 미래: $d" } } catch { Add-Issue 'ERROR' $s "날짜 형식 오류: $d" }
  # 마지막 인용문과 기준 시점
  foreach($code in $codes){
    $lines = $docs[$code].TrimEnd() -split "`r?`n"
    $last = $lines[-1]
    if(-not $last.StartsWith('> ')){ Add-Issue 'ERROR' $s "$code 마지막 줄이 안내 인용문(> ...)이 아님"; continue }
    if($last -notmatch $markerPattern[$code]){ Add-Issue 'ERROR' $s "$code 마지막 인용문에 기준 시점이 없음 (예: $(Get-Marker-Example $code))" }
    foreach($v in $vague[$code]){ if($docs[$code].Contains($v)){ Add-Issue 'WARN' $s "$code 에 날짜 없는 애매한 표기 '$v'" } }
  }
  # 본문 분량
  $enWords = (((Get-BodyText $docs['en']) -split '\s+') | Where-Object { $_ -match '\w' }).Count
  if($enWords -lt $minEnWords){ Add-Issue 'ERROR' $s "en 본문이 짧음: $enWords 단어 (최소 $minEnWords)" }
  foreach($code in 'ko','ja','zh'){ $n = ((Get-BodyText $docs[$code]) -replace '\s','').Length; if($n -lt $minChars[$code]){ Add-Issue 'ERROR' $s "$code 본문이 짧음: $n 자 (최소 $($minChars[$code]))" } }
  # 소제목에 섞인 영어 단어(번역 누락) 의심
  foreach($code in 'ko','ja','zh'){ foreach($hl in ([regex]::Matches($docs[$code],'(?m)^## .*$') | ForEach-Object { $_.Value })){ if($hl -match '\b(check|before you go|tips?)\b'){ Add-Issue 'WARN' $s "$code 소제목에 영어 단어: $hl" } } }
  # 중국어 간체
  $hit = @(); foreach($c in $simplifiedOnly.ToCharArray()){ if($docs['zh'].Contains([string]$c)){ $hit += $c } }; if($hit.Count){ Add-Issue 'WARN' $s "zh 에 간체 전용 글자 의심: $($hit -join '')" }
  # 태그 칩
  $tags = ([regex]::Match($fm['ko'],'(?m)^tags: \[(.*)\]').Groups[1].Value -split ',') | ForEach-Object { $_.Trim() }
  if(-not ($tags | Where-Object { $chipKeys.ContainsKey($_) })){ Add-Issue 'ERROR' $s '태그 칩(tagChips) 키와 일치하는 ko 태그가 없음 → 하단 칩이 안 나옴' }
  # 사진
  $thumb = Get-FmField $fm['ko'] 'thumb'
  if($thumb){ $name = Split-Path $thumb -Leaf; if(-not (Test-Path (Join-Path $img $name))){ Add-Issue 'ERROR' $s "대표 사진 없음: $name" }; if(-not (Test-Path (Join-Path $img "sm\$name"))){ Add-Issue 'ERROR' $s "카드용 sm/ 사진 없음: $name" } }
  foreach($m in [regex]::Matches($docs['ko'],'!\[[^\]]*\]\(([^)]+)\)')){ $ip = $m.Groups[1].Value
    if(-not $ip.StartsWith('/')){ Add-Issue 'ERROR' $s "본문 사진 경로가 / 로 시작하지 않음: $ip"; continue }
    $name = Split-Path $ip -Leaf; if(-not (Test-Path (Join-Path $img $name))){ Add-Issue 'ERROR' $s "본문 사진 없음: $name" }; if(-not (Test-Path (Join-Path $img "sm\$name"))){ Add-Issue 'ERROR' $s "본문 사진의 sm/ 없음: $name" } }
  # 지역/동네 존재
  $region = Get-FmField $fm['ko'] 'region'; $area = Get-FmField $fm['ko'] 'area'
  if($area -and -not $areaOk.ContainsKey($area)){ Add-Issue 'ERROR' $s "area '$area' 가 site.config.js 에 없음" }
  # 맛집 필수 키
  if($cat -eq 'food'){
    foreach($k in 'addr','lat','lng','order','orderRoman','spicy','closed','map'){ if(-not (Get-FmField $fm['ko'] $k)){ Add-Issue 'WARN' $s "맛집인데 ko 에 $k 가 없음" } }
    if($region -eq 'seoul' -and -not (Get-FmField $fm['ko'] 'subway')){ Add-Issue 'WARN' $s '서울 맛집인데 subway 가 없음' }
  }
}

$err = @($issues | Where-Object { $_.Level -eq 'ERROR' }); $warn = @($issues | Where-Object { $_.Level -eq 'WARN' })
$issues | Sort-Object Level, Slug | ForEach-Object { "{0,-5} {1}: {2}" -f $_.Level, $_.Slug, $_.Message }
"검사한 글 $($slugs.Count)개 · ERROR $($err.Count) · WARN $($warn.Count)"
if($err.Count -gt 0){ exit 1 }
