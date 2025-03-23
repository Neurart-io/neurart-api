import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [StripeController],
  providers: [
    {
      provide: 'STRIPE_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('STRIPE_SECRET_KEY') as string,
      inject: [ConfigService],
    },
    StripeService,
  ],
  exports: [StripeService],
})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      imports: [ConfigModule.forRoot()],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService) =>
            configService.get('STRIPE_API_KEY') as string,
          inject: [ConfigService],
        },
      ],
    };
  }
}
