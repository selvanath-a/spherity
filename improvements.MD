# Possible Improvements

- encrypt keys, credentials
- export wallet, docker mount
- sharable link -> share to other person without walletId( maintain separate share list with expiry)
- csrf protection
- wallet sign during share and verify both issuer and wallet
- GraphQL
- Deleted credentials verification should fail (may be have a revocation list with the cred IDs)
- Search is currently client-side
- Pagination
- Validate the proof's created timestamp in /credentials/verify
- TryRepairJSON in front end single quote->double quotes format
---
# Completed

- Custom decorator WalletId in HttpRequest
- Validate DTO