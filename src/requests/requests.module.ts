import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { CollectionsModule } from '../collections/collections.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CookieJarModule } from '../cookiejar/cookiejar.module';
import { RunLogsModule } from '../run-logs/run-logs.module';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
  imports: [CollectionsModule, PrismaModule, CookieJarModule, RunLogsModule],
  exports: []
})
export class RequestsModule {}
