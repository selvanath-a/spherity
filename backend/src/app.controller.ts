import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root application controller.
 * Provides basic health check endpoint.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint.
   * @route GET /
   * @returns Welcome message indicating the server is running
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
