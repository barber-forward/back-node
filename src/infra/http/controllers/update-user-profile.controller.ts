import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { z } from 'zod'
import {
  BadRequestException,
  ConflictException,
  Controller,
  NotFoundException,
  UseGuards,
  Body,
  HttpCode,
  Patch,
} from '@nestjs/common'

const updateUserProfileBodySchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

type UpdateUserProfileBodySchemaType = z.infer<
  typeof updateUserProfileBodySchema
>

@Controller('/users')
@UseGuards(JwtAuthGuard)
export class UpdateUserProfileController {
  constructor(private prisma: PrismaService) {}

  @Patch('/me')
  @HttpCode(200)
  async updateProfile(
    @CurrentUser() user: UserPayloadType,
    @Body(new ZodValidationPipe(updateUserProfileBodySchema))
    body: UpdateUserProfileBodySchemaType,
  ) {
    const data = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    )

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'Nenhum campo foi enviado para atualização.',
      )
    }

    const client = await this.prisma.client.findUnique({
      where: { id: user.sub },
    })

    if (!client) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    try {
      const updatedClient = await this.prisma.client.update({
        where: { id: user.sub },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      })

      return {
        success: true,
        message: 'Perfil do usuário atualizado com sucesso.',
        data: {
          user: updatedClient,
        },
      }
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Este e-mail já está em uso.')
      }
      throw error
    }
  }
}
