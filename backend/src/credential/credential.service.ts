import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import path from 'path';
import { IssuerService } from 'src/issuer/issuer.service';

/**
 * Represents a verifiable credential issued to a wallet.
 */
export interface Credential {
    /** Unique identifier for the credential (UUID) */
    id: string,
    /** The type/category of the credential (e.g., "DriverLicense", "Diploma") */
    type: string,
    /** DID of the issuer who signed the credential */
    issuer: string,
    /** DID of the subject (wallet) the credential is issued to */
    credentialSubject: string,
    /** Key-value pairs containing the credential's claims/attributes */
    claims: Record<string, any>,
    /** Timestamp when the credential was issued */
    issuedAt: Date,
    /** Cryptographic signature proving authenticity */
    signature: string
}

/**
 * Storage structure for a wallet's credentials.
 */
export interface CredentialStore {
    /** Array of credentials stored in the wallet */
    credentials: Credential[];
}
/**
 * Service for managing verifiable credentials within wallets.
 * Handles issuance, storage, retrieval, deletion, and verification of credentials.
 * Credentials are persisted as JSON files in the data/wallets directory.
 */
@Injectable()
export class CredentialService {

    private walletPath(walletId: string) {
        return path.join(process.cwd(), 'data', 'wallets', `${walletId}.json`);
    }

    private async loadWallet(walletId: string): Promise<CredentialStore> {
        const file = this.walletPath(walletId);
        try {
            const rawCreds = await fs.readFile(file, 'utf-8');
            const parsed = JSON.parse(rawCreds) as CredentialStore;
            parsed.credentials ??= [];
            return parsed;
        } catch {
            const fresh: CredentialStore = { credentials: [] };
            await this.saveWallet(walletId, fresh);
            return fresh;
        }
    }

    private async saveWallet(walletId: string, store: CredentialStore): Promise<void> {
        const dir = path.dirname(this.walletPath(walletId));
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.walletPath(walletId), JSON.stringify(store, null, 2));
    }

    private credentialSubjectDid(walletId: string) {
        return `did:vc-server:wallet:${walletId}`;
    }

    constructor(private readonly issuerService: IssuerService) { }

    /**
     * Issues a new credential to a wallet.
     * @param walletId - The wallet to issue the credential to
     * @param type - The type/category of credential
     * @param claims - Key-value pairs of claims to include in the credential
     * @returns The newly issued and signed credential
     */
    async issue(walletId: string, type: string, claims: Record<string, unknown>): Promise<Credential> {
        const vcWallet = await this.loadWallet(walletId);
        const credentialUnsigned = {
            id: randomUUID(),
            type,
            issuer: this.issuerService.getIssuerDid(),
            credentialSubject: this.credentialSubjectDid(walletId),
            claims,
            issuedAt: new Date(),
        };
        const signature = this.issuerService.sign(credentialUnsigned);
        const credential: Credential = {
            ...credentialUnsigned,
            signature
        };
        vcWallet.credentials.push(credential);
        await this.saveWallet(walletId, vcWallet);
        return credential;
    }

    /**
     * Retrieves all credentials stored in a wallet.
     * @param walletId - The wallet to retrieve credentials from
     * @returns Array of all credentials in the wallet
     */
    async getCredentialsList(walletId: string): Promise<Credential[]> {
        const vcWallet = await this.loadWallet(walletId);
        return vcWallet.credentials;
    }

    /**
     * Retrieves a specific credential by its ID.
     * @param walletId - The wallet containing the credential
     * @param credentialId - The UUID of the credential to retrieve
     * @returns The credential if found, undefined otherwise
     */
    async getCredentialById(walletId: string, credentialId: string): Promise<Credential | undefined> {
        const vcWallet = await this.loadWallet(walletId);
        return vcWallet.credentials.find(c => c.id === credentialId);
    }

    /**
     * Verifies a credential by its ID within a wallet.
     * @param walletId - The wallet containing the credential
     * @param credentialId - The UUID of the credential to verify
     * @returns Verification result with validity status and optional reason if invalid
     */
    async verifyCredentialWithId(walletId: string, credentialId: string): Promise<{ valid: boolean, reason?: string }> {
        try {
            const credential = await this.getCredentialById(walletId, credentialId);
            return this.verifyCredential(credential);
        } catch {
            return { valid: false, reason: 'Error during verification' };
        }
    }

    /**
     * Verifies a credential's signature and validity.
     * @param credential - The credential to verify
     * @returns Verification result with validity status and optional reason if invalid
     */
    async verifyCredential(credential: Credential | undefined): Promise<{ valid: boolean, reason?: string }> {
        try {
            if (!credential) {
                return { valid: false, reason: 'Missing Credential' };
            }
            if (!credential.signature) {
                return { valid: false, reason: 'Missing signature' };
            }
            const verified = this.issuerService.verify(credential, credential.signature);
            return verified ? { valid: true } : { valid: false, reason: 'Invalid signature' };
        } catch {
            return { valid: false, reason: 'Error during verification' };
        }
    }


    /**
     * Deletes a credential from a wallet.
     * @param walletId - The wallet containing the credential
     * @param credentialId - The UUID of the credential to delete
     * @returns Confirmation object with deletion status and credential ID
     * @throws NotFoundException if the credential does not exist
     */
    async deleteCredential(walletId: string, credentialId: string): Promise<{ deleted: boolean; id: string }> {
        const vcWallet = await this.loadWallet(walletId);
        const idx = vcWallet.credentials.findIndex((c) => c.id === credentialId);
        if (idx === -1) throw new NotFoundException(`Credential ${credentialId} not found`);
        vcWallet.credentials.splice(idx, 1);
        await this.saveWallet(walletId, vcWallet);
        return { deleted: true, id: credentialId };
    }

}


