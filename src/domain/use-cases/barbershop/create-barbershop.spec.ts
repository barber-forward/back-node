import { BackofficeUserRepository } from '@/domain/repositories/backoffice-user-repository'
import { BarbershopRepository } from '@/domain/repositories/barbershop-repository'
import { BackofficeUser } from '@/domain/entities/backoffice-user'
import { CreateBarbershopUseCase } from './create-barbershop'
import { Barbershop } from '@/domain/entities/barbershop'
// import { BackofficeRole } from '@/domain/enums'

// Repositório em memória para testes - BackofficeUser
class InMemoryBackofficeUserRepository implements BackofficeUserRepository {
  public items: BackofficeUser[] = []

  async findById(id: string): Promise<BackofficeUser | null> {
    const user = this.items.find((item) => item.id.toString() === id)
    return user ?? null
  }

  async findByEmail(email: string): Promise<BackofficeUser | null> {
    const user = this.items.find((item) => item.email === email)
    return user ?? null
  }

  async create(user: BackofficeUser): Promise<void> {
    this.items.push(user)
  }

  async save(user: BackofficeUser): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(user.id))
    if (index >= 0) {
      this.items[index] = user
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}

// Repositório em memória para testes - Barbershop
class InMemoryBarbershopRepository implements BarbershopRepository {
  public items: Barbershop[] = []

  async findById(id: string): Promise<Barbershop | null> {
    const barbershop = this.items.find((item) => item.id.toString() === id)
    return barbershop ?? null
  }

  async findByOwnerId(ownerId: string): Promise<Barbershop | null> {
    const barbershop = this.items.find(
      (item) => item.ownerId.toString() === ownerId,
    )
    return barbershop ?? null
  }

  async findMany(): Promise<Barbershop[]> {
    return this.items
  }

  async count(): Promise<number> {
    return this.items.length
  }

  async create(barbershop: Barbershop): Promise<void> {
    this.items.push(barbershop)
  }

  async save(barbershop: Barbershop): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(barbershop.id))
    if (index >= 0) {
      this.items[index] = barbershop
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}

describe('CreateBarbershopUseCase', () => {
  let sut: CreateBarbershopUseCase
  let barbershopRepository: InMemoryBarbershopRepository
  let backofficeUserRepository: InMemoryBackofficeUserRepository

  beforeEach(() => {
    barbershopRepository = new InMemoryBarbershopRepository()
    backofficeUserRepository = new InMemoryBackofficeUserRepository()
    sut = new CreateBarbershopUseCase(
      barbershopRepository,
      backofficeUserRepository,
    )
  })

  it('Deve criar uma nova barbearia', async () => {
    const backofficeUser = BackofficeUser.create({
      name: 'João Barbeiro',
      email: 'joao@barbershop.com',
      password: 'hashed_password',
      //   role: BackofficeRole.BARBEIRO,
    })

    await backofficeUserRepository.create(backofficeUser)

    const result = await sut.execute({
      name: 'Barbearia do João',
      description: 'A melhor barbearia da região',
      email: 'contato@barbeariadojoao.com',
      phone: '11999999999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      latitude: -23.5505199,
      longitude: -46.6333094,
      ownerId: backofficeUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.barbershop.name).toBe('Barbearia do João')
      expect(result.value.barbershop.city).toBe('São Paulo')
      expect(result.value.barbershop.state).toBe('SP')
      expect(result.value.barbershop.ownerId.toString()).toBe(
        backofficeUser.id.toString(),
      )
    }

    expect(barbershopRepository.items).toHaveLength(1)
  })

  it('Não deve criar uma barbearia se o usuário do backoffice não existir', async () => {
    const result = await sut.execute({
      name: 'Barbearia do João',
      phone: '11999999999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      ownerId: 'non-existent-id',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value.message).toBe('Usuário do backoffice não encontrado')
    }

    expect(barbershopRepository.items).toHaveLength(0)
  })

  it('Não deve criar uma barbearia se o proprietário já tiver uma', async () => {
    const backofficeUser = BackofficeUser.create({
      name: 'João Barbeiro',
      email: 'joao@barbershop.com',
      password: 'hashed_password',
      //   role: BackofficeRole.BARBEIRO,
    })

    await backofficeUserRepository.create(backofficeUser)

    const existingBarbershop = Barbershop.create({
      name: 'Primeira Barbearia',
      phone: '11988888888',
      address: 'Rua A, 100',
      city: 'São Paulo',
      state: 'SP',
      ownerId: backofficeUser.id,
    })

    await barbershopRepository.create(existingBarbershop)

    const result = await sut.execute({
      name: 'Segunda Barbearia',
      phone: '11999999999',
      address: 'Rua B, 200',
      city: 'São Paulo',
      state: 'SP',
      ownerId: backofficeUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value.message).toBe(
        'Você já possui uma barbearia cadastrada',
      )
    }

    expect(barbershopRepository.items).toHaveLength(1)
  })

  it('Deve criar uma barbearia sem campos opcionais', async () => {
    const backofficeUser = BackofficeUser.create({
      name: 'Maria Barbeira',
      email: 'maria@barbershop.com',
      password: 'hashed_password',
      //   role: BackofficeRole.BARBEIRO,
    })

    await backofficeUserRepository.create(backofficeUser)

    const result = await sut.execute({
      name: 'Barbearia Simples',
      phone: '11977777777',
      address: 'Rua C, 300',
      city: 'Rio de Janeiro',
      state: 'RJ',
      ownerId: backofficeUser.id.toString(),
      // Sem description, email, avatar, zipCode, latitude, longitude
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.barbershop.name).toBe('Barbearia Simples')
      expect(result.value.barbershop.description).toBeUndefined()
      expect(result.value.barbershop.email).toBeUndefined()
      expect(result.value.barbershop.avatar).toBeUndefined()
    }
  })

  it('Deve criar uma barbearia ativa por padrão', async () => {
    const backofficeUser = BackofficeUser.create({
      name: 'Pedro Barbeiro',
      email: 'pedro@barbershop.com',
      password: 'hashed_password',
      //   role: BackofficeRole.ADMIN,
    })

    await backofficeUserRepository.create(backofficeUser)

    const result = await sut.execute({
      name: 'Barbearia Premium',
      phone: '11966666666',
      address: 'Av. Principal, 1000',
      city: 'Curitiba',
      state: 'PR',
      ownerId: backofficeUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.barbershop.isActive).toBe(true)
    }
  })
})
