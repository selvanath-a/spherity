"use client";

import { Credential } from "@/lib/schemas/credential";
import { getDisplayType } from "@/utils";
import { ExternalLink, LayoutList, X } from "lucide-react";
import Link from "next/link";
import { CredentialMeta } from "../credential-details/CredentialMeta";
import { CredentialProof } from "../credential-details/CredentialProof";
import { CredentialRawJson } from "../credential-details/CredentialRawJson";
import { CredentialActions } from "./CredentialActions";

type CredentialDetailPanelProps = {
  credential?: Credential;
  onVerify: (id: string) => void | Promise<void>;
  onShare: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  onClose?: () => void;
};

export function CredentialDetailPanel({
  credential,
  onVerify,
  onShare,
  onDelete,
  onClose,
}: CredentialDetailPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-text font-liberation-serif text-lg">
          Credential Details
        </h2>
        {credential ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/credentials/${credential.id}`}
              className="cursor-pointer rounded-full border border-border p-2 text-ink hover:text-text hover:bg-surface transition"
              aria-label="Open credential detail page"
            >
              <ExternalLink size={14} />
            </Link>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full border border-border p-2 text-ink hover:text-text hover:bg-surface transition"
                aria-label="Close credential details"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-4 border-t border-border" />

      {!credential ? (
        <div className="h-72 flex flex-col justify-center items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center">
            <LayoutList size={24} color="var(--ink)" />
          </div>
          <h3 className="text-lg font-semibold text-text font-liberation-serif">
            Select a credential
          </h3>
          <p className="text-sm leading-6 text-ink max-w-xs">
            Click on any credential in your dashboard to view full details.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <h3 className="text-xl font-semibold text-text font-liberation-serif">
            {getDisplayType(credential)}
          </h3>

          <CredentialMeta credential={credential} />

          <CredentialProof credential={credential} />

          <CredentialRawJson credential={credential} />

          <div className="mt-6">
            <CredentialActions
              onVerify={() => onVerify(credential.id)}
              onShare={() => onShare(credential.id)}
              onDelete={() => onDelete(credential.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
