import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  phone?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class UserEntity extends Entity<UserProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
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

  set passwordHash(passwordHash: string) {
    this.props.passwordHash = passwordHash
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

  static create(props: Partial<UserProps>, id?: UniqueEntityID) {
    const user = new UserEntity(
      {
        name: props.name!,
        email: props.email!,
        passwordHash: props.passwordHash!,
        phone: props.phone,
        avatar: props.avatar,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
