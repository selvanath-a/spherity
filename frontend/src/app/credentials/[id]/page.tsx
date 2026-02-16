"use client";

import { CredentialMeta } from "@/components/credential-details/CredentialMeta";
import { CredentialProof } from "@/components/credential-details/CredentialProof";
import { CredentialRawJson } from "@/components/credential-details/CredentialRawJson";
import { getCredential, type Credential } from "@/lib/api";
import { getDisplayType } from "@/utils";
import Link from "next/link";
import { use, useEffect, useState } from "react";

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

  useEffect(() => {
    async function load() {
      try {
        const data = await getCredential(id);
        setCredential(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed loading credential",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading credential...</div>;
  }

  if (error || !credential) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <div className="alert alert-error">
          {error ?? "Credential not found"}
        </div>
        <Link href="/" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-liberation-serif text-2xl text-text">
          Credential Details
        </h1>
        <Link href="/" className="btn btn-outline font-liberation-serif ">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-2xl border border-border bg-white p-6 h-fit">
          <div className="mb-4">
            {" "}
            <h3 className="text-xl font-semibold text-text font-liberation-serif">
              {getDisplayType(credential)}
            </h3>
          </div>
          <CredentialMeta credential={credential} />
          <CredentialProof credential={credential} />
        </section>

        <section className="lg:col-span-5 rounded-2xl border border-border bg-white px-6 pb-6">
          <CredentialRawJson credential={credential} separatePage={true} />
        </section>
      </div>
    </div>
  );
}
