import { prisma } from '@cli-mmo/db/client';
import { PrismaClient } from '@cli-mmo/types';
import { SingletonService } from '.';

export class DataService implements SingletonService {
  private static instance: DataService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = prisma;
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

  public stop(): void {
    this.prisma.$disconnect();
  }
}
