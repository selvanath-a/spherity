"use client";

import { useState } from "react";
import { verifyCredential, tryRepairJson, Credential } from "@/lib/api";

/**
 * Page for verifying credentials by pasting JSON.
 * Useful for verifying credentials received from external sources.
 * Includes JSON auto-repair for common formatting issues.
 * @route /verify
 */
export default function VerifyPage() {
  const [credentialJson, setCredentialJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; error?: string } | null>(null);

  /**
   * Parses and verifies the credential JSON.
   * Applies JSON auto-repair before parsing, then calls the verification API.
   */
  async function handleVerify() {
    setResult(null);

    // Apply JSON auto-repair before parsing
    const repairedJson = tryRepairJson(credentialJson);

    // Parse credential JSON
    let credential: Credential;
    try {
      credential = JSON.parse(repairedJson);
    } catch {
      setResult({ valid: false, error: "Invalid JSON format" });
      return;
    }

    try {
      setLoading(true);
      const verifyResult = await verifyCredential(credential);
      setResult({ valid: verifyResult.valid });
    } catch (err) {
      setResult({
        valid: false,
        error: err instanceof Error ? err.message : "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>
        Verify Credential
      </h1>

      <div className="form-group">
        <label htmlFor="credential" className="form-label">
          Credential JSON
        </label>
        <textarea
          id="credential"
          className="form-textarea"
          style={{ minHeight: "200px" }}
          value={credentialJson}
          onChange={(e) => setCredentialJson(e.target.value)}
          placeholder='{"id": "...", "type": "...", ...}'
        />
      </div>

      <button
        onClick={handleVerify}
        className="btn btn-primary"
        disabled={loading || !credentialJson.trim()}
      >
        {loading ? "Verifying..." : "Verify Credential"}
      </button>

      {result && (
        <div
          className={`alert ${result.valid ? "alert-success" : "alert-error"}`}
          style={{ marginTop: "1.5rem" }}
        >
          {result.valid ? (
            <span>Credential is valid</span>
          ) : (
            <span>Credential is invalid{result.error && `: ${result.error}`}</span>
          )}
        </div>
      )}
    </div>
  );
}
