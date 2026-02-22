import { Award, Fingerprint } from "lucide-react";

type SummaryRowProps = {
  totalCredentials: number;
  walletId: string;
};

function truncateMiddle(value: string) {
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function SummaryRow({ totalCredentials, walletId }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <div className="rounded-md border border-border p-5 flex items-center justify-between bg-white">
        <div>
          <span className="text-xs text-ink font-pt-serif font-bold">TOTAL CREDENTIALS</span>
          <div className="text-2xl font-liberation-serif text-text my-2">{totalCredentials}</div>
        </div>
        <div className="hidden min-[362px]:flex w-12 h-12 rounded-full bg-surface-light items-center justify-center">
          <Award size={22} color="var(--accent)" />
        </div>
      </div>
      <div className="rounded-md border border-border p-5 flex items-center justify-between bg-white">
        <div>
          <span className="text-xs text-ink font-pt-serif font-bold">WALLET ID</span>
          <div className="rounded-xl bg-surface-light font-nimbus-mono text-xs font-light p-2 my-2"
          title={walletId}>
            {truncateMiddle(walletId)}
          </div>
        </div>
        <div className="hidden min-[362px]:flex w-12 h-12 rounded-full bg-surface-light items-center justify-center">
          <Fingerprint size={22} color="var(--accent)" />
        </div>
      </div>
    </div>
  );
}
