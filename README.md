# Mini Verifiable Credential Wallet

This project implements a **simple Verifiable Credential (VC) Wallet** consisting of a **NestJS backend** and a **Next.js frontend**.

It demonstrates the core ideas behind verifiable credentials:
- issuance
- holding credentials in a wallet
- sharing credentials
- verifying credentials issued by a trusted issuer

The implementation is intentionally minimal and educational, not production-grade SSI.

---

## High-level design

### Roles

- **Issuer**: the backend service
- **Holder (User)**: a browser wallet (one browser = one wallet)
- **Verifier**: any user pasting or opening a shared credential

There is **one global issuer** and **multiple users**, differentiated by browser instance.

---

## Identity & Wallet Model

### Wallet identity

- No authentication or user accounts are implemented.
- Each browser instance represents an independent wallet.
- The backend assigns a `walletId` on first request.

### How it works

1. First request from a browser → backend generates a UUID
2. Backend sets an **httpOnly cookie**: `walletId=<uuid>`
3. Browser automatically sends this cookie on future requests
4. Backend uses `walletId` to load that browser’s wallet

If cookies are cleared, the wallet is reset.

---

## Issuer model

- The backend owns **one global issuer key pair** (Ed25519 / tweetnacl).
- Issuer keys are stored in `data/issuer-keys.json`.
- All credentials are signed by this issuer.

Users **do not** sign credentials.

---

## Credential format

This project uses a minimal **W3C Verifiable Credentials Data Model v2.0** compliant shape.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2"
  ],
  "id": "urn:uuid:123e4567-e89b-12d3-a456-426614174000",
  "type": [
    "VerifiableCredential",
    "GymMembershipCard"
  ],
  "issuer": "did:web:issuer.example.com",
  "validFrom": "2026-01-01T12:00:00Z",
  "validUntil": "2027-01-01T12:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "level": "Gold"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "created": "2026-01-01T12:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:issuer.example.com#key-1",
    "cryptosuite": "ed25519-2020",
    "proofValue": "a1b2..."
  }
}
```
---

## Design Decisions

- **Single issuer model**: One global issuer key pair is used for all credentials, stored in `data/issuer-keys.json`.
- **Wallet identity via cookie**: A browser instance is a wallet, identified by an `httpOnly` `walletId` cookie. No user accounts or auth.
- **File-based persistence**: Credentials are stored per-wallet as unencrypted JSON files under `data/wallets/` (simple, no DB).
- **Minimal VC shape**: Uses a reduced W3C VC v2.0-compatible structure for educational clarity.
- **Proof encoding (hex)**: `proofValue` uses hex rather than multibase to keep crypto handling simple.
- **Local deletion only**: “Delete” removes the local wallet copy. Real-world revocation however, would be typically achieved through the status mechanism: `credentialStatus`. Not implemented here.
- **Validation**: Backend uses NestJS DTOs (`class-validator`) for request validation.
- **Verification method format**: `verificationMethod` uses a DID URL with a `#key-1` fragment to indicate a specific issuer key. In this demo, the DID document isn’t resolved; the fragment is illustrative.
- **Timing Interceptor**: `timingInterceptor` demonstrates interceptor usage with a minimal response Time logging for each Request.
- **Throttler Guard**: `ThrottlerGuard` demonstrates Guard usage with global rate limits of **30 requests per minute per IP**.

---

## Setup (Backend + Frontend)

### Prerequisites
- Node.js 20+
- pnpm

### Backend
```bash
cd spherity/backend
pnpm install
pnpm start:dev
```

Backend runs on `http://localhost:3001` by default.

### Frontend
```bash
cd spherity/frontend
pnpm install
pnpm dev
```

Frontend runs on `http://localhost:3000` by default.
