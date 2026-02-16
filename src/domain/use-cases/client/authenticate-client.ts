import { Either, left, right } from '@/domain/core/either'
import { ClientRepository } from '@/domain/repositories/client-repository'
import { Injectable } from '@nestjs/common'
import { compare } from 'bcryptjs'

interface AuthenticateClientUseCaseRequest {
  email: string
  password: string
}

type AuthenticateClientUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    clientId: string
  }
>

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
  }
}

@Injectable()
export class AuthenticateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    request: AuthenticateClientUseCaseRequest,
  ): Promise<AuthenticateClientUseCaseResponse> {
    const { email, password } = request

    const client = await this.clientRepository.findByEmail(email)

    if (!client) {
      return left(new InvalidCredentialsError())
    }

    if (!client.isActive) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordValid = await compare(password, client.password)

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    return right({
      clientId: client.id.toString(),
    })
  }
}
