<# ─── WORKSHOP POSTERS · make.ps1 ───
   Re-prints every workshop poster from lib/workshop.js:

     public/workshop/poster-feed.png    1080x1350   Instagram feed, WhatsApp forward
     public/workshop/poster-story.png   1080x1920   WhatsApp status, Instagram story
     public/workshop/og.jpg             1200x630    link preview for /workshop

   Why it always runs qr.js first: the poster owns no facts. qr.js
   re-reads the date, fee, deadlines and copy and writes them into
   poster.html, so a change in lib/workshop.js can never be printed
   half-applied.

   Why headless Chrome, one process per format: it is the same engine
   the site is designed in, so Cormorant, Inter and Caveat render exactly
   as they do on the phone that will see them. --virtual-time-budget
   lets the page fetch its Google Fonts and finish laying out before the
   shot; the page waits for the fonts itself, then fits and cuts.

   Why a throwaway --user-data-dir: without it headless Chrome can hand
   the job to a Chrome window the owner already has open, and the shot
   silently never happens.

   Why og is a JPEG and the posters are PNG: WhatsApp and Facebook fetch
   the link preview over whatever connection the sharer has — ~150 KB is
   the budget. The posters are uploaded by hand to apps that recompress
   anyway, so they stay lossless and take the recompression only once.

       powershell -ExecutionPolicy Bypass -File scripts\workshop-poster\make.ps1
#>

$ErrorActionPreference = 'Stop'

$here   = $PSScriptRoot
$root   = (Resolve-Path (Join-Path $here '..\..')).Path
$out    = Join-Path $root 'public\workshop'
$html   = Join-Path $here 'poster.html'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (-not (Test-Path $chrome)) { throw "Chrome not found at $chrome" }
New-Item -ItemType Directory -Force -Path $out | Out-Null

# 1 ── words and QR from the source of truth
& node --no-warnings (Join-Path $here 'qr.js')
if ($LASTEXITCODE -ne 0) { throw 'qr.js failed - nothing was printed' }

# file:///D:/website%20for%20institute/... (spaces escaped for Chrome)
$page = ([System.Uri]$html).AbsoluteUri

# Scratch space (Chrome profile, the og PNG) lives beside this script,
# on the repo's drive, not in %TEMP%: a full system drive otherwise makes
# Chrome fail silently with half a PNG. Always removed in the finally.
$tmp = Join-Path $here '.build'
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$prof = Join-Path $tmp 'profile'
try {

$formats = @(
  @{ name = 'feed';  w = 1080; h = 1350; file = (Join-Path $out 'poster-feed.png') },
  @{ name = 'story'; w = 1080; h = 1920; file = (Join-Path $out 'poster-story.png') },
  @{ name = 'og';    w = 1200; h = 630;  file = (Join-Path $tmp 'og.png') }
)

# 2 ── one screenshot per format
foreach ($f in $formats) {
  if (Test-Path $f.file) { Remove-Item $f.file -Force }
  # Windows PowerShell joins -ArgumentList with bare spaces, so any
  # argument holding a path with spaces is quoted by hand.
  $chromeArgs = @(
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    "--window-size=$($f.w),$($f.h)", '--virtual-time-budget=4000',
    "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check',
    "--screenshot=`"$($f.file)`"", "$page#$($f.name)"
  )
  Start-Process -FilePath $chrome -ArgumentList $chromeArgs -Wait -WindowStyle Hidden
  # The launcher process can return while a child is still flushing the
  # PNG, so wait until the file ends in a complete IEND chunk.
  $deadline = (Get-Date).AddSeconds(20)
  while ($true) {
    $done = $false
    if (Test-Path $f.file) {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($f.file)
        $n = $bytes.Length
        $done = $n -gt 12 -and $bytes[$n - 8] -eq 0x49 -and $bytes[$n - 7] -eq 0x45 -and $bytes[$n - 6] -eq 0x4E -and $bytes[$n - 5] -eq 0x44
      } catch { $done = $false }
    }
    if ($done) { break }
    if ((Get-Date) -gt $deadline) { throw "Chrome produced no complete screenshot for #$($f.name)" }
    Start-Sleep -Milliseconds 250
  }
  Write-Host ("  {0,-6} {1}x{2}  {3}" -f $f.name, $f.w, $f.h, $f.file)
}

# 3 ── og.png -> og.jpg, the highest quality that fits ~150 KB
$ogPng = $formats[2].file
$ogJpg = Join-Path $out 'og.jpg'
$py = @'
import sys, io
from PIL import Image
src, dst, budget = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
best = None
for q in range(92, 59, -2):
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=q, optimize=True, progressive=True, subsampling=0 if q >= 84 else 2)
    best = (q, buf.getvalue())
    if len(best[1]) <= budget:
        break
open(dst, "wb").write(best[1])
print("  og     1200x630  %s  q=%d  %d KB" % (dst, best[0], len(best[1]) // 1024))
'@
$py | & python - $ogPng $ogJpg 155000
if ($LASTEXITCODE -ne 0) { throw 'JPEG conversion failed' }

} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

foreach ($p in @($formats[0].file, $formats[1].file, $ogJpg)) {
  $i = Get-Item $p
  Write-Host ("  {0,8:N0} KB  {1}" -f ($i.Length / 1KB), $i.Name)
}
