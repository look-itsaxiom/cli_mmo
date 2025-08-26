import { DataService } from './data-service';
import { JobQueue } from './job-queue';

export function startSingletonServices(): void {
  DataService.getInstance();
  JobQueue.getInstance();
}

export function endSingletonServices(): void {
  JobQueue.getInstance().stop();
}
