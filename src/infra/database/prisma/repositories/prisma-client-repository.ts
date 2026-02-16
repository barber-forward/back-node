import { ClientRepository } from '@/domain/repositories/client-repository'
import { UniqueEntityID } from '@/domain/core/unique-entity-id'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { Client } from '@/domain/entities/client'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return null
    }

    return Client.create(
      {
        name: client.name,
        email: client.email,
        password: client.password,
        phone: client.phone ?? undefined,
        avatar: client.avatar ?? undefined,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      new UniqueEntityID(client.id),
    )
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { email },
    })

    if (!client) {
      return null
    }

    return Client.create(
      {
        name: client.name,
        email: client.email,
        password: client.password,
        phone: client.phone ?? undefined,
        avatar: client.avatar ?? undefined,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      new UniqueEntityID(client.id),
    )
  }

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({
      data: {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        password: client.password,
        phone: client.phone,
        avatar: client.avatar,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
    })
  }

  async save(client: Client): Promise<void> {
    await this.prisma.client.update({
      where: { id: client.id.toString() },
      data: {
        name: client.name,
        email: client.email,
        password: client.password,
        phone: client.phone,
        avatar: client.avatar,
        isActive: client.isActive,
        updatedAt: client.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({
      where: { id },
    })
  }
}
