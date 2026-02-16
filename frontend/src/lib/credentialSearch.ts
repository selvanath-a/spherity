import type { Credential } from "@/lib/schemas/credential";

export function getCredentialSearchText(credential: Credential): string {
  const typeText = credential.type.join(" ");
  const issuer = credential.issuer;
  const validFrom = credential.validFrom;
  const validUntil = credential.validUntil;
  const subjectText = JSON.stringify(credential.credentialSubject);

  return [typeText, issuer, validFrom, validUntil, subjectText]
    .join(" ")
    .toLowerCase();
}

export function filterCredentials(
  credentials: Credential[],
  rawQuery: string,
): Credential[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return credentials;
  return credentials.filter((c) => getCredentialSearchText(c).includes(q));
}
