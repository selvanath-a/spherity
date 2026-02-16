import type { Request } from 'express';

type WalletCookies = Record<string, string | undefined> & {
  walletId?: string;
};

export type RequestWithWalletId = Request & {
  walletId?: string;
  cookies?: WalletCookies;
};
