/**
 * API client for communicating with the Verifiable Credentials backend.
 * All requests include credentials to maintain wallet identity via cookies.
 * @module api
 */
import type { Credential } from "@/models/credential.model";

export type { Credential };

/** Backend server URL, configurable via NEXT_PUBLIC_BACKEND_URL environment variable */
const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/**
 * Request payload for issuing a new credential.
 */
export interface IssueCredentialRequest {
    /** The type/category of credential to issue */
    type: string;
    /** Key-value pairs of claims to include */
    claims: Record<string, unknown>;

    validFrom: string;

    validUntil: string;
}

/**
 * Result of credential verification.
 */
export interface VerifyResult {
    /** Whether the credential signature is valid */
    valid: boolean;
    /** Reason for invalid status (only present when valid is false) */
    reason?: string;
}



/**
 * Issues a new credential to the current wallet.
 * @param data - The credential type and claims to issue
 * @returns The newly issued credential with signature
 * @throws Error if the request fails
 */
export async function issueCredential(
    data: IssueCredentialRequest
): Promise<Credential> {
    const res = await fetch(`${BACKEND_URL}/credential/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error(`Failed to issue credential: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Retrieves all credentials stored in the current wallet.
 * @returns Array of all credentials
 * @throws Error if the request fails
 */
export async function listCredentials(): Promise<Credential[]> {
    const res = await fetch(`${BACKEND_URL}/credential/list`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`Failed to list credentials: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Retrieves a specific credential by its ID.
 * @param id - UUID of the credential to retrieve
 * @returns The credential object
 * @throws Error if the credential is not found or request fails
 */
export async function getCredential(id: string): Promise<Credential> {
    const res = await fetch(`${BACKEND_URL}/credential/${id}`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`Failed to get credential: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Verifies a credential stored in the wallet by its ID.
 * @param id - UUID of the credential to verify
 * @returns Verification result with validity status
 * @throws Error if the request fails
 */
export async function verifyCredentialById(id: string): Promise<VerifyResult> {
    const res = await fetch(`${BACKEND_URL}/credential/${id}/verify`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`Failed to verify credential: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Verifies a credential by sending the full credential object.
 * Useful for verifying credentials from external sources (e.g., pasted JSON).
 * @param credential - The full credential object to verify
 * @returns Verification result with validity status
 * @throws Error if the request fails
 */
export async function verifyCredential(
    credential: Credential
): Promise<VerifyResult> {
    const res = await fetch(`${BACKEND_URL}/credential/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
        throw new Error(`Failed to verify credential: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Deletes a credential from the wallet.
 * @param id - UUID of the credential to delete
 * @returns Confirmation object with deletion status and credential ID
 * @throws Error if the credential is not found or request fails
 */
export async function deleteCredential(id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await fetch(`${BACKEND_URL}/credential/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`Failed to delete credential: ${res.statusText}`);
    }
    return res.json();
}

/**
 * Attempts to repair common JSON issues before parsing.
 * Handles issues commonly encountered when users copy-paste JSON:
 * - Extracts credential object if wrapped in `{ credential: ... }`
 * - Replaces single quotes with double quotes
 * - Removes trailing commas before `}` or `]`
 * - Strips JavaScript-style comments
 *
 * @param input - Raw JSON string that may contain formatting issues
 * @returns Cleaned JSON string ready for parsing
 */
export function tryRepairJson(input: string): string {
    let json = input.trim();

    // Try to parse as-is first
    try {
        const parsed = JSON.parse(json);
        // If it has a credential property, extract just the credential
        if (parsed && typeof parsed === 'object' && 'credential' in parsed) {
            return JSON.stringify(parsed.credential);
        }
        return json;
    } catch {
        // Continue with repairs
    }

    // Replace single quotes with double quotes (common copy-paste issue)
    json = json.replace(/'/g, '"');

    // Remove trailing commas before } or ]
    json = json.replace(/,\s*([\}\]])/g, '$1');

    // Remove JavaScript-style comments
    json = json.replace(/\/\/.*$/gm, '');
    json = json.replace(/\/\*[\s\S]*?\*\//g, '');

    // Try to parse after repairs
    try {
        const parsed = JSON.parse(json);
        // If it has a credential property, extract just the credential
        if (parsed && typeof parsed === 'object' && 'credential' in parsed) {
            return JSON.stringify(parsed.credential);
        }
        return json;
    } catch {
        // Return the attempted repairs, let caller handle parse error
        return json;
    }
}
