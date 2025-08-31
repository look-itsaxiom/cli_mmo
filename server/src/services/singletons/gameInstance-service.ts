import { SingletonService } from '.';
import { env } from '../../env';
import { GameStateService } from '../gameState-service';
import { DataService } from './data-service';

export class GameInstanceService implements SingletonService {
  private static instance: GameInstanceService;
  private gameInstanceId: string;
  private gameMaster!: GameStateService;

  private constructor() {
    this.gameInstanceId = env.GAME_INSTANCE_ID;
    this.initializeGameInstance();
  }

  public static getInstance(): GameInstanceService {
    if (!GameInstanceService.instance) {
      GameInstanceService.instance = new GameInstanceService();
    }
    return GameInstanceService.instance;
  }

  public getGameInstanceId(): string {
    return this.gameInstanceId;
  }

  public async initializeGameInstance(): Promise<void> {
    const prisma = DataService.getInstance().getPrismaClient();
    this.gameMaster = new GameStateService(this.gameInstanceId);
    const isExistingGI = await prisma.gameInstance.findFirst({
      where: {
        id: this.gameInstanceId,
      },
    });

    if (!isExistingGI) {
      await prisma.gameInstance.create({
        data: {
          id: this.gameInstanceId,
        },
      });
      await this.gameMaster.createGameWorld();
    } else {
      await this.gameMaster.loadGameWorld();
    }

    this.gameMaster.start();
  }

  public stop(): void {
    // Clean up resources if needed
    this.gameMaster.stop();
  }
}
