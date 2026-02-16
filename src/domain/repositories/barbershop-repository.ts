import { Barbershop } from '../entities/barbershop'

export interface FindManyBarbershopsParams {
  city?: string
  state?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface BarbershopRepository {
  findById(id: string): Promise<Barbershop | null>
  findByOwnerId(ownerId: string): Promise<Barbershop | null>
  findMany(params: FindManyBarbershopsParams): Promise<Barbershop[]>
  count(
    params: Omit<FindManyBarbershopsParams, 'page' | 'pageSize'>,
  ): Promise<number>
  create(barbershop: Barbershop): Promise<void>
  save(barbershop: Barbershop): Promise<void>
  delete(id: string): Promise<void>
}
