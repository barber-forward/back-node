import { Appointment } from '../entities/appointment'
import { AppointmentStatus } from '../enums'

export interface FindManyAppointmentsParams {
  clientId?: string
  barbershopId?: string
  serviceId?: string
  status?: AppointmentStatus
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>
  findMany(params: FindManyAppointmentsParams): Promise<Appointment[]>
  findByClientId(clientId: string): Promise<Appointment[]>
  findByBarbershopId(barbershopId: string): Promise<Appointment[]>
  findByBarbershopIdAndDate(
    barbershopId: string,
    date: Date,
  ): Promise<Appointment[]>
  create(appointment: Appointment): Promise<void>
  save(appointment: Appointment): Promise<void>
  delete(id: string): Promise<void>
}
