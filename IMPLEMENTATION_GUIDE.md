# CLI MMO Implementation Guide

A comprehensive, step-by-step guide to implementing the CLI MMO game described in `cli_mmo_gdd.md` using TypeScript, with distribution capabilities for any CLI environment.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
5. [Phase 2: Core Server Architecture](#phase-2-core-server-architecture)
6. [Phase 3: Game Engine Implementation](#phase-3-game-engine-implementation)
7. [Phase 4: CLI Client Development](#phase-4-cli-client-development)
8. [Phase 5: Advanced Features](#phase-5-advanced-features)
9. [Phase 6: Testing & Quality Assurance](#phase-6-testing--quality-assurance)
10. [Phase 7: Distribution & Deployment](#phase-7-distribution--deployment)
11. [Appendices](#appendices)

---

## Project Overview

This guide will help you build a CLI-first MMO game with the following characteristics:

- **Real-time tick-based gameplay** (5-second intervals)
- **Hexagonal grid world** with territories and resources
- **Server-authoritative architecture** with thin clients
- **RESTful API** with rate limiting and authentication
- **TypeScript-based** for type safety and maintainability
- **Cross-platform CLI distribution**

### Key Game Mechanics
- Territory claiming and expansion
- Resource gathering and building construction
- Military units and combat system
- Research trees and technology progression
- Player communication and faction systems

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (v5.0+)
- **Server Framework**: Express.js or Fastify
- **Database**: PostgreSQL with TypeORM or Prisma
- **Authentication**: JWT tokens
- **CLI Framework**: Commander.js or Oclif
- **Build Tool**: esbuild or Vite
- **Package Manager**: npm or pnpm

### Supporting Libraries
- **Validation**: Zod or Joi
- **Logging**: Winston or Pino
- **Testing**: Jest or Vitest
- **HTTP Client**: Axios or node-fetch
- **Task Scheduling**: node-cron or Bull Queue
- **ASCII Art**: figlet and chalk for CLI aesthetics

### Development Tools
- **TypeScript**: For type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Docker**: Containerization (optional)

---

## Project Structure

Create a monorepo structure to organize the codebase:

```
cli-mmo/
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── server/           # Game server
│   ├── cli/              # CLI client
│   └── web/              # Web interface (future)
├── tools/                # Build and development tools
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── package.json          # Root package.json
├── tsconfig.json         # TypeScript configuration
├── .gitignore
└── README.md
```

---

## Phase 1: Foundation Setup

### Step 1.1: Initialize the Project

1. **Create the project directory**:
   ```bash
   mkdir cli-mmo
   cd cli-mmo
   ```

2. **Initialize the root package.json**:
   ```bash
   npm init -y
   ```

3. **Set up the monorepo structure**:
   ```bash
   mkdir -p packages/{shared,server,cli,web} tools docs scripts
   ```

4. **Configure workspaces** in `package.json`:
   ```json
   {
     "name": "cli-mmo",
     "workspaces": [
       "packages/*"
     ],
     "devDependencies": {
       "typescript": "^5.0.0",
       "@types/node": "^20.0.0",
       "eslint": "^8.0.0",
       "prettier": "^3.0.0"
     }
   }
   ```

### Step 1.2: TypeScript Configuration

1. **Create root `tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "commonjs",
       "lib": ["ES2022"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["packages/*/src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

2. **Configure each package** with its own `tsconfig.json` extending the root configuration.

### Step 1.3: Development Environment Setup

1. **Install development dependencies**:
   ```bash
   npm install -D typescript @types/node eslint prettier husky lint-staged
   ```

2. **Set up ESLint configuration** (`.eslintrc.js`):
   ```javascript
   module.exports = {
     parser: '@typescript-eslint/parser',
     extends: [
       '@typescript-eslint/recommended',
       'prettier'
     ],
     rules: {
       // Add your preferred rules
     }
   };
   ```

3. **Configure Prettier** (`.prettierrc`):
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2
   }
   ```

---

## Phase 2: Core Server Architecture

### Step 2.1: Shared Package Setup

Create the shared package for common types and utilities:

1. **Initialize the shared package**:
   ```bash
   cd packages/shared
   npm init -y
   ```

2. **Define core game types** (`src/types/game.ts`):
   ```typescript
   // Hexagonal coordinates
   export interface HexCoordinates {
     q: number;
     r: number;
   }

   // Resource types
   export type ResourceType = 'wood' | 'stone' | 'iron' | 'food' | 'gold' | 'ether';

   // Unit types
   export type UnitType = 'warrior' | 'scout' | 'mage';

   // Biome types
   export type BiomeType = 'forest' | 'plains' | 'hills' | 'mountains' | 'river';

   // Action tiers from GDD
   export type ActionTier = 'info' | 'order' | 'action' | 'distance' | 'timer';
   ```

3. **Create API request/response types** (`src/types/api.ts`):
   ```typescript
   export interface ApiResponse<T = any> {
     success: boolean;
     data?: T;
     error?: string;
     tick?: number;
     serverTime?: string;
   }

   export interface LoginRequest {
     deviceCode?: string;
   }

   export interface LoginResponse {
     token: string;
     playerId: string;
     nationId: string;
   }
   ```

### Step 2.2: Database Schema Design

1. **Choose your ORM** (Prisma recommended for TypeScript):
   ```bash
   cd packages/server
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Define the database schema** (`prisma/schema.prisma`):
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model Nation {
     id          String   @id @default(cuid())
     name        String   @unique
     playerId    String
     moralePct   Float    @default(100)
     drainRate   Float    @default(1)
     stockpile   Json     // { wood, stone, iron, food, gold, ether }
     tech        Json     @default("{}")
     territories String[] // hex IDs
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@map("nations")
   }

   model Hex {
     id              String   @id @default(cuid())
     q               Int
     r               Int
     biome           String
     bcMax           Int
     bcUsed          Int      @default(0)
     resourceScores  Json     // { wood, stone, iron, food, gold, ether }
     ownerNationId   String?
     visionAt        DateTime?
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt

     @@unique([q, r])
     @@map("hexes")
   }

   // Add other models following the GDD schema
   ```

### Step 2.3: Server Foundation

1. **Initialize the server package**:
   ```bash
   cd packages/server
   npm init -y
   npm install express cors helmet morgan dotenv
   npm install -D @types/express @types/cors @types/morgan
   ```

2. **Create the main server file** (`src/index.ts`):
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import morgan from 'morgan';
   import { config } from './config';
   import { gameRouter } from './routes';
   import { TickWorker } from './services/tick-worker';

   const app = express();

   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(morgan('combined'));
   app.use(express.json());

   // Routes
   app.use('/api', gameRouter);

   // Start server
   const server = app.listen(config.port, () => {
     console.log(`Server running on port ${config.port}`);
   });

   // Start tick worker
   const tickWorker = new TickWorker();
   tickWorker.start();

   // Graceful shutdown
   process.on('SIGTERM', () => {
     server.close();
     tickWorker.stop();
   });
   ```

---

## Phase 3: Game Engine Implementation

### Step 3.1: Tick System

The game runs on 5-second ticks. Create a robust tick worker:

1. **Create the tick worker** (`src/services/tick-worker.ts`):
   ```typescript
   import { EventEmitter } from 'events';
   import { GameEngine } from './game-engine';

   export class TickWorker extends EventEmitter {
     private intervalId?: NodeJS.Timer;
     private tickNumber = 0;
     private gameEngine: GameEngine;

     constructor() {
       super();
       this.gameEngine = new GameEngine();
     }

     start(): void {
       console.log('Starting tick worker...');
       this.intervalId = setInterval(() => {
         this.processTick();
       }, 5000); // 5-second ticks
     }

     stop(): void {
       if (this.intervalId) {
         clearInterval(this.intervalId);
         console.log('Tick worker stopped');
       }
     }

     private async processTick(): Promise<void> {
       this.tickNumber++;
       const startTime = Date.now();

       try {
         await this.gameEngine.processTick(this.tickNumber);
         this.emit('tick', this.tickNumber);
         
         const duration = Date.now() - startTime;
         console.log(`Tick ${this.tickNumber} processed in ${duration}ms`);
       } catch (error) {
         console.error(`Error processing tick ${this.tickNumber}:`, error);
       }
     }
   }
   ```

### Step 3.2: Game Engine Core

1. **Create the game engine** (`src/services/game-engine.ts`):
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import { ResourceProcessor } from './processors/resource-processor';
   import { ClaimProcessor } from './processors/claim-processor';
   import { CombatProcessor } from './processors/combat-processor';
   import { MoraleProcessor } from './processors/morale-processor';

   export class GameEngine {
     private db: PrismaClient;
     private processors: {
       resource: ResourceProcessor;
       claim: ClaimProcessor;
       combat: CombatProcessor;
       morale: MoraleProcessor;
     };

     constructor() {
       this.db = new PrismaClient();
       this.processors = {
         resource: new ResourceProcessor(this.db),
         claim: new ClaimProcessor(this.db),
         combat: new CombatProcessor(this.db),
         morale: new MoraleProcessor(this.db),
       };
     }

     async processTick(tickNumber: number): Promise<void> {
       // Process in specific order based on game design
       await this.processors.morale.processTick(tickNumber);
       await this.processors.resource.processTick(tickNumber);
       await this.processors.claim.processTick(tickNumber);
       await this.processors.combat.processTick(tickNumber);

       // Log tick completion
       await this.logTick(tickNumber);
     }

     private async logTick(tickNumber: number): Promise<void> {
       // Implement append-only event log as required by GDD
       await this.db.eventLog.create({
         data: {
           tick: tickNumber,
           nationId: null,
           type: 'TICK_COMPLETE',
           details: { serverTime: new Date().toISOString() }
         }
       });
     }
   }
   ```

### Step 3.3: Core Game Systems

Implement each major game system as a processor:

1. **Resource Processor** - Handles resource generation and consumption
2. **Claim Processor** - Manages territory claiming and disputes
3. **Combat Processor** - Resolves combat and power score calculations
4. **Morale Processor** - Updates morale and applies effects

Each processor should:
- Implement a `processTick(tickNumber: number)` method
- Handle database operations atomically
- Log important events to the event log
- Follow the timing rules from the GDD

### Step 3.4: Hexagonal Grid System

1. **Implement hex math utilities** (`src/utils/hex-math.ts`):
   ```typescript
   import { HexCoordinates } from '@cli-mmo/shared';

   export class HexMath {
     static distance(a: HexCoordinates, b: HexCoordinates): number {
       return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
     }

     static neighbors(hex: HexCoordinates): HexCoordinates[] {
       const directions = [
         { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
         { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
       ];
       return directions.map(dir => ({ q: hex.q + dir.q, r: hex.r + dir.r }));
     }

     static findPath(start: HexCoordinates, end: HexCoordinates): HexCoordinates[] {
       // Implement A* pathfinding for hex grid
       // Consider terrain difficulty from GDD
       // Return path with difficulty scalar
     }
   }
   ```

---

## Phase 4: CLI Client Development

### Step 4.1: CLI Package Setup

1. **Initialize the CLI package**:
   ```bash
   cd packages/cli
   npm init -y
   npm install commander axios chalk figlet inquirer
   npm install -D @types/figlet @types/inquirer
   ```

2. **Create the main CLI entry point** (`src/index.ts`):
   ```typescript
   #!/usr/bin/env node
   import { Command } from 'commander';
   import chalk from 'chalk';
   import figlet from 'figlet';
   import { GameClient } from './client/game-client';
   import { commands } from './commands';

   const program = new Command();
   const client = new GameClient();

   // ASCII splash screen
   console.log(chalk.cyan(figlet.textSync('CLI MMO', { horizontalLayout: 'full' })));

   program
     .name('game')
     .description('CLI MMO Game Client')
     .version('1.0.0');

   // Add global options
   program
     .option('--json', 'output in JSON format')
     .option('--csv', 'output in CSV format')
     .option('--quiet', 'suppress banner')
     .option('--tick', 'print server tick/time in headers');

   // Register all commands
   commands.forEach(cmd => cmd(program, client));

   program.parse();
   ```

### Step 4.2: Game Client

1. **Create the HTTP client** (`src/client/game-client.ts`):
   ```typescript
   import axios, { AxiosInstance } from 'axios';
   import { ApiResponse } from '@cli-mmo/shared';
   import { ConfigManager } from './config-manager';

   export class GameClient {
     private http: AxiosInstance;
     private config: ConfigManager;

     constructor() {
       this.config = new ConfigManager();
       this.http = axios.create({
         baseURL: this.config.get('serverUrl', 'http://localhost:3000/api'),
         timeout: 10000,
       });

       // Add auth token to requests
       this.http.interceptors.request.use(config => {
         const token = this.config.get('authToken');
         if (token) {
           config.headers.Authorization = `Bearer ${token}`;
         }
         return config;
       });
     }

     async request<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
       const response = await this.http.request({
         method,
         url: endpoint,
         data,
       });
       return response.data;
     }

     // Implement specific API methods
     async login(deviceCode?: string): Promise<ApiResponse> {
       return this.request('POST', '/auth/login', { deviceCode });
     }

     async getReport(): Promise<ApiResponse> {
       return this.request('GET', '/game/report');
     }

     async scan(options: any = {}): Promise<ApiResponse> {
       return this.request('GET', '/game/scan', options);
     }

     // Add other API methods following the GDD command set
   }
   ```

### Step 4.3: CLI Commands

Implement each command from the GDD's Minimum Viable Command Set:

1. **Login command** (`src/commands/login.ts`):
   ```typescript
   import { Command } from 'commander';
   import chalk from 'chalk';
   import { GameClient } from '../client/game-client';

   export function loginCommand(program: Command, client: GameClient) {
     program
       .command('login')
       .description('Login to the game')
       .action(async () => {
         try {
           console.log('Initiating device code flow...');
           const response = await client.login();
           
           if (response.success) {
             console.log(chalk.green('Login successful!'));
             // Show ASCII splash and CTAs as per GDD
           } else {
             console.log(chalk.red('Login failed:', response.error));
           }
         } catch (error) {
           console.error(chalk.red('Error:', error.message));
         }
       });
   }
   ```

2. **Report command** (`src/commands/report.ts`):
   ```typescript
   export function reportCommand(program: Command, client: GameClient) {
     program
       .command('report')
       .description('Show nation dashboard')
       .action(async (options) => {
         try {
           const response = await client.getReport();
           
           if (response.success) {
             // Format and display the one-screen dashboard as per GDD
             displayReport(response.data, options);
           }
         } catch (error) {
           console.error(chalk.red('Error:', error.message));
         }
       });
   }

   function displayReport(data: any, options: any) {
     if (options.json) {
       console.log(JSON.stringify(data, null, 2));
       return;
     }

     // ASCII-formatted output as shown in GDD example
     console.log('╔══════════════╗');
     console.log('║  HEXWORLD    ║  Season 34 • Tick 128 • UTC 12:03:15');
     console.log('╚══════════════╝');
     // ... format the rest of the report
   }
   ```

### Step 4.4: Configuration Management

1. **Create config manager** (`src/client/config-manager.ts`):
   ```typescript
   import fs from 'fs';
   import path from 'path';
   import os from 'os';

   export class ConfigManager {
     private configPath: string;
     private config: Record<string, any> = {};

     constructor() {
       this.configPath = path.join(os.homedir(), '.cli-mmo-config.json');
       this.load();
     }

     get(key: string, defaultValue?: any): any {
       return this.config[key] ?? defaultValue;
     }

     set(key: string, value: any): void {
       this.config[key] = value;
       this.save();
     }

     private load(): void {
       try {
         if (fs.existsSync(this.configPath)) {
           this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
         }
       } catch (error) {
         console.warn('Failed to load config:', error.message);
       }
     }

     private save(): void {
       try {
         fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
       } catch (error) {
         console.warn('Failed to save config:', error.message);
       }
     }
   }
   ```

---

## Phase 5: Advanced Features

### Step 5.1: Authentication System

Implement the device-code flow mentioned in the GDD:

1. **Create auth service** (`packages/server/src/services/auth-service.ts`)
2. **Implement JWT token management**
3. **Add rate limiting per the GDD specifications**

### Step 5.2: Rate Limiting

Implement the token bucket system from the GDD:

1. **5 RPS burst, 60 RPM sustained**
2. **Action Points per tick enforcement**
3. **Per-front caps for military actions**

### Step 5.3: Data Export

Implement CSV/JSON export capabilities:

1. **Map data export**
2. **Report data export**
3. **Personal notes export**
4. **Batch operation support**

### Step 5.4: Real-time Features

1. **WebSocket support for real-time updates**
2. **Live tick notifications**
3. **Combat resolution updates**

---

## Phase 6: Testing & Quality Assurance

### Step 6.1: Unit Testing

1. **Set up Jest or Vitest**:
   ```bash
   npm install -D jest @types/jest ts-jest
   ```

2. **Write tests for core game mechanics**:
   - Hex math calculations
   - Power score calculations
   - Tick processing logic
   - API endpoints

3. **Test CLI commands**:
   - Mock HTTP responses
   - Verify output formatting
   - Test error handling

### Step 6.2: Integration Testing

1. **Database integration tests**
2. **API endpoint tests**
3. **Game engine integration tests**

### Step 6.3: Load Testing

1. **Simulate multiple players**
2. **Test tick processing under load**
3. **Verify rate limiting effectiveness**

---

## Phase 7: Distribution & Deployment

### Step 7.1: CLI Distribution

1. **Create distributable packages**:
   ```bash
   # Build all packages
   npm run build

   # Package CLI for distribution
   cd packages/cli
   npm pack
   ```

2. **NPM Publishing**:
   ```json
   {
     "name": "@your-org/cli-mmo",
     "bin": {
       "game": "./dist/index.js"
     },
     "files": ["dist/**/*"]
   }
   ```

3. **Alternative distribution methods**:
   - **Standalone executables** using `pkg` or `nexe`
   - **Docker containers**
   - **GitHub Releases** with pre-built binaries

### Step 7.2: Server Deployment

1. **Environment configuration**:
   ```bash
   # .env file
   DATABASE_URL=postgresql://user:password@localhost:5432/climmo
   JWT_SECRET=your-jwt-secret
   PORT=3000
   ```

2. **Docker deployment**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist/ ./dist/
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

3. **Production considerations**:
   - **Process management** (PM2, systemd)
   - **Reverse proxy** (nginx, Caddy)
   - **Database migrations**
   - **Monitoring and logging**

### Step 7.3: Multi-Platform Support

1. **Cross-platform CLI**:
   - Test on Windows, macOS, and Linux
   - Handle path separators correctly
   - Use appropriate config directories

2. **Distribution scripts**:
   ```bash
   # Build for multiple platforms
   npm run build:win
   npm run build:mac
   npm run build:linux
   ```

---

## Appendices

### Appendix A: Development Workflow

1. **Git workflow recommendations**
2. **Code review process**
3. **Continuous integration setup**
4. **Release management**

### Appendix B: Performance Optimization

1. **Database optimization**
2. **Memory management**
3. **Tick processing optimization**
4. **API response caching**

### Appendix C: Security Considerations

1. **Input validation**
2. **SQL injection prevention**
3. **Rate limiting implementation**
4. **Authentication security**

### Appendix D: Troubleshooting Guide

1. **Common installation issues**
2. **Database connection problems**
3. **CLI connectivity issues**
4. **Performance debugging**

### Appendix E: Extension Points

1. **Plugin system architecture**
2. **Custom command development**
3. **TUI integration guidelines**
4. **Third-party tool integration**

---

## Next Steps

After completing this guide, you'll have:

1. ✅ A fully functional CLI MMO server
2. ✅ A cross-platform CLI client
3. ✅ Real-time tick-based gameplay
4. ✅ All core game mechanics implemented
5. ✅ Distribution-ready packages

**Recommended progression**:
1. Start with Phase 1-2 to establish the foundation
2. Implement core game mechanics in Phase 3
3. Build the CLI client in Phase 4
4. Add advanced features as needed
5. Focus on testing and distribution

**Community and Support**:
- Set up a Discord server for player communication
- Create documentation wiki
- Establish contribution guidelines
- Plan regular content updates and balance patches

This guide provides the educational framework to build a production-ready CLI MMO while learning TypeScript, game development concepts, and software architecture principles.