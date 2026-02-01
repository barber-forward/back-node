import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  ConflictException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const createAccountClientBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

type CreateAccountClientBodySchemaType = z.infer<
  typeof createAccountClientBodySchema
>

@Controller('/auth')
export class CreateAccountClientController {
  constructor(private prisma: PrismaService) {}

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountClientBodySchema))
  async handle(@Body() body: CreateAccountClientBodySchemaType) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.client.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário com esse e-mail já existe.')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { message: 'Account created successfully' }
  }
}
