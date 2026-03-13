import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/public'
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

const authenticateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type AuthenticateUserBodySchemaType = z.infer<typeof authenticateUserBodySchema>

@Controller('/auth')
@Public()
export class AuthenticateUserController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateUserBodySchema))
  async handle(
    @Body() body: AuthenticateUserBodySchemaType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body

    const user = await this.prisma.user.findUnique({
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
        expiresAt,
      },
    })

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return {
      access_token: accessToken,
    }
  }
}
