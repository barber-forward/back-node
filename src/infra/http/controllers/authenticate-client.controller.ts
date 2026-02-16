import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/prisma/prisma.service'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { z } from 'zod'

const authenticateClientBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type AuthenticateClientBodySchemaType = z.infer<
  typeof authenticateClientBodySchema
>

@Controller('/auth')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/sessions')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateClientBodySchema))
  async handle(@Body() body: AuthenticateClientBodySchemaType) {
    const { email, password } = body

    const user = await this.prisma.client.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
    })

    return {
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
        access_token: accessToken,
      },
    }
  }
}
