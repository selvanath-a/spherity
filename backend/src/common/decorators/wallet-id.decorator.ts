import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WalletId = createParamDecorator(
  // Extracts walletId injected by WalletMiddleware.
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.walletId ?? '';
  },
);
