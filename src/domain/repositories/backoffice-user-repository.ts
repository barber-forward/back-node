import { BackofficeUser } from '../entities/backoffice-user'

export interface BackofficeUserRepository {
  findById(id: string): Promise<BackofficeUser | null>
  findByEmail(email: string): Promise<BackofficeUser | null>
  create(user: BackofficeUser): Promise<void>
  save(user: BackofficeUser): Promise<void>
  delete(id: string): Promise<void>
}
