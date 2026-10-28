param(
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root "logs"

Write-Host ""
Write-Host "Stopping Xingyu Blog..." -ForegroundColor Cyan

foreach ($name in @("cloudflared", "server")) {
  $pidFile = Join-Path $logs "$name.pid"
  if (Test-Path $pidFile) {
    $processId = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($processId) {
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
}

# Fallback: stop whatever is listening on port 3000 (the local blog).
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  $listener | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Stopped. You can close this window." -ForegroundColor Green

if (-not $NoPause) {
  Read-Host "Press Enter to close"
}
