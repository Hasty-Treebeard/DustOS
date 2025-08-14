export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type EntityId = string;

export interface BlockData {
  x: number;
  y: number;
  z: number;
  blockType: number;
  biome: number;
  timestamp: number;
}

export interface GroundLevelData {
  x: number;
  z: number;
  y: number;
  blockType: number;
  biome: number;
}

export interface IndexingProgress {
  totalBlocks: number;
  indexedBlocks: number;
  startedAt?: Date;
  estimatedCompletion?: Date;
  currentChunk?: Vec3;
}
