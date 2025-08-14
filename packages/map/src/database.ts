import Database from 'better-sqlite3';
import { BlockData, GroundLevelData } from './types';

export class MapDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './map.db') {
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Create blocks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS blocks (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        z INTEGER NOT NULL,
        blockType INTEGER NOT NULL,
        biome INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY (x, y, z)
      );
    `);

    // Create ground_level table for optimized map rendering
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ground_level (
        x INTEGER NOT NULL,
        z INTEGER NOT NULL,
        y INTEGER NOT NULL,
        blockType INTEGER NOT NULL,
        biome INTEGER NOT NULL,
        PRIMARY KEY (x, z)
      );
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_blocks_xyz ON blocks(x, y, z);
      CREATE INDEX IF NOT EXISTS idx_ground_level_xz ON ground_level(x, z);
    `);
  }

  saveBlock(block: BlockData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO blocks (x, y, z, blockType, biome, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(block.x, block.y, block.z, block.blockType, block.biome, block.timestamp);
  }

  saveBlocks(blocks: BlockData[]) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO blocks (x, y, z, blockType, biome, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = this.db.transaction((blocks: BlockData[]) => {
      for (const block of blocks) {
        stmt.run(block.x, block.y, block.z, block.blockType, block.biome, block.timestamp);
      }
    });

    transaction(blocks);
  }

  getBlock(x: number, y: number, z: number): BlockData | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM blocks WHERE x = ? AND y = ? AND z = ?
    `);
    const row = stmt.get(x, y, z) as any;
    return row ? { ...row } : undefined;
  }

  saveGroundLevel(groundData: GroundLevelData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ground_level (x, z, y, blockType, biome)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(groundData.x, groundData.z, groundData.y, groundData.blockType, groundData.biome);
  }

  saveGroundLevels(groundData: GroundLevelData[]) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ground_level (x, z, y, blockType, biome)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const transaction = this.db.transaction((groundData: GroundLevelData[]) => {
      for (const data of groundData) {
        stmt.run(data.x, data.z, data.y, data.blockType, data.biome);
      }
    });

    transaction(groundData);
  }

  getGroundLevel(x: number, z: number): GroundLevelData | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM ground_level WHERE x = ? AND z = ?
    `);
    const row = stmt.get(x, z) as any;
    return row ? { ...row } : undefined;
  }

  getGroundLevelsInRange(minX: number, maxX: number, minZ: number, maxZ: number): GroundLevelData[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ground_level 
      WHERE x >= ? AND x <= ? AND z >= ? AND z <= ?
    `);
    const rows = stmt.all(minX, maxX, minZ, maxZ) as any[];
    return rows.map(row => ({ ...row }));
  }

  getTotalBlocks(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM blocks');
    const row = stmt.get() as any;
    return row.count;
  }

  getTotalGroundLevels(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM ground_level');
    const row = stmt.get() as any;
    return row.count;
  }

  getBlocksInChunk(chunkX: number, chunkY: number, chunkZ: number, chunkSize: number = 16): BlockData[] {
    const minX = chunkX * chunkSize;
    const maxX = (chunkX + 1) * chunkSize - 1;
    const minY = chunkY * chunkSize;
    const maxY = (chunkY + 1) * chunkSize - 1;
    const minZ = chunkZ * chunkSize;
    const maxZ = (chunkZ + 1) * chunkSize - 1;

    const stmt = this.db.prepare(`
      SELECT * FROM blocks 
      WHERE x >= ? AND x <= ? 
        AND y >= ? AND y <= ? 
        AND z >= ? AND z <= ?
    `);
    
    const rows = stmt.all(minX, maxX, minY, maxY, minZ, maxZ) as any[];
    return rows.map(row => ({ ...row }));
  }

  close() {
    this.db.close();
  }
}
