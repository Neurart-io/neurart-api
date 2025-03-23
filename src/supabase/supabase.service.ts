/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_KEY'),
    );
  }

  async getUserSubscription(userId: string) {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateUserSubscription(subscription: any) {
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

  async getPlanConfiguration(priceId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('plans_configuration')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllPlans(region: string = 'BR') {
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
