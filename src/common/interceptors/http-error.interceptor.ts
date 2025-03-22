/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: any) => {
        this.logger.error(`Erro capturado: ${error.message}`, error.stack);

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Erros do Stripe geralmente têm uma estrutura específica
        if (error.type && error.type.startsWith('Stripe')) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: error.message,
                  error: 'Erro no processamento de pagamento',
                  code: error.code,
                },
                HttpStatus.BAD_REQUEST,
              ),
          );
        }

        // Erro genérico (não tratado)
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Ocorreu um erro interno no servidor',
                error: 'Internal Server Error',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
