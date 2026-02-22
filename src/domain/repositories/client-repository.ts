import { ClientEntity } from '../entities/client'

export abstract class ClientRepository {
  abstract create(client: ClientEntity): Promise<void>
  abstract findById(id: string): Promise<ClientEntity | null>
  abstract findByEmail(email: string): Promise<ClientEntity | null>
  abstract save(client: ClientEntity): Promise<void>
  abstract delete(id: string): Promise<void>
}
