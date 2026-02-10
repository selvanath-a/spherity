import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { CredentialService } from './credential.service';
import type { Credential } from './credential.service';
import { WalletId } from 'src/common/decorators/wallet-id.decorator';
import { IssueCredentialDTO } from './dto/issue-credential.dto';
import { VerifyCredentialDTO } from './dto/verify-credential.dto';


/**
 * REST controller for credential management operations.
 * All endpoints operate on the wallet identified by the walletId cookie.
 * @route /credential
 */
//TODO: Create custom decorator for wallet-id
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
        // WalletId decorator avoids manual @Req() extraction.
        @WalletId() walletId: string,
        @Body() body: IssueCredentialDTO,
    ): Promise<Credential> {
        return this.credentialService.issue(walletId, body.type, body.claims);
    }

    /**
     * Retrieves all credentials in the current wallet.
     * @route GET /credential/list
     * @param req - Request containing walletId from middleware
     * @returns Array of all credentials
     */
    @Get('list')
    getAllCredentials(@WalletId() walletId: string): Promise<Credential[]> {
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
        @WalletId() walletId: string,
        @Param('id') id: string,
    ): Promise<Credential | undefined> {
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
        @WalletId() walletId: string,
        @Param('id') id: string,
    ): Promise<{ valid: boolean; reason?: string }> {
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
        @Body() body: VerifyCredentialDTO,
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
        @WalletId() walletId: string,
        @Param('id') id: string,
    ): Promise<{ deleted: boolean; id: string }> {
        return this.credentialService.deleteCredential(walletId, id);
    }
}
