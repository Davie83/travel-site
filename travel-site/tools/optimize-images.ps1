# ============================================================================
#  사진 최적화 — static/assets/img 안의 사진을 웹용으로 줄입니다.
#  ----------------------------------------------------------------------------
#  실행:  powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1
#
#  하는 일
#    1) EXIF 회전값을 픽셀에 직접 적용 (리사이즈 후 사진이 돌아가는 것 방지)
#    2) 긴 변을 1600px 로 축소 (그보다 작으면 건드리지 않음)
#    3) JPEG 품질 82로 다시 저장
#
#  원본은 git 이력과 Takeout\_정리 폴더에 남아 있습니다.
# ============================================================================

Add-Type -AssemblyName System.Drawing

$MaxEdge = 1600
$Quality = 82L
$dir = Join-Path $PSScriptRoot "..\static\assets\img"
$dir = (Resolve-Path $dir).Path

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)

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

  # 줄어들지 않으면 원본을 유지합니다
  if ($newBytes.Length -lt $sizeBefore) {
    [System.IO.File]::WriteAllBytes($path, $newBytes)
    $sizeAfter = $newBytes.Length; $note = ''
  } else {
    $sizeAfter = $sizeBefore; $note = '원본 유지'
  }
  $after += $sizeAfter

  $rows += [pscustomobject]@{
    파일   = $_.Name
    회전   = if ([int]$ori -eq 1) { '-' } else { "EXIF $ori 적용" }
    해상도 = "$w x $h  ->  $nw x $nh"
    전     = "$([math]::Round($sizeBefore/1KB))KB"
    후     = "$([math]::Round($sizeAfter/1KB))KB"
    비고   = $note
  }
}

$rows | Format-Table -AutoSize
"총 용량: {0} MB  ->  {1} MB  ({2}% 감소)" -f `
  [math]::Round($before/1MB,2), [math]::Round($after/1MB,2), [math]::Round((1-$after/$before)*100)
