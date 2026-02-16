import { CredentialService } from '../src/credential/credential.service';
import { CryptoService } from '../src/crypto/crypto.service';
import { IssuerService } from '../src/issuer/issuer.service';

async function main() {
// Run with:
// node -r ts-node/register -r tsconfig-paths/register scripts/seed.ts [wallet-id] [credentials-count]

  const crypto = new CryptoService();
  const issuer = new IssuerService(crypto);
  await issuer.onModuleInit();
  const svc = new CredentialService(issuer);

  const walletId = process.argv[2] || 'seed-wallet';
  const count = Number(process.argv[3] || 10);

  console.log(`Seeding ${count} credentials to wallet: ${walletId}`);

  const types = ['GymMembership', 'DriverLicense', 'StudentID', 'AccessBadge'];
  const levels = ['Gold', 'Silver', 'Bronze'];
  const cities = ['Berlin', 'Munich', 'Hamburg', 'Cologne'];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const validFrom = new Date().toISOString();
    const validUntil = new Date(
      Date.now() + (180 + (i % 365)) * 24 * 60 * 60 * 1000,
    ).toISOString();

    await svc.issue(
      walletId,
      type,
      {
        index: i,
        level,
        city,
        memberId: `M-${1000 + i}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
      },
      validFrom,
      validUntil,
    );
  }
  console.log('\nDone!');
}




main().catch((e) => {
  console.error(e);
  process.exit(1);
});

