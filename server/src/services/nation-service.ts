import { INation, NationId, NationResourceInventory, NaturalResource, PrismaClient, Resource } from '@cli-mmo/types';
import { DataService } from './singletons/data-service';
import { TerritoryService } from './territory-service';

export class NationService {
  private nations: Map<NationId, INation>;
  private prisma: PrismaClient;
  private territoryService: TerritoryService;

  constructor() {
    this.nations = new Map<NationId, INation>();
    this.prisma = DataService.getInstance().getPrismaClient();
    this.territoryService = new TerritoryService(this.prisma);
  }

  public async nationTick() {
    for (const nation of this.nations.values()) {
      for (const territory of nation.territories) {
        Object.keys(territory.biome.resources).forEach((resource) => {
          (nation.ownedResources as { [key in keyof NaturalResource]: { amount: number } })[
            resource as keyof NaturalResource
          ].amount += (territory.biome.resources as { [key in keyof NaturalResource]: number })[
            resource as keyof NaturalResource
          ];
        });
      }
    }
  }

  public async loadNations(gameInstanceId: string): Promise<void> {
    const { resourceNameLookup } = await this.territoryService.createResourceNameLookup();
    const nations = await this.prisma.nation.findMany({
      where: {
        gameInstanceId: gameInstanceId,
      },
    });

    nations.forEach(async (nationData) => {
      const nation: INation = {
        id: nationData.id,
        name: nationData.name,
        code: nationData.code,
      } as INation;
      const territories = await this.prisma.territory.findMany({
        where: {
          claimantId: nation.id,
        },
      });
      nation.territories = await Promise.all(
        territories.map(async (t) => (await this.territoryService.convertTerritoryData(t)).convertedTerritory)
      );
      nation.ownedResources = {} as NationResourceInventory;
      const resourceAmounts = await this.prisma.nationResourceAmount.findMany({
        where: {
          nationId: nation.id,
        },
      });
      resourceAmounts.forEach((ra) => {
        const resourceName: Resource | null = (resourceNameLookup.get(ra.resourceId) as Resource) ?? null;
        if (resourceName) {
          (nation.ownedResources as any)[resourceName as keyof Resource] = {
            amount: ra.amount,
            type: resourceName,
            resourceId: ra.resourceId,
          };
        }
      });
      this.nations.set(nationData.id, nation);
    });
  }

  public async createNation(ownerId: string, name: string, code: string, gameInstanceId: string): Promise<INation> {
    const nation = await this.prisma.nation.create({
      data: {
        name,
        code,
        ownerId: ownerId,
        gameInstanceId: gameInstanceId,
      },
    });
    return {
      id: nation.id,
      name: nation.name,
      code: nation.code,
      leader: nation.ownerId,
      territories: [],
      ownedResources: {} as NationResourceInventory,
    };
  }
}
