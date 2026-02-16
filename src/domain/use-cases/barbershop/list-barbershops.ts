import { Barbershop } from '@/domain/entities/barbershop'
import { Either, right } from '@/domain/core/either'
import { Injectable } from '@nestjs/common'
import {
  BarbershopRepository,
  FindManyBarbershopsParams,
} from '@/domain/repositories/barbershop-repository'

interface ListBarbershopsUseCaseRequest {
  city?: string
  state?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

type ListBarbershopsUseCaseResponse = Either<
  null,
  {
    barbershops: Barbershop[]
    total: number
  }
>

@Injectable()
export class ListBarbershopsUseCase {
  constructor(private barbershopRepository: BarbershopRepository) {}

  async execute(
    request: ListBarbershopsUseCaseRequest,
  ): Promise<ListBarbershopsUseCaseResponse> {
    const params: FindManyBarbershopsParams = {
      city: request.city,
      state: request.state,
      isActive: request.isActive,
      page: request.page ?? 1,
      pageSize: request.pageSize ?? 10,
    }

    const [barbershops, total] = await Promise.all([
      this.barbershopRepository.findMany(params),
      this.barbershopRepository.count({
        city: params.city,
        state: params.state,
        isActive: params.isActive,
      }),
    ])

    return right({
      barbershops,
      total,
    })
  }
}
