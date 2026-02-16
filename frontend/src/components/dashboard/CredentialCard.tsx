"use client";

import { memo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Credential } from "@/lib/schemas/credential";
import { formatDate, getDisplayType, isExpired } from "@/utils";
import { CredentialActions } from "./CredentialActions";

type CredentialCardProps = {
  credential: Credential;
  selected: boolean;
  onSelect: (id: string) => void;
  onVerify: (id: string) => void | Promise<void>;
  onShare: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
};

function CredentialCardComponent({
  credential,
  selected,
  onSelect,
  onVerify,
  onShare,
  onDelete,
}: CredentialCardProps) {
  const expired = isExpired(credential.validUntil);

  return (
    <article
      className={`rounded-md border ${selected ? "border-accent-strong" : "border-border"} flex flex-col gap-2.5 p-4 bg-white transition hover:border-accent overflow-hidden cursor-pointer`}
      onClick={() => onSelect(credential.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-left">
          <span className="font-liberation-serif text-lg text-text">{getDisplayType(credential)}</span>
        </div>
        <Link
          href={`/credentials/${credential.id}`}
          onClick={(event) => event.stopPropagation()}
          className="cursor-pointer rounded-full border border-border p-1.5 text-ink hover:text-text hover:bg-surface transition"
          aria-label="Open credential detail page"
        >
          <ExternalLink size={14} color="var(--ink)" />
        </Link>
      </div>

      <div className="flex flex-col w-full items-start font-pt-serif text-[13px] text-ink">
        <span>Issued {formatDate(credential.validFrom)}</span>
        {expired ? (
          <span className="font-semibold text-[#C23E3E]">Expired {formatDate(credential.validUntil)}</span>
        ) : (
          <span>Expires {formatDate(credential.validUntil)}</span>
        )}
      </div>

      <CredentialActions
        onVerify={() => onVerify(credential.id)}
        onShare={() => onShare(credential.id)}
        onDelete={() => onDelete(credential.id)}
      />
    </article>
  );
}

export const CredentialCard = memo(CredentialCardComponent);
