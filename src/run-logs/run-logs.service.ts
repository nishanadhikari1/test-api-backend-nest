import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RunLogsService {
  constructor(private prisma: PrismaService) {}

  async getRunLogs(userId: string, collectionId: string, requestId: string) {
    // Verify collection ownership
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const request = await this.prisma.request.findFirst({
      where: { id: requestId, collectionId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return this.prisma.runLog.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRunLog(
    requestId: string,
    data: {
      statusCode?: number;
      responseTimeMs?: number;
      responseHeaders?: Prisma.InputJsonValue;
      responseBody?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.runLog.create({
      data: {
        requestId,
        statusCode: data.statusCode,
        responseTimeMs: data.responseTimeMs,
        responseHeaders: data.responseHeaders,
        responseBody: data.responseBody,
      },
    });
  }
}
