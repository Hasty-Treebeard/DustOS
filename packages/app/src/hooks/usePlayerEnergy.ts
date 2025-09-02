import { useRecord } from "@latticexyz/stash/react";
import { stash, tables } from "../mud/stash";
import { useMemo } from "react";
import { bigIntMax } from "@latticexyz/common/utils";
import { usePlayerEntityId } from "../common/usePlayerEntityId";
import { encodePlayer } from "@dust/world/internal";

export interface PlayerEnergyData {
  currentEnergy: bigint;
  maxEnergy: bigint;
  drainRate: bigint;
  energyPercentage: number;
  formattedEnergy: string;
  formattedDrainRate: string;
  energyCosts: {
    move: bigint;
    waterMove: bigint;
    build: bigint;
    toolMine: bigint;
  };
}

export function usePlayerEnergy(): PlayerEnergyData | null {
  const { data: playerWalletAddress, isLoading: isWalletLoading } = usePlayerEntityId();

  // Constants from Dust world
  const MAX_PLAYER_ENERGY = 817600000000000000n; // 1 quintillion (1e18) - adjust this value based on actual constants
  const DEFAULT_MINE_ENERGY_COST = 8100000000000000n;
  const TOOL_MINE_ENERGY_COST = 255500000000000n;
  const DEFAULT_HIT_ENERGY_COST = 8100000000000000n;
  const TOOL_HIT_ENERGY_COST = 255500000000000n;
  const BUILD_ENERGY_COST = 255500000000000n;
  const TILL_ENERGY_COST = 255500000000000n;
  const CRAFT_ENERGY_COST = 255500000000000n;
  const MOVE_ENERGY_COST = 25550000000000n;
  const WATER_MOVE_ENERGY_COST = MAX_PLAYER_ENERGY / 4000n; // 4000 moves in water to die
  const LAVA_MOVE_ENERGY_COST = MAX_PLAYER_ENERGY / 10n; // 10 moves on lava to die
  const PLAYER_FALL_ENERGY_COST = MAX_PLAYER_ENERGY / 25n; // This makes it so, with full energy, you die from a 25 + 3 block fall
  const WOODEN_TOOL_BASE_MULTIPLIER = 10n; // 10x base effectiveness
  const ORE_TOOL_BASE_MULTIPLIER = 3n; // 3x base effectiveness
  const SPECIALIZATION_MULTIPLIER = 3n; // 3x bonus for using the right tool

  // Convert wallet address to player entity ID using EntityTypeLib.encodePlayer
  const playerEntityId = useMemo(() => {
    if (!playerWalletAddress) return null;
    try {
      const entityId = encodePlayer(playerWalletAddress);
      return entityId;
    } catch (error) {
      console.error('PlayerEnergy: Error encoding player entity ID:', error);
      return null;
    }
  }, [playerWalletAddress]);

  // Use the encoded player entity ID to query the Energy table
  const energy = useRecord(
    playerEntityId ? {
      stash,
      table: tables.Energy,
      key: { entityId: playerEntityId },
    } : {
      stash,
      table: tables.Energy,
      key: { entityId: "0x0000000000000000000000000000000000000000000000000000000000000000" },
    }
  );

  const result = useMemo(() => {
    // Don't return data if stash or tables aren't available yet
    if (!stash || !tables.Energy) {
      return null;
    }

    if (!energy) {
      return null;
    }

    const currentTime = BigInt(Date.now());
    const lastUpdatedTime = energy.lastUpdatedTime * 1000n;
    const elapsed = (currentTime - lastUpdatedTime) / 1000n;
    const energyDrained = elapsed * energy.drainRate;
    const currentEnergy = bigIntMax(0n, energy.energy - energyDrained);
    const maxEnergy = energy.energy;
    const drainRate = energy.drainRate;

    // Calculate energy percentage with decimal precision
    const energyPercentage = MAX_PLAYER_ENERGY > 0n 
      ? (Number(currentEnergy) * 100) / Number(MAX_PLAYER_ENERGY)
      : 0;

    // Format energy values for display
    const formatEnergy = (value: bigint): string => {
      // Convert to number for easier formatting
      const numValue = Number(value);
      
      if (numValue >= 1e15) {
        return `${Math.round(numValue / 1e13) / 10}`; // Show as thousands of trillions
      } else if (numValue >= 1e12) {
        return `${Math.round(numValue / 1e10) / 10}`; // Show as thousands of billions
      } else if (numValue >= 1e9) {
        return `${Math.round(numValue / 1e7) / 10}`; // Show as thousands of millions
      } else if (numValue >= 1e6) {
        return `${Math.round(numValue / 1e4) / 10}`; // Show as thousands of thousands
      } else if (numValue >= 1e3) {
        return `${Math.round(numValue / 1e1) / 10}`; // Show as thousands
      } else {
        return numValue.toString();
      }
    };

    const formatDrainRate = (rate: bigint): string => {
      // Convert to number for easier formatting
      const numValue = Number(rate);
      
      if (numValue >= 1e15) {
        return `${Math.round(numValue / 1e13) / 10}/s`; // Show as thousands of trillions per second
      } else if (numValue >= 1e12) {
        return `${Math.round(numValue / 1e10) / 10}/s`; // Show as thousands of billions per second
      } else if (numValue >= 1e9) {
        return `${Math.round(numValue / 1e7) / 10}/s`; // Show as thousands of millions per second
      } else if (numValue >= 1e6) {
        return `${Math.round(numValue / 1e4) / 10}/s`; // Show as thousands of thousands per second
      } else if (numValue >= 1e3) {
        return `${Math.round(numValue / 1e1) / 10}/s`; // Show as thousands per second
      } else {
        return `${numValue}/s`;
      }
    };

    return {
      currentEnergy,
      maxEnergy,
      drainRate,
      energyPercentage,
      formattedEnergy: formatEnergy(currentEnergy),
      formattedDrainRate: formatDrainRate(drainRate),
      energyCosts: {
        move: MOVE_ENERGY_COST,
        waterMove: WATER_MOVE_ENERGY_COST,
        build: BUILD_ENERGY_COST,
        toolMine: TOOL_MINE_ENERGY_COST,
      },
    };
  }, [energy, playerEntityId]);

  // Don't proceed if wallet is still loading or not available
  if (isWalletLoading || !playerWalletAddress) {
    return null;
  }

  return result;
}
