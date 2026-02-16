"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyCredential, verifyCredentialById } from "@/lib/api";
import type { Credential } from "@/lib/schemas/credential";

export function useVerifyCredentialByIdMutation() {
  return useMutation({
    mutationFn: (id: string) => verifyCredentialById(id),
  });
}

export function useVerifyCredentialMutation() {
  return useMutation({
    mutationFn: (credential: Credential) => verifyCredential(credential),
  });
}
