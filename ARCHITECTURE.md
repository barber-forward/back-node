# 🏗️ Arquitetura do Sistema - Visão Geral

## 📊 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│                     (Controllers/HTTP)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Client     │  │  Backoffice  │  │  Barbershop  │     │
│  │ Controller   │  │  Controller  │  │  Controller  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────┐
│         ▼                  ▼                  ▼             │
│              CAMADA DE APLICAÇÃO (Use Cases)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RegisterClient  │  CreateBarbershop  │  CreateApp  │   │
│  │  Authenticate    │  ListBarbershops   │  CancelApp  │   │
│  │  GetProfile      │  GetDetails        │  ListApps   │   │
│  └────────┬─────────────────┬────────────────┬─────────┘   │
│           │                 │                │             │
└───────────┼─────────────────┼────────────────┼─────────────┘
            │                 │                │
            │                 │                │
┌───────────┼─────────────────┼────────────────┼─────────────┐
│           ▼                 ▼                ▼             │
│          CAMADA DE DOMÍNIO (Regras de Negócio)            │
│  ┌───────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │   Entidades   │  │Repositórios│  │ Value Objects│     │
│  │               │  │(Interfaces)│  │    & Enums   │     │
│  │  - Client     │  │            │  │              │     │
│  │  - Backoffice │◄─┤ - Client   │  │ - Either     │     │
│  │  - Barbershop │  │ - Barber.. │  │ - Status     │     │
│  │  - Service    │  │ - Service  │  │ - Roles      │     │
│  │  - Appointm.  │  │ - Appointm.│  │              │     │
│  └───────────────┘  └─────┬──────┘  └──────────────┘     │
│                            │                              │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │ implements
┌────────────────────────────┼──────────────────────────────┐
│                            ▼                              │
│              CAMADA DE INFRAESTRUTURA                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Implementações de Repositórios             │   │
│  │  - PrismaClientRepository                          │   │
│  │  - PrismaBarbershopRepository                      │   │
│  │  - PrismaAppointmentRepository                     │   │
│  └───────────────────────┬────────────────────────────┘   │
│                          │                                │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Prisma ORM / Database                 │   │
│  │                   PostgreSQL                        │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de uma Requisição

### Exemplo: Criar um Agendamento

```
1. CLIENT REQUEST
   POST /appointments
   Body: { clientId, barbershopId, serviceId, date }
           │
           ▼
2. CONTROLLER (Presentation Layer)
   AppointmentController.create()
   - Valida entrada (Zod)
   - Extrai dados do token JWT
           │
           ▼
3. USE CASE (Application Layer)
   CreateAppointmentUseCase.execute()
   - Valida cliente existe
   - Valida barbearia existe
   - Valida serviço existe e está ativo
   - Cria entidade Appointment
   - Persiste no repositório
           │
           ▼
4. REPOSITORY (Domain Layer - Interface)
   AppointmentRepository.create(appointment)
           │
           ▼
5. PRISMA REPOSITORY (Infrastructure Layer)
   PrismaAppointmentRepository.create()
   - Converte Entidade → Prisma Model
   - Salva no banco de dados
           │
           ▼
6. DATABASE
   PostgreSQL
   INSERT INTO appointments...
           │
           ▼
7. RESPONSE
   Either.right({ appointment })
   → Controller retorna 201 Created
```

## 📦 Estrutura de Arquivos Criada

```
src/
├── domain/                              [✅ CRIADA]
│   ├── core/
│   │   ├── entity.ts                   # Classe base para entidades
│   │   ├── unique-entity-id.ts         # ID único
│   │   ├── either.ts                   # Either pattern
│   │   └── errors/
│   │       └── use-case-error.ts
│   │
│   ├── enums/
│   │   └── index.ts                    # BackofficeRole, AppointmentStatus, DayOfWeek
│   │
│   ├── entities/                        # 8 entidades criadas
│   │   ├── client.ts
│   │   ├── backoffice-user.ts
│   │   ├── barbershop.ts
│   │   ├── service.ts
│   │   ├── appointment.ts
│   │   ├── business-hour.ts
│   │   ├── favorite.ts
│   │   └── barbershop-image.ts
│   │
│   ├── repositories/                    # 8 interfaces criadas
│   │   ├── client-repository.ts
│   │   ├── backoffice-user-repository.ts
│   │   ├── barbershop-repository.ts
│   │   ├── service-repository.ts
│   │   ├── appointment-repository.ts
│   │   ├── business-hour-repository.ts
│   │   ├── favorite-repository.ts
│   │   └── barbershop-image-repository.ts
│   │
│   ├── use-cases/                       # 11 casos de uso criados
│   │   ├── client/
│   │   │   ├── register-client.ts
│   │   │   ├── authenticate-client.ts
│   │   │   └── get-client-profile.ts
│   │   ├── backoffice/
│   │   │   ├── register-backoffice-user.ts
│   │   │   └── authenticate-backoffice-user.ts
│   │   ├── barbershop/
│   │   │   ├── create-barbershop.ts
│   │   │   ├── get-barbershop-details.ts
│   │   │   └── list-barbershops.ts
│   │   └── appointment/
│   │       ├── create-appointment.ts
│   │       ├── cancel-appointment.ts
│   │       └── list-client-appointments.ts
│   │
│   └── README.md                        # Documentação completa
│
└── infra/
    ├── database/
    │   └── prisma/
    │       └── repositories/            [✅ EXEMPLOS CRIADOS]
    │           ├── prisma-client-repository.ts
    │           ├── prisma-barbershop-repository.ts
    │           └── README.md
    │
    └── http/
        ├── controllers/                 [⚠️ PRECISAM SER ADAPTADOS]
        │   └── ...
        └── modules/                     [📝 PRECISAM SER CRIADOS]
            ├── client.module.ts
            ├── backoffice.module.ts
            ├── barbershop.module.ts
            └── appointment.module.ts
```

## ✅ O Que Foi Criado

### ✅ Camada de Domínio (100% completa)
- ✅ 8 Entidades com regras de negócio
- ✅ 8 Interfaces de repositórios
- ✅ 11 Casos de uso funcionais
- ✅ Core classes (Entity, Either, UniqueEntityID)
- ✅ Enums e tipos

### ✅ Exemplos de Implementação
- ✅ 2 Repositórios Prisma de exemplo
- ✅ Documentação completa
- ✅ Guias de uso

## 📝 Próximos Passos

### 1. Implementar Repositórios Restantes (Infraestrutura)
```bash
src/infra/database/prisma/repositories/
├── ✅ prisma-client-repository.ts
├── ✅ prisma-barbershop-repository.ts
├── ⬜ prisma-backoffice-user-repository.ts
├── ⬜ prisma-service-repository.ts
├── ⬜ prisma-appointment-repository.ts
├── ⬜ prisma-business-hour-repository.ts
├── ⬜ prisma-favorite-repository.ts
└── ⬜ prisma-barbershop-image-repository.ts
```

### 2. Criar Módulos NestJS
```typescript
// src/infra/http/modules/client.module.ts
@Module({
  providers: [
    PrismaService,
    { provide: ClientRepository, useClass: PrismaClientRepository },
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

### 3. Adaptar Controllers Existentes
```typescript
// Antes (acoplado ao Prisma)
@Controller('/auth')
export class CreateAccountClientController {
  constructor(private prisma: PrismaService) {}
  
  async handle(@Body() body: any) {
    await this.prisma.client.create({ ... })
  }
}

// Depois (usando casos de uso)
@Controller('/auth')
export class CreateAccountClientController {
  constructor(private registerClient: RegisterClientUseCase) {}
  
  async handle(@Body() body: any) {
    const result = await this.registerClient.execute({ ... })
    
    if (result.isLeft()) {
      throw new ConflictException(result.value.message)
    }
    
    return { id: result.value.client.id.toString() }
  }
}
```

### 4. Criar Mais Casos de Uso
```
Sugestões:
- UpdateClientProfile
- UpdateBarbershop
- CreateService
- UpdateService
- ConfirmAppointment (backoffice)
- AddFavorite
- RemoveFavorite
- GetAvailableTimes
- CreateBusinessHours
```

## 🎯 Benefícios da Arquitetura

### ✅ Testabilidade
- Casos de uso podem ser testados com repositórios in-memory
- Não precisa de banco de dados para testar regras de negócio

### ✅ Manutenibilidade
- Cada camada tem uma responsabilidade clara
- Fácil localizar e modificar código

### ✅ Escalabilidade
- Adicionar novos recursos segue o mesmo padrão
- Código organizado e previsível

### ✅ Independência de Framework
- O domínio não conhece NestJS, Prisma ou Express
- Pode trocar frameworks sem reescrever regras de negócio

### ✅ Regras de Negócio Centralizadas
- Todas as regras estão nas entidades e casos de uso
- Não há lógica espalhada em controllers

## 🚀 Como Continuar

1. **Comece adaptando um controller existente**
   - Escolha o mais simples (ex: CreateAccountClientController)
   - Crie o módulo correspondente
   - Injete o caso de uso
   - Refatore o controller

2. **Implemente os repositórios necessários**
   - Use os exemplos como base
   - Teste manualmente chamando os endpoints

3. **Adicione novos casos de uso conforme necessário**
   - Identifique uma funcionalidade
   - Crie o caso de uso
   - Adicione no módulo
   - Crie/adapte o controller

4. **Escreva testes** (opcional mas recomendado)
   - Crie repositórios in-memory
   - Teste os casos de uso isoladamente
   - Adicione testes E2E para os endpoints

## 📚 Recursos de Aprendizado

- **Clean Architecture**: Livro de Robert C. Martin
- **Domain-Driven Design**: Livro de Eric Evans
- **NestJS Documentation**: https://docs.nestjs.com
- **Rocketseat - Node.js**: Cursos sobre arquitetura limpa

## 🤔 Dúvidas Frequentes

**Q: Por que tanto código para algo simples?**
R: No início parece mais trabalhoso, mas conforme o app cresce, fica muito mais fácil manter e adicionar features.

**Q: Posso misturar? Usar domínio em algumas partes e Prisma direto em outras?**
R: Tecnicamente sim, mas perde os benefícios. Melhor migrar gradualmente.

**Q: Preciso criar caso de uso até para consultas simples?**
R: Sim. Mesmo consultas simples devem passar por casos de uso para manter consistência.

**Q: E se eu precisar de uma funcionalidade urgente?**
R: Você pode criar temporariamente no controller, mas deixe um TODO para refatorar depois.
