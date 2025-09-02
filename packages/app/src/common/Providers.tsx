import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    },
  },
});

export type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
