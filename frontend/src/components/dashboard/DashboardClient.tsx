"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search } from "lucide-react";
import { Alert, AlertState } from "@/components/ui/Alert";
import { DashboardTitle } from "./DashboardTitle";
import { EmptyCredentials } from "./EmptyCredentials";
import { CredentialsList } from "./CredentialsList";
import { SummaryRow } from "./SummaryRow";
import { CredentialDetailPanel } from "./CredentialDetailPanel";
import {
  type Credential,
  listCredentials,
  deleteCredential,
  verifyCredentialById,
} from "@/lib/api";
export default function DashboardClient() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  
  useEffect(() => {
    listCredentials()
      .then(setCredentials)
      .catch((err) => {
        setAlert({
          variant: "error",
          message:
            err instanceof Error ? err.message : "Failed loading credentials",
        });
      });
  }, [setAlert]);

const total = credentials.length;

const credentialById = useMemo(
  () => new Map(credentials.map((c) => [c.id, c])),
  [credentials],
);

const displayedCredentials = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return credentials;
  return credentials.filter((c) =>
    c.type.join(" ").toLowerCase().includes(q) ||
    c.issuer.toLowerCase().includes(q) ||
    JSON.stringify(c.credentialSubject).toLowerCase().includes(q),
  );
}, [credentials, query]);

const selectedCredential = useMemo(
  () => (selectedId ? credentialById.get(selectedId) : undefined),
  [credentialById, selectedId],
);

const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
  setDetailsOpen(true);
}, []);

const remove = useCallback(async (id: string) => {
  await deleteCredential(id);
  setCredentials((prev) => prev.filter((c) => c.id !== id));
}, []);

const verify = useCallback((id: string) => verifyCredentialById(id), []);


  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await remove(id);
        if (selectedId === id) {
          setSelectedId(null);
          setDetailsOpen(false);
        }
        setAlert({ variant: "success", message: "Credential deleted" });
      } catch (err) {
        setAlert({
          variant: "error",
          message:
            err instanceof Error ? err.message : "Failed to delete credential",
        });
      }
    },
    [remove, selectedId, setAlert],
  );

  const handleVerify = useCallback(
    async (id: string) => {
      try {
        const result = await verify(id);
        if (result.valid) {
          setAlert({ variant: "success", message: "Credential is valid" });
        } else {
          setAlert({
            variant: "error",
            message: result.reason ?? "Credential is invalid",
          });
        }
      } catch (err) {
        setAlert({
          variant: "error",
          message: err instanceof Error ? err.message : "Verification failed",
        });
      }
    },
    [setAlert, verify],
  );

  const handleShare = useCallback(
    async (id: string) => {
      const credential = credentialById.get(id);
      if (!credential) {
        setAlert({ variant: "error", message: "Credential not found" });
        return;
      }

      try {
        await navigator.clipboard.writeText(
          JSON.stringify(credential, null, 2),
        );
        setAlert({ variant: "success", message: "Credential JSON copied" });
      } catch {
        setAlert({ variant: "error", message: "Copy failed" });
      }
    },
    [credentialById, setAlert],
  );

  return (
    <div className="mx-auto  px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8 space-y-6">
          <DashboardTitle />
          <SummaryRow
            totalCredentials={total}
            walletId="did:key:z6Mk...wallet"
          />

          <div className="rounded-xl bg-background">
            <div className="sticky top-0 z-20 bg-background pb-4">
              <div className="rounded-xl bg-white flex items-center justify-between h-10 p-3">
                <input
                  type="text"
                  placeholder="Filter credentials by issuer, type, or claim..."
                  className="w-full px-2 font-liberation-sans text-placeholder-text text-sm border-0 outline-none"
                  value={queryInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQueryInput(value);
                    setQuery(value);
                  }}
                />
                <Search size={16} color="var(--ink)" />
              </div>
            </div>

            {displayedCredentials.length === 0 ? (
              <EmptyCredentials />
            ) : (
              <CredentialsList
                credentials={displayedCredentials}
                selectedId={selectedId}
                handleSelect={handleSelect}
                handleVerify={handleVerify}
                handleShare={handleShare}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </section>

        <aside className="hidden lg:block lg:col-span-4">
          <CredentialDetailPanel
            credential={selectedCredential}
            onVerify={handleVerify}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        </aside>

        {detailsOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close details modal"
              className="absolute inset-0 bg-black/35 cursor-pointer"
              onClick={() => setDetailsOpen(false)}
            />
            <div
              className="absolute inset-x-0 bottom-0 max-h-screen overflow-auto rounded-t-2xl  bg-background p-3 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <CredentialDetailPanel
                credential={selectedCredential}
                onVerify={handleVerify}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ) : null}
      </div>

      {alert ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2">
          <Alert
            variant={alert.variant}
            className="flex items-center justify-between"
          >
            {alert.message}
            <button
              type="button"
              className="cursor-pointer ml-4 text-sm font-semibold hover:opacity-70"
              onClick={() => setAlert(null)}
            >
              x
            </button>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}
