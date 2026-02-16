import { Either, left, right } from '@/domain/core/either'
import { AppointmentRepository } from '@/domain/repositories/appointment-repository'
import { Appointment } from '@/domain/entities/appointment'
import { Injectable } from '@nestjs/common'

interface CancelAppointmentUseCaseRequest {
  appointmentId: string
  userId: string // pode ser clientId ou backofficeUserId
}

type CancelAppointmentUseCaseResponse = Either<
  AppointmentNotFoundError | CannotCancelAppointmentError,
  {
    appointment: Appointment
  }
>

export class AppointmentNotFoundError extends Error {
  constructor() {
    super('Agendamento não encontrado')
  }
}

export class CannotCancelAppointmentError extends Error {
  constructor() {
    super('Não é possível cancelar este agendamento')
  }
}

@Injectable()
export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    request: CancelAppointmentUseCaseRequest,
  ): Promise<CancelAppointmentUseCaseResponse> {
    const { appointmentId } = request

    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new AppointmentNotFoundError())
    }

    if (!appointment.canBeCanceled()) {
      return left(new CannotCancelAppointmentError())
    }

    appointment.cancel()

    await this.appointmentRepository.save(appointment)

    return right({
      appointment,
    })
  }
}
