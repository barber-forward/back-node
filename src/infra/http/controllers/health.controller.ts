import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { Public } from '../../auth/public'

interface HealthStatus {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  services: {
    database: 'ok' | 'error'
  }
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthStatus> {
    const databaseStatus = await this.checkDatabase()

    const response: HealthStatus = {
      status: databaseStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: databaseStatus,
      },
    }

    if (response.status === 'error') {
      throw new ServiceUnavailableException(response)
    }

    return response
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return 'ok'
    } catch {
      return 'error'
    }
  }
}
