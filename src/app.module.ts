import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { UserActivitiesModule } from './modules/user-activities/user-activities.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ActivitiesModule,
    UserActivitiesModule,
    DashboardModule,
  ],
})
export class AppModule {}
