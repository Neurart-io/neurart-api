import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageQueueService {
  private queue: Queue;

  constructor(private config: ConfigService) {
    this.queue = new Queue('image-generation', {
      connection: {
        host: this.config.get('REDIS_HOST') || 'localhost',
        port: 6379,
      },
    });
  }

  async enqueueImageJob(prompt: string, userId: string) {
    await this.queue.add('generate', { prompt, userId });
  }
}
