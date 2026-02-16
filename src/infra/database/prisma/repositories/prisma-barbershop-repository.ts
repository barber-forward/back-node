import { UniqueEntityID } from '@/domain/core/unique-entity-id'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { Barbershop } from '@/domain/entities/barbershop'
import { Injectable } from '@nestjs/common'
import {
  BarbershopRepository,
  FindManyBarbershopsParams,
} from '@/domain/repositories/barbershop-repository'

@Injectable()
export class PrismaBarbershopRepository implements BarbershopRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Barbershop | null> {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    })

    if (!barbershop) {
      return null
    }

    return this.toDomain(barbershop)
  }

  async findByOwnerId(ownerId: string): Promise<Barbershop | null> {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { ownerId },
    })

    if (!barbershop) {
      return null
    }

    return this.toDomain(barbershop)
  }

  async findMany(params: FindManyBarbershopsParams): Promise<Barbershop[]> {
    const { city, state, isActive, page = 1, pageSize = 10 } = params

    const where: any = {}
    if (city) where.city = city
    if (state) where.state = state
    if (isActive !== undefined) where.isActive = isActive

    const barbershops = await this.prisma.barbershop.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return barbershops.map(this.toDomain)
  }

  async count(
    params: Omit<FindManyBarbershopsParams, 'page' | 'pageSize'>,
  ): Promise<number> {
    const { city, state, isActive } = params

    const where: any = {}
    if (city) where.city = city
    if (state) where.state = state
    if (isActive !== undefined) where.isActive = isActive

    return this.prisma.barbershop.count({ where })
  }

  async create(barbershop: Barbershop): Promise<void> {
    await this.prisma.barbershop.create({
      data: {
        id: barbershop.id.toString(),
        name: barbershop.name,
        description: barbershop.description,
        email: barbershop.email,
        phone: barbershop.phone,
        avatar: barbershop.avatar,
        address: barbershop.address,
        city: barbershop.city,
        state: barbershop.state,
        zipCode: barbershop.zipCode,
        latitude: barbershop.latitude,
        longitude: barbershop.longitude,
        isActive: barbershop.isActive,
        ownerId: barbershop.ownerId.toString(),
        createdAt: barbershop.createdAt,
        updatedAt: barbershop.updatedAt,
      },
    })
  }

  async save(barbershop: Barbershop): Promise<void> {
    await this.prisma.barbershop.update({
      where: { id: barbershop.id.toString() },
      data: {
        name: barbershop.name,
        description: barbershop.description,
        email: barbershop.email,
        phone: barbershop.phone,
        avatar: barbershop.avatar,
        address: barbershop.address,
        city: barbershop.city,
        state: barbershop.state,
        zipCode: barbershop.zipCode,
        latitude: barbershop.latitude,
        longitude: barbershop.longitude,
        isActive: barbershop.isActive,
        updatedAt: barbershop.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.barbershop.delete({
      where: { id },
    })
  }

  private toDomain(raw: any): Barbershop {
    return Barbershop.create(
      {
        name: raw.name,
        description: raw.description ?? undefined,
        email: raw.email ?? undefined,
        phone: raw.phone,
        avatar: raw.avatar ?? undefined,
        address: raw.address,
        city: raw.city,
        state: raw.state,
        zipCode: raw.zipCode ?? undefined,
        latitude: raw.latitude ?? undefined,
        longitude: raw.longitude ?? undefined,
        isActive: raw.isActive,
        ownerId: new UniqueEntityID(raw.ownerId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
