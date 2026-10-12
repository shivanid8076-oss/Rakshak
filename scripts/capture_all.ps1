$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$baseDir = "C:\Users\dixit\Downloads\FraudShield-main\FraudShield-main\docs\screenshots"

$pages = @(
    @{ Url = "http://localhost:5173/"; File = "landing-page.png"; Budget = "4000" },
    @{ Url = "http://localhost:5173/login"; File = "login.png"; Budget = "3000" },
    @{ Url = "http://localhost:5173/dashboard"; File = "dashboard.png"; Budget = "3500" },
    @{ Url = "http://localhost:5173/cases"; File = "cases.png"; Budget = "3500" },
    @{ Url = "http://localhost:5173/cases/CASE-2451"; File = "case-details.png"; Budget = "3500" },
    @{ Url = "http://localhost:5173/investigate"; File = "investigation.png"; Budget = "3500" },
    @{ Url = "http://localhost:5173/analytics"; File = "analytics.png"; Budget = "4000" },
    @{ Url = "http://localhost:5173/admin"; File = "admin.png"; Budget = "3500" },
    @{ Url = "http://localhost:5173/settings"; File = "settings.png"; Budget = "3500" }
)

foreach ($p in $pages) {
    $outPath = Join-Path $baseDir $p.File
    Write-Host "Capturing $($p.File)..."
    Start-Process $edge -ArgumentList "--headless", "--hide-scrollbars", "--window-size=1440,900", "--virtual-time-budget=$($p.Budget)", "--screenshot=$outPath", $p.Url -Wait
}
Write-Host "All screenshots captured successfully!"
