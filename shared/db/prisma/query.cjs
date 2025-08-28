const repl = require('repl');
const { PrismaClient } = require('./generatedClient/client.js');

// Create a Prisma client instance
const prisma = new PrismaClient();

console.log('🎯 Prisma REPL loaded! Available commands:');
console.log('  • await prisma.user.findMany()');
console.log('  • await prisma.biome.findFirst()');
console.log('  • await prisma.naturalResource.count()');
console.log('  • await prisma.$queryRaw`SELECT * FROM "User" LIMIT 5`');
console.log('  • .exit to quit\n');

const replServer = repl.start({
  prompt: 'prisma> ',
  input: process.stdin,
  output: process.stdout,
});

// Add variables to the REPL context
replServer.context.prisma = prisma;
replServer.context.PrismaClient = PrismaClient;
