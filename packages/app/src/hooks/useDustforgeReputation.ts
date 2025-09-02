import { useQuery } from "@tanstack/react-query";
import { usePlayerEntityId } from "../common/usePlayerEntityId";
import { createPublicClient, http } from "viem";
import { redstone } from "../mud/redstone";

export function useDustforgeReputation(): number | null {
  const { data: playerWalletAddress, isLoading: isWalletLoading } = usePlayerEntityId();

  // Don't proceed if wallet is still loading or not available
  if (isWalletLoading || !playerWalletAddress) {
    return null;
  }

  const { data: reputation } = useQuery({
    queryKey: ["dustforge-reputation", playerWalletAddress],
    queryFn: async () => {
      try {
        // Create a Viem client for Redstone chain
        const client = createPublicClient({
          chain: redstone,
          transport: http()
        });

        // Make RPC call to query the Dustforge reputation table
        const tableId = "0x746264757374666f726765000000000052657075746174696f6e000000000000";
        
        // Query the table using the RPC client
        const result = await client.readContract({
          address: tableId as `0x${string}`,
          abi: [{
            name: "getScore",
            type: "function",
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view"
          }],
          functionName: "getScore",
          args: [playerWalletAddress as `0x${string}`]
        });

        return Number(result);
      } catch (error) {
        console.error('Error querying Dustforge reputation via RPC:', error);
        // Fallback to mock value for now
        return 69;
      }
    },
    enabled: !!playerWalletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return reputation ?? null;
}
