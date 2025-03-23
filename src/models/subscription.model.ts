export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_id?: string;
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'free';
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  images_remaining: number;
  max_images_per_generation: number;
  storage_limit: number;
  created_at: Date;
  updated_at: Date;
}

export interface PlanConfiguration {
  id: string;
  stripe_price_id: string;
  name: string;
  description?: string;
  images_per_month: number;
  max_images_per_generation: number;
  storage_limit: number;
  is_free: boolean;
  region: 'BR' | 'INTL';
  created_at: Date;
  updated_at: Date;
}
