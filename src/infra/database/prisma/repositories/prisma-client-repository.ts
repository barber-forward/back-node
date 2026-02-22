import { ClientRepository } from '@/domain/repositories/client-repository'
import { UniqueEntityID } from '@/core/unique-entity-id'
import { ClientEntity } from '@/domain/entities/client'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private prisma: PrismaService) {}

  async create(client: ClientEntity): Promise<void> {
    await this.prisma.client.create({
      data: {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        password: client.passwordHash,
      },
    })
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return null
    }

    return ClientEntity.create(
      {
        name: client.name,
        email: client.email,
        passwordHash: client.password,
      },
      new UniqueEntityID(client.id),
    )
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({
      where: { email },
    })

    if (!client) {
      return null
    }

    return ClientEntity.create(
      {
        name: client.name,
        email: client.email,
        passwordHash: client.password,
      },
      new UniqueEntityID(client.id),
    )
  }

  async save(client: ClientEntity): Promise<void> {
    await this.prisma.client.update({
      where: { id: client.id.toString() },
      data: {
        name: client.name,
        email: client.email,
        password: client.passwordHash,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({
      where: { id },
    })
  }
}
