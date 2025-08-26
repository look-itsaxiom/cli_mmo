import { Router } from 'express';
import { JobQueue } from '../services/singletons/job-queue';
import { JobRequest } from '@cli-mmo/shared';

const gameRouter = Router();

gameRouter.post('/job-request', async (req, res) => {
  const jobRequest: JobRequest = req.body;

  const jobQueue = JobQueue.getInstance();
  const success = await jobQueue.queueJobRequest(jobRequest);
  if (success) {
    res.status(202).send('Job request queued');
  } else {
    res.status(500).send('Failed to queue job request');
  }
});

export default gameRouter;
