import { EventEmitter } from 'events';
import { GameEngine } from './game-engine';

export class TickWorker extends EventEmitter {
  private intervalId?: NodeJS.Timeout;
  private tickNumber = 0;
  private gameEngine: GameEngine;

  constructor() {
    super();
    this.gameEngine = new GameEngine();
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
      this.emit('tick', this.tickNumber);

      const duration = Date.now() - startTime;
      console.log(`Tick ${this.tickNumber} processed in ${duration}ms`);
    } catch (error) {
      console.error(`Error processing tick ${this.tickNumber}:`, error);
    }
  }
}
