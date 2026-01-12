import { Injectable } from '@nestjs/common';
import canonicalize from 'canonicalize';
import nacl from 'tweetnacl';

/**
 * Low-level cryptographic service using TweetNaCl (Ed25519).
 * Provides key generation, data canonicalization, signing, and verification.
 */
@Injectable()
export class CryptoService {

    /**
     * Generates a new Ed25519 key pair for signing operations.
     * @returns Object containing hex-encoded public and private keys
     */
    generateKeyPair(): { publicKey: string, privateKey: string } {
        const keyPair = nacl.sign.keyPair();
        return {
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
            privateKey: Buffer.from(keyPair.secretKey).toString('hex')
        }
    }

    /**
     * Canonicalizes data to a deterministic JSON string for consistent signing.
     * @param data - The data to canonicalize
     * @returns Canonicalized JSON string
     */
    canonicalize(data: unknown): string {
        return canonicalize(data) ?? '';
    }

    /**
     * Signs data using Ed25519 detached signature.
     * @param data - The data to sign (will be canonicalized first)
     * @param privateKey - Hex-encoded Ed25519 private key
     * @returns Hex-encoded signature
     */
    sign(data: unknown, privateKey: string): string {
        const message = this.canonicalize(data);
        const messageBytes = Buffer.from(message, 'hex');
        const privateKeyBytes = Buffer.from(privateKey, 'hex');
        const signature = nacl.sign.detached(messageBytes, privateKeyBytes);
        return Buffer.from(signature).toString('hex');
    }

    /**
     * Verifies an Ed25519 signature against data and public key.
     * @param data - The original data that was signed
     * @param signature - Hex-encoded signature to verify
     * @param publicKey - Hex-encoded Ed25519 public key
     * @returns True if signature is valid, false otherwise
     */
    verify(data: unknown, signature: string, publicKey: string): boolean {
        try {
            const message = this.canonicalize(data);
            const messageBytes = Buffer.from(message, 'hex');
            const signatureBytes = Buffer.from(signature, 'hex');
            const publicKeyBytes = Buffer.from(publicKey, 'hex');
            return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        } catch {
            return false;
        }
    }
}
