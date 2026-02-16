import {
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

function NoClaimIdAllowed(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noClaimIdAllowed',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return true;
          }
          return !Object.hasOwn(value, 'id');
        },
      },
    });
  };
}

export class IssueCredentialDTO {
  /** The type/category of credential to issue */
  @IsString()
  @IsNotEmpty()
  type: string;
  /** Key-value pairs of claims to include in the credential */
  @IsObject()
  @IsNotEmpty()
  @NoClaimIdAllowed({
    message: 'claims must not include "id"; it is managed by the wallet',
  })
  claims: Record<string, unknown>;

  @IsISO8601()
  validFrom: string;

  @IsISO8601()
  validUntil: string;
}
