import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunLogsModule } from './run-logs/run-logs.module';
import { RequestsModule } from './requests/requests.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, CollectionsModule, RequestsModule, RunLogsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
