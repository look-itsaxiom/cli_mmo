export type * from '../generated/prisma/index.d.ts'; // import types for side effects
export { prisma } from './client.js'; // exports instance of prisma

// Re-export commonly used types for convenience
export type { User, UserCreateInput, UserUpdateInput, UserWhereInput, UserWhereUniqueInput, PrismaClient } from '../generated/prisma/index.d.ts';
