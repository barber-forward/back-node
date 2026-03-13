import { UserRepository } from '@/domain/repositories/user-repository'
import { Either, left, right } from '@/domain/core/either'
import { Injectable } from '@nestjs/common'
import { compare } from 'bcryptjs'

interface AuthenticateUserUseCaseRequest {
  email: string
  password: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
  }
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    userId: string
  }
>

@Injectable()
export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    request: AuthenticateUserUseCaseRequest,
  ): Promise<AuthenticateUserUseCaseResponse> {
    const { email, password } = request

    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return left(new InvalidCredentialsError())
    }

    if (!user.isActive) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordValid = await compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    return right({
      userId: user.id.toString(),
    })
  }
}
