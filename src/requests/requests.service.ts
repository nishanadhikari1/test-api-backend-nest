import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CollectionsService } from '../collections/collections.service';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CookieJarService } from '../cookiejar/cookiejar.service';
import { RunLogsService } from '../run-logs/run-logs.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private collection: CollectionsService,
    private cookieJar: CookieJarService,
    private runLogs: RunLogsService,
  ) {}

  private async getOwnedCollection(userId: string, collectionId: string) {
    const ownedCollection = await this.collection.getCollectionById(
      userId,
      collectionId,
    );
    if (!ownedCollection) {
      throw new NotFoundException('The selected collection could not be found');
    }
    return ownedCollection;
  }

  async createRequest(
    userId: string,
    collectionId: string,
    input: CreateRequestDto,
  ) {
    await this.getOwnedCollection(userId, collectionId);
    return this.prisma.request.create({
      data: {
        name: input.name,
        method: input.method,
        url: input.url,
        headers: input.headers,
        body: input.body,
        collectionId,
      },
    });
  }

  async getRequests(userId: string, collectionId: string) {
    await this.getOwnedCollection(userId, collectionId);
    return this.prisma.request.findMany({ where: { collectionId } });
  }

  async getRequestsById(
    userId: string,
    collectionId: string,
    requestId: string,
  ) {
    await this.getOwnedCollection(userId, collectionId);
    return this.prisma.request.findFirst({
      where: { collectionId, id: requestId },
    });
  }
  async updateRequest(
    userId: string,
    collectionId: string,
    requestId: string,
    input: UpdateRequestDto,
  ) {
    await this.getOwnedCollection(userId, collectionId);
    const existing = await this.prisma.request.findFirst({
      where: { id: requestId, collectionId },
    });
    if (!existing) {
      throw new NotFoundException('Request not found');
    }
    return this.prisma.request.update({
      where: { id: requestId },
      data: {
        name: input.name,
        method: input.method,
        url: input.url,
        headers: input.headers,
        body: input.body,
        collectionId,
      },
    });
  }

  async deleteRequest(userId: string, collectionId: string, requestId: string) {
    await this.getOwnedCollection(userId, collectionId);
    const existing = await this.prisma.request.findFirst({
      where: { id: requestId, collectionId },
    });
    if (!existing) throw new NotFoundException('Request not found');
    return this.prisma.request.delete({ where: { id: requestId } });
  }

  async sendRequestPayload(userId: string, collectionId: string, input: CreateRequestDto) {
    await this.getOwnedCollection(userId, collectionId);

    const jarCookieHeader = await this.cookieJar.getCookieHeaderForUrl(userId, input.url);
    const outgoingHeaders: Record<string, string> = { ...(input.headers as Record<string, string> | undefined) };
    if (jarCookieHeader) {
      outgoingHeaders['Cookie'] = outgoingHeaders['Cookie']
        ? `${outgoingHeaders['Cookie']}; ${jarCookieHeader}`
        : jarCookieHeader;
    }

    const startTime = Date.now();
    try {
      const response = await fetch(input.url, {
        method: input.method,
        headers: outgoingHeaders,
        body: input.body !== undefined
          ? (typeof input.body === "string" ? input.body : JSON.stringify(input.body))
          : undefined,
      });

      const responseTimeMs = Date.now() - startTime;
      await this.cookieJar.persistCookiesFromResponse(userId, input.url, response.headers);
      const responseHeaders = Object.fromEntries(response.headers.entries());

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text().catch(() => null);
      }

      return {
        statusCode: response.status,
        responseTimeMs,
        responseHeaders: responseHeaders as Prisma.InputJsonValue,
        responseBody: responseBody as Prisma.InputJsonValue,
      };
    } catch (err) {
      return {
        statusCode: undefined,
        responseTimeMs: Date.now() - startTime,
        responseHeaders: undefined,
        responseBody: { error: (err as Error).message },
      };
    }
  }

  async sendRequest(userId: string, collectionId: string, requestId: string) {
    await this.getOwnedCollection(userId, collectionId);

    const request = await this.prisma.request.findFirst({ where: { id: requestId, collectionId } });
    if (!request) throw new NotFoundException('The selected request could not be found.');

    const jarCookieHeader = await this.cookieJar.getCookieHeaderForUrl(userId, request.url);
    const outgoingHeaders: Record<string, string> = { ...(request.headers as Record<string, string> | null ?? {}) };
    if (jarCookieHeader) {
      outgoingHeaders['Cookie'] = outgoingHeaders['Cookie']
        ? `${outgoingHeaders['Cookie']}; ${jarCookieHeader}`
        : jarCookieHeader;
    }

    const startTime = Date.now();
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: outgoingHeaders,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      const responseTimeMs = Date.now() - startTime;
      await this.cookieJar.persistCookiesFromResponse(userId, request.url, response.headers);
      const responseHeaders = Object.fromEntries(response.headers.entries());

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text().catch(() => null);
      }

      return await this.runLogs.createRunLog(requestId, {
        statusCode: response.status,
        responseTimeMs,
        responseHeaders: responseHeaders as Prisma.InputJsonValue,
        responseBody: responseBody as Prisma.InputJsonValue,
      });
    } catch (err) {
      return await this.runLogs.createRunLog(requestId, {
        statusCode: undefined,
        responseTimeMs: Date.now() - startTime,
        responseHeaders: undefined,
        responseBody: { error: (err as Error).message },
      });
    }
  }
}
