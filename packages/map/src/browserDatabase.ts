import { BlockData } from './types';

export class MapDatabase {
  private dbName: string = 'dust-world-map';
  private dbVersion: number = 3;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Database upgrade needed, creating tables...');

        // Create main blocks store - stores ALL blocks with (x,y,z) coordinates
        if (!db.objectStoreNames.contains('blocks')) {
          const blocksStore = db.createObjectStore('blocks', { keyPath: ['x', 'y', 'z'] });
          blocksStore.createIndex('xyz', ['x', 'y', 'z'], { unique: true });
          blocksStore.createIndex('xz', ['x', 'z'], { unique: false }); // For map range queries
          console.log('Created blocks table');
        }

        // Remove old ground_level table if it exists (clean up)
        if (db.objectStoreNames.contains('ground_level')) {
          db.deleteObjectStore('ground_level');
          console.log('Removed old ground_level table');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    await this.initPromise;
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async saveBlock(block: BlockData): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readwrite');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      const request = store.put(block);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveBlocks(blocks: BlockData[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readwrite');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = blocks.length;
      
      if (total === 0) {
        resolve();
        return;
      }

      for (const block of blocks) {
        const request = store.put(block);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  async getBlock(x: number, y: number, z: number): Promise<BlockData | undefined> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readonly');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      const request = store.get([x, y, z]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBlocksInRange(minX: number, maxX: number, minZ: number, maxZ: number): Promise<BlockData[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readonly');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      const results: BlockData[] = [];
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as BlockData;
          const inRange = data.x >= minX && data.x <= maxX && data.z >= minZ && data.z <= maxZ;
          
          if (inRange) {
            results.push(data);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalBlocks(): Promise<number> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readonly');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBlockStatistics(): Promise<{airBlocks: number, solidBlocks: number, totalBlocks: number}> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readonly');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      let airBlocks = 0;
      let solidBlocks = 0;
      let totalBlocks = 0;
      
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as BlockData;
          totalBlocks++;
          
          // Air blocks are type 0 and 1
          if (data.blockType === 0 || data.blockType === 1) {
            airBlocks++;
          } else {
            solidBlocks++;
          }
          
          cursor.continue();
        } else {
          resolve({ airBlocks, solidBlocks, totalBlocks });
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getBlocksInChunk(chunkX: number, chunkY: number, chunkZ: number, chunkSize: number = 16): Promise<BlockData[]> {
    const minX = chunkX * chunkSize;
    const maxX = (chunkX + 1) * chunkSize - 1;
    const minY = chunkY * chunkSize;
    const maxY = (chunkY + 1) * chunkSize - 1;
    const minZ = chunkZ * chunkSize;
    const maxZ = (chunkZ + 1) * chunkSize - 1;

    const db = await this.ensureDB();
    const transaction = db.transaction(['blocks'], 'readonly');
    const store = transaction.objectStore('blocks');
    
    return new Promise((resolve, reject) => {
      const results: BlockData[] = [];
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as BlockData;
          if (data.x >= minX && data.x <= maxX && 
              data.y >= minY && data.y <= maxY && 
              data.z >= minZ && data.z <= maxZ) {
            results.push(data);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async waitForInit(): Promise<void> {
    await this.initPromise;
  }



  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
