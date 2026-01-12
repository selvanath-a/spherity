# VC Server - Frontend

A Next.js frontend for managing Verifiable Credentials.

## Features

- Issue new verifiable credentials
- View and manage credentials in your wallet
- Verify credential signatures
- Responsive UI with Tailwind CSS
- Each browser has a separate wallet
- Share and verify credentials between wallets

## Prerequisites

- Node.js 20+
- pnpm
- Backend server running on `http://localhost:3001`

## Installation

```bash
pnpm install
```

## Running the App

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

The app runs on `http://localhost:3000` by default.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `http://localhost:3001` |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home - List all credentials in wallet |
| `/issue` | Issue a new credential |
| `/verify` | Verify a credential (paste JSON) |
| `/credentials/[id]` | View credential details |

## Project Structure

```
src/
  app/
    page.tsx              # Home - credentials list
    layout.tsx            # Root layout
    issue/page.tsx        # Issue credential form
    verify/page.tsx       # Verify credential
    credentials/[id]/     # Credential detail view
  lib/
    api.ts                # Backend API client
```

## Development

The frontend communicates with the backend via REST API. Credentials are stored per-user using HTTP cookies managed by the backend.

### API Client

All API calls are in `src/lib/api.ts`:

```typescript
import { issueCredential, listCredentials, verifyCredential } from '@/lib/api';

// Issue a credential
const credential = await issueCredential({
  type: 'VerifiableCredential',
  claims: { name: 'John Doe' }
});

// List all credentials
const credentials = await listCredentials();

// Verify a credential
const result = await verifyCredential(credential);
```

## License

MIT
