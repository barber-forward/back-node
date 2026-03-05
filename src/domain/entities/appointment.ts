import { UniqueEntityID } from '../core/unique-entity-id'
import { AppointmentStatus } from '../enums'
import { Entity } from '../core/entity'

export interface AppointmentProps {
  date: Date
  status: AppointmentStatus
  notes?: string
  clientId: UniqueEntityID
  barbershopId: UniqueEntityID
  serviceId: UniqueEntityID
  createdAt: Date
  updatedAt: Date
}

export class AppointmentEntity extends Entity<AppointmentProps> {
  get date() {
    return this.props.date
  }

  get status() {
    return this.props.status
  }

  get notes() {
    return this.props.notes
  }

  get clientId() {
    return this.props.clientId
  }

  get barbershopId() {
    return this.props.barbershopId
  }

  get serviceId() {
    return this.props.serviceId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set date(date: Date) {
    this.props.date = date
    this.touch()
  }

  set notes(notes: string | undefined) {
    this.props.notes = notes
    this.touch()
  }

  public confirm() {
    if (this.props.status === AppointmentStatus.CANCELADO) {
      throw new Error('Não é possível confirmar um agendamento cancelado')
    }
    this.props.status = AppointmentStatus.CONFIRMADO
    this.touch()
  }

  public cancel() {
    if (this.props.status === AppointmentStatus.CONCLUIDO) {
      throw new Error('Não é possível cancelar um agendamento concluído')
    }
    this.props.status = AppointmentStatus.CANCELADO
    this.touch()
  }

  public complete() {
    if (this.props.status === AppointmentStatus.CANCELADO) {
      throw new Error('Não é possível concluir um agendamento cancelado')
    }
    this.props.status = AppointmentStatus.CONCLUIDO
    this.touch()
  }

  public isPending(): boolean {
    return this.props.status === AppointmentStatus.PENDENTE
  }

  public isConfirmed(): boolean {
    return this.props.status === AppointmentStatus.CONFIRMADO
  }

  public isCanceled(): boolean {
    return this.props.status === AppointmentStatus.CANCELADO
  }

  public isCompleted(): boolean {
    return this.props.status === AppointmentStatus.CONCLUIDO
  }

  public canBeCanceled(): boolean {
    return (
      this.props.status !== AppointmentStatus.CANCELADO &&
      this.props.status !== AppointmentStatus.CONCLUIDO
    )
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Partial<AppointmentProps>, id?: UniqueEntityID) {
    const appointment = new AppointmentEntity(
      {
        date: props.date!,
        status: props.status ?? AppointmentStatus.PENDENTE,
        notes: props.notes,
        clientId: props.clientId!,
        barbershopId: props.barbershopId!,
        serviceId: props.serviceId!,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return appointment
  }
}
