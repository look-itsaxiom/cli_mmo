import gameRouter from './game-router';
import userRouter from './user-router';
import { Express } from 'express';

function buildRoutes(app: Express): void {
  app.use('/api', gameRouter);
  app.use('/api', userRouter);
}

export { buildRoutes };
