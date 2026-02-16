import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface ClientProps {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class Client extends Entity<ClientProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get phone() {
    return this.props.phone
  }

  get avatar() {
    return this.props.avatar
  }

  get isActive() {
    return this.props.isActive
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set phone(phone: string | undefined) {
    this.props.phone = phone
    this.touch()
  }

  set avatar(avatar: string | undefined) {
    this.props.avatar = avatar
    this.touch()
  }

  set password(password: string) {
    this.props.password = password
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

  static create(props: Partial<ClientProps>, id?: UniqueEntityID) {
    const client = new Client(
      {
        name: props.name!,
        email: props.email!,
        password: props.password!,
        phone: props.phone,
        avatar: props.avatar,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return client
  }
}
