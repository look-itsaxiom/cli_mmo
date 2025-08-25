import { UserData } from '@cli-mmo/shared';
import { randomUUID } from 'crypto';
import { prisma } from '@cli-mmo/db';
import { User, PrismaClient } from '@cli-mmo/db';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(userData: UserData): Promise<boolean> {
    try {
      const user: User = {
        id: (await this.prisma.user.count()) + 1,
        email: userData.email,
        name: userData.name ?? '',
        createdAt: new Date(Date.UTC(Date.now())),
        userName: userData.userName ?? '',
        nationId: randomUUID(),
      };
      await this.prisma.user.create({
        data: user,
      });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }
}
