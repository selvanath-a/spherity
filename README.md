Mini Verifiable Credential Wallet

This project implements a simple Verifiable Credential (VC) Wallet consisting of a NestJS backend and a Next.js frontend.

It demonstrates the core ideas behind verifiable credentials:
	•	issuance
	•	holding credentials in a wallet
	•	sharing credentials
	•	verifying credentials issued by a trusted issuer

The implementation is intentionally minimal and educational, not production-grade SSI.

⸻

High-level design

Roles
	•	Issuer: the backend service
	•	Holder (User): a browser wallet (one browser = one wallet)
	•	Verifier: any user pasting or opening a shared credential

There is one global issuer and multiple users, differentiated by browser instance.

⸻

Identity & Wallet Model

Wallet identity
	•	No authentication or user accounts are implemented.
	•	Each browser instance represents an independent wallet.
	•	The backend assigns a walletId on first request.

How it works
	1.	First request from a browser → backend generates a UUID
	2.	Backend sets an httpOnly cookie: walletId=<uuid>
	3.	Browser automatically sends this cookie on future requests
	4.	Backend uses walletId to load that browser’s wallet

If cookies are cleared, the wallet is reset.

⸻

Issuer model
	•	The backend owns one global issuer key pair (Ed25519 / tweetnacl).
	•	Issuer keys are stored in data/issuer-keys.json.
	•	All credentials are signed by this issuer.

Users do not sign credentials.

⸻

Credential format

{
  "id": "uuid",
  "type": "GymMembershipCard",
  "issuer": "did:example:issuer",
  "subject": "did:example:wallet:<walletId>",
  "claims": {
    "level": "Gold"
  },
  "issuedAt": "2026-01-01T12:00:00Z",
  "signature": "<hex-ed25519-signature>"
}

Field explanation
	•	id: unique credential identifier
	•	type: human-readable credential category
	•	issuer: DID of the backend issuer
	•	subject: DID of the wallet the credential is about
	•	claims: arbitrary key–value data
	•	issuedAt: issuance timestamp
	•	signature: detached Ed25519 signature of the credential payload

⸻
