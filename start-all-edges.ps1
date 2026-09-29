# ============================================================================
# start-all-edges.ps1 - Spawn 7 Edge Nodes untuk 7 Region Indonesia
# ============================================================================

$ErrorActionPreference = "Stop"
$root = "C:\dwagonminiup"
$edgePath = "$root\apps\edge-node"

$regions = @(
    @{ Name = 'sumatera';   Port = 4001; Color = 'Yellow';  Flag = '[SM]'; Label = 'Sumatera' },
    @{ Name = 'jawa';       Port = 4002; Color = 'White';   Flag = '[JW]'; Label = 'Jawa' },
    @{ Name = 'kalimantan'; Port = 4003; Color = 'Green';   Flag = '[KL]'; Label = 'Kalimantan' },
    @{ Name = 'bali-nusra'; Port = 4004; Color = 'Red';     Flag = '[BL]'; Label = 'Bali-Nusra' },
    @{ Name = 'sulawesi';   Port = 4005; Color = 'Magenta'; Flag = '[SL]'; Label = 'Sulawesi' },
    @{ Name = 'maluku';     Port = 4006; Color = 'Blue';    Flag = '[ML]'; Label = 'Maluku' },
    @{ Name = 'papua';      Port = 4007; Color = 'Cyan';    Flag = '[PP]'; Label = 'Papua' }
)

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Spawning 7 Edge Nodes (7 Region Indonesia)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

foreach ($r in $regions) {
    $cmd = "cd '$edgePath'; `$env:PORT=$($r.Port); `$env:REGION='$($r.Name)'; `$env:JWT_SECRET='supersecret'; `$env:REDIS_URL='redis://localhost:6379'; `$host.UI.RawUI.WindowTitle='Edge-$($r.Label) :$($r.Port)'; Write-Host '$($r.Flag) Starting edge-$($r.Name) on :$($r.Port)...' -ForegroundColor $($r.Color); pnpm dev"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Write-Host "  $($r.Flag) Spawned edge-$($r.Name) on port $($r.Port)" -ForegroundColor $r.Color
    Start-Sleep -Milliseconds 600
}

Write-Host ""
Write-Host "7 edge nodes spawned in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "Test each via browser:" -ForegroundColor Yellow
foreach ($r in $regions) {
    Write-Host "  http://localhost:$($r.Port)/api/health  ->  $($r.Label)" -ForegroundColor $r.Color
}
Write-Host ""
Write-Host "Stop all edges:" -ForegroundColor Yellow
Write-Host "  Get-Process node | Stop-Process -Force" -ForegroundColor White