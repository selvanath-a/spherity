import { Credential } from "@/models/credential.model";
import { CredentialCard } from "./CredentialCard";

type CredentialsListProps = {
  credentials: Credential[];
  selectedId: string | null;
  handleSelect: (id: string) => void;
  handleVerify: (id: string) => void | Promise<void>;
  handleShare: (id: string) => void;
  handleDelete: (id: string) => void | Promise<void>;
};

export function CredentialsList({
  credentials,
  selectedId,
  handleSelect,
  handleVerify,
  handleShare,
  handleDelete,
}: CredentialsListProps) {
  return (
    <div>
      <div className="max-h-[62vh] overflow-y-auto pr-1 sm:max-h-[65vh] lg:max-h-[78vh] lg:overflow-y-auto lg:pr-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              selected={selectedId === credential.id}
              onSelect={handleSelect}
              onVerify={handleVerify}
              onShare={handleShare}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
