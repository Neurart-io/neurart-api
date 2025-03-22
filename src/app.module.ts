import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeModule } from './stripe/stripe.module';
import { HttpErrorInterceptor } from './common/interceptors/http-error.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // tempo em segundos
          limit: 10, // número máximo de requisições nesse período
        },
      ],
    }),
    StripeModule.forRootAsync(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Interceptors globais
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Guards globais
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // O SubscriptionGuard geralmente não é usado globalmente,
    // mas aplicado em rotas específicas usando o decorador @UseGuards
  ],
})
export class AppModule {}
