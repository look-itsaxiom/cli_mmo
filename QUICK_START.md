# Quick Start Guide

This is a condensed version of the full Implementation Guide to get you started quickly with the CLI MMO project.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Git
- Basic TypeScript knowledge

## 1. Quick Setup (15 minutes)

```bash
# 1. Initialize project
mkdir cli-mmo && cd cli-mmo
npm init -y

# 2. Create structure
mkdir -p packages/{shared,server,cli} tools docs scripts

# 3. Install core dependencies
npm install -D typescript @types/node eslint prettier

# 4. Set up TypeScript
echo '{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}' > tsconfig.json
```

## 2. Server Foundation (30 minutes)

```bash
cd packages/server
npm init -y
npm install express prisma @prisma/client cors helmet morgan
npm install -D @types/express

# Set up database
npx prisma init
# Edit prisma/schema.prisma with your models
npx prisma generate
npx prisma db push
```

## 3. CLI Client (20 minutes)

```bash
cd ../cli
npm init -y
npm install commander axios chalk figlet
npm install -D @types/figlet

# Create basic CLI structure
mkdir -p src/{commands,client}
```

## 4. Key Files to Create

### Server (`packages/server/src/index.ts`)
```typescript
import express from 'express';
import { TickWorker } from './services/tick-worker';

const app = express();
app.use(express.json());

const tickWorker = new TickWorker();
tickWorker.start();

app.listen(3000, () => console.log('Server running on port 3000'));
```

### CLI (`packages/cli/src/index.ts`)
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('game')
  .description('CLI MMO Game Client')
  .version('1.0.0');

program
  .command('login')
  .action(() => console.log(chalk.green('Login command')));

program.parse();
```

## 5. Development Commands

```bash
# Build everything
npm run build

# Start server in development
cd packages/server && npm run dev

# Test CLI locally
cd packages/cli && npm link
game --help
```

## Next Steps

1. Follow the complete Implementation Guide for detailed architecture
2. Implement the tick system (5-second intervals)
3. Add authentication and rate limiting
4. Build out the game mechanics from the GDD
5. Create comprehensive tests
6. Package for distribution

## Common Gotchas

- **Database connections**: Make sure PostgreSQL is running
- **TypeScript paths**: Use absolute imports with proper path mapping
- **CLI permissions**: Use `chmod +x` for executable scripts
- **Port conflicts**: Default server port is 3000
- **Authentication**: Implement device-code flow as specified in GDD

## Resources

- [Full Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Game Design Document](./cli_mmo_gdd.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Commander.js Docs](https://github.com/tj/commander.js/)