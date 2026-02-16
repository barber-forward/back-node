import { BackofficeUserRepository } from '@/domain/repositories/backoffice-user-repository'
import { Either, left, right } from '@/domain/core/either'
import { Injectable } from '@nestjs/common'
import { compare } from 'bcryptjs'

interface AuthenticateBackofficeUserUseCaseRequest {
  email: string
  password: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
  }
}

type AuthenticateBackofficeUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    userId: string
  }
>

@Injectable()
export class AuthenticateBackofficeUserUseCase {
  constructor(private backofficeUserRepository: BackofficeUserRepository) {}

  async execute(
    request: AuthenticateBackofficeUserUseCaseRequest,
  ): Promise<AuthenticateBackofficeUserUseCaseResponse> {
    const { email, password } = request

    const user = await this.backofficeUserRepository.findByEmail(email)

    if (!user) {
      return left(new InvalidCredentialsError())
    }

    if (!user.isActive) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    return right({
      userId: user.id.toString(),
    })
  }
}
