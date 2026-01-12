import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateKeyPair', () => {
    it('should generate valid Ed25519 key pair', () => {
      const keyPair = service.generateKeyPair();

      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      // Ed25519 public key is 32 bytes = 64 hex chars
      expect(keyPair.publicKey).toHaveLength(64);
      // Ed25519 private key is 64 bytes = 128 hex chars
      expect(keyPair.privateKey).toHaveLength(128);
    });

    it('should generate unique key pairs each time', () => {
      const keyPair1 = service.generateKeyPair();
      const keyPair2 = service.generateKeyPair();

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe('canonicalize', () => {
    it('should produce deterministic output for objects', () => {
      const data1 = { b: 2, a: 1 };
      const data2 = { a: 1, b: 2 };

      expect(service.canonicalize(data1)).toBe(service.canonicalize(data2));
    });

    it('should handle nested objects', () => {
      const data = { outer: { inner: 'value' } };
      const result = service.canonicalize(data);

      expect(result).toBe('{"outer":{"inner":"value"}}');
    });

    it('should handle arrays', () => {
      const data = { items: [3, 1, 2] };
      const result = service.canonicalize(data);

      expect(result).toBe('{"items":[3,1,2]}');
    });

    it('should return empty string for undefined', () => {
      const result = service.canonicalize(undefined);
      expect(result).toBe('');
    });
  });

  describe('sign', () => {
    it('should produce valid hex signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };

      const signature = service.sign(data, keyPair.privateKey);

      // Ed25519 signature is 64 bytes = 128 hex chars
      expect(signature).toHaveLength(128);
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should produce different signatures for different data', () => {
      const keyPair = service.generateKeyPair();

      const sig1 = service.sign({ msg: 'hello' }, keyPair.privateKey);
      const sig2 = service.sign({ msg: 'world' }, keyPair.privateKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce same signature for same data', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'consistent' };

      const sig1 = service.sign(data, keyPair.privateKey);
      const sig2 = service.sign(data, keyPair.privateKey);

      expect(sig1).toBe(sig2);
    });

    it('should produce same signature regardless of object key order', () => {
      const keyPair = service.generateKeyPair();

      const sig1 = service.sign({ a: 1, b: 2 }, keyPair.privateKey);
      const sig2 = service.sign({ b: 2, a: 1 }, keyPair.privateKey);

      expect(sig1).toBe(sig2);
    });
  });

  describe('verify', () => {
    it('should verify valid signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test data' };
      const signature = service.sign(data, keyPair.privateKey);

      const isValid = service.verify(data, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject signature with wrong public key', () => {
      const keyPair1 = service.generateKeyPair();
      const keyPair2 = service.generateKeyPair();
      const data = { message: 'test' };
      const signature = service.sign(data, keyPair1.privateKey);

      const isValid = service.verify(data, signature, keyPair2.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject signature when data is tampered', () => {
      const keyPair = service.generateKeyPair();
      const originalData = { message: 'original' };
      const signature = service.sign(originalData, keyPair.privateKey);
      const tamperedData = { message: 'tampered' };

      const isValid = service.verify(tamperedData, signature, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject invalid signature format', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };

      const isValid = service.verify(data, 'invalid-signature', keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject truncated signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const signature = service.sign(data, keyPair.privateKey);
      const truncatedSig = signature.slice(0, 64); // Half the signature

      const isValid = service.verify(data, truncatedSig, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject modified signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const signature = service.sign(data, keyPair.privateKey);
      // Flip some bits in the signature
      const modifiedSig = signature.slice(0, -4) + 'ffff';

      const isValid = service.verify(data, modifiedSig, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject empty signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };

      const isValid = service.verify(data, '', keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject invalid public key format', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const signature = service.sign(data, keyPair.privateKey);

      const isValid = service.verify(data, signature, 'invalid-public-key');

      expect(isValid).toBe(false);
    });

    it('should reject signature with added extra bytes', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const signature = service.sign(data, keyPair.privateKey);
      const extendedSig = signature + 'deadbeef';

      const isValid = service.verify(data, extendedSig, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should handle verification with null-like data gracefully', () => {
      const keyPair = service.generateKeyPair();

      // These should not throw, just return false for mismatched data
      expect(service.verify(null, 'abc', keyPair.publicKey)).toBe(false);
      expect(service.verify(undefined, 'abc', keyPair.publicKey)).toBe(false);
    });

    it('should verify regardless of object property order', () => {
      const keyPair = service.generateKeyPair();
      const signature = service.sign({ a: 1, b: 2 }, keyPair.privateKey);

      // Verify with different property order
      const isValid = service.verify({ b: 2, a: 1 }, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });
  });

  describe('bad signature scenarios', () => {
    it('should reject signature created with different private key', () => {
      const keyPair1 = service.generateKeyPair();
      const keyPair2 = service.generateKeyPair();
      const data = { credential: 'data' };
      const signature = service.sign(data, keyPair2.privateKey);

      // Try to verify with keyPair1's public key
      expect(service.verify(data, signature, keyPair1.publicKey)).toBe(false);
    });

    it('should reject forged signature attempting replay attack', () => {
      const keyPair = service.generateKeyPair();
      const originalData = { id: '123', amount: 100 };
      const signature = service.sign(originalData, keyPair.privateKey);

      // Attacker tries to use same signature with modified data
      const tamperedData = { id: '123', amount: 1000000 };
      expect(service.verify(tamperedData, signature, keyPair.publicKey)).toBe(false);
    });

    it('should reject signature with flipped bits', () => {
      const keyPair = service.generateKeyPair();
      const data = { test: 'data' };
      const signature = service.sign(data, keyPair.privateKey);

      // XOR first byte with 0xFF to flip all its bits
      const firstByte = parseInt(signature.slice(0, 2), 16);
      const flippedByte = (firstByte ^ 0xff).toString(16).padStart(2, '0');
      const flippedSig = flippedByte + signature.slice(2);
      expect(service.verify(data, flippedSig, keyPair.publicKey)).toBe(false);
    });

    it('should reject all-zero signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const zeroSig = '0'.repeat(128);

      expect(service.verify(data, zeroSig, keyPair.publicKey)).toBe(false);
    });

    it('should reject all-f signature', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };
      const ffSig = 'f'.repeat(128);

      expect(service.verify(data, ffSig, keyPair.publicKey)).toBe(false);
    });

    it('should reject signature with non-hex characters', () => {
      const keyPair = service.generateKeyPair();
      const data = { message: 'test' };

      expect(service.verify(data, 'ghijklmnop'.repeat(13), keyPair.publicKey)).toBe(false);
    });
  });
});
