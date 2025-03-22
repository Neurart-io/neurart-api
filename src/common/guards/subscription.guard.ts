/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly stripeService: StripeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Recuperar os metadados da rota, se houver
    const requiredPlan = this.reflector.get<string>(
      'requiredPlan',
      context.getHandler(),
    );

    // Se não houver plano requerido, permitir acesso
    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Aqui você precisaria implementar a lógica para extrair o usuário
    // do contexto de autenticação (que ainda não está implementado)
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // Exemplo de verificação de assinatura (isso precisará ser adaptado)
    // Aqui você integraria com o serviço do Stripe para verificar se o usuário
    // tem uma assinatura ativa do plano requerido
    try {
      // Implementação fictícia - você precisará implementar isso adequadamente
      // com base na lógica do seu negócio
      const hasActiveSubscription = await this.checkUserSubscription(
        userId,
        requiredPlan,
      );

      if (!hasActiveSubscription) {
        throw new UnauthorizedException(
          'Assinatura requerida para acessar este recurso',
        );
      }

      return true;
    } catch (error: any) {
      console.error(error);
      throw new UnauthorizedException(
        'Erro ao verificar assinatura do usuário',
      );
    }
  }

  // Método a ser implementado para verificar a assinatura do usuário
  private checkUserSubscription(
    userId: string,
    plan: string,
  ): Promise<boolean> {
    console.log(userId, plan);
    // Implementação fictícia - você precisará implementar a lógica real
    // baseada em como você armazena e verifica as assinaturas

    // Exemplo: buscar cliente no Stripe pelo ID do usuário
    // const customer = await this.stripeService.findCustomerByUserId(userId);
    // const subscription = await this.stripeService.getActiveSubscription(customer.id);
    // return subscription && subscription.plan.id === plan;

    // Por enquanto, retornaremos true para não bloquear o desenvolvimento
    return Promise.resolve(true);
  }
}
