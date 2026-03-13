import { UserEntity } from '../entities/user'

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>
  abstract findById(id: string): Promise<UserEntity | null>
  abstract findByEmail(email: string): Promise<UserEntity | null>
  abstract save(user: UserEntity): Promise<void>
  abstract delete(id: string): Promise<void>
}
