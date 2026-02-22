import { UniqueEntityID } from '@/core/unique-entity-id'
import { Entity } from '@/core/entity'

interface ClientProps {
  name: string
  email: string
  passwordHash: string
}

export class ClientEntity extends Entity<ClientProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  static create(props: ClientProps, id?: UniqueEntityID) {
    const client = new ClientEntity(props, id)
    return client
  }
}
