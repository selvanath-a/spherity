


export interface Proof {
    type: 'DataIntegrityProof';
    created: string;
    proofPurpose: 'assertionMethod';
    verificationMethod: string;
    /** Identifies the signature + canonicalization suite used. */
    cryptosuite: string;
    proofValue: string;
}

export type CredentialSubject = {
    id: string;
} & Record<string, unknown>;

/**
 * Represents a verifiable credential issued to a wallet.
 */
export type Credential ={
    '@context': string[];
    id: string;
    type: string[];
    issuer: string;
    validFrom: string;
    validUntil: string;
    credentialSubject: CredentialSubject;
    proof: Proof;
}
