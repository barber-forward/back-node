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
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

const createServiceBodySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().positive().optional(),
  duration: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
})

const updateServiceBodySchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    oldPrice: z.coerce.number().positive().optional(),
    duration: z.coerce.number().int().positive().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

type CreateServiceBodySchemaType = z.infer<typeof createServiceBodySchema>
type UpdateServiceBodySchemaType = z.infer<typeof updateServiceBodySchema>

@Controller('/services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(createServiceBodySchema))
    body: CreateServiceBodySchemaType,
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
        'Você não tem permissão para cadastrar serviços.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException(
        'Você precisa cadastrar uma barbearia antes de criar serviços.',
      )
    }

    const service = await this.prisma.service.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        oldPrice: body.oldPrice,
        duration: body.duration,
        imageUrl: body.imageUrl,
        barbershopId: appUser.barbershop.id,
      },
    })

    return service
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

    const services = await this.prisma.service.findMany({
      where: { barbershopId: appUser.barbershop.id },
      orderBy: { createdAt: 'desc' },
    })

    return services
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateServiceBodySchema))
    body: UpdateServiceBodySchemaType,
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
        'Você não tem permissão para atualizar este serviço.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const service = await this.prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.')
    }

    if (service.barbershopId !== appUser.barbershop.id) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este serviço.',
      )
    }

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: body,
    })

    return updatedService
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
        'Você não tem permissão para deletar este serviço.',
      )
    }

    if (!appUser.barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    const service = await this.prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.')
    }

    if (service.barbershopId !== appUser.barbershop.id) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este serviço.',
      )
    }

    await this.prisma.service.delete({
      where: { id },
    })

    return { message: 'Serviço deletado com sucesso.' }
  }
}
