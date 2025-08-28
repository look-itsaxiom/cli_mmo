# CLI MMO Development Environment Setup Script
# Run this script from the init/ directory to set up your development environment

# ASCII Header
Write-Host @"
   _____  _       _____   __  __  __  __   ____  
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

# Check if we're in the CLI MMO project root or init directory
$currentLocation = Get-Location
$isInInit = Test-Path "init.ps1" -PathType Leaf
$isInRoot = Test-Path "pnpm-workspace.yaml" -PathType Leaf

if (-not $isInInit -and -not $isInRoot) {
    Write-Host "X This script must be run from either the cli_mmo project root or the init/ directory." -ForegroundColor Red
    Write-Host "  Current location: $currentLocation" -ForegroundColor Yellow
    Write-Host "  Please navigate to the correct directory and try again." -ForegroundColor Yellow
    exit 1
}

if ($isInInit) {
    Write-Host "OK Running from init directory" -ForegroundColor Green
    $root = Get-Location
    $root = $root | Split-Path
} else {
    Write-Host "OK Running from project root directory" -ForegroundColor Green
    $root = Get-Location
}


# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to print step headers
function Write-Step {
    param($StepNumber, $Description)
    Write-Host "`n[$StepNumber/7] $Description" -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor DarkGray
}

# Function to check success and exit on failure
function Assert-Success {
    param($Message)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "X $Message" -ForegroundColor Red
        Write-Host "Setup failed. Please check the error above and try again." -ForegroundColor Red
        exit 1
    }
}

# Function to create or update .env file
function Set-EnvVariable {
    param($FilePath, $Key, $Value)
    
    try {
        # Ensure directory exists
        $directory = Split-Path $FilePath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        
        if (Test-Path $FilePath) {
            $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match "^$Key=") {
                # Update existing key
                $content = $content -replace "^$Key=.*", "$Key=`"$Value`""
            } else {
                # Add new key
                if ($content) {
                    $content += "`n$Key=`"$Value`""
                } else {
                    $content = "$Key=`"$Value`""
                }
            }
        } else {
            # Create new file
            $content = "$Key=`"$Value`""
        }
        
        $content | Set-Content $FilePath -NoNewline
    } catch {
        Write-Host "WARNING: Could not update $FilePath" -ForegroundColor Yellow
    }
}

# Step 1: Check prerequisites
Write-Step 1 "Checking prerequisites"
Write-Host "Checking Node.js..." -NoNewline
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host " OK Found Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host " X Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Docker..." -NoNewline
if (Test-CommandExists "docker") {
    Write-Host " OK Found Docker" -ForegroundColor Green
} else {
    Write-Host " X Docker not found. Please install Docker Desktop from https://docker.com/" -ForegroundColor Red
    exit 1
}

# Step 2: Install pnpm globally
Write-Step 2 "Installing pnpm package manager"
Write-Host "Checking for pnpm..." -NoNewline
if (Test-CommandExists "pnpm") {
    $pnpmVersion = pnpm --version
    Write-Host " OK pnpm $pnpmVersion already installed" -ForegroundColor Green
} else {
    Write-Host " Installing pnpm globally..." -ForegroundColor White
    npm install pnpm -g
    Assert-Success "Failed to install pnpm"
    $pnpmVersion = pnpm --version
    Write-Host "OK pnpm $pnpmVersion installed successfully" -ForegroundColor Green
}

# Step 3: Install project dependencies
Write-Step 3 "Installing project dependencies"
Write-Host "Installing dependencies for all packages..." -ForegroundColor White
Set-Location $root
pnpm -r install
Assert-Success "Failed to install dependencies"
Write-Host "OK All dependencies installed successfully" -ForegroundColor Green

# Step 4: Configure environment variables
Write-Step 4 "Configuring environment variables"
Set-Location "$root/shared/db"
Write-Host "Setting up database connection for shared/db..." -ForegroundColor White
Set-EnvVariable "$root/shared/db/.env" "DATABASE_URL" "postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
Write-Host "OK Database .env file configured" -ForegroundColor Green

Write-Step 4 "Configuring environment variables"
Set-Location "$root/server"
Write-Host "Setting up database connection for server..." -ForegroundColor White
Set-EnvVariable "$root/server/.env" "NODE_ENV" "development"
Write-Host "OK Database .env file configured" -ForegroundColor Green

# Step 5: Start Docker Desktop and database
Write-Step 5 "Starting Docker services"
Write-Host "Starting Docker Desktop..." -ForegroundColor White
docker version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker Desktop manually." -ForegroundColor Yellow
    Write-Host "Waiting for Docker to be available..." -ForegroundColor Yellow
    
    # Wait for Docker to be ready
    $attempts = 0
    do {
        Start-Sleep 5
        docker version 2>$null
        $attempts++
        Write-Host "." -NoNewline -ForegroundColor Yellow
    } while ($LASTEXITCODE -ne 0 -and $attempts -lt 12)
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nX Docker is not available. Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "`nOK Docker is now running" -ForegroundColor Green
} else {
    Write-Host "OK Docker is already running" -ForegroundColor Green
}

Write-Host "Starting PostgreSQL database..." -ForegroundColor White

docker compose -f "$root/shared/db/docker-compose.yml" up -d
Assert-Success "Failed to start database"

# Wait for database to be healthy
Write-Host "Waiting for database to be ready..." -NoNewline -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep 1
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connection = $tcpClient.ConnectAsync("localhost", 5432)
        $connection.Wait(1000)
        if ($connection.IsCompleted -and $tcpClient.Connected) {
            $dbReady = $true
            $tcpClient.Close()
        } else {
            $dbReady = $false
        }
    } catch {
        $dbReady = $false
    }
    $attempts++
    Write-Host "." -NoNewline -ForegroundColor Yellow
} while (-not $dbReady -and $attempts -lt 15)

if ($dbReady) {
    Write-Host " OK Database is ready" -ForegroundColor Green
    Write-Host " Migrating db with prisma migrate dev"
    npx prisma migrate dev
    Write-Host "OK Database migrated successfully" -ForegroundColor Green
    Write-Host "Seeding database with initial data"
    pnpm --filter "./shared/types" seed:db
    Write-Host "OK Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host " WARNING Database connection timeout" -ForegroundColor Yellow
}

Set-Location $root

# Step 6: Build shared packages
Write-Step 6 "Building shared packages"
Write-Host "Building database and types packages..." -ForegroundColor White
pnpm --filter "./shared/*" build
Assert-Success "Failed to build shared packages"
Write-Host "OK Shared packages built successfully" -ForegroundColor Green

# Step 7: Verify setup
Write-Step 7 "Verifying setup"
Write-Host "Building all projects..." -ForegroundColor White

Set-Location $root

pnpm -r build

# Success message
Write-Host @"

                       Setup Complete!
================================================================

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
"@ -ForegroundColor Green