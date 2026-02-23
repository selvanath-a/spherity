"use client";

import { CredentialMeta } from "@/components/credential-details/CredentialMeta";
import { CredentialProof } from "@/components/credential-details/CredentialProof";
import { CredentialRawJson } from "@/components/credential-details/CredentialRawJson";
import { useCredentialQuery } from "@/hooks/useCredentialQuery";
import { getDisplayType } from "@/utils";
import Link from "next/link";
import { use } from "react";

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
  const { data: credential, isLoading, error } = useCredentialQuery(id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="h-9 w-52 animate-pulse rounded-lg bg-surface" />
          <div className="h-10 w-40 animate-pulse rounded-full bg-surface" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7 rounded-2xl border border-border bg-white p-6">
            <div className="h-8 w-60 animate-pulse rounded-md bg-surface" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-surface" />
              <div className="h-4 w-56 animate-pulse rounded bg-surface" />
              <div className="h-4 w-44 animate-pulse rounded bg-surface" />
            </div>

            <div className="mt-6 border-t border-border pt-6 space-y-3">
              <div className="h-4 w-36 animate-pulse rounded bg-surface" />
              <div className="h-20 w-full animate-pulse rounded-xl bg-surface" />
            </div>
          </section>

          <section className="lg:col-span-5 rounded-2xl border border-border bg-white p-6">
            <div className="h-4 w-24 animate-pulse rounded bg-surface" />
            <div className="mt-3 h-90 w-full animate-pulse rounded-xl bg-surface" />
          </section>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <div className="alert alert-error">
          {error instanceof Error ? error.message : "Credential not found"}
        </div>
        <Link href="/" className="btn btn-outline">
          ← Back{" "}
          <span className="hidden min-[362px]:inline-block">to Dashboard</span>
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
          ← Back{" "}
          <span className="hidden min-[362px]:inline-block">to Dashboard</span>
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
