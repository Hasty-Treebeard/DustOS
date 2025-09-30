import { useMemo } from "react";
import { getBlockMass } from "../common/objects";

export interface BlockMassData {
  blockName: string;
  mass: number;
  objectType: number;
}

export function useBlockMass(blockType: number | null): BlockMassData | null {
  const blockData = useMemo(() => {
    if (!blockType) return null;
    
    const massData = getBlockMass(blockType);
    if (!massData) return null;
    
    return {
      blockName: massData.name,
      mass: massData.mass,
      objectType: blockType,
    };
  }, [blockType]);

  return blockData;
}
