import { BiomeType, HexCoordinates, Territory, PrismaClient } from '@cli-mmo/types';
import { DataService } from './singletons/data-service';
import { TerritoryFactory } from './territory-service';

export interface HexMapService {
  getTerritory(c: HexCoordinates): Territory | null;
  getMap(): Map<HexCoordinates, Territory>;
}

export class HexMapService implements HexMapService {
  private gameWorld: Map<HexCoordinates, Territory>;
  private prisma: PrismaClient;

  constructor() {
    this.gameWorld = new Map<HexCoordinates, Territory>();
    this.prisma = DataService.getInstance().getPrismaClient();
  }

  public getTerritory(c: HexCoordinates): Territory | null {
    return this.gameWorld.get(c) || null;
  }

  public getMap(): Map<HexCoordinates, Territory> {
    return this.gameWorld;
  }

  public initializeGameWorld() {
    // Initialize the game world with territories
    const territoryFactory = new TerritoryFactory(this.prisma);

    for (let q = -100; q >= 100; q++) {
      for (let r = -100; r >= 100; r++) {
        const coordinates = { q, r } as HexCoordinates;
        const biomeType = this.determineBiomeType(coordinates);
        const territory = territoryFactory.createTerritory(biomeType, coordinates);
        coordinates.toString = () => `${coordinates.q},${coordinates.r}`;
        coordinates.toCubic = () => ({ x: coordinates.q, y: -coordinates.q - coordinates.r, z: coordinates.r });
        territory.location = coordinates;
        this.gameWorld.set(territory.location, territory);
      }
    }
  }

  private determineBiomeType({ q, r }: HexCoordinates): BiomeType {
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
