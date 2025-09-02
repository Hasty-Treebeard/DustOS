import { useRecord } from "@latticexyz/stash/react";
import { stash, tables } from "../mud/stash";
import { useMemo } from "react";
import { bigIntMax } from "@latticexyz/common/utils";
import { usePlayerEntityId } from "./usePlayerEntityId";
import { encodePlayer } from "@dust/world/internal";

export function usePlayerStatus(): "alive" | "dead" {
  const { data: playerWalletAddress, isLoading: isWalletLoading } = usePlayerEntityId();

  // Don't proceed if wallet is still loading or not available
  if (isWalletLoading || !playerWalletAddress) {
    return "dead"; // Default to dead while loading
  }

  // Convert wallet address to player entity ID using encodePlayer
  const playerEntityId = useMemo(() => {
    if (!playerWalletAddress) return null;
    try {
      const entityId = encodePlayer(playerWalletAddress);
      return entityId;
    } catch (error) {
      console.error('usePlayerStatus: Error encoding player entity ID:', error);
      return null;
    }
  }, [playerWalletAddress]);

  const energy = useRecord({
    stash,
    table: tables.Energy,
    key: { entityId: playerEntityId ?? "0x" },
  });

  const optimisticEnergy = useMemo(() => {
    if (!energy) return undefined;
    const currentTime = BigInt(Date.now());
    const lastUpdatedTime = energy.lastUpdatedTime * 1000n;
    const elapsed = (currentTime - lastUpdatedTime) / 1000n;
    const energyDrained = elapsed * energy.drainRate;
    return bigIntMax(0n, energy.energy - energyDrained);
  }, [energy]);

  return optimisticEnergy ? "alive" : "dead";
}
