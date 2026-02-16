import { Client } from '../entities/client'

export interface ClientRepository {
  findById(id: string): Promise<Client | null>
  findByEmail(email: string): Promise<Client | null>
  create(client: Client): Promise<void>
  save(client: Client): Promise<void>
  delete(id: string): Promise<void>
}
