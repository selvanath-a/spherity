import { z } from "zod";
import { credentialSchema } from "./credential";

export const issueFormSchema = z
  .object({
    type: z.string().trim().min(1, "Type is required"),
    validFrom: z.string().min(1, "Issue date is required"),
    validUntil: z.string().min(1, "Expiry date is required"),
    claimsJson: z.string().min(1, "Claims JSON is required"),
  })
  .superRefine((data, ctx) => {
    // claimsJson must parse to object
    try {
      const parsed = JSON.parse(data.claimsJson) as unknown;
      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["claimsJson"],
          message: "Claims must be a JSON object",
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        path: ["claimsJson"],
        message: "Invalid JSON in claims field",
      });
    }

    // validUntil >= validFrom
    const from = new Date(data.validFrom);
    const until = new Date(data.validUntil);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(until.getTime()) && until < from) {
      ctx.addIssue({
        code: "custom",
        path: ["validUntil"],
        message: "Expiry date must be on or after issue date",
      });
    }
  })
  .transform((data) => ({
    type: data.type,
    validFrom: new Date(data.validFrom).toISOString(),
    validUntil: new Date(data.validUntil).toISOString(),
    claims: JSON.parse(data.claimsJson) as Record<string, unknown>,
  }));

export const verifyFormSchema = z.object({
  credentialJson: z.string().trim().min(1, "Credential JSON is required"),
});

export const parsedVerifyCredentialSchema = credentialSchema;
