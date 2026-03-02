import 'dotenv/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Env } from './env'
import { ResponseInterceptor } from '../common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true }) ?? 3000

  await app.listen(port, '0.0.0.0')
}
bootstrap()
