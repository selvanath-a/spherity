import { Credential } from "./models/credential.model";

export function getDisplayType(vc: Credential): string {
    // Returns the last type in the array as it's usually the most specific one
    // Filter out "VerifiableCredential" if possible, or just take the last one
    const types = vc.type.filter(t => t !== 'VerifiableCredential');
    return types.length > 0 ? types[types.length - 1] : 'VerifiableCredential';
}

export function getSubjectId(vc: Credential): string {
    return vc.credentialSubject.id;
}

export function getClaims(vc: Credential): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...claims } = vc.credentialSubject;
    return claims;
}
export function formatDate(dateString?: string) {
    if (!dateString) return "-";
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
