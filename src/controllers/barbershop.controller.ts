import { z } from 'zod'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import {
  Body,
  ConflictException,
  Controller,
  Delete,
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
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayloadType } from '@/auth/jwt.strategy'

const createBarbershopBodySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string(),
  avatar: z.string().url().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

const updateBarbershopBodySchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

type CreateBarbershopBodySchemaType = z.infer<typeof createBarbershopBodySchema>

type UpdateBarbershopBodySchemaType = z.infer<typeof updateBarbershopBodySchema>

@Controller('/barbershops')
export class BarbershopController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ZodValidationPipe(createBarbershopBodySchema))
    body: CreateBarbershopBodySchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const userId = user.sub

    const backofficeUser = await this.prisma.backofficeUser.findUnique({
      where: { id: userId },
      include: { barbershop: true },
    })

    if (!backofficeUser) {
      throw new NotFoundException('Usuário do backoffice não encontrado.')
    }

    if (backofficeUser.barbershop) {
      throw new ConflictException('Você já possui uma barbearia cadastrada.')
    }

    const barbershop = await this.prisma.barbershop.create({
      data: {
        ...body,
        ownerId: userId,
      },
    })

    return { barbershop }
  }

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('isActive') isActive?: string,
  ) {
    const where: Partial<{
      city: string
      state: string
      isActive: boolean
    }> = {}

    if (city) where.city = city
    if (state) where.state = state
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const barbershops = await this.prisma.barbershop.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          where: { isActive: true },
        },
        businessHours: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { barbershops }
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          where: { isActive: true },
        },
        businessHours: true,
        images: true,
      },
    })

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    return { barbershop }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBarbershopBodySchema))
    body: UpdateBarbershopBodySchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const userId = user.sub

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    })

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    if (barbershop.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta barbearia.',
      )
    }

    const updatedBarbershop = await this.prisma.barbershop.update({
      where: { id },
      data: body,
    })

    return { barbershop: updatedBarbershop }
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayloadType) {
    const userId = user.sub

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    })

    if (!barbershop) {
      throw new NotFoundException('Barbearia não encontrada.')
    }

    if (barbershop.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta barbearia.',
      )
    }

    await this.prisma.barbershop.delete({
      where: { id },
    })

    return { success: true, message: 'Barbearia deletada com sucesso.' }
  }
}
