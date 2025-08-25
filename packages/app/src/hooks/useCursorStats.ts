import { useState, useEffect } from 'react';
import { getObjectTypeAt } from "../getObjectTypeAt";

type CursorPosition = {
  x: number;
  y: number;
  z: number;
};

export function useCursorStats(cursorPosition: { data: CursorPosition | null | undefined; [key: string]: any }) {
  const [cursorBlockType, setCursorBlockType] = useState<number | null>(null);

  // Hook for analyzing cursor position and block type

  const updateCursorStats = async () => {
    if (!cursorPosition?.data) return;
    
    try {
      const cursorBlockType = await getObjectTypeAt([
        cursorPosition.data.x,
        cursorPosition.data.y,
        cursorPosition.data.z,
      ]);
      setCursorBlockType(cursorBlockType);
    } catch (err) {
      console.error("Failed to update cursor stats:", err);
    }
  };

  useEffect(() => {
    if (cursorPosition?.data) {
      updateCursorStats();
    }
  }, [cursorPosition?.data?.x, cursorPosition?.data?.y, cursorPosition?.data?.z]);

  return { cursorBlockType };
}
