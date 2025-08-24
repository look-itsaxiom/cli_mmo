# CLI MMO Development Resources

Additional resources and examples to support the implementation of the CLI MMO game.

## Code Examples

### Example Package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### Example Environment Configuration

```bash
# .env.example
DATABASE_URL="postgresql://username:password@localhost:5432/cli_mmo"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
TICK_INTERVAL_MS=5000
RATE_LIMIT_BURST=5
RATE_LIMIT_SUSTAINED=60
```

### Example Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/cli_mmo
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=cli_mmo
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Game Mechanics Implementation Examples

### Hex Math Utilities

```typescript
// Example implementation of hexagonal grid mathematics
export class HexUtils {
  static readonly DIRECTIONS = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  static distance(a: HexCoordinates, b: HexCoordinates): number {
    return (Math.abs(a.q - b.q) + 
            Math.abs(a.q + a.r - b.q - b.r) + 
            Math.abs(a.r - b.r)) / 2;
  }

  static neighbors(hex: HexCoordinates): HexCoordinates[] {
    return this.DIRECTIONS.map(dir => ({
      q: hex.q + dir.q,
      r: hex.r + dir.r
    }));
  }

  static ring(center: HexCoordinates, radius: number): HexCoordinates[] {
    if (radius === 0) return [center];
    
    const results: HexCoordinates[] = [];
    let hex = { q: center.q - radius, r: center.r + radius };
    
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push({ ...hex });
        hex = this.neighbor(hex, i);
      }
    }
    return results;
  }

  private static neighbor(hex: HexCoordinates, direction: number): HexCoordinates {
    const dir = this.DIRECTIONS[direction];
    return { q: hex.q + dir.q, r: hex.r + dir.r };
  }
}
```

### Power Score Calculation

```typescript
// Example power score calculation based on GDD rules
export class PowerScore {
  static calculate(hex: Hex, units: UnitPool, buildings: Building[], morale: number): number {
    let defenseScore = 0;

    // Base unit defense
    defenseScore += units.warrior * 1; // 1 DEF per warrior
    defenseScore += units.scout * 2;   // 2 DEF per scout
    defenseScore += units.mage * 0;    // 0 DEF per mage

    // Building bonuses
    const barracks = buildings.find(b => b.type === 'barracks');
    if (barracks && units.warrior >= 5) {
      defenseScore += 5;
      if (units.warrior >= 10) defenseScore += 2;
      if (units.warrior >= 20) defenseScore += 3;
    }

    const watchtowers = buildings.filter(b => b.type === 'watchtower');
    watchtowers.forEach(tower => {
      if (units.scout >= 2) defenseScore += 2;
    });

    // Morale modifier
    if (morale < 60) defenseScore *= 0.9;      // -10% at low morale
    if (morale < 40) defenseScore *= 0.8;      // -20% at very low morale
    if (morale > 100) defenseScore *= 1.1;     // +10% at boost state

    // Terrain bonuses (example)
    if (hex.biome === 'hills' && units.scout > 0) {
      defenseScore += Math.floor(units.scout * 0.5);
    }

    return Math.floor(defenseScore);
  }
}
```

### Rate Limiting Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { TokenBucket } from './token-bucket';

export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      if (!userId) return next();

      const bucket = this.getBucket(userId);
      
      if (bucket.consume(1)) {
        next();
      } else {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: bucket.getRetryTime()
        });
      }
    };
  }

  private getBucket(userId: string): TokenBucket {
    if (!this.buckets.has(userId)) {
      // 5 RPS burst, 60 RPM sustained as per GDD
      this.buckets.set(userId, new TokenBucket(5, 60));
    }
    return this.buckets.get(userId)!;
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private burstCapacity: number,
    private refillRate: number // tokens per minute
  ) {
    this.tokens = burstCapacity;
    this.lastRefill = Date.now();
  }

  consume(tokens: number): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000 / 60; // minutes
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.burstCapacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getRetryTime(): number {
    this.refill();
    const tokensNeeded = 1 - this.tokens;
    return Math.ceil((tokensNeeded / this.refillRate) * 60 * 1000); // ms
  }
}
```

## CLI Output Formatting Examples

### ASCII Art and Styling

```typescript
import chalk from 'chalk';
import figlet from 'figlet';

export class OutputFormatter {
  static splash(): void {
    console.log(chalk.cyan(figlet.textSync('CLI MMO', { 
      horizontalLayout: 'full',
      font: 'Speed'
    })));
    console.log(chalk.yellow('⚔️  Warcraft-like strategy, played through a terminal  ⚔️'));
    console.log();
  }

  static header(title: string, tick: number, serverTime: string): void {
    const border = '═'.repeat(title.length + 4);
    console.log(chalk.blue(`╔${border}╗`));
    console.log(chalk.blue(`║  ${title.toUpperCase()}  ║`) + 
                chalk.gray(`  Tick ${tick} • ${serverTime}`));
    console.log(chalk.blue(`╚${border}╝`));
  }

  static report(data: any): void {
    const { nation, morale, stockpile, claims, fronts, mail } = data;
    
    this.header('HEXWORLD', data.tick, data.serverTime);
    
    console.log(chalk.green(`Welcome back, ${nation.name}.`));
    console.log(chalk.yellow('Consider supporting development → ko-fi.com/climmo'));
    console.log();
    
    // Nation summary
    console.log(chalk.white('[Report]') + 
                ` Nation: ${chalk.cyan(nation.name)} • ` +
                `Morale: ${this.formatMorale(morale)} • ` +
                `Stock: ${this.formatResources(stockpile)}`);
    
    console.log(`Open Claims: ${claims.length} • ` +
                `Fronts: ${fronts.length} • ` +
                `Unread Mail: ${mail.unread}`);
  }

  private static formatMorale(morale: number): string {
    const pct = Math.floor(morale);
    let color = chalk.green;
    let status = 'High';
    
    if (pct < 60) { color = chalk.yellow; status = 'Medium'; }
    if (pct < 40) { color = chalk.red; status = 'Low'; }
    if (pct < 20) { color = chalk.bgRed; status = 'Critical'; }
    
    return color(`${status} (${pct}%)`);
  }

  private static formatResources(stockpile: any): string {
    const { wood, stone, iron, food, gold, ether } = stockpile;
    return `W${wood} S${stone} I${iron} F${food} G${gold} E${ether}`;
  }
}
```

### Progress Indicators

```typescript
export class ProgressFormatter {
  static buildQueue(builds: any[]): void {
    if (builds.length === 0) {
      console.log(chalk.gray('No active builds'));
      return;
    }

    console.log(chalk.white('\nBuild Queue:'));
    builds.forEach(build => {
      const progress = this.calculateProgress(build.startedTick, build.completeTick);
      const eta = this.formatETA(build.completeTick - build.currentTick);
      
      console.log(`  ${this.progressBar(progress)} ${build.type} @ (${build.hex.q},${build.hex.r}) • ETA ${eta}`);
    });
  }

  private static progressBar(progress: number, width: number = 20): string {
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    
    return chalk.green('█'.repeat(filled)) + 
           chalk.gray('░'.repeat(empty)) + 
           ` ${Math.floor(progress * 100)}%`;
  }

  private static formatETA(ticks: number): string {
    const seconds = ticks * 5; // 5-second ticks
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${seconds}s`;
  }
}
```

## Testing Examples

### Unit Test Example

```typescript
// Example Jest test for hex math
import { HexUtils } from '../src/utils/hex-utils';

describe('HexUtils', () => {
  describe('distance', () => {
    it('should calculate distance between adjacent hexes', () => {
      const hex1 = { q: 0, r: 0 };
      const hex2 = { q: 1, r: 0 };
      
      expect(HexUtils.distance(hex1, hex2)).toBe(1);
    });

    it('should calculate distance between distant hexes', () => {
      const hex1 = { q: 0, r: 0 };
      const hex2 = { q: 3, r: -2 };
      
      expect(HexUtils.distance(hex1, hex2)).toBe(3);
    });
  });

  describe('neighbors', () => {
    it('should return 6 neighbors for any hex', () => {
      const hex = { q: 0, r: 0 };
      const neighbors = HexUtils.neighbors(hex);
      
      expect(neighbors).toHaveLength(6);
      expect(neighbors).toContainEqual({ q: 1, r: 0 });
      expect(neighbors).toContainEqual({ q: -1, r: 0 });
    });
  });
});
```

### Integration Test Example

```typescript
// Example API integration test
import request from 'supertest';
import { app } from '../src/app';

describe('Game API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Set up test database and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ deviceCode: 'test-device' });
    
    authToken = response.body.data.token;
  });

  describe('GET /api/game/report', () => {
    it('should return player report', async () => {
      const response = await request(app)
        .get('/api/game/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nation');
      expect(response.body.data).toHaveProperty('morale');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/game/report')
        .expect(401);
    });
  });
});
```

## Deployment Scripts

### Build Script

```bash
#!/bin/bash
# scripts/build.sh

echo "Building CLI MMO..."

# Clean previous builds
rm -rf packages/*/dist

# Build shared package first
cd packages/shared
npm run build
cd ../..

# Build server
cd packages/server
npm run build
cd ../..

# Build CLI
cd packages/cli
npm run build
chmod +x dist/index.js
cd ../..

echo "Build complete!"
```

### Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

echo "Deploying CLI MMO..."

# Build everything
./scripts/build.sh

# Run database migrations
cd packages/server
npx prisma migrate deploy
cd ../..

# Start server with PM2
pm2 restart cli-mmo-server || pm2 start packages/server/dist/index.js --name cli-mmo-server

# Publish CLI to npm (if needed)
if [ "$PUBLISH_CLI" = "true" ]; then
  cd packages/cli
  npm publish
  cd ../..
fi

echo "Deployment complete!"
```

This collection of resources provides concrete examples and code snippets to help implement the CLI MMO game effectively. Use these alongside the main Implementation Guide for a comprehensive development experience.