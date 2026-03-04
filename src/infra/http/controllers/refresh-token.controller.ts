import { Public } from '@/infra/auth/public'
import { JwtService } from '@nestjs/jwt'
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
  constructor(private jwt: JwtService) {}

  @Post('/auth/refresh')
  @HttpCode(200)
  async handleClient(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.refresh(request, response, '/api/auth/refresh')
  }

  @Post('/backoffice/refresh')
  @HttpCode(200)
  async handleBackoffice(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.refresh(request, response, '/api/backoffice/refresh')
  }

  private async refresh(
    request: Request,
    response: Response,
    cookiePath: string,
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

    const newAccessToken = this.jwt.sign({ sub: payload.sub })

    const newRefreshToken = this.jwt.sign(
      { sub: payload.sub },
      { expiresIn: '7d' },
    )

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
