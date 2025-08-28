import { prisma } from '@cli-mmo/db/client';
import { seedNaturalResources } from './resources';
import { createBiomeTemplateResourceRanges, createBiomeTemplates, seedBiomeTypes } from './biomes';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data to avoid constraint conflicts
  console.log('🧹 Clearing existing data...');
  await prisma.biomeTemplateResourceRange.deleteMany();
  await prisma.biomeTemplate.deleteMany();

  // Create natural resources with upsert to handle duplicates
  console.log('🌿 Seeding natural resources...');
  for (const resourceType of seedNaturalResources) {
    await prisma.naturalResource.upsert({
      where: { name: resourceType },
      update: {}, // No updates needed if it exists
      create: { name: resourceType },
    });
  }

  const resources = await prisma.naturalResource.findMany();
  console.log(`✅ Found ${resources.length} natural resources`);

  // Create biomes with upsert to handle duplicates
  console.log('🏔️ Seeding biomes...');
  for (const biomeType of seedBiomeTypes) {
    await prisma.biome.upsert({
      where: { name: biomeType },
      update: {}, // No updates needed if it exists
      create: { name: biomeType },
    });
  }

  const biomes = await prisma.biome.findMany();
  console.log(`✅ Found ${biomes.length} biomes`);

  const biomeTemplates = createBiomeTemplates(biomes);

  // Create biome templates
  console.log('🏗️ Creating biome templates...');
  for (const template of biomeTemplates) {
    await prisma.biomeTemplate.create({ data: template });
  }
  console.log(`✅ Created ${biomeTemplates.length} biome templates`);

  // Get the created biome templates from database
  const savedBiomeTemplates = await prisma.biomeTemplate.findMany();
  const biomeTemplateResourceRanges = createBiomeTemplateResourceRanges(savedBiomeTemplates, resources, biomes);

  // Create biome template resource ranges
  console.log('⚖️ Creating biome template resource ranges...');
  for (const range of biomeTemplateResourceRanges) {
    await prisma.biomeTemplateResourceRange.create({ data: range });
  }
  console.log(`✅ Created ${biomeTemplateResourceRanges.length} resource ranges`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
