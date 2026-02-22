import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'

@Controller('/users')
@UseGuards(JwtAuthGuard)
export class GetUserProfileController {
  constructor(private prisma: PrismaService) {}

  @Get('/me')
  async handle(@CurrentUser() user: UserPayloadType) {
    const client = await this.prisma.client.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!client) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    return {
      success: true,
      message: 'Perfil do usuário retornado com sucesso.',
      data: {
        user: client,
      },
    }
  }
}
