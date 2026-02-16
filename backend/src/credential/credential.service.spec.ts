import { Test, TestingModule } from '@nestjs/testing';
import { CredentialService } from './credential.service';
import { IssuerService } from '../issuer/issuer.service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('CredentialService', () => {
  let service: CredentialService;
  let issuerService: jest.Mocked<IssuerService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialService,
        {
          provide: IssuerService,
          useValue: {
            getIssuerDid: jest.fn().mockReturnValue('did:vc-server:issuer'),
            sign: jest.fn().mockReturnValue('mock-signature'),
            verify: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CredentialService>(CredentialService);
    issuerService = module.get(IssuerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issue', () => {
    it('should issue a new credential', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.issue(
        'test-wallet',
        'TestCredential',
        { name: 'John' },
        '2024-01-01T00:00:00Z',
        '2025-01-01T00:00:00Z',
      );

      expect(result.type).toEqual(['VerifiableCredential', 'TestCredential']);
      expect(result.issuer).toBe('did:vc-server:issuer');
      expect(result.credentialSubject).toEqual({
        id: 'did:vc-server:wallet:test-wallet',
        name: 'John',
      });
      expect(result.validUntil).toEqual(expect.any(String));
      expect(result.proof.proofValue).toBe('mock-signature');
      expect(result.proof.cryptosuite).toBe('ed25519-2020');
      expect(issuerService.sign).toHaveBeenCalled();
    });
  });

  describe('getCredentialsList', () => {
    it('should return empty list for new wallet', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.getCredentialsList('test-wallet');

      expect(result).toEqual([]);
    });

    it('should return credentials from existing wallet', async () => {
      const mockStore = {
        credentials: [
          {
            '@context': ['https://www.w3.org/ns/credentials/v2'],
            id: '1',
            type: ['VerifiableCredential', 'Test'],
            issuer: 'did:test',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2025-01-01T00:00:00Z',
            credentialSubject: { id: 'did:subject' },
            proof: {
              type: 'DataIntegrityProof',
              created: '2024-01-01T00:00:00Z',
              proofPurpose: 'assertionMethod',
              verificationMethod: 'did:vc-server:issuer#key-1',
              cryptosuite: 'ed25519-2020',
              proofValue: 'sig',
            },
          },
        ],
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStore));

      const result = await service.getCredentialsList('test-wallet');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getCredentialById', () => {
    it('should return credential by id', async () => {
      const mockStore = {
        credentials: [
          {
            '@context': ['https://www.w3.org/ns/credentials/v2'],
            id: 'cred-1',
            type: ['VerifiableCredential', 'Test'],
            issuer: 'did:test',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2025-01-01T00:00:00Z',
            credentialSubject: { id: 'did:subject' },
            proof: {
              type: 'DataIntegrityProof',
              created: '2024-01-01T00:00:00Z',
              proofPurpose: 'assertionMethod',
              verificationMethod: 'did:vc-server:issuer#key-1',
              cryptosuite: 'ed25519-2020',
              proofValue: 'sig',
            },
          },
        ],
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStore));

      const result = await service.getCredentialById('test-wallet', 'cred-1');

      expect(result?.id).toBe('cred-1');
    });

    it('should return undefined for non-existent credential', async () => {
      const mockStore = { credentials: [] };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStore));

      const result = await service.getCredentialById('test-wallet', 'non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('deleteCredential', () => {
    it('should delete existing credential', async () => {
      const mockStore = {
        credentials: [
          {
            '@context': ['https://www.w3.org/ns/credentials/v2'],
            id: 'cred-1',
            type: ['VerifiableCredential', 'Test'],
            issuer: 'did:test',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2025-01-01T00:00:00Z',
            credentialSubject: { id: 'did:subject' },
            proof: {
              type: 'DataIntegrityProof',
              created: '2024-01-01T00:00:00Z',
              proofPurpose: 'assertionMethod',
              verificationMethod: 'did:vc-server:issuer#key-1',
              cryptosuite: 'ed25519-2020',
              proofValue: 'sig',
            },
          },
        ],
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStore));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.deleteCredential('test-wallet', 'cred-1');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-wallet.json'),
        expect.stringContaining('"credentials": []'),
      );
    });

    it('should throw for non-existent credential', async () => {
      const mockStore = { credentials: [] };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStore));

      await expect(service.deleteCredential('test-wallet', 'non-existent')).rejects.toThrow();
    });
  });

  describe('verifyCredential', () => {
    it('should return valid for correct signature', async () => {
      const credential = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: '1',
        type: ['VerifiableCredential', 'Test'],
        issuer: 'did:test',
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2025-01-01T00:00:00Z',
        credentialSubject: { id: 'did:subject' },
        proof: {
          type: 'DataIntegrityProof',
          created: '2024-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:vc-server:issuer#key-1',
          cryptosuite: 'ed25519-2020',
          proofValue: 'valid-sig',
        },
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(true);
    });

    it('should verify credential with correct signature extraction', async () => {
      const credential = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: 'test-id',
        type: ['VerifiableCredential', 'TestCredential'],
        issuer: 'did:test:issuer',
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2025-01-01T00:00:00Z',
        credentialSubject: { id: 'did:test:subject', name: 'Alice', age: 30 },
        proof: {
          type: 'DataIntegrityProof',
          created: '2024-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:vc-server:issuer#key-1',
          cryptosuite: 'ed25519-2020',
          proofValue: 'actual-signature-value',
        },
      };

      await service.verifyCredential(credential);

      // Verify that issuerService.verify was called with the correct arguments:
      // 1. Credential data WITHOUT the signature
      // 2. The signature as a separate argument
      expect(issuerService.verify).toHaveBeenCalledWith(
        {
          '@context': ['https://www.w3.org/ns/credentials/v2'],
          id: 'test-id',
          type: ['VerifiableCredential', 'TestCredential'],
          issuer: 'did:test:issuer',
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2025-01-01T00:00:00Z',
          credentialSubject: { id: 'did:test:subject', name: 'Alice', age: 30 },
          // Note: proof is NOT included in the credential data
        },
        'actual-signature-value' // proofValue passed separately
      );
    });

    it('should return invalid for missing credential', async () => {
      const result = await service.verifyCredential(undefined);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Missing Credential');
    });

    it('should return invalid for missing proof', async () => {
      const credential = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: '1',
        type: ['VerifiableCredential', 'Test'],
        issuer: 'did:test',
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2025-01-01T00:00:00Z',
        credentialSubject: { id: 'did:subject' },
        proof: {
          type: 'DataIntegrityProof',
          created: '2024-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:vc-server:issuer#key-1',
          cryptosuite: 'ed25519-2020',
          proofValue: '',
        },
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Missing proof');
    });

    it('should return invalid for unsupported cryptosuite', async () => {
      const credential = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: '1',
        type: ['VerifiableCredential', 'Test'],
        issuer: 'did:test',
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2025-01-01T00:00:00Z',
        credentialSubject: { id: 'did:subject' },
        proof: {
          type: 'DataIntegrityProof',
          created: '2024-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:vc-server:issuer#key-1',
          cryptosuite: 'unsupported-suite',
          proofValue: 'valid-sig',
        },
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Unsupported cryptosuite');
    });

    it('should return invalid for invalid signature', async () => {
      issuerService.verify.mockReturnValue(false);
      const credential = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: '1',
        type: ['VerifiableCredential', 'Test'],
        issuer: 'did:test',
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2025-01-01T00:00:00Z',
        credentialSubject: { id: 'did:subject' },
        proof: {
          type: 'DataIntegrityProof',
          created: '2024-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:vc-server:issuer#key-1',
          cryptosuite: 'ed25519-2020',
          proofValue: 'invalid-sig',
        },
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid signature');
    });
  });
});
