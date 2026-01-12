import { Injectable } from '@nestjs/common';

/**
 * Root application service.
 * Provides basic application-level functionality.
 */
@Injectable()
export class AppService {
  /**
   * Returns a welcome message for the health check endpoint.
   * @returns Hello World greeting
   */
  getHello(): string {
    return 'Hello World!';
  }
}
