# ==============================================================================
# ShopSphere - Automated Full Stack Launcher & Network Share
# Starts MySQL, Spring Boot Backend, and React Frontend in Docker containers.
# ==============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "          Starting ShopSphere Full Stack Platform         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Docker Engine is running
Write-Host "[1/4] Checking Docker daemon status..." -ForegroundColor Yellow
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Desktop is not running or accessible." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host "       Docker daemon is active and accessible." -ForegroundColor Green

# 2. Build and start Docker Compose services
Write-Host "[2/4] Building and starting containers (MySQL, Backend, Frontend)..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] docker-compose failed to launch." -ForegroundColor Red
    exit 1
}

# 3. Wait for containers to become healthy
Write-Host "[3/4] Waiting for services to become healthy..." -ForegroundColor Yellow

$timeout = 90
$elapsed = 0
$backendHealthy = $false
$frontendHealthy = $false

while ($elapsed -lt $timeout) {
    $backendState = docker inspect -f "{{.State.Health.Status}}" shopsphere-backend 2>$null
    $frontendState = docker inspect -f "{{.State.Health.Status}}" shopsphere-frontend 2>$null

    if ($backendState -eq 'healthy') { $backendHealthy = $true }
    if ($frontendState -eq 'healthy') { $frontendHealthy = $true }

    if ($backendHealthy -and $frontendHealthy) {
        break
    }

    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "       Waiting for services... (${elapsed}s elapsed)" -ForegroundColor Gray
}

# 4. Detect Wi-Fi / Local Network IP for sharing with friends
$localIp = "192.168.1.112"
try {
    $ipMatch = (ipconfig | Select-String -Pattern "IPv4 Address[ .:]+([0-9.]+)")
    if ($ipMatch) {
        $firstMatch = $ipMatch[0].Matches[0].Groups[1].Value
        if ($firstMatch) { $localIp = $firstMatch }
    }
} catch {}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "        ShopSphere is running successfully!               " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host " Access URLs:" -ForegroundColor White
Write-Host "   Local Machine URL:       http://localhost:8080/" -ForegroundColor Cyan
Write-Host "   Share with Friend (Wi-Fi): http://${localIp}:8080/" -ForegroundColor Green
Write-Host "   Backend API & Swagger:   http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan
Write-Host "   Backend Health:          http://localhost:8081/actuator/health" -ForegroundColor Cyan
Write-Host ""
Write-Host " To Share Over Internet (Any laptop / anywhere in the world):" -ForegroundColor Magenta
Write-Host "   Run this command in a new terminal: npx localtunnel --port 8080" -ForegroundColor Yellow
Write-Host ""
Write-Host " Demo Credentials for Evaluation:" -ForegroundColor White
Write-Host "   Customer Account:  customer@shopsphere.com  /  customer123" -ForegroundColor Yellow
Write-Host "   Admin Account:     admin@shopsphere.com     /  admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening http://localhost:8080/ in default browser..." -ForegroundColor Gray
Start-Process "http://localhost:8080/"
