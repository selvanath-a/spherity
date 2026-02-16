import type { Credential } from "@/lib/schemas/credential";
import { describe, expect, it } from "vitest";
import { filterCredentials } from "./credentialSearch";

const credential: Credential = {
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  id: "urn:uuid:test-1",
  type: ["VerifiableCredential", "GymMembershipCard"],
  issuer: "did:vc-server:issuer",
  validFrom: "2026-02-15T00:00:00.000Z",
  validUntil: "2027-02-15T00:00:00.000Z",
  credentialSubject: { id: "did:wallet:1", name: "Alice", age: 33 },
  proof: {
    type: "DataIntegrityProof",
    created: "2026-02-15T01:00:00.000Z",
    proofPurpose: "assertionMethod",
    verificationMethod: "did:vc-server:issuer#key-1",
    cryptosuite: "ed25519-2020",
    proofValue: "abcd",
  },
};

describe("filterCredentials", () => {
  it("matches by type", () => {
    expect(filterCredentials([credential], "gym")).toHaveLength(1);
  });

  it("matches by issuer", () => {
    expect(filterCredentials([credential], "vc-server")).toHaveLength(1);
  });

  it("matches by validFrom/validUntil", () => {
    expect(filterCredentials([credential], "2027-02-15")).toHaveLength(1);
  });

  it("matches by credentialSubject", () => {
    expect(filterCredentials([credential], "alice")).toHaveLength(1);
  });

  it("returns empty on non-match", () => {
    expect(filterCredentials([credential], "passport")).toHaveLength(0);
  });
});
