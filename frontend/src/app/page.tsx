"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  listCredentials,
  deleteCredential,
  verifyCredentialById,
  Credential,
} from "@/lib/api";

/**
 * Dashboard page displaying all credentials in the current wallet.
 * Provides actions to view, share, verify, and delete credentials.
 * @route /
 */
export default function Dashboard() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  /** Fetches all credentials from the backend and updates state. */
  async function loadCredentials() {
    try {
      setLoading(true);
      const data = await listCredentials();
      setCredentials(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed loading credentials");
    } finally {
      setLoading(false);
    }
  }

  /** Copies credential JSON to clipboard for sharing. */
  function handleShare(id: string) {
    const credential = credentials.find((c) => c.id === id);
    if (credential) {
      navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
      alert("Credential copied to clipboard!");
    }
  }

  /** Deletes a credential after user confirmation. */
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this credential?")) {
      return;
    }
    try {
      const result = await deleteCredential(id);
      if (result.deleted) {
        setCredentials(credentials.filter((c) => c.id !== result.id));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed deleting credential");
    }
  }

  /** Verifies a credential's signature and displays the result. */
  async function handleVerify(id: string) {
    try {
      const result = await verifyCredentialById(id);
      if (result.valid) {
        alert("✓ Credential is valid");
      } else {
        alert("✗ Credential is invalid");
        console.error("Invalid credential reason:", result.reason);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed credential verification"
      );
    }
  }

  if (loading) {
    return <div className="loading">Loading credentials...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Credentials</h1>
        <Link href="/issue" className="btn btn-primary">
          + Issue New Credential
        </Link>
      </div>

      {credentials.length === 0 ? (
        <div className="empty-state">
          <p>No credentials yet.</p>
          <p>
            <Link href="/issue">Issue your first credential</Link>
          </p>
        </div>
      ) : (
        <div>
          {credentials.map((credential) => (
            <div key={credential.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{credential.type}</div>
                  <div className="card-meta">
                    Credential Subject: {credential.credentialSubject}
                  </div>
                  <div className="card-meta">Issuer: {credential.issuer}</div>
                </div>
              </div>
              <div className="card-actions">
                <Link
                  href={`/credentials/${credential.id}`}
                  className="btn btn-outline btn-sm"
                >
                  View
                </Link>
                <button
                  onClick={() => handleShare(credential.id)}
                  className="btn btn-outline btn-sm"
                >
                  Share
                </button>
                <button
                  onClick={() => handleVerify(credential.id)}
                  className="btn btn-outline btn-sm"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleDelete(credential.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
