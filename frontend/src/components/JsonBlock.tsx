"use client";

import { useState } from "react";

interface JsonBlockProps {
  value: unknown;
  onCopy?: () => void;
  className?: string;
}

export function JsonBlock({ value, onCopy, className }: JsonBlockProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(value, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className || ""}`}>
      <pre className="max-w-full overflow-x-auto rounded-xl border border-border bg-bg p-4 text-sm font-mono text-ink shadow-inner">
        {jsonString}
      </pre>
      <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink hover:border-ink hover:bg-surface transition"
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
