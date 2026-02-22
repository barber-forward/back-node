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

const createAccountBackofficeBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

type CreateAccountBackofficeBodySchemaType = z.infer<
  typeof createAccountBackofficeBodySchema
>

@Controller('/backoffice/accounts')
export class CreateAccountBackofficeController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBackofficeBodySchema))
  async handle(@Body() body: CreateAccountBackofficeBodySchemaType) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.backofficeUser.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário com esse e-mail já existe.')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.backofficeUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { message: 'Account created successfully' }
  }
}
