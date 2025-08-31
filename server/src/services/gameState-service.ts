import EventEmitter from 'node:events';
import { HexMapService } from './hex-map-service';
import { NationService } from './nation-service';

export class GameStateService extends EventEmitter {
  private gameInstanceId: string;
  private worldMap: HexMapService;
  private nations: NationService;
  private intervalId?: NodeJS.Timeout;
  private tickNumber = 0;

  constructor(gameInstanceId: string) {
    super();
    this.gameInstanceId = gameInstanceId;
    this.worldMap = new HexMapService();
    this.nations = new NationService();
  }

  public async createGameWorld(): Promise<void> {
    await this.worldMap.initializeGameWorld();
    await this.worldMap.saveGameWorld(this.gameInstanceId);
  }

  public async loadGameWorld(): Promise<void> {
    await this.worldMap.loadGameWorld(this.gameInstanceId);
    await this.nations.loadNations(this.gameInstanceId);
  }

  public start(): void {
    console.log(`Starting game instance: ${this.gameInstanceId}`);
    // Initialize game state and start game loop
    this.registerListeners();
    this.intervalId = setInterval(() => this.gameLoop(), 30000); // 30 seconds per tick to start out
  }

  public stop(): void {
    console.log(`Stopping game instance: ${this.gameInstanceId}`);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private registerListeners(): void {
    this.on('tick', this.logTick.bind(this));
    this.on('tick', this.nations.nationTick.bind(this.nations));
  }

  private logTick(tickNumber: number): void {
    console.log(`Game tick: ${tickNumber}`);
  }

  private async gameLoop(): Promise<void> {
    this.tickNumber++;
    this.emit('tick', this.tickNumber);
  }
}
