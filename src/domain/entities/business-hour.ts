import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'
import { DayOfWeek } from '../enums'

export interface BusinessHourProps {
  dayOfWeek: DayOfWeek
  openTime: string // Formato: "HH:mm"
  closeTime: string // Formato: "HH:mm"
  isClosed: boolean
  barbershopId: UniqueEntityID
}

export class BusinessHour extends Entity<BusinessHourProps> {
  get dayOfWeek() {
    return this.props.dayOfWeek
  }

  get openTime() {
    return this.props.openTime
  }

  get closeTime() {
    return this.props.closeTime
  }

  get isClosed() {
    return this.props.isClosed
  }

  get barbershopId() {
    return this.props.barbershopId
  }

  set openTime(openTime: string) {
    this.validateTimeFormat(openTime)
    this.props.openTime = openTime
  }

  set closeTime(closeTime: string) {
    this.validateTimeFormat(closeTime)
    this.props.closeTime = closeTime
  }

  public close() {
    this.props.isClosed = true
  }

  public open() {
    this.props.isClosed = false
  }

  public isOpen(): boolean {
    return !this.props.isClosed
  }

  private validateTimeFormat(time: string) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(time)) {
      throw new Error('Formato de horário inválido. Use HH:mm')
    }
  }

  static create(props: Partial<BusinessHourProps>, id?: UniqueEntityID) {
    const businessHour = new BusinessHour(
      {
        dayOfWeek: props.dayOfWeek!,
        openTime: props.openTime!,
        closeTime: props.closeTime!,
        isClosed: props.isClosed ?? false,
        barbershopId: props.barbershopId!,
      },
      id,
    )

    return businessHour
  }
}
