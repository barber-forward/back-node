import { Either, left, right } from '@/domain/core/either'
import { BackofficeUserRepository } from '@/domain/repositories/backoffice-user-repository'
import { BackofficeUser } from '@/domain/entities/backoffice-user'
import { BackofficeRole } from '@/domain/enums'
import { Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'

interface RegisterBackofficeUserUseCaseRequest {
  name: string
  email: string
  password: string
  phone?: string
  role?: BackofficeRole
}

type RegisterBackofficeUserUseCaseResponse = Either<
  BackofficeUserAlreadyExistsError,
  {
    user: BackofficeUser
  }
>

export class BackofficeUserAlreadyExistsError extends Error {
  constructor() {
    super('Usuário do backoffice com esse e-mail já existe')
  }
}

@Injectable()
export class RegisterBackofficeUserUseCase {
  constructor(private backofficeUserRepository: BackofficeUserRepository) {}

  async execute(
    request: RegisterBackofficeUserUseCaseRequest,
  ): Promise<RegisterBackofficeUserUseCaseResponse> {
    const { name, email, password, phone, role } = request

    const userWithSameEmail =
      await this.backofficeUserRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new BackofficeUserAlreadyExistsError())
    }

    const hashedPassword = await hash(password, 8)

    const user = BackofficeUser.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    })

    await this.backofficeUserRepository.create(user)

    return right({
      user,
    })
  }
}
