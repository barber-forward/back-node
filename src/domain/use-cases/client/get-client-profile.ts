import { Either, left, right } from '@/domain/core/either'
import { ClientRepository } from '@/domain/repositories/client-repository'
import { Client } from '@/domain/entities/client'
import { Injectable } from '@nestjs/common'

interface GetClientProfileUseCaseRequest {
  clientId: string
}

type GetClientProfileUseCaseResponse = Either<
  ClientNotFoundError,
  {
    client: Client
  }
>

export class ClientNotFoundError extends Error {
  constructor() {
    super('Cliente não encontrado')
  }
}

@Injectable()
export class GetClientProfileUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    request: GetClientProfileUseCaseRequest,
  ): Promise<GetClientProfileUseCaseResponse> {
    const { clientId } = request

    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      return left(new ClientNotFoundError())
    }

    return right({
      client,
    })
  }
}
