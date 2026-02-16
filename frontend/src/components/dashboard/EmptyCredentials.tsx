import Link from "next/link";

export function EmptyCredentials() {
  return (
    <div className="w-full h-80 flex flex-col items-center justify-center rounded-2xl bg-white space-y-3">
      <span className="font-liberation-serif text-xl text-text">
        No credentials found
      </span>
      <span className="font-pt-serif text-sm text-ink max-w-xs text-center leading-6">
        Your wallet is currently empty.
      </span>
      <div className="flex items-center gap-2">
        <Link
          href="/issue"
          className="cursor-pointer rounded-full bg-text px-4 py-2 text-sm font-semibold text-background shadow-sm hover:opacity-90 transition font-liberation-serif"
        >
          Add First Credential
        </Link>
      </div>
    </div>
  );
}
