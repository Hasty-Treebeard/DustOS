import { useQuery } from "@tanstack/react-query";
import { useDustClient } from "./useDustClient";

export function usePlayerEntityId() {
  const { data: dustClient } = useDustClient();

  return useQuery({
    queryKey: ["player-entity-id"],
    queryFn: () => {
      if (!dustClient) {
        throw new Error("Dust client not available");
      }
      return dustClient.appContext.userAddress;
    },
    enabled: !!dustClient,
  });
}
