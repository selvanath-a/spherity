import { Credential } from "@/lib/schemas/credential";
import { formatDate, isExpired } from "@/utils";

type Props = { credential: Credential };

export function CredentialMeta({ credential }: Props) {
  const expired = isExpired(credential.validUntil);

  return (
    <div className="mt-6 space-y-3 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-ink">Issuer</span>
        <span className="text-right break-all">{credential.issuer}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-ink">Issue Date</span>
        <span>{formatDate(credential.validFrom)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-ink">Status</span>
        {expired ? (
          <span className="font-semibold text-[#C23E3E]">Expired</span>
        ) : (
          <span>Active</span>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-ink">Expiry</span>
        {expired ? (
          <span className="font-semibold text-[#C23E3E]">
            Expired {formatDate(credential.validUntil)}
          </span>
        ) : (
          <span>{formatDate(credential.validUntil)}</span>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-ink">ID</span>
        <span className="text-right break-all">{credential.id}</span>
      </div>
    </div>
  );
}
