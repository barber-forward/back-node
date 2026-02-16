import { Service } from '../entities/service'

export interface ServiceRepository {
  findById(id: string): Promise<Service | null>
  findManyByBarbershopId(barbershopId: string): Promise<Service[]>
  findActiveByBarbershopId(barbershopId: string): Promise<Service[]>
  create(service: Service): Promise<void>
  save(service: Service): Promise<void>
  delete(id: string): Promise<void>
}
