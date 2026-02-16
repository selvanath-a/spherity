import { IsISO8601, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class IssueCredentialDTO {
  /** The type/category of credential to issue */
  @IsString()
  @IsNotEmpty()
  type: string;
  /** Key-value pairs of claims to include in the credential */
  @IsObject()
  @IsNotEmpty()
  claims: Record<string, unknown>;

  @IsISO8601()
  validFrom: string;

  @IsISO8601()
  validUntil: string;
}
