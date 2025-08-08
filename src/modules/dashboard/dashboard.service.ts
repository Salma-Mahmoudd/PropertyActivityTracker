// Create new service: src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      onlineUsers,
      totalActivities,
      totalProperties,
      recentActivities,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ONLINE } }),
      this.prisma.userActivity.count(),
      this.prisma.property.count(),
      this.prisma.userActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          property: { select: { name: true, address: true } },
          activity: { select: { name: true, icon: true } },
        },
      }),
    ]);

    return {
      totalUsers,
      onlineUsers,
      totalActivities,
      totalProperties,
      recentActivities,
    };
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      where: { role: 'SALES_REP' },
      select: {
        id: true,
        name: true,
        email: true,
        score: true,
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { score: 'desc' },
      take: 20,
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      score: user.score,
      activitiesCount: user._count.activities,
    }));
  }
}
