import { WalletMiddleware } from './wallet.middleware';

describe('WalletMiddleware', () => {
  it('should be defined', () => {
    expect(new WalletMiddleware()).toBeDefined();
  });
});
