# ============================================================================
#  사진 최적화 — static/assets/img 안의 사진을 웹용으로 줄입니다.
#  ----------------------------------------------------------------------------
#  실행:  powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1
#
#  하는 일
#    1) EXIF 회전값을 픽셀에 직접 적용 (리사이즈 후 사진이 돌아가는 것 방지)
#    2) 긴 변을 1600px 로 축소 (그보다 작으면 건드리지 않음)
#    3) JPEG 품질 82로 다시 저장
#    4) 목록 카드용 작은 사진을 img\sm\ 에 따로 만듭니다 (폭 700px)
#
#  4번이 왜 필요한가
#    카드는 화면에 255~350px 폭으로 그려지는데, 1200~1600px 원본을 그대로
#    내려보내면 필요한 픽셀의 20배 이상을 씁니다. 홈을 끝까지 스크롤하면
#    썸네일만 12MB 였습니다. 해외 관광객이 로밍으로 보는 사이트라 부담이 큽니다.
#    카드는 CSS 가 4:3 으로 잘라 쓰므로(object-fit:cover) 폭만 맞추면 됩니다.
#    글 본문의 큰 사진은 원본을 그대로 씁니다.
#
#  원본은 git 이력과 Takeout\_정리 폴더에 남아 있습니다.
# ============================================================================

Add-Type -AssemblyName System.Drawing

$MaxEdge   = 1600
$CardWidth = 700     # 카드용 작은 사진의 폭 (350px 표시 x 2배 화면까지 커버)
$Quality     = 82L
$CardQuality = 74L    # 카드는 255~350px 로 작게 보이므로 화질을 조금 낮춰도 차이가 안 보입니다
$dir = Join-Path $PSScriptRoot "..\static\assets\img"
$dir = (Resolve-Path $dir).Path
$smDir = Join-Path $dir "sm"
if (-not (Test-Path $smDir)) { New-Item -ItemType Directory -Path $smDir | Out-Null }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
$epCard = New-Object System.Drawing.Imaging.EncoderParameters(1)
$epCard.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $CardQuality)

# EXIF 방향값 → 회전/반전 동작
$rot = @{
  1 = 'RotateNoneFlipNone'; 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX'
  5 = 'Rotate90FlipX';      6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX';   8 = 'Rotate270FlipNone'
}

$before = 0; $after = 0; $rows = @()

Get-ChildItem $dir -Filter *.jpg | Sort-Object Name | ForEach-Object {
  $path = $_.FullName
  $sizeBefore = $_.Length
  $before += $sizeBefore

  # 파일을 잠그지 않도록 메모리로 읽어서 엽니다
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $ms = New-Object System.IO.MemoryStream($bytes, $false)
  $img = [System.Drawing.Image]::FromStream($ms)

  $ori = 1
  try { $ori = $img.GetPropertyItem(0x0112).Value[0] } catch {}
  if ($rot.ContainsKey([int]$ori) -and [int]$ori -ne 1) { $img.RotateFlip($rot[[int]$ori]) }

  $w = $img.Width; $h = $img.Height
  $scale = [Math]::Min(1.0, $MaxEdge / [Math]::Max($w, $h))
  $nw = [int][Math]::Round($w * $scale); $nh = [int][Math]::Round($h * $scale)

  $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = 'HighQualityBicubic'
  $g.SmoothingMode      = 'HighQuality'
  $g.PixelOffsetMode    = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'
  $g.DrawImage($img, 0, 0, $nw, $nh)
  $g.Dispose()

  $img.Dispose(); $ms.Dispose()

  $out = New-Object System.IO.MemoryStream
  $bmp.Save($out, $codec, $ep)
  $bmp.Dispose()
  $newBytes = $out.ToArray(); $out.Dispose()

  # 이미 최적화된 사진을 다시 저장하면 용량은 거의 그대로인데 화질만 깎입니다.
  # 그래서 "의미 있게" 줄어들 때만(5% 이상 그리고 20KB 이상) 새로 씁니다.
  $gain = $sizeBefore - $newBytes.Length
  if ($gain -gt ($sizeBefore * 0.05) -and $gain -gt 20KB) {
    [System.IO.File]::WriteAllBytes($path, $newBytes)
    $sizeAfter = $newBytes.Length; $note = ''
  } else {
    $sizeAfter = $sizeBefore; $note = '원본 유지'
  }
  $after += $sizeAfter

  # ---- 카드용 작은 사진 (img\sm\) --------------------------------------
  #  og-default 는 미리보기 전용이라 카드에 안 쓰이므로 건너뜁니다.
  $smNote = '-'
  if ($_.Name -ne 'og-default.jpg') {
    $smPath = Join-Path $smDir $_.Name
    # 방금 저장한 결과(또는 원본)를 기준으로 만듭니다
    $srcBytes = [System.IO.File]::ReadAllBytes($path)
    $ms2 = New-Object System.IO.MemoryStream($srcBytes, $false)
    $img2 = [System.Drawing.Image]::FromStream($ms2)

    # 카드는 CSS 가 4:3 · object-fit:cover · 가운데 기준으로 잘라 보여줍니다.
    # 그래서 여기서도 똑같이 가운데 4:3 으로 잘라 둡니다.
    # 잘려 나갈 부분을 담지 않으니 용량이 절반으로 줄고, 화면에 보이는 그림은 같습니다.
    $sw = $CardWidth
    $sh = [int][Math]::Round($CardWidth * 3 / 4)      # 700 x 525
    $srcRatio = $img2.Width / $img2.Height
    $tgtRatio = 4.0 / 3.0
    if ($srcRatio -gt $tgtRatio) {
      # 원본이 더 넓다 → 좌우를 잘라냅니다
      $cropH = $img2.Height
      $cropW = [int][Math]::Round($img2.Height * $tgtRatio)
    } else {
      # 원본이 더 높다(세로 사진) → 위아래를 잘라냅니다
      $cropW = $img2.Width
      $cropH = [int][Math]::Round($img2.Width / $tgtRatio)
    }
    $cropX = [int][Math]::Round(($img2.Width  - $cropW) / 2)
    $cropY = [int][Math]::Round(($img2.Height - $cropH) / 2)

    $sbmp = New-Object System.Drawing.Bitmap($sw, $sh)
    $sg = [System.Drawing.Graphics]::FromImage($sbmp)
    $sg.InterpolationMode  = 'HighQualityBicubic'
    $sg.SmoothingMode      = 'HighQuality'
    $sg.PixelOffsetMode    = 'HighQuality'
    $sg.CompositingQuality = 'HighQuality'
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $sw, $sh)
    $srcRect  = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $sg.DrawImage($img2, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $sg.Dispose()

    $sout = New-Object System.IO.MemoryStream
    $sbmp.Save($sout, $codec, $epCard)
    $sbmp.Dispose()
    $sBytes = $sout.ToArray(); $sout.Dispose()
    [System.IO.File]::WriteAllBytes($smPath, $sBytes)
    $smNote = "$($sw)x$($sh) · $([math]::Round($sBytes.Length/1KB))KB"
    $img2.Dispose(); $ms2.Dispose()
  }

  $rows += [pscustomobject]@{
    파일   = $_.Name
    회전   = if ([int]$ori -eq 1) { '-' } else { "EXIF $ori 적용" }
    해상도 = "$w x $h  ->  $nw x $nh"
    전     = "$([math]::Round($sizeBefore/1KB))KB"
    후     = "$([math]::Round($sizeAfter/1KB))KB"
    카드용 = $smNote
    비고   = $note
  }
}

$rows | Format-Table -AutoSize
"총 용량: {0} MB  ->  {1} MB  ({2}% 감소)" -f `
  [math]::Round($before/1MB,2), [math]::Round($after/1MB,2), [math]::Round((1-$after/$before)*100)
$smFiles = Get-ChildItem $smDir -Filter *.jpg -ErrorAction SilentlyContinue
if ($smFiles) {
  $smSum = ($smFiles | Measure-Object -Property Length -Sum).Sum
  "카드용(img\sm): {0}개 · {1} MB · 평균 {2}KB" -f `
    $smFiles.Count, [math]::Round($smSum/1MB,2), [math]::Round($smSum/$smFiles.Count/1KB)
}
