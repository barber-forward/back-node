import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountClientController } from './controllers/create-account-client.controller'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/authenticate-client.controller'
import { BarbershopController } from './controllers/barbershop.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateAccountClientController,
    AuthenticateController,
    BarbershopController,
    GetUserProfileController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
