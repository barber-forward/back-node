import { Favorite } from '../entities/favorite'

export interface FavoriteRepository {
  findById(id: string): Promise<Favorite | null>
  findByClientAndBarbershop(
    clientId: string,
    barbershopId: string,
  ): Promise<Favorite | null>
  findManyByClientId(clientId: string): Promise<Favorite[]>
  create(favorite: Favorite): Promise<void>
  delete(id: string): Promise<void>
}
