"use client";

import { useState } from "react";
import { Share2, ShieldCheck, Trash2 } from "lucide-react";

type CredentialActionsProps = {
  onVerify: () => void | Promise<void>;
  onShare: () => void;
  onDelete: () => void | Promise<void>;
};

export function CredentialActions({
  onVerify,
  onShare,
  onDelete,
}: CredentialActionsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    try {
      setDeleting(true);
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="border-surface-light border-t flex items-center justify-between w-full pt-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShare();
          }}
          className="cursor-pointer rounded-full p-1 text-ink hover:bg-surface hover:text-text transition"
          aria-label="Share credential"
        >
          <Share2 size={18} color="var(--ink)" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void onVerify();
          }}
          className="cursor-pointer rounded-full p-1 text-ink hover:bg-surface hover:text-text transition"
          aria-label="Verify credential"
        >
          <ShieldCheck size={18} color="var(--ink)" />
        </button>
      </div>
      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-surface transition"
            onClick={(event) => {
              event.stopPropagation();
              setConfirmingDelete(false);
            }}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-full bg-[#C23E3E] px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
            onClick={(event) => {
              event.stopPropagation();
              void handleConfirmDelete();
            }}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Confirm"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setConfirmingDelete(true);
          }}
          className="cursor-pointer rounded-full p-1 text-[#C23E3E] hover:bg-[#fdeeee] transition"
          aria-label="Delete credential"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
