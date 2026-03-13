import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common'

@Controller('/users')
@UseGuards(JwtAuthGuard)
export class GetUserProfileController {
  constructor(private prisma: PrismaService) {}

  @Get('/me')
  async handle(@CurrentUser() user: UserPayloadType) {
    const client = await this.prisma.user.findUnique({
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
