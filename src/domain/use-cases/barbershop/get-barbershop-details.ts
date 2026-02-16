import { Either, left, right } from '@/domain/core/either'
import { BarbershopRepository } from '@/domain/repositories/barbershop-repository'
import { Barbershop } from '@/domain/entities/barbershop'
import { Injectable } from '@nestjs/common'

interface GetBarbershopDetailsUseCaseRequest {
  barbershopId: string
}

type GetBarbershopDetailsUseCaseResponse = Either<
  BarbershopNotFoundError,
  {
    barbershop: Barbershop
  }
>

export class BarbershopNotFoundError extends Error {
  constructor() {
    super('Barbearia não encontrada')
  }
}

@Injectable()
export class GetBarbershopDetailsUseCase {
  constructor(private barbershopRepository: BarbershopRepository) {}

  async execute(
    request: GetBarbershopDetailsUseCaseRequest,
  ): Promise<GetBarbershopDetailsUseCaseResponse> {
    const { barbershopId } = request

    const barbershop = await this.barbershopRepository.findById(barbershopId)

    if (!barbershop) {
      return left(new BarbershopNotFoundError())
    }

    return right({
      barbershop,
    })
  }
}
