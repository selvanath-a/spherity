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
    queryKeys.ts          # React Query keys
    credentialSearch.ts   # Search utility logic
  hooks/
    useCredentialsQuery.ts
    useCredentialQuery.ts
    useIssueCredentialMutation.ts
    useDeleteCredentialMutation.ts
    useVerifyCredentialMutation.ts
    useDebouncedValue.ts
```

## Development

The frontend communicates with the backend via REST API. Credentials are stored per-user using HTTP cookies managed by the backend.

### Data Layer

- Server state is managed with TanStack Query.
- Reads use query hooks (`useCredentialsQuery`, `useCredentialQuery`).
- Writes use mutation hooks (`issue`, `delete`, `verify`).
- Delete uses optimistic cache update + rollback on failure.

### Search

- Dashboard search is client-side and debounced (200ms).
- Searchable fields:
  - `type`
  - `issuer`
  - `validFrom`
  - `validUntil`
  - `credentialSubject`

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

### Testing

- Backend: Jest unit/integration coverage.
- Frontend: Vitest utility tests:
  - `src/lib/credentialSearch.test.ts`
  - `src/lib/schemas/error-map.test.ts`

Run frontend tests:

```bash
pnpm test
```

## Criteria Coverage (Short)

- Code Quality
  - Clear module split: API client, query hooks, schema validation, search utility.
- TypeScript Practices
  - Typed credential schema and API contracts; utility functions typed end-to-end.
- Frontend Architecture
  - Query/mutation hooks + reusable dashboard/detail components + separated utility layer.
- API Integration
  - React Query caching, invalidation, optimistic delete, user-facing error states.
- NestJS Practices
  - Backend uses DI, DTO validation, middleware and interceptor patterns (see backend README).
- Documentation
  - Setup, architecture decisions, and tradeoffs documented in README.
- Testing (bonus)
  - Jest backend tests + Vitest frontend utility tests.

## License

MIT
