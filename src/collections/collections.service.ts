import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async createCollection(userId: string, input: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        name: input.name,
        userId,
      },
    });
  }

  async getCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCollectionById(userId: string, collectionId: string) {
    return this.prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
    });
  }

  async updateCollection(
    userId: string,
    collectionId: string,
    input: UpdateCollectionDto,
  ) {
    const existing = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!existing)
      throw new NotFoundException('The selected collection could not be found');

    return this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        name: input.name,
      },
    });
  }

  async deleteCollection(userId: string, collectionId: string) {
    const existing = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!existing)
      throw new NotFoundException(
        'The selected collection could not be found.',
      );

    return this.prisma.collection.delete({
      where: { id: collectionId },
    });
  }
}
