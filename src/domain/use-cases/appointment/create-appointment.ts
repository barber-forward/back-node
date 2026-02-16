import { AppointmentRepository } from '@/domain/repositories/appointment-repository'
import { BarbershopRepository } from '@/domain/repositories/barbershop-repository'
import { ServiceRepository } from '@/domain/repositories/service-repository'
import { ClientRepository } from '@/domain/repositories/client-repository'
import { UniqueEntityID } from '@/domain/core/unique-entity-id'
import { Appointment } from '@/domain/entities/appointment'
import { Either, left, right } from '@/domain/core/either'
import { Injectable } from '@nestjs/common'

interface CreateAppointmentUseCaseRequest {
  clientId: string
  barbershopId: string
  serviceId: string
  date: Date
  notes?: string
}

export class ClientNotFoundError extends Error {
  constructor() {
    super('Cliente não encontrado')
  }
}

export class BarbershopNotFoundError extends Error {
  constructor() {
    super('Barbearia não encontrada')
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super('Serviço não encontrado')
  }
}

export class ServiceNotAvailableError extends Error {
  constructor() {
    super('Serviço não está disponível')
  }
}

type CreateAppointmentUseCaseResponse = Either<
  | ClientNotFoundError
  | BarbershopNotFoundError
  | ServiceNotFoundError
  | ServiceNotAvailableError,
  {
    appointment: Appointment
  }
>

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private clientRepository: ClientRepository,
    private barbershopRepository: BarbershopRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  async execute(
    request: CreateAppointmentUseCaseRequest,
  ): Promise<CreateAppointmentUseCaseResponse> {
    const { clientId, barbershopId, serviceId, date, notes } = request

    // Validar cliente
    const client = await this.clientRepository.findById(clientId)
    if (!client) {
      return left(new ClientNotFoundError())
    }

    // Validar barbearia
    const barbershop = await this.barbershopRepository.findById(barbershopId)
    if (!barbershop || !barbershop.isActive) {
      return left(new BarbershopNotFoundError())
    }

    // Validar serviço
    const service = await this.serviceRepository.findById(serviceId)
    if (!service) {
      return left(new ServiceNotFoundError())
    }

    if (!service.isActive || service.barbershopId.toString() !== barbershopId) {
      return left(new ServiceNotAvailableError())
    }

    const appointment = Appointment.create({
      clientId: new UniqueEntityID(clientId),
      barbershopId: new UniqueEntityID(barbershopId),
      serviceId: new UniqueEntityID(serviceId),
      date,
      notes,
    })

    await this.appointmentRepository.create(appointment)

    return right({
      appointment,
    })
  }
}
