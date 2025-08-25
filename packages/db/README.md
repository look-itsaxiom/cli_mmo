# Database Package (@cli-mmo/db)

This package provides database access using Prisma ORM with PostgreSQL for the CLI MMO application.

## Setup

### 1. Start the PostgreSQL container

```bash
cd packages/db
docker compose up -d
```

### 2. Set up environment variables

Create a `.env` file in `packages/db/`:

```bash
DATABASE_URL="postgresql://postgres:prisma@localhost:5432/postgres?schema=public"
```

### 3. Generate Prisma client

```bash
# From the db package directory
npx prisma generate

# Or using nx from root
npx nx run @cli-mmo/db:generate
```

### 4. Run migrations

```bash
# From the db package directory
npx prisma migrate dev

# Or using nx from root
npx nx run @cli-mmo/db:migrate
```

## Usage

```typescript
import { prisma, User } from '@cli-mmo/db';

// Get all users
const users = await prisma.user.findMany();

// Create a user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    userName: 'player1',
    nationId: 'nation-uuid',
  },
});
```

## Docker Services

The `docker-compose.yml` file defines:

- **postgres_db**: PostgreSQL 15 database server
  - Port: 5432
  - Database: postgres
  - User: postgres
  - Password: prisma

## Development Notes

- The database schema is defined in `prisma/schema.prisma`
- Generated client code is output to `generated/prisma/`
- The Prisma client is exported from `src/index.ts`
- A singleton instance is available as `prisma`

## Nx Integration

This package integrates with Nx through the following targets:

- `docker:run`: Start the PostgreSQL container
- `generate`: Generate the Prisma client
- `migrate`: Run database migrations
- `deploy`: Deploy migrations (for production)
- `build`: Build the package (depends on generate)

The build process automatically handles the dependency chain to ensure the database is ready before building.