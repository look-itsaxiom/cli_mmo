# CLI MMO Development Environment Setup Script
# Run this script from the init/ directory to set up your development environment

# ASCII Header
Write-Ho# Step 6: Build shared packages
Write-Step 6 "Building shared packages"
Write-Host "Building database and types packages..." -ForegroundColor White
pnpm --filter "./shared/*" build
Assert-Success "Failed to build shared packages"
Write-Host "✓ Shared packages built successfully" -ForegroundColor Green

# Step 7: Build all packages
Write-Step 7 "Building all packages"
Write-Host "Building all project packages..." -ForegroundColor White
pnpm -r build
Assert-Success "Failed to build all packages"
Write-Host "✓ All packages built successfully" -ForegroundColor Green

# Step 8: Verify setup
Write-Step 8 "Verifying setup" _       _____   __  __  __  __   ____  
 / ___ / | |     |_   _| |  \/  ||  \/  | / __ \ 
| |      | |       | |   | |\/| || |\/| || |  | |
| |      | |       | |   | |  | || |  | || |  | |
| |___   | |____  _| |_  | |  | || |  | || |__| |
\______/ |_____| |_____| |_|  |_||_|  |_| \____/ 

         🎮 CLI MMO Development Setup 🎮
============================================================
"@ -ForegroundColor Cyan

Write-Host "Welcome! This script will set up your CLI MMO development environment." -ForegroundColor Green
Write-Host "Please ensure you have Node.js and Docker installed before proceeding.`n" -ForegroundColor Yellow

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to print step headers
function Write-Step {
    param($StepNumber, $Description)
    Write-Host "`n[$StepNumber/8] $Description" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

# Function to check success and exit on failure
function Assert-Success {
    param($Message)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ $Message" -ForegroundColor Red
        Write-Host "Setup failed. Please check the error above and try again." -ForegroundColor Red
        exit 1
    }
}

# Function to create or update .env file
function Set-EnvVariable {
    param($FilePath, $Key, $Value)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        if ($content -match "^$Key=") {
            # Update existing key
            $content = $content -replace "^$Key=.*", "$Key=`"$Value`""
        } else {
            # Add new key
            $content += "`n$Key=`"$Value`""
        }
    } else {
        # Create new file
        $content = "$Key=`"$Value`""
    }
    
    $content | Set-Content $FilePath -NoNewline
}

# Step 1: Check prerequisites
Write-Step 1 "Checking prerequisites"
Write-Host "Checking Node.js..." -NoNewline
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host " ✓ Found Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host " ❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Docker..." -NoNewline
if (Test-CommandExists "docker") {
    Write-Host " ✓ Found Docker" -ForegroundColor Green
} else {
    Write-Host " ❌ Docker not found. Please install Docker Desktop from https://docker.com/" -ForegroundColor Red
    exit 1
}

# Step 2: Install pnpm globally
Write-Step 2 "Installing pnpm package manager"
Write-Host "Installing pnpm globally..." -NoNewline
npm install pnpm -g
Assert-Success "Failed to install pnpm"
$pnpmVersion = pnpm --version
Write-Host " ✓ pnpm $pnpmVersion installed successfully" -ForegroundColor Green

# Step 3: Install project dependencies
Write-Step 3 "Installing project dependencies"
Write-Host "Installing dependencies for all packages..." -ForegroundColor White
pnpm -r install
Assert-Success "Failed to install dependencies"
Write-Host "✓ All dependencies installed successfully" -ForegroundColor Green

# Step 4: Start Docker Desktop and database
Write-Step 4 "Starting Docker services"
Write-Host "Starting Docker Desktop..." -ForegroundColor White
docker version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Docker Desktop (this may take a moment)..." -ForegroundColor Yellow
    Start-Process "Docker Desktop" -WindowStyle Hidden
    
    # Wait for Docker to be ready
    $attempts = 0
    do {
        Start-Sleep 3
        docker version > $null 2>&1
        $attempts++
        Write-Host "." -NoNewline -ForegroundColor Yellow
    } while ($LASTEXITCODE -ne 0 -and $attempts -lt 20)
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Docker Desktop failed to start within 60 seconds" -ForegroundColor Red
        exit 1
    }
    Write-Host "`n✓ Docker Desktop is running" -ForegroundColor Green
} else {
    Write-Host "✓ Docker Desktop is already running" -ForegroundColor Green
}

Write-Host "Starting PostgreSQL database..." -ForegroundColor White
Set-Location ../shared/db
docker compose up -d
Assert-Success "Failed to start database"

# Wait for database to be healthy
Write-Host "Waiting for database to be ready..." -NoNewline -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep 2
    $health = docker compose ps --format json | ConvertFrom-Json | Where-Object { $_.Service -eq "postgres_db" } | Select-Object -ExpandProperty Health
    $attempts++
    Write-Host "." -NoNewline -ForegroundColor Yellow
} while ($health -ne "healthy" -and $attempts -lt 15)

if ($health -eq "healthy") {
    Write-Host " ✓ Database is healthy and ready" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Database may still be starting up" -ForegroundColor Yellow
}

Set-Location ../../init

# Step 5: Configure environment variables
Write-Step 5 "Configuring environment variables"
Write-Host "Setting up database connection for shared/db..." -ForegroundColor White
Set-EnvVariable "../shared/db/.env" "DATABASE_URL" "postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
Write-Host "✓ Database .env file configured" -ForegroundColor Green

Write-Host "Setting up database connection for server..." -ForegroundColor White
Set-EnvVariable "../server/.env" "DATABASE_URL" "postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
Write-Host "✓ Server .env file configured" -ForegroundColor Green

# Step 6: Build shared packages
Write-Step 6 "Building shared packages"
Write-Host "Building database and types packages..." -ForegroundColor White
pnpm --filter "./shared/*" build
Assert-Success "Failed to build shared packages"
Write-Host "✓ Shared packages built successfully" -ForegroundColor Green

# Step 6: Build all packages
Write-Step 6 "Building all packages"
Write-Host "Building all project packages..." -ForegroundColor White
pnpm -r build
Assert-Success "Failed to build all packages"
Write-Host "✓ All packages built successfully" -ForegroundColor Green

# Step 7: Verify setup
Write-Step 7 "Verifying setup"
Write-Host "Checking if server can start..." -ForegroundColor White
Set-Location ../server

# Test if server starts successfully (run for 3 seconds then kill)
$job = Start-Job -ScriptBlock {
    Set-Location $args[0]
    pnpm dev
} -ArgumentList (Get-Location).Path

Start-Sleep 3
Stop-Job $job -PassThru | Remove-Job

if ($job.State -eq "Running") {
    Write-Host "✓ Server can start successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server may have issues starting - check logs manually" -ForegroundColor Yellow
}

Set-Location ../init

# Success message
Write-Host @"

🎉 Setup Complete! 🎉
═══════════════════════════════════════════════════════════

Your CLI MMO development environment is ready!

Next steps:
1. Start the server: cd server && pnpm dev
2. Start the web client: cd client-web && pnpm dev
3. Open your browser to the URL shown by the web client

Database Info:
- PostgreSQL running on localhost:5432
- Database: postgres
- Username: postgres
- Password: prisma

Useful commands:
- pnpm -r build          Build all packages
- pnpm -r test           Run all tests
- pnpm -r typecheck      Type check all packages
- docker compose -f shared/db/docker-compose.yml logs  View database logs

Happy coding! 🚀
"@ -ForegroundColor Green

