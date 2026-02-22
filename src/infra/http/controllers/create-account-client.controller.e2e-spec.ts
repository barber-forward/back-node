import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { Test } from '@nestjs/testing'

describe('CreateAccountClientController (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Tiago Teste',
        email: 'tiagoteste@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)

    const userOnDatebase = await prisma.client.findUnique({
      where: {
        email: 'tiagoteste@example.com',
      },
    })

    expect(userOnDatebase).toBeTruthy()
    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
