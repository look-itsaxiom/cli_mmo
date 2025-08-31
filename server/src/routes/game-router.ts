import { Router } from 'express';
import { JobQueue } from '../services/singletons/job-service';
import { JobRequest } from '@cli-mmo/types';
import { HexMapService } from '../services/hex-map-service';

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

gameRouter.get('/map', async (req, res) => {
  const mapService = new HexMapService();
  await mapService.initializeGameWorld();
  const gameMap = mapService.getMap();
  res.send({
    map: Array.from(gameMap.entries()).map(([coords, territory]) => ({
      coordinates: coords,
      territory,
    })),
  });
});

export default gameRouter;
