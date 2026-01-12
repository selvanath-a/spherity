import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

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
    let walletId = req.cookies?.walletId;

    if (!walletId) {
      walletId = randomUUID();

      res.cookie('walletId', walletId, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    }

    (req as Request & { walletId?: string }).walletId = walletId;
    next();
  }
}