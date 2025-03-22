import { SetMetadata } from '@nestjs/common';

export const PLAN_KEY = 'requiredPlan';
export const RequiresPlan = (plan: string) => SetMetadata(PLAN_KEY, plan);
