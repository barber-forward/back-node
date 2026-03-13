import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import {
  ConflictException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'

const createUserBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

type CreateUserBodySchemaType = z.infer<typeof createUserBodySchema>

@Controller('/auth')
export class CreateUserController {
  constructor(private prisma: PrismaService) {}

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchemaType) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário com esse e-mail já existe.')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { message: 'Account created successfully' }
  }
}
