import { CreateAccountBackofficeController } from './controllers/create-account-backoffice.controller'
import { AuthenticateBackofficeController } from './controllers/authenticate-backoffice.controller'
import { CreateAccountClientController } from './controllers/create-account-client.controller'
import { UpdateUserProfileController } from './controllers/update-user-profile.controller'
import { AuthenticateController } from './controllers/authenticate-client.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { BarbershopController } from './controllers/barbershop.controller'
import { HealthController } from './controllers/health.controller'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [
    CreateAccountBackofficeController,
    AuthenticateBackofficeController,
    CreateAccountClientController,
    UpdateUserProfileController,
    GetUserProfileController,
    RefreshTokenController,
    AuthenticateController,
    BarbershopController,
    HealthController,
  ],
})
export class HttpModule {}
