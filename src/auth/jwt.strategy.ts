import { z } from 'zod'
import { Env } from '@/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'

const tokenSchema = z.object({
  sub: z.string().uuid(),
})

type TokenSchemaType = z.infer<typeof tokenSchema>

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

  async validate(payload: TokenSchemaType) {
    return tokenSchema.parse(payload)
  }
}
