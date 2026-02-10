Code Challenge: Mini Verifiable Credential Wallet
Scenario:
You are tasked with building a simple “Verifiable Credential Wallet” application.

Description:
The app should allow a user to:

Issue a credential to themselves (for example, “Gym Membership Card” or any sample claim).

View a list of credentials they hold in their wallet.

Share a credential (for example, by generating a shareable link or copying a JSON blob)

Verify a credential that someone else shares (by pasting JSON or using the link).

Backend:

Build an API (REST or GraphQL) that lets the client with the following endpoints:

Issue a new credential: Enter the claims, sign the data using the algorithm of your choice and store the credential

List all credentials inside the wallet

Fetch a credential by ID or similar

Verify a credential  (e.g., check a digital signature or similar mechanism)

Delete a credential

Additional requirements/hints:

User management or authentication is not needed

Data persistence can be in-memory or file-based (no need for a full database).

The backend must be containerised

Frontend:

Dashboard with the following functionality:

Show all issued credentials

Issue a new credential through a simple form

View details of any credential

“Share” a credential (e.g., copy JSON, display a shareable link)

“Verify” a credential (e.g., paste JSON to check validity)

Delete a credential

General:

You can use any open-source libraries or frameworks you like for cryptography or data handling.

The Backend has to be implemented in nestjs

Design and UX can be minimalistic.

Hand in:
Please provide your solution as a GitHub repository. When you’re ready, you’ll be invited to present and discuss your approach with the team.