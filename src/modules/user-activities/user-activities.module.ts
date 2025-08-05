import { Module } from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { UserActivitiesController } from './user-activities.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserActivitiesService],
  controllers: [UserActivitiesController],
})
export class UserActivitiesModule {}
