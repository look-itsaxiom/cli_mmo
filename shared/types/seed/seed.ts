import { prisma } from '@cli-mmo/db/client';
import { seedNaturalResources } from './resources';
import { createBiomeTemplateResourceRanges, createBiomeTemplates, seedBiomeTypes } from './biomes';

async function main() {
  await prisma.naturalResource.createMany({
    data: seedNaturalResources.map((name) => ({ name })),
  });

  const resources = await prisma.naturalResource.findMany();

  await prisma.biome.createMany({
    data: seedBiomeTypes.map((name) => ({ name })),
  });

  const biomes = await prisma.biome.findMany();

  const biomeTemplates = createBiomeTemplates(biomes);

  await prisma.biomeTemplate.createMany({
    data: biomeTemplates,
  });

  const biomeTemplateResourceRanges = createBiomeTemplateResourceRanges(biomeTemplates, resources);

  await prisma.biomeTemplateResourceRange.createMany({
    data: biomeTemplateResourceRanges,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
