import { DataService } from './data-service';
import { GameInstanceService } from './gameInstance-service';
import { JobQueue } from './job-service';

export interface SingletonService {
  stop(): void;
}

export function startSingletonServices(): void {
  DataService.getInstance();
  JobQueue.getInstance();
  GameInstanceService.getInstance();
}

export function endSingletonServices(): void {
  JobQueue.getInstance().stop();
  GameInstanceService.getInstance().stop();
  DataService.getInstance().stop();
}
