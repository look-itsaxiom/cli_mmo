import {
  BiomeType,
  THexCoordinates,
  ITerritory,
  PrismaClient,
  Territory,
  TerritoryResourceAmount,
} from '@cli-mmo/types';
import { DataService } from './singletons/data-service';
import { TerritoryService } from './territory-service';

export interface HexMapService {
  getTerritory(c: THexCoordinates): ITerritory | null;
  getMap(): Map<THexCoordinates, ITerritory>;
}

export class HexCoordinates implements THexCoordinates {
  public q: number;
  public r: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }

  public toString(): string {
    return `Hex(${this.q}, ${this.r})`;
  }

  public toCubic(): { x: number; y: number; z: number } {
    return { x: this.q, y: -this.q - this.r, z: this.r };
  }
}

export class HexMapService implements HexMapService {
  private gameWorld: Map<HexCoordinates, ITerritory>;
  private prisma: PrismaClient;
  private territoryService: TerritoryService;

  constructor() {
    this.gameWorld = new Map<HexCoordinates, ITerritory>();
    this.prisma = DataService.getInstance().getPrismaClient();
    this.territoryService = new TerritoryService(this.prisma);
  }

  public getTerritory(c: HexCoordinates): ITerritory | null {
    return this.gameWorld.get(c) || null;
  }

  public getMap(): Map<HexCoordinates, ITerritory> {
    return this.gameWorld;
  }

  public async initializeGameWorld() {
    await this.territoryService.initializeBiomeTemplates();

    for (let q = 0; q < 100; q++) {
      for (let r = 0; r < 100; r++) {
        const coordinates = { q, r } as HexCoordinates;
        const biomeType = this.determineBiomeType(coordinates);
        const territory = this.territoryService.createTerritory(biomeType, coordinates);
        coordinates.toString = () => `${coordinates.q},${coordinates.r}`;
        coordinates.toCubic = () => ({ x: coordinates.q, y: -coordinates.q - coordinates.r, z: coordinates.r });
        territory.location = coordinates;
        this.gameWorld.set(territory.location, territory);
      }
    }
  }

  public async saveGameWorld(gameInstanceId: string) {
    const flattenedWorld = await this.flattenGameWorld(gameInstanceId);

    try {
      this.prisma.territory.createMany({
        data: flattenedWorld.map((item) => item.territory),
      });
      this.prisma.territoryResourceAmount.createMany({
        data: flattenedWorld.flatMap((item) => item.resources),
      });
    } catch (error) {
      console.error('Error saving game world:', error);
    }
  }

  public async loadGameWorld(gameInstanceId: string) {
    const territories = await this.prisma.territory.findMany({
      where: { gameInstanceId: gameInstanceId },
    });
    for (const territory of territories) {
      const { coordinates, convertedTerritory } = await this.territoryService.convertTerritoryData(territory);
      this.gameWorld.set(coordinates, convertedTerritory);
    }
  }

  private async flattenGameWorld(
    gameInstanceId: string
  ): Promise<Array<{ territory: Territory; resources: Array<TerritoryResourceAmount> }>> {
    const flattened: Array<{ territory: Territory; resources: Array<TerritoryResourceAmount> }> = [];
    this.gameWorld.forEach(async (territory) => {
      const {
        flat,
        flatResources,
      }: {
        flat: {
          id: string;
          q: number;
          r: number;
          gameInstanceId: string;
          biomeId: string;
          claimed: boolean;
          claimantId: string;
          maxBC: number;
          currentBC: number;
        };
        flatResources: { id: number; territoryId: string; resourceId: string; amount: number }[];
      } = await this.territoryService.flattenTerritoryData(territory, gameInstanceId);
      flattened.push({ territory: flat, resources: flatResources });
    });
    return flattened;
  }

  private determineBiomeType({ q, r }: THexCoordinates): BiomeType {
    if (q < 0 && r < 0) {
      return 'mountains';
    } else if (q < 0 && r >= 0) {
      return 'forest';
    } else if (q >= 0 && r < 0) {
      return 'desert';
    } else {
      return 'plains';
    }
  }
}
