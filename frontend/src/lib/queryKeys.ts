export const credentialsKeys = {
  all: ["credentials"] as const,
  list: ["credentials", "list"] as const,
  detail: (id: string) => ["credentials", "detail", id] as const,
};
