import { useState, useEffect } from 'react';
import { getObjectTypeAt } from "../getObjectTypeAt";

type PlayerPosition = {
  x: number;
  y: number;
  z: number;
};

export function useBlockAnalysis(playerPosition: { data: PlayerPosition | null | undefined; [key: string]: any }) {
  const [playerBlockType, setPlayerBlockType] = useState<number | null>(null);
  const [distanceToCave, setDistanceToCave] = useState<number | null>(null);
  const [distanceToSurface, setDistanceToSurface] = useState<number | null>(null);

  // Hook for analyzing player block position and cave/surface distances

  const updatePlayerBlockColumn = async () => {
    if (!playerPosition?.data) return;
    
    try {
      // Block directly below
      const newPlayerBlockType = await getObjectTypeAt([
        playerPosition.data.x,
        playerPosition.data.y - 1,
        playerPosition.data.z,
      ]);
      setPlayerBlockType(newPlayerBlockType);

      // Check blocks below for types 1, 2, or 111, up to Y = -60
      let foundBelow = false;
      const maxDistanceDown = playerPosition.data.y + 60;
      for (let i = 1; i <= maxDistanceDown; i++) {
        const blockType = await getObjectTypeAt([
          playerPosition.data.x,
          playerPosition.data.y - i,
          playerPosition.data.z,
        ]);
        if (blockType === 1 || blockType === 2 || blockType === 111) {
          setDistanceToCave(i);
          foundBelow = true;
          break;
        }
      }
      if (!foundBelow) {
        setDistanceToCave(null);
      }
      
      // Check blocks above for types 1, 2, or 111, up to Y = 324
      let foundAbove = false;
      const maxDistanceUp = 322 - playerPosition.data.y;
      for (let j = 2; j <= maxDistanceUp; j++) {
        const blockType = await getObjectTypeAt([
          playerPosition.data.x,
          playerPosition.data.y + j,
          playerPosition.data.z,
        ]);
        if (blockType === 1 || blockType === 2 || blockType === 111) {
          setDistanceToSurface(j);
          foundAbove = true;
          break;
        }
      }
      if (!foundAbove) {
        setDistanceToSurface(null);
      }
    } catch (err) {
      console.error("Failed to update playerBlockType or cave distance:", err);
    }
  };

  useEffect(() => {
    if (playerPosition?.data) {
      updatePlayerBlockColumn();
    }
  }, [playerPosition?.data?.x, playerPosition?.data?.y, playerPosition?.data?.z]);

  return { playerBlockType, distanceToCave, distanceToSurface };
}
