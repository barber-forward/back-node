import { UniqueEntityID } from '../core/unique-entity-id'
// import { BackofficeRole } from '../enums'
import { Entity } from '../core/entity'

export interface BackofficeUserProps {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  //   role: BackofficeRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class BackofficeUser extends Entity<BackofficeUserProps> {
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

  //   get role() {
  //     return this.props.role
  //   }

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

  //   public isAdmin(): boolean {
  //     return this.props.role === BackofficeRole.ADMIN
  //   }

  //   public isBarbeiro(): boolean {
  //     return this.props.role === BackofficeRole.BARBEIRO
  //   }

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

  static create(props: Partial<BackofficeUserProps>, id?: UniqueEntityID) {
    const backofficeUser = new BackofficeUser(
      {
        name: props.name!,
        email: props.email!,
        password: props.password!,
        phone: props.phone,
        avatar: props.avatar,
        // role: props.role ?? BackofficeRole.BARBEIRO,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return backofficeUser
  }
}
