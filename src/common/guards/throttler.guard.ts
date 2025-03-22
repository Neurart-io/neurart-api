import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  // Podemos personalizar o comportamento aqui, se necessário
  // Por exemplo, para ignorar certas rotas ou IPs específicos
}
