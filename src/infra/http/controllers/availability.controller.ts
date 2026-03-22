import { AvailabilityService } from '@/infra/http/services/availability.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { z } from 'zod'
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Query,
} from '@nestjs/common'

const availabilityQuerySchema = z.object({
  barbershopId: z.string().uuid('ID da barbearia inválido.'),
  serviceId: z.string().uuid('ID do serviço inválido.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD.'),
})

@Controller('/availability')
export class AvailabilityController {
  constructor(
    private availabilityService: AvailabilityService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HttpCode(200)
  async getAvailability(
    @Query('barbershopId') barbershopId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    const parsed = availabilityQuerySchema.safeParse({
      barbershopId,
      serviceId,
      date,
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      throw new BadRequestException(firstError.message)
    }

    const { barbershopId: bId, serviceId: sId, date: dateStr } = parsed.data

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: bId },
    })

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const service = await this.prisma.service.findUnique({
      where: { id: sId },
    })

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.')
    }

    if (service.barbershopId !== bId) {
      throw new BadRequestException(
        'Este serviço não pertence a esta barbearia.',
      )
    }

    const dateObj = new Date(dateStr + 'T00:00:00.000Z')

    const slots = await this.availabilityService.getAvailableSlots({
      barbershopId: bId,
      serviceId: sId,
      date: dateObj,
    })

    return slots
  }
}
