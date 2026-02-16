import type { z } from "zod";

export type IssueFieldErrors = {
  type?: string;
  validFrom?: string;
  validUntil?: string;
  claimsJson?: string;
};

export function zodIssuesToIssueFieldErrors(issues: z.core.$ZodIssue[]): IssueFieldErrors {
  const out: IssueFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (key === "type" && !out.type) out.type = issue.message;
    if (key === "validFrom" && !out.validFrom) out.validFrom = issue.message;
    if (key === "validUntil" && !out.validUntil) out.validUntil = issue.message;
    if (key === "claimsJson" && !out.claimsJson) out.claimsJson = issue.message;
  }
  return out;
}

export function zodIssuesToMessage(issues: z.core.$ZodIssue[], fallback = "Invalid input"): string {
  return issues[0]?.message ?? fallback;
}
