import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { UserPayloadType } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common'

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
