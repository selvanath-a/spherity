import { Test, TestingModule } from '@nestjs/testing';
import { CredentialController } from './credential.controller';
import { CredentialService, Credential } from './credential.service';

describe('CredentialController', () => {
  let controller: CredentialController;
  let credentialService: jest.Mocked<CredentialService>;

  const mockCredential: Credential = {
    id: 'test-id',
    type: 'TestCredential',
    issuer: 'did:vc-server:issuer',
    credentialSubject: 'did:vc-server:wallet:test-wallet',
    claims: { name: 'Test' },
    issuedAt: new Date(),
    signature: 'test-signature',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredentialController],
      providers: [
        {
          provide: CredentialService,
          useValue: {
            issue: jest.fn().mockResolvedValue(mockCredential),
            getCredentialsList: jest.fn().mockResolvedValue([mockCredential]),
            getCredentialById: jest.fn().mockResolvedValue(mockCredential),
            verifyCredentialWithId: jest.fn().mockResolvedValue({ valid: true }),
            verifyCredential: jest.fn().mockResolvedValue({ valid: true }),
            deleteCredential: jest.fn().mockResolvedValue({ deleted: true, id: 'test-id' }),
          },
        },
      ],
    }).compile();

    controller = module.get<CredentialController>(CredentialController);
    credentialService = module.get(CredentialService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('issueCredential', () => {
    it('should issue a credential', async () => {
      const req = { walletId: 'test-wallet' } as any;
      const body = { type: 'TestCredential', claims: { name: 'Test' } };

      const result = await controller.issueCredential(req, body);

      expect(credentialService.issue).toHaveBeenCalledWith('test-wallet', 'TestCredential', { name: 'Test' });
      expect(result).toEqual(mockCredential);
    });
  });

  describe('getCredentials', () => {
    it('should return list of credentials', async () => {
      const req = { walletId: 'test-wallet' } as any;

      const result = await controller.getAllCredentials(req);

      expect(credentialService.getCredentialsList).toHaveBeenCalledWith('test-wallet');
      expect(result).toEqual([mockCredential]);
    });
  });

  describe('getCredential', () => {
    it('should return a single credential', async () => {
      const req = { walletId: 'test-wallet' } as any;

      const result = await controller.getCredentialbyId(req, 'test-id');

      expect(credentialService.getCredentialById).toHaveBeenCalledWith('test-wallet', 'test-id');
      expect(result).toEqual(mockCredential);
    });
  });

  describe('verifyCredentialWithId', () => {
    it('should verify credential by ID', async () => {
      const req = { walletId: 'test-wallet' } as any;

      const result = await controller.verifyCredentialWithId(req, 'test-id');

      expect(credentialService.verifyCredentialWithId).toHaveBeenCalledWith('test-wallet', 'test-id');
      expect(result).toEqual({ valid: true });
    });
  });

  describe('verifyCredential', () => {
    it('should verify credential object', async () => {
      const result = await controller.verifyCredential({ credential: mockCredential });

      expect(credentialService.verifyCredential).toHaveBeenCalledWith(mockCredential);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('deleteCredential', () => {
    it('should delete a credential and return confirmation', async () => {
      const req = { walletId: 'test-wallet' } as any;

      const result = await controller.deleteCredential(req, 'test-id');

      expect(credentialService.deleteCredential).toHaveBeenCalledWith('test-wallet', 'test-id');
      expect(result).toEqual({ deleted: true, id: 'test-id' });
    });
  });
});
