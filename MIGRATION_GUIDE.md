# 🔄 Guia de Migração dos Controllers

Este guia mostra como migrar seus controllers existentes para usar a nova arquitetura de domínio.

## 📋 Controllers Existentes para Migrar

- ⬜ create-account-client.controller.ts
- ⬜ authenticate-client.controller.ts
- ⬜ create-account-backoffice.controller.ts
- ⬜ authenticate-backoffice.controller.ts
- ⬜ get-user-profile.controller.ts
- ⬜ barbershop.controller.ts

## 🎯 Exemplo 1: Create Account Client

### ❌ ANTES (acoplado ao Prisma)

```typescript
import { PrismaService } from '@/infra/prisma/prisma.service'
import { Controller, Post, Body } from '@nestjs/common'
import { hash } from 'bcryptjs'

@Controller('/auth')
export class CreateAccountClientController {
  constructor(private prisma: PrismaService) {}

  @Post('/register')
  async handle(@Body() body: any) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.client.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário com esse e-mail já existe.')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { message: 'Account created successfully' }
  }
}
```

### ✅ DEPOIS (usando caso de uso)

```typescript
import { RegisterClientUseCase } from '@/domain/use-cases/client/register-client'
import { Controller, Post, Body, ConflictException } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const createAccountClientBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
})

type CreateAccountClientBodySchemaType = z.infer<
  typeof createAccountClientBodySchema
>

@Controller('/auth')
export class CreateAccountClientController {
  constructor(private registerClient: RegisterClientUseCase) {}

  @Post('/register')
  async handle(
    @Body(new ZodValidationPipe(createAccountClientBodySchema))
    body: CreateAccountClientBodySchemaType,
  ) {
    const result = await this.registerClient.execute({
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
    })

    if (result.isLeft()) {
      const error = result.value
      throw new ConflictException(error.message)
    }

    const { client } = result.value

    return {
      id: client.id.toString(),
      message: 'Account created successfully',
    }
  }
}
```

## 🎯 Exemplo 2: Authenticate Client

### ❌ ANTES

```typescript
import { PrismaService } from '@/infra/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common'
import { compare } from 'bcryptjs'

@Controller('/auth')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/login')
  async handle(@Body() body: any) {
    const { email, password } = body

    const client = await this.prisma.client.findUnique({
      where: { email },
    })

    if (!client) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const isPasswordValid = await compare(password, client.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const token = this.jwt.sign({
      sub: client.id,
      email: client.email,
      type: 'client',
    })

    return { access_token: token }
  }
}
```

### ✅ DEPOIS

```typescript
import { AuthenticateClientUseCase } from '@/domain/use-cases/client/authenticate-client'
import { JwtService } from '@nestjs/jwt'
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchemaType = z.infer<typeof authenticateBodySchema>

@Controller('/auth')
export class AuthenticateController {
  constructor(
    private authenticateClient: AuthenticateClientUseCase,
    private jwt: JwtService,
  ) {}

  @Post('/login')
  @HttpCode(200)
  async handle(
    @Body(new ZodValidationPipe(authenticateBodySchema))
    body: AuthenticateBodySchemaType,
  ) {
    const result = await this.authenticateClient.execute({
      email: body.email,
      password: body.password,
    })

    if (result.isLeft()) {
      const error = result.value
      throw new UnauthorizedException(error.message)
    }

    const { clientId } = result.value

    const token = this.jwt.sign({
      sub: clientId,
      type: 'client',
    })

    return { access_token: token }
  }
}
```

## 🎯 Exemplo 3: Create Barbershop

### ❌ ANTES

```typescript
import { PrismaService } from '@/infra/prisma/prisma.service'
import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'

@Controller('/barbershops')
export class BarbershopController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @CurrentUser() user: any) {
    const userId = user.sub

    const backofficeUser = await this.prisma.backofficeUser.findUnique({
      where: { id: userId },
      include: { barbershop: true },
    })

    if (!backofficeUser) {
      throw new NotFoundException('Usuário do backoffice não encontrado.')
    }

    if (backofficeUser.barbershop) {
      throw new ConflictException('Você já possui uma barbearia cadastrada.')
    }

    const barbershop = await this.prisma.barbershop.create({
      data: {
        ...body,
        ownerId: userId,
      },
    })

    return barbershop
  }
}
```

### ✅ DEPOIS

```typescript
import { CreateBarbershopUseCase } from '@/domain/use-cases/barbershop/create-barbershop'
import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  ConflictException,
  HttpCode,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayloadType } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const createBarbershopBodySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string(),
  avatar: z.string().url().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

type CreateBarbershopBodySchemaType = z.infer<
  typeof createBarbershopBodySchema
>

@Controller('/barbershops')
export class BarbershopController {
  constructor(private createBarbershop: CreateBarbershopUseCase) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ZodValidationPipe(createBarbershopBodySchema))
    body: CreateBarbershopBodySchemaType,
    @CurrentUser() user: UserPayloadType,
  ) {
    const result = await this.createBarbershop.execute({
      ...body,
      ownerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error.constructor.name === 'BackofficeUserNotFoundError') {
        throw new NotFoundException(error.message)
      }

      if (error.constructor.name === 'BarbershopAlreadyExistsError') {
        throw new ConflictException(error.message)
      }

      throw new Error('Erro inesperado')
    }

    const { barbershop } = result.value

    return {
      id: barbershop.id.toString(),
      name: barbershop.name,
      city: barbershop.city,
      state: barbershop.state,
    }
  }
}
```

## 🎯 Exemplo 4: List Barbershops (GET com query params)

### ❌ ANTES

```typescript
@Get()
async findAll(
  @Query('city') city?: string,
  @Query('state') state?: string,
  @Query('isActive') isActive?: string,
  @Query('page') page?: string,
  @Query('pageSize') pageSize?: string,
) {
  const where: any = {}

  if (city) where.city = city
  if (state) where.state = state
  if (isActive !== undefined) where.isActive = isActive === 'true'

  const currentPage = page ? parseInt(page, 10) : 1
  const currentPageSize = pageSize ? parseInt(pageSize, 10) : 10

  const [result, totalCount] = await Promise.all([
    this.prisma.barbershop.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        services: { where: { isActive: true } },
        businessHours: true,
        images: true,
      },
      take: currentPageSize,
      skip: (currentPage - 1) * currentPageSize,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.barbershop.count({ where }),
  ])

  return {
    data: result,
    total: totalCount,
    page: currentPage,
    pageSize: currentPageSize,
  }
}
```

### ✅ DEPOIS

```typescript
import { ListBarbershopsUseCase } from '@/domain/use-cases/barbershop/list-barbershops'
import { Controller, Get, Query, HttpCode } from '@nestjs/common'
import { z } from 'zod'

const listBarbershopsQuerySchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

@Controller('/barbershops')
export class BarbershopController {
  constructor(private listBarbershops: ListBarbershopsUseCase) {}

  @Get()
  @HttpCode(200)
  async findAll(@Query() query: any) {
    const { city, state, isActive, page, pageSize } =
      listBarbershopsQuerySchema.parse(query)

    const result = await this.listBarbershops.execute({
      city,
      state,
      isActive,
      page,
      pageSize,
    })

    // Como List não retorna erro, podemos assumir sucesso
    const { barbershops, total } = result.value

    return {
      data: barbershops.map((b) => ({
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        phone: b.phone,
        avatar: b.avatar,
        address: b.address,
        city: b.city,
        state: b.state,
        isActive: b.isActive,
        // Se precisar incluir relacionamentos, você precisará
        // carregar via outros repositórios ou criar um DTO específico
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }
}
```

## 📝 Passo a Passo para Migrar um Controller

### 1. Identifique os Casos de Uso Necessários

```
CreateAccountClientController → RegisterClientUseCase
AuthenticateController → AuthenticateClientUseCase
BarbershopController.create → CreateBarbershopUseCase
BarbershopController.findAll → ListBarbershopsUseCase
```

### 2. Crie o Módulo NestJS

```typescript
// src/infra/http/modules/client.module.ts
import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { ClientRepository } from '@/domain/repositories/client-repository'
import { PrismaClientRepository } from '@/infra/database/prisma/repositories/prisma-client-repository'
import { RegisterClientUseCase } from '@/domain/use-cases/client/register-client'
import { AuthenticateClientUseCase } from '@/domain/use-cases/client/authenticate-client'
import { GetClientProfileUseCase } from '@/domain/use-cases/client/get-client-profile'

@Module({
  providers: [
    PrismaService,
    {
      provide: ClientRepository,
      useClass: PrismaClientRepository,
    },
    RegisterClientUseCase,
    AuthenticateClientUseCase,
    GetClientProfileUseCase,
  ],
  exports: [
    RegisterClientUseCase,
    AuthenticateClientUseCase,
    GetClientProfileUseCase,
  ],
})
export class ClientModule {}
```

### 3. Importe o Módulo no HttpModule

```typescript
// src/infra/http/http.module.ts
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ClientModule } from './modules/client.module'
import { CreateAccountClientController } from './controllers/create-account-client.controller'
import { AuthenticateController } from './controllers/authenticate-client.controller'

@Module({
  imports: [
    AuthModule,
    ClientModule, // ← Adicione aqui
  ],
  controllers: [
    CreateAccountClientController,
    AuthenticateController,
    // ... outros
  ],
})
export class HttpModule {}
```

### 4. Refatore o Controller

- Remova `PrismaService` do construtor
- Injete o(s) caso(s) de uso necessário(s)
- Chame `useCase.execute()`
- Trate o retorno com `Either` (isLeft/isRight)
- Lance exceções HTTP apropriadas

### 5. Teste

```bash
# Inicie o servidor
npm run start:dev

# Teste o endpoint
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'
```

## 🚦 Checklist de Migração

Para cada controller migrado:

- [ ] Identificar casos de uso necessários
- [ ] Criar implementação do(s) repositório(s) no Prisma
- [ ] Criar módulo NestJS com providers
- [ ] Importar módulo no HttpModule
- [ ] Refatorar controller para usar casos de uso
- [ ] Adicionar validação Zod
- [ ] Tratar erros com Either pattern
- [ ] Testar endpoint manualmente
- [ ] Atualizar testes (se houver)

## 📊 Ordem Recomendada de Migração

1. **CreateAccountClientController** (mais simples)
2. **AuthenticateController** 
3. **GetUserProfileController**
4. **CreateAccountBackofficeController**
5. **AuthenticateBackofficeController**
6. **BarbershopController.create**
7. **BarbershopController** (outros métodos)

## 💡 Dicas

### Tratamento de Erros

```typescript
// Mapeie erros de domínio para HTTP exceptions
if (result.isLeft()) {
  const error = result.value

  // Por nome da classe
  if (error.constructor.name === 'ClientNotFoundError') {
    throw new NotFoundException(error.message)
  }

  // Por tipo
  if (error instanceof ClientNotFoundError) {
    throw new NotFoundException(error.message)
  }

  // Genérico
  throw new BadRequestException(error.message)
}
```

### DTOs de Resposta

```typescript
// Crie DTOs para padronizar respostas
interface BarbershopResponse {
  id: string
  name: string
  city: string
  state: string
}

function toBarbershopResponse(barbershop: Barbershop): BarbershopResponse {
  return {
    id: barbershop.id.toString(),
    name: barbershop.name,
    city: barbershop.city,
    state: barbershop.state,
  }
}
```

### Reutilizando Validações

```typescript
// Crie schemas compartilhados
// src/infra/http/schemas/barbershop.schema.ts
export const createBarbershopBodySchema = z.object({
  name: z.string().min(3),
  // ...
})

export const updateBarbershopBodySchema = z.object({
  name: z.string().min(3).optional(),
  // ...
})
```

## 🎯 Resultado Final

Após a migração completa, você terá:

✅ Controllers enxutos focados apenas em HTTP
✅ Lógica de negócio centralizada em casos de uso
✅ Código testável sem dependências de frameworks
✅ Separação clara de responsabilidades
✅ Fácil manutenção e expansão
