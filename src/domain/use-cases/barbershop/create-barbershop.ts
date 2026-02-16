import { BackofficeUserRepository } from '@/domain/repositories/backoffice-user-repository'
import { BarbershopRepository } from '@/domain/repositories/barbershop-repository'
import { UniqueEntityID } from '@/domain/core/unique-entity-id'
import { Either, left, right } from '@/domain/core/either'
import { Barbershop } from '@/domain/entities/barbershop'
import { Injectable } from '@nestjs/common'

interface CreateBarbershopUseCaseRequest {
  name: string
  description?: string
  email?: string
  phone: string
  avatar?: string
  address: string
  city: string
  state: string
  zipCode?: string
  latitude?: number
  longitude?: number
  ownerId: string
}

export class BackofficeUserNotFoundError extends Error {
  constructor() {
    super('Usuário do backoffice não encontrado')
  }
}

export class BarbershopAlreadyExistsError extends Error {
  constructor() {
    super('Você já possui uma barbearia cadastrada')
  }
}

type CreateBarbershopUseCaseResponse = Either<
  BackofficeUserNotFoundError | BarbershopAlreadyExistsError,
  {
    barbershop: Barbershop
  }
>

@Injectable()
export class CreateBarbershopUseCase {
  constructor(
    private barbershopRepository: BarbershopRepository,
    private backofficeUserRepository: BackofficeUserRepository,
  ) {}

  async execute(
    request: CreateBarbershopUseCaseRequest,
  ): Promise<CreateBarbershopUseCaseResponse> {
    const {
      name,
      description,
      email,
      phone,
      avatar,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      ownerId,
    } = request

    const backofficeUser = await this.backofficeUserRepository.findById(ownerId)

    if (!backofficeUser) {
      return left(new BackofficeUserNotFoundError())
    }

    const existingBarbershop =
      await this.barbershopRepository.findByOwnerId(ownerId)

    if (existingBarbershop) {
      return left(new BarbershopAlreadyExistsError())
    }

    const barbershop = Barbershop.create({
      name,
      description,
      email,
      phone,
      avatar,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      ownerId: new UniqueEntityID(ownerId),
    })

    await this.barbershopRepository.create(barbershop)

    return right({
      barbershop,
    })
  }
}
