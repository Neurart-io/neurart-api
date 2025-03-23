/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async getOrCreateStripeCustomer(userId: string, email: string) {
    const subscription = await this.supabaseService.getUserSubscription(userId);

    if (subscription?.stripe_customer_id) {
      return subscription.stripe_customer_id;
    }

    const customer = await this.stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });

    await this.supabaseService.updateUserSubscription({
      user_id: userId,
      stripe_customer_id: customer.id,
      status: 'free',
      images_remaining: 10, // valor default do plano gratuito
      max_images_per_generation: 1,
      storage_limit: 104857600, // 100MB
    });

    return customer.id;
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string,
  ): Promise<string> {
    const customerId = await this.getOrCreateStripeCustomer(userId, email);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/canceled`,
      metadata: { userId },
    });

    return session.url as string;
  }

  async createPortalSession(userId: string): Promise<string> {
    const subscription = await this.supabaseService.getUserSubscription(userId);

    if (!subscription?.stripe_customer_id) {
      throw new Error('Nenhuma assinatura encontrada para este usuário');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${this.configService.get('FRONTEND_URL')}/account`,
    });

    return session.url as string;
  }

  // async handleWebhook(signature: string, payload: Buffer) {
  //   let event: Stripe.Event;

  //   try {
  //     event = this.stripe.webhooks.constructEvent(
  //       payload,
  //       signature,
  //       this.configService.get('STRIPE_WEBHOOK_SECRET') as string,
  //     );
  //   } catch (err) {
  //     throw new Error(`Webhook Error: ${err.message}`);
  //   }

  //   switch (event.type) {
  //     case 'checkout.session.completed':
  //       const session = event.data.object as Stripe.Checkout.Session;
  //       await this.handleSubscriptionUpdate(session);
  //       break;
  //     case 'customer.subscription.updated':
  //     case 'customer.subscription.deleted':
  //       const subscription = event.data.object as Stripe.Subscription;
  //       await this.handleSubscriptionUpdate(subscription);
  //       break;
  //   }
  // }

  private async handleSubscriptionCreated(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.userId as string;
    const subscriptionId = session.subscription as string;

    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    const planConfig = await this.supabaseService.getPlanConfiguration(priceId);

    await this.supabaseService.updateUserSubscription({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      plan_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      images_remaining: planConfig?.images_per_month as number,
      max_images_per_generation:
        planConfig?.max_images_per_generation as number,
      storage_limit: planConfig?.storage_limit as number,
    });
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = subscription.customer as string;

    const { data: subscriptionData } = await this.supabaseService.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!subscriptionData) return;

    const priceId = subscription.items.data[0].price.id;
    const planConfig = await this.supabaseService.getPlanConfiguration(priceId);

    await this.supabaseService.updateUserSubscription({
      user_id: subscriptionData.user_id,
      stripe_subscription_id: subscription.id,
      plan_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      // Se o plano mudou, atualizar limites
      images_remaining: planConfig.images_per_month,
      max_images_per_generation: planConfig.max_images_per_generation,
      storage_limit: planConfig.storage_limit,
    });
  }
}
