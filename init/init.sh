#!/bin/bash
# CLI MMO Development Environment Setup Script
# Run this script from the init/ directory to set up your development environment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ASCII Header
echo -e "${CYAN}"
cat << "EOF"
  ______  _       _____   __  __  __  __   ____  
 / ___ / | |     |_   _| |  \/  ||  \/  | / __ \ 
| |      | |       | |   | |\/| || |\/| || |  | |
| |      | |       | |   | |  | || |  | || |  | |
| |___   | |____  _| |_  | |  | || |  | || |__| |
\______/ |_____| |_____| |_|  |_||_|  |_| \____/ 

         🎮 CLI MMO Development Setup 🎮
============================================================
EOF
echo -e "${NC}"

echo -e "${GREEN}Welcome! This script will set up your CLI MMO development environment.${NC}"
echo -e "${YELLOW}Please ensure you have Node.js and Docker installed before proceeding.${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print step headers
print_step() {
    echo ""
    echo -e "${MAGENTA}[$1/8] $2${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check success and exit on failure
assert_success() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ $1${NC}"
        echo -e "${RED}Setup failed. Please check the error above and try again.${NC}"
        exit 1
    fi
}

# Function to create or update .env file
set_env_variable() {
    local file_path="$1"
    local key="$2"
    local value="$3"
    
    if [ -f "$file_path" ]; then
        if grep -q "^$key=" "$file_path"; then
            # Update existing key
            sed -i.bak "s|^$key=.*|$key=\"$value\"|" "$file_path" && rm "$file_path.bak"
        else
            # Add new key
            echo "$key=\"$value\"" >> "$file_path"
        fi
    else
        # Create new file
        echo "$key=\"$value\"" > "$file_path"
    fi
}

# Step 1: Check prerequisites
print_step 1 "Checking prerequisites"
echo -n "Checking Node.js..."
if command_exists node; then
    node_version=$(node --version)
    echo -e " ${GREEN}✓ Found Node.js $node_version${NC}"
else
    echo -e " ${RED}❌ Node.js not found. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -n "Checking Docker..."
if command_exists docker; then
    echo -e " ${GREEN}✓ Found Docker${NC}"
else
    echo -e " ${RED}❌ Docker not found. Please install Docker from https://docker.com/${NC}"
    exit 1
fi

# Step 2: Install pnpm globally
print_step 2 "Installing pnpm package manager"
echo -n "Installing pnpm globally..."
npm install pnpm -g >/dev/null 2>&1
assert_success "Failed to install pnpm"
pnpm_version=$(pnpm --version 2>/dev/null)
echo -e " ${GREEN}✓ pnpm $pnpm_version installed successfully${NC}"

# Step 3: Install project dependencies
print_step 3 "Installing project dependencies"
echo -e "${NC}Installing dependencies for all packages..."
pnpm -r install
assert_success "Failed to install dependencies"
echo -e "${GREEN}✓ All dependencies installed successfully${NC}"

# Step 4: Start Docker services
print_step 4 "Starting Docker services"
echo -e "${NC}Checking Docker daemon..."
docker version >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Docker daemon is not running. Please start Docker and try again.${NC}"
    echo -e "${YELLOW}On macOS: Open Docker Desktop${NC}"
    echo -e "${YELLOW}On Linux: sudo systemctl start docker${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
fi

echo -e "${NC}Starting PostgreSQL database..."
cd ../shared/db
docker compose up -d
assert_success "Failed to start database"

# Wait for database to be healthy
echo -n -e "${YELLOW}Waiting for database to be ready..."
attempts=0
while [ $attempts -lt 15 ]; do
    health=$(docker compose ps --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | grep -o 'healthy' || echo "")
    if [ "$health" = "healthy" ]; then
        break
    fi
    sleep 2
    echo -n "."
    attempts=$((attempts + 1))
done

if [ "$health" = "healthy" ]; then
    echo -e " ${GREEN}✓ Database is healthy and ready${NC}"
else
    echo -e " ${YELLOW}⚠️  Database may still be starting up${NC}"
fi

cd ../../init

# Step 5: Configure environment variables
print_step 5 "Configuring environment variables"
echo -e "${NC}Setting up database connection for shared/db..."
set_env_variable "../shared/db/.env" "DATABASE_URL" "postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
echo -e "${GREEN}✓ Database .env file configured${NC}"

echo -e "${NC}Setting up database connection for server..."
set_env_variable "../server/.env" "DATABASE_URL" "postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
echo -e "${GREEN}✓ Server .env file configured${NC}"

# Step 6: Build shared packages
print_step 6 "Building shared packages"
echo -e "${NC}Building database and types packages..."
pnpm --filter "./shared/*" build
assert_success "Failed to build shared packages"
echo -e "${GREEN}✓ Shared packages built successfully${NC}"

# Step 7: Build all packages
print_step 7 "Building all packages"
echo -e "${NC}Building all project packages..."
pnpm -r build
assert_success "Failed to build all packages"
echo -e "${GREEN}✓ All packages built successfully${NC}"

# Step 8: Verify setup
print_step 8 "Verifying setup"

# Step 6: Build all packages
print_step 6 "Building all packages"
echo -e "${NC}Building all project packages..."
pnpm -r build
assert_success "Failed to build all packages"
echo -e "${GREEN}✓ All packages built successfully${NC}"

# Step 7: Verify setup
print_step 7 "Verifying setup"
echo -e "${NC}Checking if server can start..."
cd ../server

# Test if server starts successfully (run for 3 seconds then kill)
timeout 3s pnpm dev >/dev/null 2>&1 &
server_pid=$!
sleep 3
kill $server_pid 2>/dev/null

if kill -0 $server_pid 2>/dev/null; then
    echo -e "${GREEN}✓ Server can start successfully${NC}"
    kill $server_pid 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Server may have issues starting - check logs manually${NC}"
fi

cd ../init

# Success message
echo -e "${GREEN}"
cat << "EOF"

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
EOF
echo -e "${NC}"
