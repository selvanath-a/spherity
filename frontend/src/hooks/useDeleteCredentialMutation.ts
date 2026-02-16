"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCredential } from "@/lib/api";
import { credentialsKeys } from "@/lib/queryKeys";
import type { Credential } from "@/lib/schemas/credential";

type Ctx = { previousList?: Credential[] };

export function useDeleteCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCredential(id),
    onMutate: async (id): Promise<Ctx> => {
      await queryClient.cancelQueries({ queryKey: credentialsKeys.list });

      const previousList = queryClient.getQueryData<Credential[]>(
        credentialsKeys.list,
      );

      queryClient.setQueryData<Credential[]>(credentialsKeys.list, (old = []) =>
        old.filter((c) => c.id !== id),
      );

      return { previousList };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousList) {
        queryClient.setQueryData(credentialsKeys.list, ctx.previousList);
      }
    },
    onSettled: async (_data, _err, id) => {
      await queryClient.invalidateQueries({ queryKey: credentialsKeys.list });
      await queryClient.invalidateQueries({
        queryKey: credentialsKeys.detail(id),
      });
    },
  });
}
