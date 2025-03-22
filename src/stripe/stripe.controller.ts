import { Controller, Get, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequiresPlan } from '../common/decorators/requires-plan.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get('products')
  async getProducts() {
    return await this.stripeService.getProducts();
  }

  @Get('customers')
  @UseGuards(SubscriptionGuard)
  @RequiresPlan('premium') // Este é apenas um exemplo, defina os nomes dos planos conforme seu negócio
  async getCustomers() {
    return await this.stripeService.getCustomers();
  }
}
