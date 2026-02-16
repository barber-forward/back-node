import { Either, right } from '@/domain/core/either'
import { AppointmentRepository } from '@/domain/repositories/appointment-repository'
import { Appointment } from '@/domain/entities/appointment'
import { Injectable } from '@nestjs/common'

interface ListClientAppointmentsUseCaseRequest {
  clientId: string
}

type ListClientAppointmentsUseCaseResponse = Either<
  null,
  {
    appointments: Appointment[]
  }
>

@Injectable()
export class ListClientAppointmentsUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    request: ListClientAppointmentsUseCaseRequest,
  ): Promise<ListClientAppointmentsUseCaseResponse> {
    const { clientId } = request

    const appointments =
      await this.appointmentRepository.findByClientId(clientId)

    return right({
      appointments,
    })
  }
}
