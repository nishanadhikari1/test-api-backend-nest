import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  @HttpCode(201)
  async createRequest(
    @Body() dto: CreateRequestDto & { collectionId: string },
    @Req() req: any,
  ) {
    return this.requestsService.createRequest(
      req.user.userId,
      dto.collectionId,
      dto,
    );
  }

  @Get()
  async getRequests(
    @Body('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.requestsService.getRequests(req.user.userId, collectionId);
  }

  @Get(':id')
  async getRequestById(
    @Param('id') id: string,
    @Body('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.requestsService.getRequestsById(req.user.userId, collectionId, id);
  }

  @Patch(':id')
  async updateRequest(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto & { collectionId: string },
    @Req() req: any,
  ) {
    return this.requestsService.updateRequest(
      req.user.userId,
      dto.collectionId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteRequest(
    @Param('id') id: string,
    @Body('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.requestsService.deleteRequest(
      req.user.userId,
      collectionId,
      id,
    );
  }

  @Post('send')
  async sendRequestPayload(
    @Body() dto: CreateRequestDto & { collectionId: string },
    @Req() req: any,
  ) {
    return this.requestsService.sendRequestPayload(
      req.user.userId,
      dto.collectionId,
      dto,
    );
  }

  @Post(':id/send')
  async sendRequest(
    @Param('id') id: string,
    @Body('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.requestsService.sendRequest(req.user.userId, collectionId, id);
  }
}
