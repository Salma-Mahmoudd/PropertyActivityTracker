import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserActivitiesService } from './user-activities.service';
import { UserActivitiesController } from './user-activities.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ActivitiesGateway } from './activities.gateway';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [UserActivitiesService, ActivitiesGateway],
  controllers: [UserActivitiesController],
  exports: [ActivitiesGateway],
})
export class UserActivitiesModule {}
