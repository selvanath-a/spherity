import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs/promises';
import { CryptoService } from 'src/crypto/crypto.service';

/**
 * Persisted issuer key configuration.
 */
export interface IssuerKeysFile {
    /** DID identifier for the issuer (e.g., "did:vc-server:issuer") */
    issuerDid: string;
    /** Hex-encoded Ed25519 private key (TweetNaCl secretKey) */
    privateKey: string;
    /** Hex-encoded Ed25519 public key */
    publicKey: string;
}

/**
 * Service managing the credential issuer's identity and cryptographic operations.
 * Loads or generates issuer keys on startup and persists them to disk.
 * Provides signing and verification using the issuer's key pair.
 */
@Injectable()
export class IssuerService implements OnModuleInit {
    private readonly keysFilePath = path.join(process.cwd(), 'data', 'issuer-keys.json');
    private keys: IssuerKeysFile;

    private readonly DEFAULT_ISSUER_DID = 'did:vc-server:issuer';

    constructor(private readonly cryptoService: CryptoService) { }

    /**
     * Initializes the issuer service on module startup.
     * Loads existing keys from disk or generates new ones if not found.
     */
    async onModuleInit() {
        try {
            const data = await fs.readFile(this.keysFilePath, 'utf-8');
            this.keys = JSON.parse(data) as IssuerKeysFile;
        }
        catch {
            this.keys = { issuerDid: this.DEFAULT_ISSUER_DID, ...this.cryptoService.generateKeyPair() };
            await this.save();
        }
    }

    /**
     * Persists the current issuer keys to disk.
     */
    async save(): Promise<void> {
        const dir = path.dirname(this.keysFilePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.keysFilePath, JSON.stringify(this.keys, null, 2));
    }

    /**
     * Returns the issuer's DID identifier.
     * @returns The issuer DID string
     */
    getIssuerDid(): string {
        return this.keys.issuerDid;
    }

    /**
     * Returns the issuer's public key.
     * @returns Hex-encoded public key
     */
    getPublicKey(): string {
        return this.keys.publicKey;
    }

    /**
     * Signs data using the issuer's private key.
     * @param data - The data to sign
     * @returns Hex-encoded signature
     */
    sign(data: unknown): string {
        return this.cryptoService.sign(data, this.keys.privateKey);
    }

    /**
     * Verifies a signature using the issuer's public key.
     * @param data - The original data that was signed
     * @param signature - Hex-encoded signature to verify
     * @returns True if signature is valid, false otherwise
     */
    verify(data: unknown, signature: string): boolean {
        return this.cryptoService.verify(data, signature, this.keys.publicKey);
    }
}
