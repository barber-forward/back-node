import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'

const authenticateBackofficeBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type AuthenticateBackofficeBodySchemaType = z.infer<
  typeof authenticateBackofficeBodySchema
>

@Controller('/backoffice')
export class AuthenticateBackofficeController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/sessions')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateBackofficeBodySchema))
  async handle(@Body() body: AuthenticateBackofficeBodySchemaType) {
    const { email, password } = body

    const user = await this.prisma.backofficeUser.findUnique({
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
      access_token: accessToken,
    }
  }
}
