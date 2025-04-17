import { Controller, Post, Body } from '@nestjs/common';
import { ImageQueueService } from './image-queue.service';

@Controller('generate')
export class ImageQueueController {
  constructor(private readonly queueService: ImageQueueService) {}

  @Post()
  async createJob(@Body() body: { prompt: string; userId: string }) {
    await this.queueService.enqueueImageJob(body.prompt, body.userId);
    return { status: 'ok', message: 'Imagem será gerada em breve' };
  }
}
