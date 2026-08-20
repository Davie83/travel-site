# ============================================================================
#  링크 공유용 대표 이미지 생성 (og:image)
#  ----------------------------------------------------------------------------
#  1200x630 — 카카오톡·페이스북·X 가 링크 미리보기에 쓰는 표준 크기입니다.
#  사이트 지도와 같은 지역 색을 써서 브랜드가 이어지게 했습니다.
#
#  실행:  powershell -ExecutionPolicy Bypass -File tools\make-og-image.ps1
#  결과:  static/assets/img/og-default.jpg
# ============================================================================
Add-Type -AssemblyName System.Drawing

$W=1200; $H=630
$bg=[System.Drawing.ColorTranslator]::FromHtml('#0f1114')
$bmp=New-Object System.Drawing.Bitmap($W,$H)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode='AntiAlias'; $g.TextRenderingHint='ClearTypeGridFit'
$g.InterpolationMode='HighQualityBicubic'
$g.Clear($bg)

# 지역 다각형 (사이트 지도와 같은 좌표. 다크모드용 밝은 색)
$regions=@(
 @{n='gyeonggi';    c='#d5a4df'; ctr=@(80,112);  p=@(@(55,96),@(92,74),@(137,50),@(138,155),@(43,156),@(52,134),@(46,116))},
 @{n='gangwon';     c='#7cc1de'; ctr=@(213,91);  p=@(@(137,50),@(181,30),@(217,20),@(235,58),@(254,104),@(271,150),@(272,158),@(138,155))},
 @{n='chungcheong'; c='#9fd98c'; ctr=@(90,197);  p=@(@(43,156),@(177,155),@(177,243),@(61,242),@(67,214),@(61,190),@(47,178))},
 @{n='jeolla';      c='#e7d488'; ctr=@(81,333);  p=@(@(61,242),@(154,243),@(155,352),@(132,368),@(106,378),@(81,388),@(61,392),@(47,384),@(43,362),@(52,340),@(49,316),@(57,292),@(52,268))},
 @{n='gyeongsang';  c='#e39996'; ctr=@(227,273); p=@(@(177,155),@(272,158),@(283,196),@(289,236),@(285,272),@(274,300),@(263,318),@(248,330),@(223,338),@(200,336),@(178,346),@(155,352),@(154,243),@(177,243))},
 @{n='seoul';       c='#827adc'; ctr=@(101,103); p=@(@(88,92),@(114,90),@(119,104),@(110,115),@(92,114),@(84,102))},
 @{n='busan';       c='#72dfd6'; ctr=@(255,313); p=@(@(250,300),@(278,296),@(266,322),@(245,332),@(236,314))}
)

# 지도 배치: 오른쪽. 원본 y 20~491 을 화면에 맞춤
$scale=1.12; $ox=724; $oy=50; $shrink=0.93
function Tx($x,$cx){ return ($ox + (($cx + ($x-$cx)*$shrink)) * $scale) }
function Ty($y,$cy){ return ($oy + (($cy + ($y-$cy)*$shrink) - 20) * $scale) }

foreach($r in $regions){
  $col=[System.Drawing.ColorTranslator]::FromHtml($r.c)
  $pts=@()
  foreach($pt in $r.p){ $pts += New-Object System.Drawing.PointF([float](Tx $pt[0] $r.ctr[0]),[float](Ty $pt[1] $r.ctr[1])) }
  $fill=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170,$col.R,$col.G,$col.B))
  $pen=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170,$col.R,$col.G,$col.B), 9)
  $pen.LineJoin='Round'
  $g.FillPolygon($fill,$pts); $g.DrawPolygon($pen,$pts)
  $fill.Dispose(); $pen.Dispose()
}
# 제주 (섬)
$jc=[System.Drawing.ColorTranslator]::FromHtml('#9ae0ba')
$jb=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170,$jc.R,$jc.G,$jc.B))
$g.FillEllipse($jb, [float]($ox+(72-30)*$scale), [float]($oy+(468-21-20)*$scale), [float](66*$scale), [float](46*$scale))
$jb.Dispose()

# 왼쪽 텍스트
$white=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,233,236,239))
$mute =New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,147,158,169))
$accent=New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#72dfd6'))

$fTitle=New-Object System.Drawing.Font('Segoe UI',72,[System.Drawing.FontStyle]::Bold)
$fKor  =New-Object System.Drawing.Font('Malgun Gothic',40,[System.Drawing.FontStyle]::Bold)
$fSub  =New-Object System.Drawing.Font('Malgun Gothic',22,[System.Drawing.FontStyle]::Regular)
$fUrl  =New-Object System.Drawing.Font('Segoe UI',22,[System.Drawing.FontStyle]::Bold)

$g.DrawString('Korea Trips',$fTitle,$white,68,132)
$g.DrawString('여행한입',$fKor,$mute,74,248)
$g.DrawString("한국인이 직접 다녀온",$fSub,$white,74,340)
$g.DrawString("여행지 · 맛집 기록",$fSub,$white,74,382)
$g.DrawString('kfoodtrip.net',$fUrl,$accent,74,478)

# 하단 강조선
$bar=New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#72dfd6'))
$g.FillRectangle($bar,0,($H-8),$W,8)

$g.Dispose()

$codec=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}
$ep=New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,88L)
$out=Join-Path $PSScriptRoot "..\static\assets\img\og-default.jpg"
$bmp.Save($out,$codec,$ep); $bmp.Dispose()
$f=Get-Item $out
"생성: {0}  ({1} KB, {2}x{3})" -f $f.Name, [math]::Round($f.Length/1KB), $W, $H
