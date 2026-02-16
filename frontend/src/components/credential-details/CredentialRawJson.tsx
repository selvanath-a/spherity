"use client";

import { useState } from "react";
import type { Credential } from "@/lib/api";
import { Copy } from "lucide-react";
import { Button } from "../ui/Button";
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
        <p className="text-[11px] uppercase tracking-[0.08em] text-ink">
          Raw Data
        </p>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className=" cursor-pointer"
        >
          {copied ? "Copied!" : <Copy size={16} />}
        </Button>
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
