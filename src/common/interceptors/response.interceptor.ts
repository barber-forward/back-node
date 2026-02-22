import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Request, Response } from 'express'
import { SKIP_RESPONSE_TRANSFORM_KEY } from '../decorators/skip-response-transform.decorator'

export interface ApiResponse<T> {
  statusCode: number
  message?: string
  success?: boolean
  data: T
  timestamp: string
  path: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  private readonly logger = new Logger(ResponseInterceptor.name)

  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (skipTransform) {
      return next.handle()
    }

    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const startTime = Date.now()

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - startTime

        if (process.env.NODE_ENV !== 'production') {
          this.logger.log(
            `${request.method} ${request.url} - ${response.statusCode} - ${responseTime}ms`,
          )
        }

        if (
          data &&
          typeof data === 'object' &&
          ('message' in data || 'success' in data)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { message, success, data: innerData, ...rest } = data as any

          return {
            statusCode: response.statusCode,
            ...(success !== undefined && { success }),
            ...(message && { message }),
            data: innerData !== undefined ? innerData : rest,
            timestamp: new Date().toISOString(),
            path: request.url,
          }
        }

        return {
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        }
      }),
    )
  }
}
