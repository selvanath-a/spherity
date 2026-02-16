"use client";

import { useQuery } from "@tanstack/react-query";
import { getCredential } from "@/lib/api";
import { credentialsKeys } from "@/lib/queryKeys";

export function useCredentialQuery(id: string) {
  return useQuery({
    queryKey: credentialsKeys.detail(id),
    queryFn: () => getCredential(id),
    enabled: Boolean(id),
  });
}
