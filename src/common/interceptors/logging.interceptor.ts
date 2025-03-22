/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    const now = Date.now();

    this.logger.log(`Requisição: ${method} ${url} ${ip} ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `Resposta: ${method} ${url} ${response.statusCode} ${delay}ms`,
          );
        },
        error: (err) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Falha: ${method} ${url} ${err.status || 500} ${delay}ms - ${err.message}`,
          );
        },
      }),
    );
  }
}
