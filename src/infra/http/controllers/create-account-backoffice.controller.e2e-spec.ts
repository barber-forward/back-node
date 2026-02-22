import request from 'supertest'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { Test } from '@nestjs/testing'

describe('CreateAccountBackofficeController (E2E)', () => {
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

  test('[POST] /backoffice/accounts', async () => {
    const response = await request(app.getHttpServer())
      .post('/backoffice/accounts')
      .send({
        name: 'Tiago Teste BKO',
        email: 'tiagotestebko@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)

    const userOnDatebase = await prisma.backofficeUser.findUnique({
      where: {
        email: 'tiagotestebko@example.com',
      },
    })

    expect(userOnDatebase).toBeTruthy()
    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
