import { UniqueEntityID } from '../core/unique-entity-id'
import { Entity } from '../core/entity'

export interface BarbershopProps {
  name: string
  description?: string
  email?: string
  phone: string
  avatar?: string
  address: string
  city: string
  state: string
  zipCode?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  ownerId: UniqueEntityID
  createdAt: Date
  updatedAt: Date
}

export class Barbershop extends Entity<BarbershopProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get avatar() {
    return this.props.avatar
  }

  get address() {
    return this.props.address
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get zipCode() {
    return this.props.zipCode
  }

  get latitude() {
    return this.props.latitude
  }

  get longitude() {
    return this.props.longitude
  }

  get isActive() {
    return this.props.isActive
  }

  get ownerId() {
    return this.props.ownerId
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

  set description(description: string | undefined) {
    this.props.description = description
    this.touch()
  }

  set email(email: string | undefined) {
    this.props.email = email
    this.touch()
  }

  set phone(phone: string) {
    this.props.phone = phone
    this.touch()
  }

  set avatar(avatar: string | undefined) {
    this.props.avatar = avatar
    this.touch()
  }

  set address(address: string) {
    this.props.address = address
    this.touch()
  }

  set city(city: string) {
    this.props.city = city
    this.touch()
  }

  set state(state: string) {
    this.props.state = state
    this.touch()
  }

  set zipCode(zipCode: string | undefined) {
    this.props.zipCode = zipCode
    this.touch()
  }

  public updateLocation(latitude: number, longitude: number) {
    this.props.latitude = latitude
    this.props.longitude = longitude
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

  static create(props: Partial<BarbershopProps>, id?: UniqueEntityID) {
    const barbershop = new Barbershop(
      {
        name: props.name!,
        description: props.description,
        email: props.email,
        phone: props.phone!,
        avatar: props.avatar,
        address: props.address!,
        city: props.city!,
        state: props.state!,
        zipCode: props.zipCode,
        latitude: props.latitude,
        longitude: props.longitude,
        isActive: props.isActive ?? true,
        ownerId: props.ownerId!,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return barbershop
  }
}
