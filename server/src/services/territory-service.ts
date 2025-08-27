import {
  BiomeType,
  HexCoordinates,
  IBiomeTemplate,
  Territory,
  TerritoryBiome,
  PrismaClient,
  TerritoryResourceRates,
  NaturalResourceType,
} from '@cli-mmo/types';

export class TerritoryFactory {
  private biomeTemplates: Map<BiomeType, IBiomeTemplate>;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.biomeTemplates = new Map<BiomeType, IBiomeTemplate>();
    this.initializeBiomeTemplates();
    this.prisma = prisma;
  }

  public createTerritory(biomeType: BiomeType, location: HexCoordinates): Territory {
    const newTerritory: Territory = {} as Territory;

    const biomeTemplate = this.biomeTemplates.get(biomeType);

    if (!biomeTemplate) {
      throw new Error(`Biome template not found for type: ${biomeType}`);
    }

    const territoryBiome = {
      type: biomeType,
      resources: this.generateResources(biomeTemplate),
    } as TerritoryBiome;

    newTerritory.biome = territoryBiome;
    newTerritory.claimed = false;
    newTerritory.currentBC = 0;
    newTerritory.maxBC =
      Math.floor(Math.random() * (biomeTemplate.bpRange[1] - biomeTemplate.bpRange[0] + 1)) + biomeTemplate.bpRange[0];
    newTerritory.location = location;
    newTerritory.id = `${location.q},${location.r}`;
    newTerritory.claimedBy = null;

    return newTerritory;
  }

  private generateResources(biomeTemplate: IBiomeTemplate): TerritoryResourceRates {
    const resourceRates: TerritoryResourceRates = {};

    // Iterate through each resource range in the biome template
    for (const [resource, range] of Object.entries(biomeTemplate.resourceRanges)) {
      const resourceName = resource as NaturalResourceType;
      const [minAmount, maxAmount] = range;
      // Generate a random amount within the specified range
      const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
      resourceRates[resourceName] = amount;
    }

    return resourceRates;
  }

  private async initializeBiomeTemplates() {
    // Initialize biome templates here
    const templates = await this.prisma.biomeTemplate.findMany();
    const biomeTypes = await this.prisma.biome.findMany();
    const resources = await this.prisma.naturalResource.findMany();

    const biomeNameLookup = new Map(biomeTypes.map((biome) => [biome.id, biome.name as BiomeType]));
    const resourceNameLookup = new Map(resources.map((resource) => [resource.id, resource.name]));

    for (const template of templates) {
      const biomeName = biomeNameLookup.get(template.biomeId) as BiomeType;
      if (biomeName) {
        const newTemplate: IBiomeTemplate = {} as IBiomeTemplate;
        newTemplate.type = biomeName;
        newTemplate.npcOwnershipRate = template.npcOwnershipRate;
        newTemplate.bpRange = [template.minBPRange, template.maxBPRange];
        for (const resource of resources) {
          const resourceRange = await this.prisma.biomeTemplateResourceRange.findUnique({
            where: { biomeTemplateId: template.id, resourceId: resource.id },
          });
          newTemplate.resourceRanges = {
            ...newTemplate.resourceRanges,
            [resourceNameLookup.get(resource.id) as keyof typeof newTemplate.resourceRanges]: [
              resourceRange?.minAmount ?? 0,
              resourceRange?.maxAmount ?? 3,
            ],
          };
        }

        this.biomeTemplates.set(biomeName, newTemplate);
      }
    }
  }
}
