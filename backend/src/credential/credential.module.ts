import { Module } from '@nestjs/common';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { IssuerService } from 'src/issuer/issuer.service';

/**
 * Feature module for credential management.
 * Provides endpoints and services for issuing, storing, retrieving,
 * verifying, and deleting verifiable credentials.
 */
@Module({
  controllers: [CredentialController],
  providers: [CredentialService, CryptoService, IssuerService]
})
export class CredentialModule {}
