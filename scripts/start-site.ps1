param(
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$logs = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$Seconds = 30
  )

  for ($i = 0; $i -lt $Seconds; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  return $false
}

function Show-LanUrl {
  try {
    $address = Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object {
        $_.IPAddress -notmatch '^127\.' -and
        $_.IPAddress -notmatch '^169\.254\.' -and
        $_.InterfaceAlias -notmatch 'Loopback'
      } |
      Select-Object -First 1

    if ($address) {
      Write-Host ("LAN:    http://{0}:3000" -f $address.IPAddress)
    }
  } catch {
    # LAN address is optional
  }
}

Write-Host ""
Write-Host "Starting Xingyu Blog..." -ForegroundColor Cyan
Write-Host ""

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  Write-Host "Node.js was not found. Please install Node.js 24+ first." -ForegroundColor Red
  if (-not $NoPause) { Read-Host "Press Enter to close" }
  exit 1
}

$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
  if (-not (Test-Path (Join-Path $root ".next"))) {
    Write-Host "The production build is missing. Run: npm install; npm run build" -ForegroundColor Red
    if (-not $NoPause) { Read-Host "Press Enter to close" }
    exit 1
  }

  $env:NODE_ENV = "production"
  $env:PORT = "3000"

  $serverOut = Join-Path $logs "server.out.log"
  $serverErr = Join-Path $logs "server.err.log"
  $server = Start-Process `
    -FilePath $node `
    -ArgumentList "server.mjs" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $serverOut `
    -RedirectStandardError $serverErr `
    -PassThru

  Set-Content -Path (Join-Path $logs "server.pid") -Value $server.Id -Encoding ascii
}

if (-not (Wait-ForHttp -Url "http://127.0.0.1:3000/" -Seconds 30)) {
  Write-Host "The local site did not start. Check logs\server.err.log" -ForegroundColor Red
  if (-not $NoPause) { Read-Host "Press Enter to close" }
  exit 1
}

Write-Host "Local:  http://localhost:3000" -ForegroundColor Green
Show-LanUrl

$cf = Join-Path $root "tools\cloudflared.exe"
if (-not (Test-Path $cf)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $cf) | Out-Null
  Write-Host "Downloading cloudflared (first run only)..." -ForegroundColor Yellow
  try {
    & curl.exe -L --ssl-no-revoke --fail --silent --show-error `
      --output $cf `
      "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
  } catch {
    Write-Host "Could not download cloudflared. Public URL is unavailable." -ForegroundColor Red
  }
}

$publicUrl = $null
if (Test-Path $cf) {
  $oldPidFile = Join-Path $logs "cloudflared.pid"
  if (Test-Path $oldPidFile) {
    $oldPid = Get-Content $oldPidFile -ErrorAction SilentlyContinue
    if ($oldPid) {
      Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $oldPidFile -Force -ErrorAction SilentlyContinue
  }

  $cfOut = Join-Path $logs "cloudflared.out.log"
  $cfErr = Join-Path $logs "cloudflared.err.log"
  Remove-Item $cfOut, $cfErr -Force -ErrorAction SilentlyContinue

  $cfProcess = Start-Process `
    -FilePath $cf `
    -ArgumentList @("tunnel", "--url", "http://127.0.0.1:3000", "--no-autoupdate") `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $cfOut `
    -RedirectStandardError $cfErr `
    -PassThru

  Set-Content -Path (Join-Path $logs "cloudflared.pid") -Value $cfProcess.Id -Encoding ascii

  for ($i = 0; $i -lt 50; $i++) {
    Start-Sleep -Milliseconds 600
    $text = ""
    if (Test-Path $cfErr) { $text += (Get-Content $cfErr -Raw -ErrorAction SilentlyContinue) }
    if (Test-Path $cfOut) { $text += (Get-Content $cfOut -Raw -ErrorAction SilentlyContinue) }

    $match = [regex]::Match($text, "https://[a-z0-9-]+\.trycloudflare\.com")
    if ($match.Success) {
      $publicUrl = $match.Value
      break
    }
  }
}

Write-Host ""
if ($publicUrl) {
  Set-Content -Path (Join-Path $logs "public-url.txt") -Value $publicUrl -Encoding ascii
  Write-Host "Friend URL (temporary, changes after restart):" -ForegroundColor Yellow
  Write-Host $publicUrl -ForegroundColor Cyan
  Write-Host ""
} else {
  Write-Host "Local site is running. Public URL could not be created." -ForegroundColor Yellow
  Write-Host "Check logs\cloudflared.err.log for details."
}

Write-Host "Opening the local site in your browser..."
Start-Process "http://localhost:3000"

if (-not $NoPause) {
  Write-Host ""
  Read-Host "Press Enter to close this window. The site keeps running."
}
