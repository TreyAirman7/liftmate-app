# Ollama Remote Access Startup Script (using localtunnel)
# This script checks prerequisites, starts the proxy server, and then starts localtunnel.

# --- Configuration ---
$ollamaPort = 11434 # Default Ollama port
$configJsonPath = Join-Path $PSScriptRoot "config.json"
$proxyServerScript = Join-Path $PSScriptRoot "server.js"
$tunnelUrlFilePath = Join-Path $PSScriptRoot "localtunnel-url.txt" # File to store the URL (optional)

# --- Load Config ---
$config = $null
$proxyServerPort = 3500 # Default

if (Test-Path $configJsonPath) {
    try {
        $configContent = Get-Content $configJsonPath -Raw
        $config = $configContent | ConvertFrom-Json -ErrorAction Stop
        if ($config.port) { $proxyServerPort = $config.port }
         Write-Host "Loaded port $proxyServerPort from '$configJsonPath'" -ForegroundColor Green
    } catch {
        Write-Host "Error reading or parsing '$configJsonPath': $($_.Exception.Message). Using default port $proxyServerPort." -ForegroundColor Red
    }
} else {
    Write-Host "Warning: '$configJsonPath' not found. Using default port $proxyServerPort." -ForegroundColor Yellow
}

# --- Prerequisites Check ---

# 1. Check if Ollama is running
Write-Host "Checking if Ollama is running on port $ollamaPort..." -ForegroundColor Cyan
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:$ollamaPort/api/version" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Ollama is running: version $($ollamaCheck.version)" -ForegroundColor Green
}
catch {
    Write-Host "Error: Ollama does not seem to be running on http://localhost:$ollamaPort." -ForegroundColor Red
    Write-Host "Please ensure Ollama is installed and running before executing this script." -ForegroundColor Red
    exit 1
}

# 2. Install npm dependencies if needed
$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Node modules not found. Running 'npm install'..." -ForegroundColor Cyan
    Push-Location $PSScriptRoot
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error running 'npm install'. Please check npm logs." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "'npm install' completed." -ForegroundColor Green
    Pop-Location
} else {
     Write-Host "Node modules found." -ForegroundColor Green
}

# --- Start Proxy Server ---
Write-Host "Starting the Node.js proxy server ('$proxyServerScript') in the background..." -ForegroundColor Cyan
Push-Location $PSScriptRoot
$nodeProcess = Start-Process node -ArgumentList $proxyServerScript -PassThru -WindowStyle Minimized 
Pop-Location

if (-not $nodeProcess) {
    Write-Host "Error starting Node.js server process." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js proxy server started (PID: $($nodeProcess.Id)). Waiting a few seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 5 # Give server time to start listening

# --- Start Localtunnel ---
Write-Host "Starting localtunnel to expose port $proxyServerPort..." -ForegroundColor Cyan
Write-Host "Localtunnel will run in the foreground. Press Ctrl+C here to stop it." -ForegroundColor Cyan

try {
    # Run npx localtunnel directly. It should print the URL to the console.
    # We are running this in the ollama-remote-access directory context.
    Push-Location $PSScriptRoot
    npx localtunnel --port $proxyServerPort 
    # The script will block here until localtunnel is stopped (Ctrl+C)
    
    # If localtunnel exits immediately, there might be an error.
    if ($LASTEXITCODE -ne 0) {
         Write-Host "Localtunnel exited with code $LASTEXITCODE." -ForegroundColor Red
    }
    Pop-Location

} catch {
     Write-Host "Error running localtunnel: $($_.Exception.Message)" -ForegroundColor Red
     # Attempt to stop the node server if localtunnel failed
     Stop-Process -Id $nodeProcess.Id -Force -ErrorAction SilentlyContinue
     exit 1
}

Write-Host "Localtunnel stopped." -ForegroundColor Yellow
# Attempt to stop the node server when localtunnel stops
Write-Host "Stopping Node.js proxy server (PID: $($nodeProcess.Id))..." -ForegroundColor Yellow
Stop-Process -Id $nodeProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "Node.js proxy server stopped." -ForegroundColor Yellow