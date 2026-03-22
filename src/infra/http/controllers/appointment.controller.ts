import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { AvailabilityService } from '@/infra/http/services/availability.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { z } from 'zod'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Formato de horário inválido. Use HH:mm.')

const createAppointmentBodySchema = z.object({
  barbershopId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD.'),
  startTime: timeSchema,
})

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELED', 'COMPLETED']),
})

type CreateAppointmentBodySchemaType = z.infer<
  typeof createAppointmentBodySchema
>
type UpdateAppointmentStatusSchemaType = z.infer<
  typeof updateAppointmentStatusSchema
>

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

@Controller('/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(createAppointmentBodySchema))
    body: CreateAppointmentBodySchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const clientId = user.sub

    const service = await this.prisma.service.findUnique({
      where: { id: body.serviceId },
    })

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.')
    }

    if (service.barbershopId !== body.barbershopId) {
      throw new BadRequestException(
        'Este serviço não pertence a esta barbearia.',
      )
    }

    const dateObj = new Date(body.date + 'T00:00:00.000Z')

    // Verifica se o slot solicitado está disponível
    const availableSlots = await this.availabilityService.getAvailableSlots({
      barbershopId: body.barbershopId,
      serviceId: body.serviceId,
      date: dateObj,
    })

    if (!availableSlots.includes(body.startTime)) {
      throw new ConflictException('Este horário não está disponível.')
    }

    const startMinutes = timeToMinutes(body.startTime)
    const endTime = minutesToTime(startMinutes + service.duration)

    const appointment = await this.prisma.appointment.create({
      data: {
        date: dateObj,
        startTime: body.startTime,
        endTime,
        clientId,
        barbershopId: body.barbershopId,
        serviceId: body.serviceId,
      },
      include: {
        service: { select: { name: true, duration: true, price: true } },
        barbershop: { select: { name: true } },
      },
    })

    return appointment
  }

  @Get('my')
  @HttpCode(200)
  async findMyAppointments(
    @CurrentUser() user: UserPayloadType,
    @Query('status') status?: string,
  ) {
    const clientId = user.sub

    const where: Record<string, unknown> = { clientId }
    if (status) {
      where.status = status.toUpperCase()
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        service: { select: { name: true, duration: true, price: true } },
        barbershop: { select: { name: true, phone: true, address: true } },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    })

    return appointments
  }

  @Get('barbershop')
  @HttpCode(200)
  async findBarbershopAppointments(
    @CurrentUser() user: UserPayloadType,
    @Query('date') date?: string,
    @Query('status') status?: string,
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
        'Apenas barbeiros e administradores podem visualizar agendamentos da barbearia.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const where: Record<string, unknown> = {
      barbershopId: appUser.barbershop.id,
    }

    if (date) {
      where.date = new Date(date + 'T00:00:00.000Z')
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        service: { select: { name: true, duration: true, price: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return appointments
  }

  @Patch(':id/status')
  @HttpCode(200)
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentStatusSchema))
    body: UpdateAppointmentStatusSchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const userId = user.sub

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado.')
    }

    // Cliente pode cancelar o próprio agendamento
    const isClient = appointment.clientId === userId
    if (isClient && body.status !== 'CANCELED') {
      throw new ForbiddenException(
        'Clientes podem apenas cancelar agendamentos.',
      )
    }

    // Barbeiro/admin pode confirmar, concluir ou cancelar
    if (!isClient) {
      const appUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { barbershop: true },
      })

      if (!appUser || (appUser.role !== 'BARBER' && appUser.role !== 'ADMIN')) {
        throw new ForbiddenException(
          'Sem permissão para alterar este agendamento.',
        )
      }

      if (
        !appUser.barbershop ||
        appUser.barbershop.id !== appointment.barbershopId
      ) {
        throw new ForbiddenException(
          'Este agendamento não pertence à sua barbearia.',
        )
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: body.status },
    })

    return updated
  }
}
