import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestWithWalletId } from 'src/common/types/request-with-wallet-id.type';

/**
 * Middleware that manages wallet identity via HTTP cookies.
 * Creates a new wallet ID for first-time visitors and persists it
 * across requests using a secure, HTTP-only cookie.
 */
@Injectable()
export class WalletMiddleware implements NestMiddleware {
  /**
   * Processes each request to ensure a wallet ID is available.
   * If no walletId cookie exists, generates a new UUID and sets it.
   * Attaches the walletId to the request object for use by controllers.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    const request = req as RequestWithWalletId;

    const walletIdFromCookie = request.cookies?.walletId;
    const walletId = walletIdFromCookie ?? randomUUID();
    if (!walletIdFromCookie) {
      res.cookie('walletId', walletId, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    }

    request.walletId = walletId;
    next();
  }
}
