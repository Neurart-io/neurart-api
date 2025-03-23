/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import {
  UserSubscription,
  PlanConfiguration,
} from 'src/models/subscription.model';

@Injectable()
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL') as string,
      this.configService.get('SUPABASE_SERVICE_KEY') as string,
    );
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateUserSubscription(
    subscription: Omit<UserSubscription, 'created_at' | 'updated_at' | 'id'>,
  ): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .upsert({
        ...subscription,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPlanConfiguration(priceId: string): Promise<PlanConfiguration> {
    const { data, error } = await this.supabase
      .from('plans_configuration')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllPlans(region: string = 'BR'): Promise<PlanConfiguration[]> {
    const { data, error } = await this.supabase
      .from('plans_configuration')
      .select('*')
      .eq('region', region)
      .order('is_free', { ascending: false })
      .order('images_per_month', { ascending: true });

    if (error) throw error;
    return data;
  }
}
