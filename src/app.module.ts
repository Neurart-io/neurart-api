import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeModule } from './stripe/stripe.module';
import { SupabaseModule } from './supabase/supabase.module';
import { HttpErrorInterceptor } from './common/interceptors/http-error.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerGuard } from './common/guards/throttler.guard';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { ImageQueueController } from './jobs/image-queue.controller';
import { ImageQueueService } from './jobs/image-queue.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 20,
      },
    ]),
    SupabaseModule,
    StripeModule,
  ],
  controllers: [AppController, ImageQueueController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    ImageQueueService,
  ],
})
export class AppModule {}
