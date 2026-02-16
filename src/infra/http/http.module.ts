import { AuthenticateBackofficeController } from './controllers/authenticate-backoffice.controller'
import { CreateAccountBackofficeController } from './controllers/create-account-backoffice.controller'
import { CreateAccountClientController } from './controllers/create-account-client.controller'
import { AuthenticateController } from './controllers/authenticate-client.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { BarbershopController } from './controllers/barbershop.controller'
import { PrismaService } from '../prisma/prisma.service'
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [
    CreateAccountBackofficeController,
    AuthenticateBackofficeController,
    CreateAccountClientController,
    GetUserProfileController,
    AuthenticateController,
    BarbershopController,
  ],
  providers: [PrismaService],
})
export class HttpModule {}
