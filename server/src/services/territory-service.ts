import {
  BiomeType,
  THexCoordinates,
  IBiomeTemplate,
  ITerritory,
  TerritoryBiome,
  PrismaClient,
  TerritoryResourceRates,
  NaturalResourceType,
  TerritoryResourceAmount,
  Territory,
} from '@cli-mmo/types';
import { HexCoordinates } from './hex-map-service';

export class TerritoryService {
  private biomeTemplates: Map<BiomeType, IBiomeTemplate>;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.biomeTemplates = new Map<BiomeType, IBiomeTemplate>();
    this.prisma = prisma;
  }

  public createTerritory(biomeType: BiomeType, location: THexCoordinates): ITerritory {
    const newTerritory: ITerritory = {} as ITerritory;

    const biomeTemplate = this.biomeTemplates.get(biomeType as BiomeType);

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

  public async initializeBiomeTemplates() {
    // Initialize biome templates here
    const templates = await this.prisma.biomeTemplate.findMany();
    const { biomeNameLookup } = await this.createBiomeNameLookups();
    const { resourceNameLookup } = await this.createResourceNameLookup();

    for (const template of templates) {
      const biomeName = biomeNameLookup.get(template.biomeId) as BiomeType;
      if (biomeName) {
        const newTemplate: IBiomeTemplate = {} as IBiomeTemplate;
        newTemplate.type = biomeName;
        newTemplate.npcOwnershipRate = template.npcOwnershipRate;
        newTemplate.bpRange = [template.minBPRange, template.maxBPRange];
        const resourceRanges = await this.prisma.biomeTemplateResourceRange.findMany({
          where: { biomeTemplateId: template.id },
        });
        for (const resourceRange of resourceRanges) {
          newTemplate.resourceRanges = {
            ...newTemplate.resourceRanges,
            [resourceNameLookup.get(resourceRange.resourceId) as keyof typeof newTemplate.resourceRanges]: [
              resourceRange?.minAmount ?? 0,
              resourceRange?.maxAmount ?? 3,
            ],
          };
        }

        this.biomeTemplates.set(biomeName, newTemplate);
      }
    }
  }

  public async convertTerritoryData(territory: Territory) {
    const { biomeNameLookup } = await this.createBiomeNameLookups();
    const { resourceNameLookup } = await this.createResourceNameLookup();

    const coordinates = new HexCoordinates(territory.q, territory.r);
    const convertedTerritory = {} as ITerritory;
    convertedTerritory.id = territory.id;
    convertedTerritory.biome = {
      type: biomeNameLookup.get(territory.biomeId) as BiomeType,
      resources: await this.getTerritoryResources(territory.id, resourceNameLookup),
    };
    convertedTerritory.location = coordinates;
    convertedTerritory.claimed = territory.claimed;
    convertedTerritory.claimedBy = territory.claimantId === 'null' ? null : (territory.claimantId as string);
    convertedTerritory.maxBC = territory.maxBC;
    convertedTerritory.currentBC = territory.currentBC;
    convertedTerritory.claims = [];

    return { coordinates, convertedTerritory };
  }

  public async getTerritoryResources(
    territoryId: string,
    resourceNameLookup: Map<string, string>
  ): Promise<TerritoryResourceRates> {
    const resources = await this.prisma.territoryResourceAmount.findMany({
      where: { territoryId: territoryId },
    });

    return resources.reduce(
      (resourcesObj, resource) => ({
        ...resourcesObj,
        [resourceNameLookup.get(resource.resourceId) as keyof typeof resourcesObj]: resource.amount,
      }),
      {}
    );
  }

  public async flattenTerritoryData(territory: ITerritory, gameInstanceId: string) {
    const { biomeIdLookup } = await this.createBiomeNameLookups();
    const { resourceIdLookup } = await this.createResourceNameLookup();

    const { biome, location } = territory;
    const flat: Territory = {
      id: territory.id,
      biomeId: biomeIdLookup.get(biome.type) ?? 'Unknown Biome',
      q: location.q,
      r: location.r,
      gameInstanceId: gameInstanceId,
      maxBC: territory.maxBC,
      currentBC: territory.currentBC,
      claimed: territory.claimed,
      claimantId: territory.claimedBy ?? 'null',
    };
    const flatResources: TerritoryResourceAmount[] = await Promise.all(
      Object.keys(territory.biome.resources).map(async (resourceName) => ({
        id: (await this.prisma.territoryResourceAmount.count()) + 1,
        territoryId: territory.id,
        resourceId: resourceIdLookup.get(resourceName) ?? 'Unknown Resource',
        amount: territory.biome.resources[resourceName as keyof typeof territory.biome.resources] || 0,
      }))
    );
    return { flat, flatResources };
  }

  public async createBiomeNameLookups() {
    const biomeTypes = await this.prisma.biome.findMany();

    const biomeNameLookup = new Map(biomeTypes.map((biome) => [biome.id, biome.name as BiomeType]));
    const biomeIdLookup = new Map(biomeTypes.map((biome) => [biome.name as BiomeType, biome.id]));
    return { biomeNameLookup, biomeIdLookup };
  }

  public async createResourceNameLookup() {
    const resources = await this.prisma.naturalResource.findMany();
    const resourceNameLookup = new Map(resources.map((resource) => [resource.id, resource.name]));
    const resourceIdLookup = new Map(resources.map((resource) => [resource.name, resource.id]));
    return { resourceNameLookup, resourceIdLookup };
  }
}
