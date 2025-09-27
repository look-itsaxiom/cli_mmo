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
import { GameInstanceService } from './singletons/gameInstance-service';

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

  public async mapTick() {
    const gameInstanceId = GameInstanceService.getInstance().getGameInstanceId();
    await this.updateGameWorld(gameInstanceId);
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

  public async saveGameWorld(gameInstanceId: string, systemNationId?: string) {
    const flattenedWorld = await this.flattenGameWorld(gameInstanceId, systemNationId);

    try {
      // Use transaction to ensure atomicity
      await this.prisma.$transaction(async (tx: any) => {
        await tx.territory.createMany({
          data: flattenedWorld.map((item) => item.territory),
        });
        await tx.territoryResourceAmount.createMany({
          data: flattenedWorld.flatMap((item) => item.resources),
        });
      });
    } catch (error) {
      console.error('Error saving game world:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  public async updateGameWorld(gameInstanceId: string) {
    const flattenedWorld = await this.flattenGameWorld(gameInstanceId);

    try {
      // Use a transaction to ensure all updates happen atomically
      await this.prisma.$transaction(async (tx: any) => {
        // Process territories sequentially to avoid concurrency issues
        for (const hex of flattenedWorld) {
          await tx.territory.update({
            where: { id: hex.territory.id },
            data: hex.territory,
          });
          
          // Update resources for this territory
          for (const resource of hex.resources) {
            await tx.territoryResourceAmount.upsert({
              where: {
                territoryId_resourceId: {
                  territoryId: resource.territoryId,
                  resourceId: resource.resourceId,
                }
              },
              update: {
                amount: resource.amount,
              },
              create: resource,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error updating game world:', error);
      throw error; // Re-throw to allow caller to handle
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
    gameInstanceId: string,
    systemNationId?: string
  ): Promise<Array<{ territory: Territory; resources: Array<TerritoryResourceAmount> }>> {
    // Pre-fetch lookups once to avoid repeated database calls
    const { biomeIdLookup } = await this.territoryService.createBiomeNameLookups();
    const { resourceIdLookup } = await this.territoryService.createResourceNameLookup();
    
    const flattened: Array<{ territory: Territory; resources: Array<TerritoryResourceAmount> }> = [];
    
    // Process territories efficiently
    for (const [, territory] of this.gameWorld) {
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
        // Use systemNationId for unclaimed territories, or the actual claimedBy if claimed
        claimantId: territory.claimedBy || systemNationId || 'system-nation-' + gameInstanceId,
      };
      
      // Generate resources efficiently without extra async calls
      // Let database handle ID with autoincrement
      const flatResources: Array<TerritoryResourceAmount> = Object.keys(territory.biome.resources).map((resourceName) => ({
        territoryId: territory.id,
        resourceId: resourceIdLookup.get(resourceName) ?? 'Unknown Resource',
        amount: territory.biome.resources[resourceName as keyof typeof territory.biome.resources] || 0,
      } as any)); // Casting as any since we're omitting the id field intentionally
      
      flattened.push({ territory: flat, resources: flatResources });
    }
    
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
