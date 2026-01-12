import { Test, TestingModule } from '@nestjs/testing';
import { IssuerService } from './issuer.service';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('IssuerService', () => {
  let service: IssuerService;
  let cryptoService: jest.Mocked<CryptoService>;

  const mockKeyPair = {
    publicKey: 'mock-public-key-hex',
    privateKey: 'mock-private-key-hex',
  };

  const mockStoredKeys = {
    issuerDid: 'did:key:stored-issuer',
    publicKey: 'stored-public-key-hex',
    privateKey: 'stored-private-key-hex',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuerService,
        {
          provide: CryptoService,
          useValue: {
            generateKeyPair: jest.fn().mockReturnValue(mockKeyPair),
            sign: jest.fn().mockReturnValue('mock-signature'),
            verify: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<IssuerService>(IssuerService);
    cryptoService = module.get(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should load existing keys from file', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));

      await service.onModuleInit();

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('issuer-keys.json'),
        'utf-8',
      );
      expect(service.getIssuerDid()).toBe('did:key:stored-issuer');
      expect(service.getPublicKey()).toBe('stored-public-key-hex');
    });

    it('should generate new keys when file does not exist', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(cryptoService.generateKeyPair).toHaveBeenCalled();
      expect(service.getIssuerDid()).toBe('did:vc-server:issuer');
      expect(service.getPublicKey()).toBe('mock-public-key-hex');
    });

    it('should save newly generated keys to file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true },
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('issuer-keys.json'),
        expect.stringContaining('did:vc-server:issuer'),
      );
    });

    it('should generate new keys when file contains invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(cryptoService.generateKeyPair).toHaveBeenCalled();
      expect(service.getIssuerDid()).toBe('did:vc-server:issuer');
    });
  });

  describe('save', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));
      await service.onModuleInit();
    });

    it('should create directory if it does not exist', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.save();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true },
      );
    });

    it('should write keys to file as formatted JSON', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.save();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('issuer-keys.json'),
        JSON.stringify(mockStoredKeys, null, 2),
      );
    });
  });

  describe('getIssuerDid', () => {
    it('should return the issuer DID', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));
      await service.onModuleInit();

      expect(service.getIssuerDid()).toBe('did:key:stored-issuer');
    });
  });

  describe('getPublicKey', () => {
    it('should return the public key', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));
      await service.onModuleInit();

      expect(service.getPublicKey()).toBe('stored-public-key-hex');
    });
  });

  describe('sign', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));
      await service.onModuleInit();
    });

    it('should sign data using the crypto service', () => {
      const data = { test: 'data' };

      const signature = service.sign(data);

      expect(cryptoService.sign).toHaveBeenCalledWith(
        data,
        'stored-private-key-hex',
      );
      expect(signature).toBe('mock-signature');
    });

    it('should pass the private key to crypto service', () => {
      service.sign({ message: 'hello' });

      expect(cryptoService.sign).toHaveBeenCalledWith(
        { message: 'hello' },
        'stored-private-key-hex',
      );
    });
  });

  describe('verify', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockStoredKeys));
      await service.onModuleInit();
    });

    it('should verify signature using the crypto service', () => {
      const data = { test: 'data' };
      const signature = 'some-signature';

      const result = service.verify(data, signature);

      expect(cryptoService.verify).toHaveBeenCalledWith(
        data,
        signature,
        'stored-public-key-hex',
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      cryptoService.verify.mockReturnValue(false);

      const result = service.verify({ data: 'test' }, 'invalid-signature');

      expect(result).toBe(false);
    });
  });
});
