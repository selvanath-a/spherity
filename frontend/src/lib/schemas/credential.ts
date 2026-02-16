import { z } from "zod";

export const proofSchema = z.object({
  type: z.string(),
  created: z.iso.datetime(),
  proofPurpose: z.string(),
  verificationMethod: z.string().min(1),
  cryptosuite: z.string().min(1),
  proofValue: z.string().min(1),
});

export const credentialSubjectSchema = z
  .object({
    id: z.string().min(1),
  })
  .catchall(z.unknown());

export const credentialSchema = z.object({
  "@context": z.array(z.string()).min(1),
  id: z.string().min(1),
  type: z.array(z.string()).min(1),
  issuer: z.string().min(1),
  validFrom: z.iso.datetime(),
  validUntil: z.iso.datetime(),
  credentialSubject: credentialSubjectSchema,
  proof: proofSchema,
});

export const verifyResultSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
});

export const deleteResultSchema = z.object({
  deleted: z.boolean(),
  id: z.string(),
});

export type Credential = z.infer<typeof credentialSchema>;
