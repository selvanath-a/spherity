import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CredentialModule } from './credential/credential.module';
import { WalletMiddleware } from './wallet/wallet.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Root application module for the Verifiable Credentials server.
 * Configures the wallet middleware globally and imports feature modules.
 */
@Module({
  imports: [CredentialModule,
    // Global rate limiting (ttl in ms for @nestjs/throttler v6).
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 30,
        },
      ],
    })],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }, AppService],
})
export class AppModule implements NestModule {
  /**
   * Configures middleware for all routes.
   * Applies WalletMiddleware globally to manage wallet identity cookies.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WalletMiddleware).forRoutes('*');
  }
}
