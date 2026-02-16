import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface BarbershopImageProps {
  url: string
  barbershopId: UniqueEntityID
  createdAt: Date
  updatedAt: Date
}

export class BarbershopImage extends Entity<BarbershopImageProps> {
  get url() {
    return this.props.url
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

  set url(url: string) {
    this.props.url = url
    this.props.updatedAt = new Date()
  }

  static create(props: Partial<BarbershopImageProps>, id?: UniqueEntityID) {
    const barbershopImage = new BarbershopImage(
      {
        url: props.url!,
        barbershopId: props.barbershopId!,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return barbershopImage
  }
}
