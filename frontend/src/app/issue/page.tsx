"use client";

import { useIssueCredentialMutation } from "@/hooks/useIssueCredentialMutation";
import { tryRepairJson } from "@/lib/api";
import { zodIssuesToIssueFieldErrors } from "@/lib/schemas/error-map";
import { issueFormSchema } from "@/lib/schemas/forms";
import { FileSignature } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IssuePage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [claimsJson, setClaimsJson] = useState("{}");
  const [typeError, setTypeError] = useState<string | null>(null);
  const [validFromError, setValidFromError] = useState<string | null>(null);
  const [validUntilError, setValidUntilError] = useState<string | null>(null);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const issueMutation = useIssueCredentialMutation();
const loading = issueMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = issueFormSchema.safeParse({
      type,
      validFrom,
      validUntil,
      claimsJson: tryRepairJson(claimsJson),
    });

    if (!parsed.success) {
      const fieldErrors = zodIssuesToIssueFieldErrors(parsed.error.issues);
      setTypeError(fieldErrors.type ?? null);
      setValidFromError(fieldErrors.validFrom ?? null);
      setValidUntilError(fieldErrors.validUntil ?? null);
      setClaimsError(fieldErrors.claimsJson ?? null);
      return;
    }

    setTypeError(null);
    setValidFromError(null);
    setValidUntilError(null);
    setClaimsError(null);

    try {
      const payload = parsed.data; // already transformed: { type, validFrom ISO, validUntil ISO, claims }
      // await issueCredential(payload);
      await issueMutation.mutateAsync(payload);

      // await issueCredential({ type, claims, validFrom, validUntil });
      setSuccess("Credential issued.");
      setTimeout(() => router.push("/"), 450);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to issue credential";
      setError(message);
    } 
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-white p-6">
        <h1 className="text-2xl md:text-3xl font-liberation-serif text-text">
          Issue Credential
        </h1>
        <p className="mt-2 text-sm font-liberation-serif text-ink">
          Define credential type and claims JSON. Signature is handled by
          backend.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="type"
              className="text-xs font-pt-serif font-bold uppercase text-ink"
            >
              Credential Type
            </label>
            <input
              id="type"
              type="text"
              className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none ${typeError ? "border-[#d35f5f]" : "border-border"}`}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value.trim()) setTypeError(null);
              }}
              placeholder="e.g., UniversityDegreeCredential"
              required
            />
            {typeError ? (
              <p className="mt-1 text-xs text-[#b53f3f]">{typeError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="validFrom"
                className="text-xs font-pt-serif font-bold uppercase text-ink"
              >
                Issue Date
              </label>
              <input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => {
                  setValidFrom(e.target.value);
                  if (e.target.value) setValidFromError(null);
                }}
                className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none ${validFromError ? "border-[#d35f5f]" : "border-border"}`}
                required
              />
              {validFromError ? (
                <p className="mt-1 text-xs text-[#b53f3f]">{validFromError}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="validUntil"
                className="text-xs font-pt-serif font-bold uppercase text-ink"
              >
                Expiry Date
              </label>
              <input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => {
                  setValidUntil(e.target.value);
                  if (e.target.value) setValidUntilError(null);
                }}
                min={validFrom || undefined}
                className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none ${validUntilError ? "border-[#d35f5f]" : "border-border"}`}
                required
              />
              {validUntilError ? (
                <p className="mt-1 text-xs text-[#b53f3f]">{validUntilError}</p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="claims"
                className="text-xs font-pt-serif font-bold uppercase text-ink"
              >
                Claims (JSON)
              </label>
            </div>
            <textarea
              id="claims"
              value={claimsJson}
              onChange={(e) => {
                setClaimsJson(e.target.value);
                setClaimsError(null);
              }}
              onBlur={() => {
                try {
                  JSON.parse(tryRepairJson(claimsJson));
                } catch {
                  setClaimsError("Invalid JSON");
                }
              }}
              className={`mt-2 min-h-56 w-full rounded-xl border px-3 py-2 font-nimbus-mono text-xs outline-none ${claimsError ? "border-[#d35f5f]" : "border-border"}`}
              placeholder='{"name":"John Doe","age":30}'
            />
            {claimsError ? (
              <p className="mt-1 text-xs text-[#b53f3f]">{claimsError}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-[#efcdcd] bg-[#fff4f4] p-3 text-sm text-[#b53f3f]">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-[#dceadf] bg-[#f2f8f3] p-3 text-sm text-[#2d6a36]">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-2"
            disabled={loading}
          >
            <FileSignature size={16} />
            {loading ? "Issuing..." : "Issue Credential"}
          </button>
        </form>
      </section>
    </div>
  );
}
