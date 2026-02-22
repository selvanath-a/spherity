"use client";

import { useState } from "react";
import { Credential } from "@/lib/schemas/credential";
import { Copy } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = { credential: Credential; separatePage?: boolean };

export function CredentialRawJson({ credential, separatePage = false }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-5">
      <div className="flex items-center ">
        <p className="text-[11px] uppercase tracking-[0.08em] text-ink font-bold">
          Raw Data
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer inline-flex items-center justify-center rounded-full p-2 text-ink hover:bg-ink/5 transition"
        >
          {copied ? "Copied!" : <Copy size={16} />}
        </button>
      </div>

      <pre
        className={cn(
          "mt-2 overflow-auto rounded-xl bg-[#F2ECE3] p-4 text-[11px] leading-5 text-[#6D655D]",
          separatePage ? "h-fit" : "h-72",
        )}
      >
        {JSON.stringify(credential, null, 2)}
      </pre>
    </div>
  );
}
