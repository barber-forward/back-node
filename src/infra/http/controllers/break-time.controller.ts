import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { z } from 'zod'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'

const DAY_OF_WEEK_VALUES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Formato de horário inválido. Use HH:mm.')

const createBreakTimeBodySchema = z
  .object({
    dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'O horário de início deve ser anterior ao de término.',
    path: ['startTime'],
  })

type CreateBreakTimeBodySchemaType = z.infer<typeof createBreakTimeBodySchema>

@Controller('/break-times')
@UseGuards(JwtAuthGuard)
export class BreakTimeController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(createBreakTimeBodySchema))
    body: CreateBreakTimeBodySchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const userId = user.sub

    const appUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { barbershop: true },
    })

    if (!appUser) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    if (appUser.role !== 'BARBER' && appUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas barbeiros e administradores podem gerenciar intervalos.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException(
        'Você precisa cadastrar uma barbearia antes de definir intervalos.',
      )
    }

    const breakTime = await this.prisma.breakTime.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        barbershopId: appUser.barbershop.id,
      },
    })

    return breakTime
  }

  @Get()
  @HttpCode(200)
  async findAll(@CurrentUser() user: UserPayloadType) {
    const userId = user.sub

    const appUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { barbershop: true },
    })

    if (!appUser) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    if (!appUser.barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const breakTimes = await this.prisma.breakTime.findMany({
      where: { barbershopId: appUser.barbershop.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return breakTimes
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayloadType) {
    const userId = user.sub

    const appUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { barbershop: true },
    })

    if (!appUser) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    if (appUser.role !== 'BARBER' && appUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas barbeiros e administradores podem gerenciar intervalos.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const breakTime = await this.prisma.breakTime.findUnique({
      where: { id },
    })

    if (!breakTime) {
      throw new NotFoundException('Intervalo não encontrado.')
    }

    if (breakTime.barbershopId !== appUser.barbershop.id) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este intervalo.',
      )
    }

    await this.prisma.breakTime.delete({ where: { id } })

    return { message: 'Intervalo deletado com sucesso.' }
  }
}
