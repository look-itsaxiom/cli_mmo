import { Biome, BiomeTemplate, BiomeTemplateResourceRange, NaturalResource } from '@cli-mmo/db/types';
import { BiomeType, NaturalResourceType } from '../src/game';

export const seedBiomeTypes: BiomeType[] = ['forest', 'desert', 'plains', 'mountains', 'desert'];

const minBPRange = {
  forest: 2,
  desert: 3,
  plains: 5,
  mountains: 4,
} as { [key in BiomeType]: number };

const maxBPRange = {
  forest: 4,
  desert: 5,
  plains: 7,
  mountains: 6,
} as { [key in BiomeType]: number };

const npcOwnershipRate = {
  forest: 0.1,
  desert: 0.2,
  plains: 0.3,
  mountains: 0.4,
} as { [key in BiomeType]: number };

export const createBiomeTemplates = (biomes: Biome[]): BiomeTemplate[] => {
  return biomes.map((biome) => ({
    id: `${biome.name}-template`,
    biomeId: biome.id,
    minBPRange: minBPRange[biome.name],
    maxBPRange: maxBPRange[biome.name],
    npcOwnershipRate: npcOwnershipRate[biome.name],
  }));
};

const biomeTemplateResources = {
  forest: {
    wood: { min: 5, max: 10 },
    stone: { min: 2, max: 5 },
    iron: { min: 1, max: 3 },
    food: { min: 3, max: 7 },
    etherium: { min: 0, max: 2 },
    mythril: { min: 0, max: 1 },
  },
  desert: {
    wood: { min: 0, max: 1 },
    stone: { min: 5, max: 10 },
    iron: { min: 3, max: 6 },
    food: { min: 1, max: 3 },
    etherium: { min: 2, max: 5 },
    mythril: { min: 0, max: 2 },
  },
  plains: {
    wood: { min: 2, max: 5 },
    stone: { min: 3, max: 6 },
    iron: { min: 2, max: 4 },
    food: { min: 5, max: 10 },
    etherium: { min: 1, max: 3 },
    mythril: { min: 0, max: 1 },
  },
  mountains: {
    wood: { min: 1, max: 3 },
    stone: { min: 10, max: 20 },
    iron: { min: 5, max: 10 },
    food: { min: 1, max: 3 },
    etherium: { min: 3, max: 6 },
    mythril: { min: 2, max: 5 },
  },
  hills: {
    wood: { min: 3, max: 6 },
    stone: { min: 6, max: 12 },
    iron: { min: 3, max: 7 },
    food: { min: 2, max: 5 },
    etherium: { min: 1, max: 4 },
    mythril: { min: 1, max: 3 },
  },
  wetland: {
    wood: { min: 4, max: 8 },
    stone: { min: 1, max: 3 },
    iron: { min: 2, max: 4 },
    food: { min: 6, max: 12 },
    etherium: { min: 2, max: 5 },
    mythril: { min: 0, max: 2 },
  },
  wildlands: {
    wood: { min: 3, max: 8 },
    stone: { min: 3, max: 8 },
    iron: { min: 3, max: 8 },
    food: { min: 3, max: 8 },
    etherium: { min: 3, max: 8 },
    mythril: { min: 1, max: 4 },
  },
} as { [key in BiomeType]: { [key in NaturalResourceType]: { min: number; max: number } } };

export const createBiomeTemplateResourceRanges = (
  biomeTemplates: BiomeTemplate[],
  resources: NaturalResource[]
): BiomeTemplateResourceRange[] => {
  const resourceRanges: BiomeTemplateResourceRange[] = [];
  for (const biomeTemplate of biomeTemplates) {
    for (const resource of resources) {
      resourceRanges.push({
        id: `${biomeTemplate.id}-resource-${resource.id}`,
        biomeTemplateId: biomeTemplate.id,
        resourceId: resource.id,
        minAmount: biomeTemplateResources[resource.name]?.min ?? 0,
        maxAmount: biomeTemplateResources[resource.name]?.max ?? 3,
      });
    }
  }
  return resourceRanges;
};
