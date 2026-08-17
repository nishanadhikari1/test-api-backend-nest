import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { RunLogsService } from './run-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('collections/:collectionId/requests/:requestId/run-logs')
export class RunLogsController {
  constructor(private runLogsService: RunLogsService) {}

  @Get()
  async getRunLogs(
    @Param('collectionId') collectionId: string,
    @Param('requestId') requestId: string,
    @Req() req: any,
  ) {
    return this.runLogsService.getRunLogs(req.user.userId, collectionId, requestId);
  }
}
