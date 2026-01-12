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

      const result = await service.issue('test-wallet', 'TestCredential', { name: 'John' });

      expect(result.type).toBe('TestCredential');
      expect(result.issuer).toBe('did:vc-server:issuer');
      expect(result.credentialSubject).toBe('did:vc-server:wallet:test-wallet');
      expect(result.claims).toEqual({ name: 'John' });
      expect(result.signature).toBe('mock-signature');
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
          { id: '1', type: 'Test', issuer: 'did:test', credentialSubject: 'did:subject', claims: {}, issuedAt: new Date(), signature: 'sig' },
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
          { id: 'cred-1', type: 'Test', issuer: 'did:test', credentialSubject: 'did:subject', claims: {}, issuedAt: new Date(), signature: 'sig' },
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
          { id: 'cred-1', type: 'Test', issuer: 'did:test', credentialSubject: 'did:subject', claims: {}, issuedAt: new Date(), signature: 'sig' },
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
        id: '1',
        type: 'Test',
        issuer: 'did:test',
        credentialSubject: 'did:subject',
        claims: {},
        issuedAt: new Date(),
        signature: 'valid-sig',
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for missing credential', async () => {
      const result = await service.verifyCredential(undefined);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Missing Credential');
    });

    it('should return invalid for missing signature', async () => {
      const credential = {
        id: '1',
        type: 'Test',
        issuer: 'did:test',
        credentialSubject: 'did:subject',
        claims: {},
        issuedAt: new Date(),
        signature: '',
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Missing signature');
    });

    it('should return invalid for invalid signature', async () => {
      issuerService.verify.mockReturnValue(false);
      const credential = {
        id: '1',
        type: 'Test',
        issuer: 'did:test',
        credentialSubject: 'did:subject',
        claims: {},
        issuedAt: new Date(),
        signature: 'invalid-sig',
      };

      const result = await service.verifyCredential(credential);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid signature');
    });
  });
});
