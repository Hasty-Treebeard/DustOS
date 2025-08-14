import { WorldModule } from './world';
import { MapDatabase } from './browserDatabase';
import { IndexingProgress, BlockData } from './types';

export class IndexingService {
  private world: WorldModule;
  private db: MapDatabase;
  private isRunning = false;
  private progress: IndexingProgress = {
    totalBlocks: 0,
    indexedBlocks: 0,
  };

  constructor(world: WorldModule, db: MapDatabase) {
    this.world = world;
    this.db = db;
  }

  /**
   * Start indexing a horizontal slice of the world at a specific Y level
   */
  async startIndexing(
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number,
    yLevel: number = 64,
    onProgress?: (progress: IndexingProgress) => void
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Indexing is already running');
    }

    this.isRunning = true;
    const totalCoordinates = (maxX - minX + 1) * (maxZ - minZ + 1);
    
    this.progress = {
      totalBlocks: totalCoordinates,
      indexedBlocks: 0,
      startedAt: new Date(),
      currentChunk: { x: minX, y: yLevel, z: minZ }
    };

    try {
      // Process in batches for better performance
      const batchSize = 50; // Reduced batch size for faster updates
      const coordinates: Array<{ x: number; z: number; y: number }> = [];

      // Generate all coordinates at the specified Y level
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          coordinates.push({ x, z, y: yLevel });
        }
      }

      // Process in batches
      for (let i = 0; i < coordinates.length; i += batchSize) {
        if (!this.isRunning) break; // Allow stopping

        const batch = coordinates.slice(i, i + batchSize);
        
        // Get block data for each coordinate in the batch
        const blockDataPromises = batch.map(async coord => {
          try {
            const blockData = await this.world.getBlockData({ x: coord.x, y: coord.y, z: coord.z });
            console.log(`Block at (${coord.x},${coord.y},${coord.z}): type=${blockData.blockType}, biome=${blockData.biome}`);
            return {
              x: coord.x,
              y: coord.y,
              z: coord.z,
              blockType: blockData.blockType,
              biome: blockData.biome,
              timestamp: Date.now()
            } as BlockData;
          } catch (error) {
            console.error(`Failed to fetch block at (${coord.x},${coord.y},${coord.z}):`, error);
            // Return null block for failed fetches
            return {
              x: coord.x,
              y: coord.y,
              z: coord.z,
              blockType: 0, // null/air
              biome: 0,
              timestamp: Date.now()
            } as BlockData;
          }
        });

        const blocks = await Promise.all(blockDataPromises);
        
        // Save all data to main blocks table
        if (blocks.length > 0) {
          await this.db.saveBlocks(blocks);
          
          // Count different block types for better feedback
          const solidBlocks = blocks.filter(b => b.blockType !== 0 && b.blockType !== 1).length;
          const airBlocks = blocks.filter(b => b.blockType === 0 || b.blockType === 1).length;
          console.log(`Saved ${blocks.length} blocks to database (${solidBlocks} solid, ${airBlocks} air)`);
        }

        // Update progress
        this.progress.indexedBlocks = Math.min(i + batchSize, coordinates.length);
        this.progress.currentChunk = { x: batch[0].x, y: yLevel, z: batch[0].z };
        
        // Calculate estimated completion
        const elapsed = Date.now() - this.progress.startedAt!.getTime();
        const rate = this.progress.indexedBlocks / elapsed; // blocks per ms
        const remaining = this.progress.totalBlocks - this.progress.indexedBlocks;
        if (rate > 0) {
          this.progress.estimatedCompletion = new Date(Date.now() + (remaining / rate));
        }

        if (onProgress) {
          onProgress({ ...this.progress });
        }

        // Small delay to prevent overwhelming the provider
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.progress.indexedBlocks = this.progress.totalBlocks;
      if (onProgress) {
        onProgress({ ...this.progress });
      }

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the current indexing process
   */
  stopIndexing() {
    this.isRunning = false;
  }

  /**
   * Get current progress
   */
  getProgress(): IndexingProgress {
    return { ...this.progress };
  }

  /**
   * Check if indexing is currently running
   */
  isIndexing(): boolean {
    return this.isRunning;
  }

  /**
   * Index a specific chunk area (16x16 positions) at a given Y level
   */
  async indexChunk(chunkX: number, chunkZ: number, yLevel: number = 64, onProgress?: (progress: IndexingProgress) => void): Promise<void> {
    const minX = chunkX * 16;
    const maxX = minX + 15;
    const minZ = chunkZ * 16;
    const maxZ = minZ + 15;

    await this.startIndexing(minX, maxX, minZ, maxZ, yLevel, onProgress);
  }

  /**
   * Index area around a center point at a given Y level
   */
  async indexArea(centerX: number, centerZ: number, radius: number, yLevel: number = 64, onProgress?: (progress: IndexingProgress) => void): Promise<void> {
    const minX = centerX - radius;
    const maxX = centerX + radius;
    const minZ = centerZ - radius;
    const maxZ = centerZ + radius;

    await this.startIndexing(minX, maxX, minZ, maxZ, yLevel, onProgress);
  }
}
