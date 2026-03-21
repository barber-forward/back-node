import { UpdateUserProfileController } from './controllers/update-user-profile.controller'
import { AuthenticateUserController } from './controllers/authenticate-user.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { CreateUserController } from './controllers/create-user.controller'
import { BarbershopController } from './controllers/barbershop.controller'
import { ServiceController } from './controllers/service.controller'
import { HealthController } from './controllers/health.controller'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from '../auth/auth.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [
    CreateUserController,
    UpdateUserProfileController,
    GetUserProfileController,
    RefreshTokenController,
    AuthenticateUserController,
    BarbershopController,
    ServiceController,
    HealthController,
  ],
})
export class HttpModule {}
