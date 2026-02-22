import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'

describe('GetUserProfileController (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /users/me', async () => {
    const user = await prisma.client.create({
      data: {
        name: 'Tiago Teste',
        email: 'tiagoteste@example.com',
        password: await hash('123456', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)

    const userOnDatebase = await prisma.client.findUnique({
      where: {
        email: 'tiagoteste@example.com',
      },
    })

    expect(userOnDatebase).toBeTruthy()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: expect.any(String),
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    })
  })
})
