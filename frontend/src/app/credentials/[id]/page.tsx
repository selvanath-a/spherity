"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getCredential, Credential } from "@/lib/api";

/**
 * Detail page displaying a single credential's full information.
 * Shows metadata and raw JSON with copy-to-clipboard functionality.
 * @route /credentials/[id]
 */
export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCredential(id);
        setCredential(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed loading credential");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /** Copies the credential JSON to clipboard and shows confirmation. */
  function handleCopyJson() {
    if (credential) {
      navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return <div className="loading">Loading credential...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <Link href="/" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Credential Details</h1>
        <Link href="/" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: "1rem" }}>
          <strong>Type:</strong> {credential?.type}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Issuer:</strong> {credential?.issuer}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Subject:</strong> {credential?.credentialSubject}
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: "1.25rem", margin: "1.5rem 0 1rem" }}>
        Raw JSON
      </h2>
      <pre className="json-display">{JSON.stringify(credential, null, 2)}</pre>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={handleCopyJson} className="btn btn-primary">
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>
    </div>
  );
}
