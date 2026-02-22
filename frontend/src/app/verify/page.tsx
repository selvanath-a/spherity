"use client";

import { Alert, AlertState } from "@/components/ui/Alert";
import { tryRepairJson } from "@/utils";
import { credentialSchema } from "@/lib/schemas/credential";
import { zodIssuesToMessage } from "@/lib/schemas/error-map";
import { useState } from "react";
import { useVerifyCredentialMutation } from "@/hooks/useVerifyCredentialMutation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Link from "next/link";

export default function VerifyPage() {
  const [credentialJson, setCredentialJson] = useState("");
  const [alert, setAlert] = useState<AlertState>();
  const isOnline = useOnlineStatus();
  const verifyMutation = useVerifyCredentialMutation();
  const loading = verifyMutation.isPending;

  const isValidJson = (() => {
    if (!credentialJson.trim()) return null;
    try {
      JSON.parse(tryRepairJson(credentialJson));
      return true;
    } catch {
      return false;
    }
  })();

  async function handleVerify() {
    const repairedJson = tryRepairJson(credentialJson);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(repairedJson);
    } catch (err) {
      setAlert({
        variant: "error",
        message: err instanceof Error ? err.message : "Invalid JSON format",
      });
      return;
    }

    const credentialParse = credentialSchema.safeParse(parsedJson);
    if (!credentialParse.success) {
      setAlert({
        variant: "error",
        message: zodIssuesToMessage(
          credentialParse.error.issues,
          "Credential schema is invalid",
        ),
      });
      return;
    }
    const credential = credentialParse.data;

    try {
      const verifyResult = await verifyMutation.mutateAsync(credential);
      if (!verifyResult.valid) {
        setAlert({
          variant: "error",
          message: `Credential is invalid: ${verifyResult.reason || "Unknown reason"}`,
        });
        return;
      }
      setAlert({ variant: "success", message: "Credential is valid" });
    } catch (err) {
      setAlert({
        variant: "error",
        message: err instanceof Error ? err.message : "Verification failed",
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <section className="lg:col-span-8 rounded-2xl border border-border bg-white p-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-liberation-serif text-text">
          Verify Credential
        </h1>
          <Link href="/" className="btn btn-outline cursor-pointer">
            ← Back{" "}
            <span className="hidden min-[400px]:inline-block">
              to Dashboard
            </span>
          </Link>
          </div>
        <p className="mt-2 text-sm font-liberation-serif text-ink">
          Paste a credential JSON payload and validate its signature.
        </p>

        <label
          htmlFor="credential"
          className="mt-6 block text-xs font-pt-serif font-bold uppercase text-ink"
        >
          Credential JSON
        </label>
        <textarea
          id="credential"
          className="mt-2 min-h-64 w-full rounded-xl border border-border px-3 py-2 font-nimbus-mono text-xs outline-none"
          value={credentialJson}
          onChange={(event) => setCredentialJson(event.target.value)}
          placeholder={`{\n  "@context": ["https://www.w3.org/ns/credentials/v2"],\n  "type": ["VerifiableCredential", "Example"],\n  "issuer": "did:example:123",\n  "validFrom": "...",\n  "validUntil": "...",\n  "credentialSubject": { "id": "..." },\n  "proof": { ... }\n}`}
        />

        <div className="mt-2 text-xs">
          {isValidJson === true ? (
            <span className="font-semibold text-[#2d6a36]">
              Valid JSON format
            </span>
          ) : null}
          {isValidJson === false ? (
            <span className="font-semibold text-[#b53f3f]">
              Invalid JSON format
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !credentialJson}
            className="cursor-pointer rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Credential"}
          </button>
        </div>
      </section>
      {!isOnline ? (
        <div className="rounded-xl border border-[#efcdcd] bg-[#fff4f4] my-3 p-3 text-sm text-[#b53f3f]">
          Verifying requires internet connection.
        </div>
      ) : null}
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
