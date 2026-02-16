import { ClientRepository } from '@/domain/repositories/client-repository'
import { Either, left, right } from '@/domain/core/either'
import { Client } from '@/domain/entities/client'
import { Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'

interface RegisterClientUseCaseRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export class ClientAlreadyExistsError extends Error {
  constructor() {
    super('Cliente com esse e-mail já existe')
  }
}

type RegisterClientUseCaseResponse = Either<
  ClientAlreadyExistsError,
  {
    client: Client
  }
>

@Injectable()
export class RegisterClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    request: RegisterClientUseCaseRequest,
  ): Promise<RegisterClientUseCaseResponse> {
    const { name, email, password, phone } = request

    const clientWithSameEmail = await this.clientRepository.findByEmail(email)

    if (clientWithSameEmail) {
      return left(new ClientAlreadyExistsError())
    }

    const hashedPassword = await hash(password, 8)

    const client = Client.create({
      name,
      email,
      password: hashedPassword,
      phone,
    })

    await this.clientRepository.create(client)

    return right({
      client,
    })
  }
}
