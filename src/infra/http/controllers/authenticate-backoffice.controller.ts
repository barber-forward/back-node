import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { createHash } from 'crypto'
import { Response } from 'express'
import { z } from 'zod'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
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
  async handle(
    @Body() body: AuthenticateBackofficeBodySchemaType,
    @Res({ passthrough: true }) response: Response,
  ) {
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

    const accessToken = this.jwt.sign({ sub: user.id })

    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' })

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        userType: 'backoffice',
        expiresAt,
      },
    })

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/backoffice/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return {
      access_token: accessToken,
    }
  }
}
