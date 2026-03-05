import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface FavoriteProps {
  clientId: UniqueEntityID
  barbershopId: UniqueEntityID
  createdAt: Date
  updatedAt: Date
}

export class FavoriteEntity extends Entity<FavoriteProps> {
  get clientId() {
    return this.props.clientId
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

  static create(props: Partial<FavoriteProps>, id?: UniqueEntityID) {
    const favorite = new FavoriteEntity(
      {
        clientId: props.clientId!,
        barbershopId: props.barbershopId!,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return favorite
  }
}
