"use client";

import { useQuery } from "@tanstack/react-query";
import { listCredentials } from "@/lib/api";
import { credentialsKeys } from "@/lib/queryKeys";

export function useCredentialsQuery() {
  return useQuery({
    queryKey: credentialsKeys.list,
    queryFn: listCredentials,
  });
}
