import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithWalletId } from '../types/request-with-wallet-id.type';

export const WalletId = createParamDecorator(
  // Extracts walletId injected by WalletMiddleware.
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithWalletId>();
    return request.walletId ?? '';
  },
);
