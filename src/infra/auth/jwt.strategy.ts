import { z } from 'zod'
import { Env } from '@/infra/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
})

export type UserPayloadType = z.infer<typeof tokenPayloadSchema>
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: Buffer.from(publicKey, 'base64'),
    })
  }

  async validate(payload: UserPayloadType) {
    return tokenPayloadSchema.parse(payload)
  }
}
