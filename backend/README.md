# VC Server - Backend

A NestJS backend for issuing and verifying Verifiable Credentials (VCs).

## Features

- Issue verifiable credentials with Ed25519 signatures
- Verify credential signatures
- Per-user wallet storage via HTTP cookies
- RESTful API
- Credentials include validity window (`validFrom` / `validUntil`)

## Prerequisites

- Node.js 20+
- pnpm

## Installation

```bash
pnpm install
```

## Running the Server

```bash
# Development (with hot reload)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The server runs on `http://localhost:3001` by default.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/credential/issue` | Issue a new credential |
| `GET` | `/credential/list` | List all credentials for wallet |
| `GET` | `/credential/:id` | Get credential by ID |
| `GET` | `/credential/:id/verify` | Verify credential by ID |
| `POST` | `/credential/verify` | Verify credential object |
| `DELETE` | `/credential/:id` | Delete credential |

`validFrom` and `validUntil` are required ISO-8601 timestamps for issuance.

## Seed Data

```bash
# Default: wallet "seed-wallet", 10 credentials
pnpm seed

# Custom wallet and count
pnpm seed my-wallet 25
```

## Testing

```bash
# Unit tests
pnpm test

# Test coverage
pnpm test:cov
```

## Docker

```bash
# Build
docker build -t vc-backend .

# Run
docker run -p 3001:3001 -e CORS_ORIGIN=https://your-frontend.com vc-backend
```

## Project Structure

```
src/
  credential/     # Credential issuing and verification
  crypto/         # Cryptographic operations (Ed25519)
  issuer/         # Issuer key management
  wallet/         # Wallet middleware (cookie-based)
  main.ts         # Application entry point
```

## License

MIT
