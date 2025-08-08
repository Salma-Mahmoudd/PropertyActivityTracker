import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        onlineUsers: { type: 'number' },
        totalActivities: { type: 'number' },
        totalProperties: { type: 'number' },
        recentActivities: { type: 'array' },
      },
    },
  })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('leaderboard')
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' },
          score: { type: 'number' },
          activitiesCount: { type: 'number' },
        },
      },
    },
  })
  getLeaderboard() {
    return this.dashboardService.getLeaderboard();
  }
}
