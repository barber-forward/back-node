import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountClientController } from './controllers/create-account-client.controller'

@Module({
  imports: [],
  controllers: [CreateAccountClientController],
  providers: [PrismaService],
})
export class AppModule {}
