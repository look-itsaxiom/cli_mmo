import { BiomeType, HexCoordinates, BiomeTemplate, Territory } from '@cli-mmo/types';

export interface HexMapService {
  getTerritory(c: HexCoordinates): Territory | null;
}

class TerritoryFactory {
  private biomeTemplates: Map<BiomeType, BiomeTemplate>;

  constructor() {
    this.biomeTemplates = new Map<BiomeType, BiomeTemplate>();
    this.initializeBiomeTemplates();
  }

  public createTerritory(biomeType: BiomeType): Territory {
    const newTerritory: Territory = {} as Territory;

    const biomeTemplate = this.biomeTemplates.get(biomeType);
  }

  private initializeBiomeTemplates() {
    // Initialize biome templates here
  }
}

export class HexMapService implements HexMapService {
  private gameWorld: Map<HexCoordinates, Territory>;

  constructor() {
    this.gameWorld = new Map<HexCoordinates, Territory>();
    this.initializeGameWorld();
  }

  public getTerritory(c: HexCoordinates): Territory | null {
    return this.gameWorld.get(c) || null;
  }

  private initializeGameWorld() {
    // Initialize the game world with territories
    //
  }
}
