import { JobRequest } from '@cli-mmo/types';

export class JobQueue {
  private static instance: JobQueue;
  private jobReqQueue: JobRequest[];

  private constructor() {
    this.jobReqQueue = [];
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  public async queueJobRequest(jobReq: JobRequest): Promise<boolean> {
    this.jobReqQueue.push(jobReq);
    return true;
  }

  public getJobRequests(): JobRequest[] {
    return this.jobReqQueue;
  }

  public removeJobRequest(id: string): void {
    this.jobReqQueue = this.jobReqQueue.filter((job) => job.id !== id);
  }

  public stop(): void {
    this.jobReqQueue = [];
  }
}
