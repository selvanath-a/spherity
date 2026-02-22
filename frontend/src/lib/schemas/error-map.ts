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
    switch(key) {
      case "type":
      case "validFrom":
      case "validUntil":
      case "claimsJson":
        if (!out[key]) out[key] = issue.message;
        break;
    }
  }
  return out;
}

export function zodIssuesToMessage(issues: z.core.$ZodIssue[], fallback = "Invalid input"): string {
  return issues[0]?.message ?? fallback;
}
