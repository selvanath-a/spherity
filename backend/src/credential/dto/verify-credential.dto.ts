import { IsNotEmpty, IsObject } from "class-validator";
import type { Credential } from "../credential.service";

/** Request payload for verifying a credential object. */
export class VerifyCredentialDTO {
    @IsObject()
    @IsNotEmpty()
     credential: Credential;
}
