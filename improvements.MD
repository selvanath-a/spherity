# Possible Improvements

- encrypt keys, credentials
- export wallet, docker mount
- sharable link -> share to other person without walletId( maintain separate share list with expiry)
- csrf protection
- wallet sign during share and verify both issuer and wallet
- GraphQL
- Deleted credentials verification should fail (may be have a revocation list with the cred IDs)
- Search and filtering are currently client-side and operate on the in-memory credential list.
- Pagination is not implemented yet.
---
# Completed

- Custom decorator WalletId in HttpRequest
- Validate DTO