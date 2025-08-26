import { prisma } from '@cli-mmo/db/client';
import { PrismaClient } from '@cli-mmo/types';

export class DataService {
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
}
