import { Credential } from "@/lib/schemas/credential";

export function getDisplayType(vc: Credential): string {
    // Returns the last type in the array as it's usually the most specific one
    // Filter out "VerifiableCredential" if possible, or just take the last one
    const types = vc.type.filter(t => t !== 'VerifiableCredential');
    return types.length > 0 ? types[types.length - 1] : 'VerifiableCredential';
}

export function formatDate(dateString?: string) {
    if (!dateString || Number.isNaN(new Date(dateString).getTime()))
        return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export function isExpired(validUntil?: string) {
    if (!validUntil) return false;
    const expiry = new Date(validUntil);
    if (Number.isNaN(expiry.getTime())) return false;
    return expiry.getTime() < Date.now();
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
            return JSON.stringify((parsed as { credential: unknown }).credential);
        }
        return json;
    } catch {
        // Continue with repairs
    }

    // Replace single quotes with double quotes (common copy-paste issue)
    // TODO: Can cause issues in legitimate single quotes eg. D'Souza
    // json = json.replace(/'/g, '"');

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
            return JSON.stringify((parsed as { credential: unknown }).credential);
        }
        return json;
    } catch {
        // Return the attempted repairs, let caller handle parse error
        return json;
    }
}