import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @HttpCode(201)
  async createCollection(@Body() dto: CreateCollectionDto, @Req() req: any) {
    return this.collectionsService.createCollection(req.user.userId, dto);
  }

  @Get()
  async getCollections(@Req() req: any) {
    return this.collectionsService.getCollections(req.user.userId);
  }

  @Get(':collectionId')
  async getCollectionById(
    @Param('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.collectionsService.getCollectionById(
      req.user.userId,
      collectionId,
    );
  }

  @Patch(':collectionId')
  async updateCollection(
    @Param('collectionId') collectionId: string,
    @Body() dto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    return this.collectionsService.updateCollection(
      req.user.userId,
      collectionId,
      dto,
    );
  }

  @Delete(':collectionId')
  @HttpCode(204)
  async deleteCollection(
    @Param('collectionId') collectionId: string,
    @Req() req: any,
  ) {
    return this.collectionsService.deleteCollection(
      req.user.userId,
      collectionId,
    );
  }
}
