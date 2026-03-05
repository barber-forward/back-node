import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface ServiceProps {
  name: string
  description?: string
  duration?: number // em minutos
  price: number
  oldPrice?: number
  imageUrl?: string
  isActive: boolean
  barbershopId: UniqueEntityID
  createdAt: Date
  updatedAt: Date
}

export class ServiceEntity extends Entity<ServiceProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get duration() {
    return this.props.duration
  }

  get price() {
    return this.props.price
  }

  get oldPrice() {
    return this.props.oldPrice
  }

  get imageUrl() {
    return this.props.imageUrl
  }

  get isActive() {
    return this.props.isActive
  }

  get barbershopId() {
    return this.props.barbershopId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get hasDiscount(): boolean {
    return !!this.props.oldPrice && this.props.oldPrice > this.props.price
  }

  get discountPercentage(): number | null {
    if (!this.hasDiscount || !this.props.oldPrice) {
      return null
    }
    return Math.round(
      ((this.props.oldPrice - this.props.price) / this.props.oldPrice) * 100,
    )
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set description(description: string | undefined) {
    this.props.description = description
    this.touch()
  }

  set duration(duration: number | undefined) {
    this.props.duration = duration
    this.touch()
  }

  set price(price: number) {
    this.props.price = price
    this.touch()
  }

  set oldPrice(oldPrice: number | undefined) {
    this.props.oldPrice = oldPrice
    this.touch()
  }

  set imageUrl(imageUrl: string | undefined) {
    this.props.imageUrl = imageUrl
    this.touch()
  }

  public deactivate() {
    this.props.isActive = false
    this.touch()
  }

  public activate() {
    this.props.isActive = true
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Partial<ServiceProps>, id?: UniqueEntityID) {
    const service = new ServiceEntity(
      {
        name: props.name!,
        description: props.description,
        duration: props.duration,
        price: props.price!,
        oldPrice: props.oldPrice,
        imageUrl: props.imageUrl,
        isActive: props.isActive ?? true,
        barbershopId: props.barbershopId!,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return service
  }
}
