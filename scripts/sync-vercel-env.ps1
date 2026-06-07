# Синхронизация NEXT_PUBLIC_* из .env.local в Vercel (Production + Preview).
# Требуется: vercel login && vercel link (в папке craftflow).
param(
  [string]$EnvFile = ".env.local"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path $EnvFile)) {
  Write-Error "Не найден $EnvFile"
}

function Get-EnvValue([string]$Name) {
  $line = Get-Content $EnvFile | Where-Object { $_ -match "^\s*$Name=" } | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -replace "^\s*$Name=", "").Trim().Trim('"').Trim("'")
}

$vars = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL"
)

Write-Host "Проверка Vercel CLI..."
vercel --version | Out-Null

foreach ($name in $vars) {
  $value = Get-EnvValue $name
  if (-not $value) {
    Write-Warning "Пропуск $name — пусто в $EnvFile"
    continue
  }
  Write-Host "Добавление $name (production, preview)..."
  $value | vercel env add $name production --force
  $value | vercel env add $name preview --force
}

Write-Host ""
Write-Host "Готово. Запустите redeploy:"
Write-Host "  vercel --prod"
Write-Host "или в Dashboard: Deployments -> Redeploy (без Build Cache)"
