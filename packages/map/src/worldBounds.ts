export const WORLD_BOUNDS = {
  MIN_X: -1536,
  MAX_X: 2560,
  MIN_Y: -64,
  MAX_Y: 320,
  MIN_Z: -3072,
  MAX_Z: 1024,
} as const;

export const WORLD_SIZE = {
  WIDTH: WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X + 1,  // 4097 blocks
  HEIGHT: WORLD_BOUNDS.MAX_Y - WORLD_BOUNDS.MIN_Y + 1, // 385 blocks  
  DEPTH: WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z + 1,  // 4097 blocks
} as const;

export const WORLD_CENTER = {
  X: Math.floor((WORLD_BOUNDS.MIN_X + WORLD_BOUNDS.MAX_X) / 2), // 512
  Y: Math.floor((WORLD_BOUNDS.MIN_Y + WORLD_BOUNDS.MAX_Y) / 2), // 128
  Z: Math.floor((WORLD_BOUNDS.MIN_Z + WORLD_BOUNDS.MAX_Z) / 2), // -1024
} as const;

export function isWithinWorldBounds(x: number, y: number, z: number): boolean {
  return (
    x >= WORLD_BOUNDS.MIN_X && x <= WORLD_BOUNDS.MAX_X &&
    y >= WORLD_BOUNDS.MIN_Y && y <= WORLD_BOUNDS.MAX_Y &&
    z >= WORLD_BOUNDS.MIN_Z && z <= WORLD_BOUNDS.MAX_Z
  );
}

export function clampToWorldBounds(x: number, y: number, z: number): { x: number; y: number; z: number } {
  return {
    x: Math.max(WORLD_BOUNDS.MIN_X, Math.min(WORLD_BOUNDS.MAX_X, x)),
    y: Math.max(WORLD_BOUNDS.MIN_Y, Math.min(WORLD_BOUNDS.MAX_Y, y)),
    z: Math.max(WORLD_BOUNDS.MIN_Z, Math.min(WORLD_BOUNDS.MAX_Z, z)),
  };
}
