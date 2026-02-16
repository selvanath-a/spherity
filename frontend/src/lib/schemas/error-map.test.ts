import { describe, expect, it } from "vitest";
import { zodIssuesToIssueFieldErrors, zodIssuesToMessage } from "./error-map";

describe("error-map", () => {
  it("maps first message per field", () => {
    const issues = [
      { path: ["type"], message: "Type required" },
      { path: ["type"], message: "Type too short" },
      { path: ["claimsJson"], message: "Invalid JSON" },
    ] as never[];

    const out = zodIssuesToIssueFieldErrors(issues);
    expect(out.type).toBe("Type required");
    expect(out.claimsJson).toBe("Invalid JSON");
  });

  it("returns first issue message", () => {
    const msg = zodIssuesToMessage(
      [{ path: ["x"], message: "Bad payload" }] as never[],
      "Fallback",
    );
    expect(msg).toBe("Bad payload");
  });
});
