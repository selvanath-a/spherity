"use client";

import { Plus, WalletCards } from "lucide-react";
import Link from "next/link";

export function HeaderBar() {
  return (
    <div className="w-full bg-header flex items-center justify-between px-4 md:px-8 py-2 border-b border-border">
      <Link href="/" className="flex items-center gap-2 ">
        <div className="w-9 h-9 rounded-lg bg-text flex items-center justify-center">
          <WalletCards size={20} color="var(--background)" />
        </div>
        <span className="hidden min-[362px]:inline font-bold text-text font-liberation-serif">
          VC Wallet
        </span>
      </Link>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/verify"
          className="rounded-full border border-border px-3 md:px-4 py-2 text-sm font-bold text-text bg-transparent hover:bg-surface font-liberation-serif transition cursor-pointer"
        >
          Verify
        </Link>
        <Link
          href="/issue"
          className="rounded-full bg-text px-3 md:px-4 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90 transition font-liberation-serif cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
            <span className="hidden min-[362px]:inline">New Credential</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
