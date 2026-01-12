"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { issueCredential, tryRepairJson } from "@/lib/api";

/**
 * Page for issuing new verifiable credentials.
 * Provides a form to specify credential type and claims (as JSON).
 * @route /issue
 */
export default function IssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("");
  // const [issuer, setIssuer] = useState("");
  // const [subject, setSubject] = useState("");
  const [claimsJson, setClaimsJson] = useState("{}");

  /**
   * Handles form submission to issue a new credential.
   * Parses claims JSON (with auto-repair), calls the API, and redirects to dashboard.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Parse claims JSON
    let claims: Record<string, unknown>;
    try {
      const repairedJson = tryRepairJson(claimsJson);
      claims = JSON.parse(repairedJson);
    } catch {
      setError("Invalid JSON in claims field");
      return;
    }

    try {
      setLoading(true);
      await issueCredential({ type, claims });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to issue credential"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>
        Issue Credential
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Type
          </label>
          <input
            id="type"
            type="text"
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g., VerifiableCredential"
            required
          />
        </div>

        {/* <div className="form-group">
          <label htmlFor="issuer" className="form-label">
            Issuer
          </label>
          <input
            id="issuer"
            type="text"
            className="form-input"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g., did:example:issuer"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., did:example:subject"
            required
          />
        </div> */}

        <div className="form-group">
          <label htmlFor="claims" className="form-label">
            Claims (JSON)
          </label>
          <textarea
            id="claims"
            className="form-textarea"
            value={claimsJson}
            onChange={(e) => setClaimsJson(e.target.value)}
            placeholder='{"name": "John Doe", "age": 30}'
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Issuing..." : "Issue Credential"}
        </button>
      </form>
    </div>
  );
}
