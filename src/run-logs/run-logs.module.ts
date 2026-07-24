import { Module } from '@nestjs/common';
import { RunLogsController } from './run-logs.controller';
import { RunLogsService } from './run-logs.service';

@Module({
  controllers: [RunLogsController],
  providers: [RunLogsService]
})
export class RunLogsModule {}
