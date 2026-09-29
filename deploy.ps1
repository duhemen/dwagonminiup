# ============================================================================
# deploy.ps1 — Deployment automation script
# ============================================================================

param(
  [Parameter(Position=0)]
  [ValidateSet('init','build','up','down','restart','logs','ps','backup','ssl','renew-ssl','clean','update')]
  [string]$Action = 'up'
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$COMPOSE = "docker compose -f docker-compose.prod.yml"

function Log($msg) { Write-Host "→ $msg" -ForegroundColor Cyan }
function OK($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Err($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

switch ($Action) {
  'init' {
    Log "Inisialisasi production environment..."
    if (-not (Test-Path ".env.production")) {
      Copy-Item ".env.production.example" ".env.production"
      Err "Edit .env.production dulu, lalu jalankan lagi."
      exit 1
    }
    New-Item -ItemType Directory -Force -Path "nginx\certs", "nginx\www", "backups" | Out-Null
    OK "Init selesai."
  }
  'build' {
    Log "Build images..."
    & cmd /c "$COMPOSE build --no-cache"
    OK "Build selesai."
  }
  'up' {
    Log "Start services..."
    & cmd /c "$COMPOSE --env-file .env.production up -d"
    Start-Sleep -Seconds 5
    & cmd /c "$COMPOSE ps"
    OK "Services UP."
  }
  'down' {
    Log "Stop services..."
    & cmd /c "$COMPOSE --env-file .env.production down"
    OK "Services DOWN."
  }
  'restart' {
    Log "Restart services..."
    & cmd /c "$COMPOSE --env-file .env.production restart"
    OK "Restarted."
  }
  'logs' {
    & cmd /c "$COMPOSE --env-file .env.production logs -f --tail=100"
  }
  'ps' {
    & cmd /c "$COMPOSE --env-file .env.production ps"
  }
  'backup' {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $file = "backups\dwagon-$ts.sql"
    Log "Backup database → $file"
    & cmd /c "$COMPOSE exec -T postgres pg_dump -U dwagon dwagon > $file"
    OK "Backup selesai: $file"
  }
  'ssl' {
    if (-not $env:DOMAIN) { Err "Set `$env:DOMAIN dulu"; exit 1 }
    if (-not $env:LETSENCRYPT_EMAIL) { Err "Set `$env:LETSENCRYPT_EMAIL dulu"; exit 1 }
    Log "Request SSL cert untuk $env:DOMAIN..."
    & cmd /c "$COMPOSE run --rm certbot certonly --webroot -w /var/www/certbot -d $env:DOMAIN --email $env:LETSENCRYPT_EMAIL --agree-tos --no-eff-email"
    OK "SSL cert terinstall. Restart nginx: .\deploy.ps1 restart"
  }
  'renew-ssl' {
    Log "Renew SSL cert..."
    & cmd /c "$COMPOSE run --rm certbot renew"
    & cmd /c "$COMPOSE exec nginx nginx -s reload"
    OK "SSL renewed."
  }
  'clean' {
    Log "Cleanup unused images & volumes..."
    & cmd /c "docker system prune -f"
    & cmd /c "docker volume prune -f"
    OK "Clean selesai."
  }
  'update' {
    Log "Update deployment (pull latest, rebuild, restart)..."
    & cmd /c "git pull"
    & cmd /c "$COMPOSE --env-file .env.production build"
    & cmd /c "$COMPOSE --env-file .env.production up -d"
    OK "Update selesai."
  }
  default {
    Write-Host "Usage: .\deploy.ps1 [init|build|up|down|restart|logs|ps|backup|ssl|renew-ssl|clean|update]"
  }
}