import { User, UserData, PrismaClient } from '@cli-mmo/types';
import { randomUUID } from 'crypto';
import { DataService } from './singletons/data-service';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DataService.getInstance().getPrismaClient();
  }

  async getAllUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async createUser(userData: UserData): Promise<boolean> {
    console.log(userData);
    try {
      const user: User = {
        id: randomUUID(),
        email: userData.email,
        name: userData.name ?? '',
        createdAt: new Date(),
        userName: userData.userName ?? '',
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
