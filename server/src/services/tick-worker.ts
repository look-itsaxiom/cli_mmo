import { EventEmitter } from 'events';
import { GameEngine } from './game-engine';
import { UserService } from './user-service';

export class TickWorker extends EventEmitter {
  private intervalId?: NodeJS.Timeout;
  private tickNumber = 0;
  private gameEngine: GameEngine;
  private userService: UserService;

  constructor() {
    super();
    this.gameEngine = new GameEngine();
    this.userService = new UserService();
  }

  start() {
    console.log('TickWorker started');
    this.intervalId = setInterval(() => {
      this.processTick();
    }, 5000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('TickWorker stopped');
    }
  }

  private async processTick(): Promise<void> {
    this.tickNumber++;
    const startTime = Date.now();

    try {
      await this.gameEngine.processTick(this.tickNumber);
      console.log(await this.userService.getAllUsers());
      this.emit('tick', this.tickNumber);

      const duration = Date.now() - startTime;
      console.log(`Tick ${this.tickNumber} processed in ${duration}ms`);
    } catch (error) {
      console.error(`Error processing tick ${this.tickNumber}:`, error);
    }
  }
}
