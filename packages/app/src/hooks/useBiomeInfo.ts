import { useState, useEffect } from 'react';
import { getBiome } from "@dust/world/internal";
import { biomesById } from "@dust/world/internal";
import { worldAddress } from "../common/worldAddress";
import { publicClient } from "../chain";

export function useBiomeInfo(x: number | undefined, y: number | undefined, z: number | undefined) {
  const [biomeName, setBiomeName] = useState<string | null>(null);
  const [oreMultipliers, setOreMultipliers] = useState<{
    coal: number;
    copper: number;
    iron: number;
    gold: number;
    diamond: number;
    neptunium: number;
  } | null>(null);

  // Hook for fetching biome information and ore multipliers

  const updateBiomeInfo = async () => {
    if (x === undefined || y === undefined || z === undefined) return;
    
    try {
      const newBiomeId = await getBiome(worldAddress, publicClient as any, [x, y, z]);
      const numericBiomeId = typeof newBiomeId === 'bigint' ? Number(newBiomeId) : Number(newBiomeId);
      const biomeData: any = (biomesById as any)[numericBiomeId];
      const biomeName = typeof biomeData === 'string' ? biomeData : biomeData?.name || "Unknown";
      setBiomeName(biomeName);
      
      // Update ore multipliers state when biome changes
      const biome = (biomesById as any)[numericBiomeId];
      if (biome?.oreMultipliers && Array.isArray(biome.oreMultipliers)) {
        const nameToKey: Record<string, keyof NonNullable<typeof oreMultipliers>> = {
          CoalOre: 'coal',
          CopperOre: 'copper',
          IronOre: 'iron',
          GoldOre: 'gold',
          DiamondOre: 'diamond',
          NeptuniumOre: 'neptunium',
        };

        // Calculate sum of all multipliers
        const sum = biome.oreMultipliers.reduce(
          (total: number, entry: [string, number]) => total + Number(entry[1] || 0),
          0
        );

        const named: { coal: number; copper: number; iron: number; gold: number; diamond: number; neptunium: number } = {
          coal: 0,
          copper: 0,
          iron: 0,
          gold: 0,
          diamond: 0,
          neptunium: 0,
        };
        for (const entry of biome.oreMultipliers) {
          const [name, value]: [string, number] = entry;
          const key = nameToKey[name];
          if (key) {
            const percentage = sum > 0 ? (Number(value || 0) / sum) * 100 : 0;
            (named as any)[key] = Math.round(percentage * 100) / 100;
          }
        }
        setOreMultipliers(named);
      } else {
        setOreMultipliers(null);
      }
    } catch (err) {
      console.error("Failed to update biome info:", err);
      setBiomeName("Unknown");
    }
  };

  useEffect(() => {
    if (x !== undefined && y !== undefined && z !== undefined) {
      updateBiomeInfo();
    }
  }, [x, y, z]);

  return { biomeName, oreMultipliers, updateBiomeInfo };
}
