import { UserRepository } from '@/domain/repositories/user-repository'
import { UniqueEntityID } from '@/domain/core/unique-entity-id'
import { UserEntity } from '@/domain/entities/user'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: UserEntity): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        password: user.passwordHash,
      },
    })
  }

  async findById(id: string): Promise<UserEntity | null> {
    const client = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!client) {
      return null
    }

    return UserEntity.create(
      {
        name: client.name,
        email: client.email,
        passwordHash: client.password,
      },
      new UniqueEntityID(client.id),
    )
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const client = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!client) {
      return null
    }

    return UserEntity.create(
      {
        name: client.name,
        email: client.email,
        passwordHash: client.password,
      },
      new UniqueEntityID(client.id),
    )
  }

  async save(client: UserEntity): Promise<void> {
    await this.prisma.user.update({
      where: { id: client.id.toString() },
      data: {
        name: client.name,
        email: client.email,
        password: client.passwordHash,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
