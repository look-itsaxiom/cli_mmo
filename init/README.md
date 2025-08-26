# CLI MMO Development Setup

Welcome to the CLI MMO project! This directory contains setup scripts to get your development environment up and running quickly.

## Quick Start

### Windows (PowerShell)

```powershell
cd init
.\init.ps1
```

### macOS/Linux (Bash)

```bash
cd init
chmod +x init.sh
./init.sh
```

## What These Scripts Do

Both scripts perform the same setup steps:

1. **Check Prerequisites** - Verify Node.js and Docker are installed
2. **Install pnpm** - Install the pnpm package manager globally
3. **Install Dependencies** - Install all project dependencies using pnpm workspaces
4. **Start Database** - Launch PostgreSQL database using Docker Compose
5. **Configure Environment** - Set up DATABASE_URL in .env files for shared/db and server
6. **Build Shared Packages** - Build database and types packages first
7. **Build All Packages** - Build the entire project
8. **Verify Setup** - Test that the server can start successfully

## Prerequisites

Before running these scripts, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Docker** - [Download here](https://docker.com/)
  - On Windows: Docker Desktop
  - On macOS: Docker Desktop
  - On Linux: Docker Engine

## After Setup

Once the setup is complete, you can:

1. **Start the server**:

   ```bash
   cd server
   pnpm dev
   ```

2. **Start the web client**:

   ```bash
   cd client-web
   pnpm dev
   ```

3. **Access the application** in your browser at the URL shown by the web client

## Database Information

- **Host**: localhost:5432
- **Database**: postgres
- **Username**: postgres
- **Password**: prisma

## Useful Commands

- `pnpm -r build` - Build all packages
- `pnpm -r test` - Run all tests
- `pnpm -r typecheck` - Type check all packages
- `docker compose -f shared/db/docker-compose.yml logs` - View database logs
- `docker compose -f shared/db/docker-compose.yml down` - Stop database

## Troubleshooting

### Docker Issues

- Make sure Docker Desktop is running
- On Linux, ensure your user is in the docker group: `sudo usermod -aG docker $USER`

### Permission Issues (macOS/Linux)

- Make sure the script is executable: `chmod +x init.sh`

### Port Conflicts

- If port 5432 is already in use, stop other PostgreSQL instances
- If port 3000 is in use, the server will automatically try other ports

### Build Errors

- Clear node_modules and try again: `pnpm -r clean && pnpm -r install`
- Make sure you're using the correct Node.js version

## Need Help?

If you encounter issues not covered here, please check the main project README or create an issue in the repository.
