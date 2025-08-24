import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { gameRouter } from './routes';
import { TickWorker } from './services/tick-worker';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api', gameRouter);

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// start ticker
const tickWorker = new TickWorker();
tickWorker.start();

// shutdown
process.on('SIGTERM', () => {
  server.close();
  tickWorker.stop();
});
