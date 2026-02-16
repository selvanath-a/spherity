import { Test, TestingModule } from '@nestjs/testing';
import { CredentialService } from './credential.service';
import { IssuerService } from '../issuer/issuer.service';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

/**
 * Integration tests for the credential issuance and verification flow.
 * These tests use REAL cryptographic operations (no mocking of crypto services)
 * to verify that the entire chain works correctly end-to-end.
 */
describe('Credential Integration Tests', () => {
    let credentialService: CredentialService;
    let issuerService: IssuerService;
    let cryptoService: CryptoService;

    function dateWindow() {
        return {
            validFrom: new Date('2024-01-01T00:00:00.000Z').toISOString(),
            validUntil: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        };
    }

    beforeEach(async () => {
        jest.clearAllMocks();

        // Create a test module with REAL services (no mocks for crypto/issuer)
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CredentialService,
                IssuerService,
                CryptoService, // Real crypto service
            ],
        }).compile();

        credentialService = module.get<CredentialService>(CredentialService);
        issuerService = module.get<IssuerService>(IssuerService);
        cryptoService = module.get<CryptoService>(CryptoService);

        // Mock file system operations (we still don't want to touch the real filesystem)
        mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.writeFile.mockResolvedValue(undefined);

        // Initialize the issuer service to generate real keys
        await issuerService.onModuleInit();
    });

    describe('End-to-End Credential Flow with Real Crypto', () => {
        it('should issue a credential with real signature and verify it successfully', async () => {
            const walletId = 'test-wallet-123';
            const credentialType = 'DriverLicense';
            const claims = {
                name: 'Alice Johnson',
                licenseNumber: 'DL-123456',
                expiryDate: '2030-12-31',
            };

            // Issue a credential with REAL cryptographic signing
            const issuedCredential = await credentialService.issue(
                walletId,
                credentialType,
                claims,
                dateWindow().validFrom,
                dateWindow().validUntil,
            );

            // Verify the credential structure
            expect(issuedCredential).toHaveProperty('id');
            expect(issuedCredential).toHaveProperty('proof');
            expect(issuedCredential.validUntil).toBeDefined();
            expect(issuedCredential.type).toEqual(['VerifiableCredential', credentialType]);
            expect(issuedCredential.credentialSubject).toMatchObject({
                id: `did:vc-server:wallet:${walletId}`,
                ...claims,
            });
            expect(issuedCredential.issuer).toBe(issuerService.getIssuerDid());

            // Verify the credential with REAL cryptographic verification
            const verificationResult = await credentialService.verifyCredential(
                issuedCredential,
            );

            expect(verificationResult.valid).toBe(true);
            expect(verificationResult.reason).toBeUndefined();
        });

        it('should reject tampered credential data', async () => {
            // Issue a valid credential
            const credential = await credentialService.issue(
                'wallet-456',
                'Diploma',
                { degree: 'Bachelor of Science', university: 'MIT' },
                dateWindow().validFrom,
                dateWindow().validUntil,
            );

            // Tamper with the claims
            const tamperedCredential = {
                ...credential,
                credentialSubject: {
                    ...credential.credentialSubject,
                    degree: 'PhD', // Changed!
                }
            };

            // Verification should fail because signature doesn't match tampered data
            const result = await credentialService.verifyCredential(
                tamperedCredential,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid signature');
        });

        it('should reject credential with tampered signature', async () => {
            const credential = await credentialService.issue(
                'wallet-789',
                'MembershipCard',
                { memberLevel: 'Gold' },
                dateWindow().validFrom,
                dateWindow().validUntil,
            );

            // Tamper with the signature
            const tamperedCredential = {
                ...credential,
                proof: {
                    ...credential.proof,
                    proofValue: credential.proof.proofValue.slice(0, -4) + 'ffff',
                }
            };

            const result = await credentialService.verifyCredential(
                tamperedCredential,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid signature');
        });

        it('should reject credential with completely fake signature', async () => {
            const credential = await credentialService.issue(
                'wallet-999',
                'AccessBadge',
                { accessLevel: 'Admin' },
                dateWindow().validFrom,
                dateWindow().validUntil,
            );

            // Replace with a completely fake signature
            const fakeCredential = {
                ...credential,
                proof: {
                    ...credential.proof,
                    proofValue: 'a'.repeat(128), // Valid length but wrong signature
                }
            };

            const result = await credentialService.verifyCredential(fakeCredential);

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid signature');
        });

        it('should handle multiple credentials with different signatures', async () => {
            // Issue multiple credentials
            const cred1 = await credentialService.issue('wallet-1', 'TypeA', {
                data: 'A',
            }, dateWindow().validFrom, dateWindow().validUntil);
            const cred2 = await credentialService.issue('wallet-2', 'TypeB', {
                data: 'B',
            }, dateWindow().validFrom, dateWindow().validUntil);

            // Each should have unique signatures
            expect(cred1.proof.proofValue).not.toBe(cred2.proof.proofValue);

            // Both should verify successfully
            const result1 = await credentialService.verifyCredential(cred1);
            const result2 = await credentialService.verifyCredential(cred2);

            expect(result1.valid).toBe(true);
            expect(result2.valid).toBe(true);
        });

        it('should reject replay attack (using signature from one credential on another)', async () => {
            const cred1 = await credentialService.issue('wallet-1', 'Document1', {
                value: 100,
            }, dateWindow().validFrom, dateWindow().validUntil);
            const cred2 = await credentialService.issue('wallet-2', 'Document2', {
                value: 200,
            }, dateWindow().validFrom, dateWindow().validUntil);

            // Try to use cred1's signature on cred2's data (replay attack)
            const replayAttempt = {
                ...cred2,
                proof: {
                    ...cred2.proof,
                    proofValue: cred1.proof.proofValue,
                }
            };

            const result = await credentialService.verifyCredential(replayAttempt);

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid signature');
        });

        it('should verify credential regardless of claim object property order', async () => {
            // Issue credential with claims in one order
            const credential = await credentialService.issue('wallet-order', 'Test', {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
            }, dateWindow().validFrom, dateWindow().validUntil);

            // Verify should work even if we reconstruct with different property order
            // (This tests that canonicalization is working correctly)
            const reorderedCredential = {
                ...credential,
                credentialSubject: {
                    id: credential.credentialSubject.id,
                    age: 30,
                    lastName: 'Doe',
                    firstName: 'John',
                },
            };

            const result = await credentialService.verifyCredential(
                reorderedCredential,
            );

            expect(result.valid).toBe(true);
        });

        it('should detect even subtle tampering in nested claims', async () => {
            const credential = await credentialService.issue('wallet-nested', 'ID', {
                personal: {
                    name: 'Alice',
                    address: {
                        street: '123 Main St',
                        city: 'Boston',
                    },
                },
            }, dateWindow().validFrom, dateWindow().validUntil);

            // Tamper with a deeply nested value
            const tamperedCredential = {
                ...credential,
                credentialSubject: {
                    id: credential.credentialSubject.id,
                    personal: {
                        name: 'Alice',
                        address: {
                            street: '123 Main St',
                            city: 'Cambridge', // Changed!
                        },
                    },
                }
            };

            const result = await credentialService.verifyCredential(
                tamperedCredential,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid signature');
        });
    });

    describe('Cryptographic Properties', () => {
        it('should use Ed25519 signatures with correct length', async () => {
            const credential = await credentialService.issue('wallet-crypto', 'Test', {
                test: 'data',
            }, dateWindow().validFrom, dateWindow().validUntil);

            // Ed25519 signatures are 64 bytes = 128 hex characters
            expect(credential.proof.proofValue).toHaveLength(128);
            expect(credential.proof.proofValue).toMatch(/^[0-9a-f]+$/);
        });

        it('should produce deterministic signatures for identical data', async () => {
            // Mock the file system to return the same wallet data
            const walletData = { credentials: [] };
            mockFs.readFile.mockResolvedValue(JSON.stringify(walletData));

            const data = { test: 'deterministic' };

            // We can't directly test this at the credential level because each credential
            // gets a unique ID and timestamp. But we can verify through the crypto service.
            const keyPair = cryptoService.generateKeyPair();
            const sig1 = cryptoService.sign(data, keyPair.privateKey);
            const sig2 = cryptoService.sign(data, keyPair.privateKey);

            expect(sig1).toBe(sig2);
        });
    });
});
