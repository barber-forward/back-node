import { ClientRepository } from '@/domain/repositories/client-repository'
import { Either, left, right } from '@/domain/core/either'
import { Injectable } from '@nestjs/common'
import { compare } from 'bcryptjs'

interface AuthenticateClientUseCaseRequest {
  email: string
  password: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
  }
}

type AuthenticateClientUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    clientId: string
  }
>

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

    const isPasswordValid = await compare(password, client.passwordHash)

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    return right({
      clientId: client.id.toString(),
    })
  }
}
