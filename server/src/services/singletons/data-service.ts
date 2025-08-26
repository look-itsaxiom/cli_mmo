import { PrismaClient } from '@cli-mmo/db';

export class DataService {
  private static instance: DataService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}
