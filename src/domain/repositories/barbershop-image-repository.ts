import { BarbershopImage } from '../entities/barbershop-image'

export interface BarbershopImageRepository {
  findById(id: string): Promise<BarbershopImage | null>
  findManyByBarbershopId(barbershopId: string): Promise<BarbershopImage[]>
  create(image: BarbershopImage): Promise<void>
  delete(id: string): Promise<void>
}
