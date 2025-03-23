/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SupabaseService } from '../supabase/supabase.service';
@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private supabaseService: SupabaseService,
  ) {}

  // @Get('plans')
  // async getPlans(@Headers('x-region') region: string = 'BR') {
  //   return await this.stripeService.getAllPlans(region);
  // }

  @Post('create-checkout')
  async createCheckout(
    @Body() body: { userId: string; email: string; priceId: string },
  ) {
    const { userId, email, priceId } = body;

    const url = await this.stripeService.createCheckoutSession(
      userId,
      email,
      priceId,
    );
    return { url };
  }

  @Post('create-portal')
  async createPortal(@Body() body: { userId: string }) {
    const { userId } = body;

    const url = await this.stripeService.createPortalSession(userId);
    return { url };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.stripeService.handleWebhook(signature, req.rawBody as Buffer);
    return { received: true };
  }
}
