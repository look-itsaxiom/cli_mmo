import { JobQueue } from './singletons/job-queue';
import { ActionTier } from '@cli-mmo/types';

export class GameEngine {
  //private db: PrismaClient;
  private jobQueue: JobQueue;

  constructor() {
    //this.db = new PrismaClient();
    this.jobQueue = JobQueue.getInstance();
  }

  async processTick(tickNumber: number): Promise<void> {
    console.log(`Processing game logic for tick ${tickNumber}`);
    // log in game time for now, each tick is 30 minutes in game
    const inGameTime = new Date(Date.now() + tickNumber * 30 * 60 * 1000);
    console.log(`In-game time for tick ${tickNumber}: ${inGameTime.toISOString()}`);

    // evaluate job-requests created since last tick
    const jobRequests = this.jobQueue.getJobRequests();
    // resolve info job-requests and queue responses
    for (const jobReq of jobRequests) {
      if (jobReq.actionType === ActionTier.INFO) {
        // process info job request
        console.log(`Processing INFO job request with id ${jobReq.id}`);
        // after processing, remove from queue
        console.log(`INFO job request with id ${jobReq.id} has been processed`);
        this.jobQueue.removeJobRequest(jobReq.id);
      }
    }
    // create new jobs from order type job-requests and place them in process
    // sort in process jobs by Action Tier weight
    // iterate in process jobs one cycle of their specific type
    // ex. distance based action continues its movement one hex then checks if it has reached its destination
    // ex. timer based action checks if the timer has expired and triggers the next action
    // resolve jobs that have reached completion and queue responses
    // end tick processing

    await this.logTick(tickNumber);
  }

  private async logTick(tickNumber: number): Promise<void> {
    console.log({
      data: {
        tick: tickNumber,
        nationId: null,
        type: 'TICK_COMPLETE',
        details: { serverTime: new Date().toISOString() },
      },
    });
    // await this.db.eventLog.create({
    //   data: {
    //     tick: tickNumber,
    //     nationId: null,
    //     type: 'TICK_COMPLETE',
    //     details: { serverTime: new Date().toISOString() },
    //   },
    // });
  }
}
