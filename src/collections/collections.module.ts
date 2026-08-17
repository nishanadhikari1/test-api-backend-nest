import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService],
  imports: [PrismaModule, AuthModule],
  exports: [CollectionsService]
})
export class CollectionsModule {}
