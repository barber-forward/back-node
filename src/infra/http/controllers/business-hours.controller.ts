import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { z } from 'zod'
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  UnprocessableEntityException,
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

const businessHourItemSchema = z
  .object({
    dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
    openTime: timeSchema,
    closeTime: timeSchema,
    isClosed: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.isClosed) return true
      return data.openTime < data.closeTime
    },
    {
      message: 'O horário de abertura deve ser anterior ao de fechamento.',
      path: ['openTime'],
    },
  )

const bulkUpsertBodySchema = z
  .array(businessHourItemSchema)
  .min(1, 'Informe ao menos um horário.')

type BulkUpsertBodySchemaType = z.infer<typeof bulkUpsertBodySchema>

@Controller('/business-hours')
@UseGuards(JwtAuthGuard)
export class BusinessHourController {
  constructor(private prisma: PrismaService) {}

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

    const businessHours = await this.prisma.businessHour.findMany({
      where: { barbershopId: appUser.barbershop.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return {
      success: true,
      message: 'Horários de funcionamento recuperados com sucesso.',
      data: businessHours,
    }
  }

  @Patch()
  @HttpCode(200)
  async bulkUpsert(
    @Body(new ZodValidationPipe(bulkUpsertBodySchema))
    body: BulkUpsertBodySchemaType,
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
        'Apenas barbeiros e administradores podem gerenciar horários de funcionamento.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException(
        'Você precisa cadastrar uma barbearia antes de definir horários.',
      )
    }

    const invalidItem = body.find(
      (item) => !item.isClosed && item.openTime >= item.closeTime,
    )

    if (invalidItem) {
      throw new UnprocessableEntityException(
        `Horário inválido para ${invalidItem.dayOfWeek}: a abertura deve ser anterior ao fechamento.`,
      )
    }

    const barbershopId = appUser.barbershop.id

    const updatedHours = await this.prisma.$transaction(
      body.map((item) =>
        this.prisma.businessHour.upsert({
          where: {
            barbershopId_dayOfWeek: {
              barbershopId,
              dayOfWeek: item.dayOfWeek,
            },
          },
          create: {
            dayOfWeek: item.dayOfWeek,
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
            barbershopId,
          },
          update: {
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
          },
        }),
      ),
    )

    return {
      success: true,
      message: 'Horários de funcionamento atualizados com sucesso.',
      data: updatedHours,
    }
  }
}
