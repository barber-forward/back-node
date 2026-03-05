import { Public } from '@/infra/auth/public'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { createHash } from 'crypto'
import { Request, Response } from 'express'
import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'

@Controller()
@Public()
export class RefreshTokenController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('/auth/refresh')
  @HttpCode(200)
  async handleClient(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.refresh(request, response, '/api/auth/refresh', 'client')
  }

  @Post('/backoffice/refresh')
  @HttpCode(200)
  async handleBackoffice(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.refresh(
      request,
      response,
      '/api/backoffice/refresh',
      'backoffice',
    )
  }

  private async refresh(
    request: Request,
    response: Response,
    cookiePath: string,
    userType: 'client' | 'backoffice',
  ) {
    const token: string | undefined = request.cookies?.refresh_token

    if (!token) {
      throw new UnauthorizedException('Refresh token não encontrado.')
    }

    let payload: { sub: string }

    try {
      payload = this.jwt.verify<{ sub: string }>(token)
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.')
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    })

    if (!storedToken || storedToken.revokedAt !== null) {
      throw new UnauthorizedException(
        'Refresh token já foi utilizado ou revogado.',
      )
    }

    const userExists =
      userType === 'client'
        ? await this.prisma.client.findUnique({
            where: { id: payload.sub },
            select: { id: true },
          })
        : await this.prisma.backofficeUser.findUnique({
            where: { id: payload.sub },
            select: { id: true },
          })

    if (!userExists) {
      throw new UnauthorizedException('Usuário não encontrado.')
    }

    // Revoga o token atual
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    })

    const newAccessToken = this.jwt.sign({ sub: payload.sub })
    const newRefreshToken = this.jwt.sign(
      { sub: payload.sub },
      { expiresIn: '7d' },
    )

    // Salva o novo token no banco
    const newTokenHash = createHash('sha256')
      .update(newRefreshToken)
      .digest('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: payload.sub,
        userType,
        expiresAt,
      },
    })

    response.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: cookiePath,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return {
      access_token: newAccessToken,
    }
  }
}
