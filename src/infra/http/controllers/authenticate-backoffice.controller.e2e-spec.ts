import request from 'supertest'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'

describe('AuthenticateBackofficeController (E2E)', () => {
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

  test('[POST] /backoffice/sessions', async () => {
    await prisma.backofficeUser.create({
      data: {
        name: 'Tiago Teste BKO',
        email: 'tiagotestebko@example.com',
        password: await hash('123456', 8),
      },
    })

    const response = await request(app.getHttpServer())
      .post('/backoffice/sessions')
      .send({
        email: 'tiagotestebko@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      data: {
        user: {
          name: 'Tiago Teste BKO',
          email: 'tiagotestebko@example.com',
        },
        access_token: expect.any(String),
      },
    })
  })
})
