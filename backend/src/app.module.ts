import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CredentialModule } from './credential/credential.module';
import { WalletMiddleware } from './wallet/wallet.middleware';

/**
 * Root application module for the Verifiable Credentials server.
 * Configures the wallet middleware globally and imports feature modules.
 */
@Module({
  imports: [CredentialModule],
  controllers: [AppController],
  providers: [AppService],
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
