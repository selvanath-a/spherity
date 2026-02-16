import { Credential } from "@/lib/schemas/credential";
import { ShieldCheck } from "lucide-react";

type Props = { credential: Credential };

export function CredentialProof({ credential }: Props) {
  return (
    <div className="mt-5 rounded-xl border border-[#DDEADF] bg-[#F2F8F3] p-4 flex gap-3">
      <div className="inline-flex gap-2 font-semibold text-[#2D6A36] items-baseline">
        <ShieldCheck size={20} className="mt-1" />
      </div>
      <div>
        <span className="text-[#2D6A36] text-sm font-bold">Valid Cryptographic Proof</span>
        <p className="mt-1 text-xs leading-5 text-[#4A5E4D] break-all">
          Signed by <b>{credential.issuer}</b> using{" "}
          <b>{credential.proof?.cryptosuite ?? "unknown"}</b> verification
          method.
        </p>
      </div>
    </div>
  );
}
