import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { CredentialService } from './credential.service';
import type { Credential } from './credential.service';

/**
 * Request payload for issuing a new credential.
 */
interface IssueCredentialDTO {
    /** The type/category of credential to issue */
    type: string;
    /** Key-value pairs of claims to include in the credential */
    claims: Record<string, unknown>;
}

/**
 * REST controller for credential management operations.
 * All endpoints operate on the wallet identified by the walletId cookie.
 * @route /credential
 */
@Controller('credential')
export class CredentialController {
    constructor(private readonly credentialService: CredentialService) { }

    /**
     * Issues a new credential to the current wallet.
     * @route POST /credential/issue
     * @param req - Request containing walletId from middleware
     * @param body - Credential type and claims
     * @returns The newly issued credential
     */
    @Post('issue')
    issueCredential(
        @Req() req: Request & { walletId?: string },
        @Body() body: IssueCredentialDTO,
    ): Promise<Credential> {
        const walletId = req.walletId || '';
        return this.credentialService.issue(walletId, body.type, body.claims);
    }

    /**
     * Retrieves all credentials in the current wallet.
     * @route GET /credential/list
     * @param req - Request containing walletId from middleware
     * @returns Array of all credentials
     */
    @Get('list')
    getAllCredentials(@Req() req: Request & { walletId?: string }): Promise<Credential[]> {
        const walletId = req.walletId || '';
        return this.credentialService.getCredentialsList(walletId);
    }

    /**
     * Retrieves a specific credential by ID.
     * @route GET /credential/:id
     * @param req - Request containing walletId from middleware
     * @param id - UUID of the credential
     * @returns The credential if found
     */
    @Get(':id')
    getCredentialbyId(
        @Req() req: Request & { walletId?: string },
        @Param('id') id: string,
    ): Promise<Credential | undefined> {
        const walletId = req.walletId || '';
        return this.credentialService.getCredentialById(walletId, id);
    }

    /**
     * Verifies a credential stored in the wallet by its ID.
     * @route GET /credential/:id/verify
     * @param req - Request containing walletId from middleware
     * @param id - UUID of the credential to verify
     * @returns Verification result with validity status
     */
    @Get(':id/verify')
    verifyCredentialWithId(
        @Req() req: Request & { walletId?: string },
        @Param('id') id: string,
    ): Promise<{ valid: boolean; reason?: string }> {
        const walletId = req.walletId || '';
        return this.credentialService.verifyCredentialWithId(walletId, id);
    }

    /**
     * Verifies a credential provided in the request body.
     * Useful for verifying credentials from external sources.
     * @route POST /credential/verify
     * @param body - Object containing the credential to verify
     * @returns Verification result with validity status
     */
    @Post('verify')
    verifyCredential(
        @Body() body: { credential: Credential },
    ): Promise<{ valid: boolean; reason?: string }> {
        return this.credentialService.verifyCredential(body.credential);
    }

    /**
     * Deletes a credential from the wallet.
     * @route DELETE /credential/:id
     * @param req - Request containing walletId from middleware
     * @param id - UUID of the credential to delete
     * @returns Confirmation object with deletion status and credential ID
     */
    @Delete(':id')
    deleteCredential(
        @Req() req: Request & { walletId?: string },
        @Param('id') id: string,
    ): Promise<{ deleted: boolean; id: string }> {
        const walletId = req.walletId || '';
        return this.credentialService.deleteCredential(walletId, id);
    }
}
