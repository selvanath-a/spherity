"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { issueCredential, type IssueCredentialRequest } from "@/lib/api";
import { credentialsKeys } from "@/lib/queryKeys";

export function useIssueCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueCredentialRequest) => issueCredential(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: credentialsKeys.list });
    },
  });
}
