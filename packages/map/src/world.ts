import { ethers } from "ethers";
import { Vec3 } from "./types";
import { ObjectTypes } from "./objectTypes";

export class WorldModule {
  // Constants from the original implementation
  private BYTES_32_BITS = 256n;
  private ENTITY_TYPE_BITS = 8n;
  private ENTITY_ID_BITS = this.BYTES_32_BITS - this.ENTITY_TYPE_BITS; // 248n
  private VEC3_BITS = 96n;

  public blockCache = new Map<string, { blockType: number; biome: number }>();

  // Entity Types enum (from original codebase)
  private EntityTypes = {
    Incremental: 0x00,
    Player: 0x01,
    Fragment: 0x02,
    Block: 0x03,
  } as const;

  // You'll need to configure these based on your deployed contracts
  private ENTITY_OBJECT_TYPE_TABLE_ID =
    "0x74620000000000000000000000000000456e746974794f626a65637454797065";

  private provider: ethers.Provider;
  private worldContract: ethers.Contract;

  constructor(provider: ethers.Provider, worldContract: ethers.Contract) {
    this.provider = provider;
    this.worldContract = worldContract;
  }

  /**
   * Pack an [x,y,z] vector into a single uint96 to match Vec3.sol user type
   */
  private packVec3(coord: [number, number, number]): bigint {
    const [x, y, z] = coord;

    // Convert each signed 32-bit integer into an unsigned 32-bit number
    const ux = BigInt(x >>> 0);
    const uy = BigInt(y >>> 0);
    const uz = BigInt(z >>> 0);

    // Pack the three numbers into a single 96-bit integer:
    // Shift ux left by 64 bits, uy left by 32 bits, and then OR them together
    return (ux << 64n) | (uy << 32n) | uz;
  }

  /**
   * Encode entity type and data into EntityId
   */
  private encodeEntity(entityType: number, data: bigint): string {
    const entityId = (BigInt(entityType) << this.ENTITY_ID_BITS) | data;
    return ethers.zeroPadValue(ethers.toBeHex(entityId), 32);
  }

  /**
   * Encode coordinate with entity type
   */
  private encodeCoord(
    entityType: number,
    coord: { x: number; y: number; z: number }
  ): string {
    const packedCoord = this.packVec3([coord.x, coord.y, coord.z]);
    return this.encodeEntity(
      entityType,
      packedCoord << (this.ENTITY_ID_BITS - this.VEC3_BITS)
    );
  }

  /**
   * Encode block coordinate into EntityId
   */
  private encodeBlock(coord: { x: number; y: number; z: number }): string {
    return this.encodeCoord(this.EntityTypes.Block, coord);
  }

  async getObjectTypeAt(coord: Vec3): Promise<number> {
    const entityId = this.encodeBlock({ x: coord.x, y: coord.y, z: coord.z });

    try {
      const [staticData] = await this.worldContract.getRecord(
        this.ENTITY_OBJECT_TYPE_TABLE_ID,
        [entityId]
      );

      if (staticData !== "0x") {
        // Decode the ObjectType (uint16) from static data - should be first 2 bytes
        const objectType = parseInt(staticData.slice(2, 6), 16); // First 2 bytes as uint16
        if (objectType !== 0) {
          return objectType;
        }
      }
      return 0;
    } catch (error) {
      return 0; // Return 0 instead of throwing for easier batch processing
    }
  }

  // World constants
  CHUNK_SIZE = 16;
  DATA_OFFSET = 1; // SSTORE2 offset
  VERSION_PADDING = 1;
  BIOME_PADDING = 1;
  SURFACE_PADDING = 1;
  CREATE3_PROXY_INITCODE_HASH =
    "0x21c35dbe1b344a2488cf3321d6ce542f8e9f305544ff09e4993a62319a497c1f";

  // Helper: Floor division for negative numbers
  private floorDiv(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    if (a < 0 !== b < 0 && a % b !== 0) {
      return Math.ceil(a / b - 1);
    }
    return Math.floor(a / b);
  }

  // Helper: Proper modulo for negative numbers
  private mod(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  // Convert voxel to chunk coordinate
  public toChunkCoord(coord: Vec3): Vec3 {
    const chunkCoord = {
      x: this.floorDiv(coord.x, this.CHUNK_SIZE),
      y: this.floorDiv(coord.y, this.CHUNK_SIZE),
      z: this.floorDiv(coord.z, this.CHUNK_SIZE),
    };
    return chunkCoord;
  }

  // Get chunk pointer address (CREATE3)
  private getChunkPointer(chunkCoord: Vec3, worldAddress: string): string {
    // Pack chunk coord to get salt
    const salt = ethers.zeroPadValue(
      ethers.toBeHex(this.packVec3([chunkCoord.x, chunkCoord.y, chunkCoord.z])), 
      32
    );

    // First, calculate CREATE2 proxy address
    const create2Input = ethers.concat([
      "0xff",
      worldAddress,
      salt,
      this.CREATE3_PROXY_INITCODE_HASH,
    ]);
    const proxyAddress = "0x" + ethers.keccak256(create2Input).slice(-40);

    // Then calculate final storage address
    const rlpEncoded = ethers.concat([
      "0xd6", // RLP header
      "0x94", // RLP address prefix
      proxyAddress,
      "0x01", // Nonce
    ]);

    return "0x" + ethers.keccak256(rlpEncoded).slice(-40);
  }

  private getBlockIndex(coord: Vec3): number {
    // Get position relative to chunk origin
    const relativeCoord: Vec3 = {
      x: this.mod(coord.x, this.CHUNK_SIZE),
      y: this.mod(coord.y, this.CHUNK_SIZE),
      z: this.mod(coord.z, this.CHUNK_SIZE),
    };

    // Linear index: x * 256 + y * 16 + z
    const dataIndex =
      relativeCoord.x * this.CHUNK_SIZE * this.CHUNK_SIZE +
      relativeCoord.y * this.CHUNK_SIZE +
      relativeCoord.z;

    // Add header offset
    return (
      this.VERSION_PADDING +
      this.BIOME_PADDING +
      this.SURFACE_PADDING +
      dataIndex
    );
  }

  public async getBlockData(coord: Vec3): Promise<{ blockType: number; biome: number }> {
    const cacheKey = `${coord.x},${coord.y},${coord.z}`;
    
    // Check cache first
    if (this.blockCache.has(cacheKey)) {
      return this.blockCache.get(cacheKey)!;
    }

    let blockType = 0;
    try {
      blockType = await this.getObjectTypeAt(coord);
    } catch (error) {
      console.log("No object type found, trying to get block type from chunk");
    }

    const worldAddress = this.worldContract.target as string;

    // Step 1: Convert to chunk coordinate
    const chunkCoord = this.toChunkCoord(coord);

    // Step 2 & 3: Get chunk pointer and check if explored
    const chunkPointer = this.getChunkPointer(chunkCoord, worldAddress);
    const code = await this.provider.getCode(chunkPointer);

    if (code === "0x") {
      // Chunk not explored - return air/null
      console.log(`Chunk at (${chunkCoord.x},${chunkCoord.y},${chunkCoord.z}) not explored - returning air for block (${coord.x},${coord.y},${coord.z})`);
      const result = { blockType: 0, biome: 0 };
      this.blockCache.set(cacheKey, result);
      return result;
    }

    // Get biome data (byte at index 1 + DATA_OFFSET)
    const biomeByteIndex = this.DATA_OFFSET + 1;
    const biomeByte = code.slice(
      2 + biomeByteIndex * 2,
      2 + (biomeByteIndex + 1) * 2
    );
    const biome = parseInt(biomeByte, 16);

    // If we got blockType from object type, return it with biome
    if (blockType !== 0) {
      const result = { blockType, biome };
      this.blockCache.set(cacheKey, result);
      return result;
    }

    // Otherwise, get block type from chunk data
    const index = this.getBlockIndex(coord);

    // Read single byte at index (accounting for SSTORE2 DATA_OFFSET)
    const byteIndex = this.DATA_OFFSET + index;
    const blockTypeByte = code.slice(
      2 + byteIndex * 2,
      2 + (byteIndex + 1) * 2
    );

    blockType = parseInt(blockTypeByte, 16);

    console.log(`Block (${coord.x},${coord.y},${coord.z}) in chunk (${chunkCoord.x},${chunkCoord.y},${chunkCoord.z}): type=${blockType}, biome=${biome}`);
    const result = { blockType, biome };
    this.blockCache.set(cacheKey, result);
    return result;
  }

  /**
   * Get ground level for a given x,z coordinate
   * Returns the Y coordinate of the first non-passthrough block from top down
   */
  public async getGroundLevel(x: number, z: number, maxY: number = 100, minY: number = -64): Promise<{y: number, blockType: number, biome: number} | null> {
    // Scan from top to bottom to find ground level
    for (let y = maxY; y >= minY; y--) {
      try {
        const blockData = await this.getBlockData({ x, y, z });
        
        if (blockData.blockType !== 0 && blockData.blockType !== 1) { // Not null or air
          const objectType = ObjectTypes[blockData.blockType];
          if (objectType && !objectType.passThrough) {
            return {
              y,
              blockType: blockData.blockType,
              biome: blockData.biome
            };
          }
        }
      } catch (error) {
        // Continue if we can't fetch a block
        continue;
      }
    }
    
    return null; // No ground found
  }

  /**
   * Batch process ground levels for better performance
   */
  public async getGroundLevelsBatch(
    coordinates: Array<{ x: number; z: number }>,
    maxY: number = 100,
    minY: number = -64
  ): Promise<Array<{ x: number; z: number; y: number; blockType: number; biome: number } | null>> {
    const promises = coordinates.map(async coord => {
      const groundLevel = await this.getGroundLevel(coord.x, coord.z, maxY, minY);
      if (groundLevel) {
        return {
          x: coord.x,
          z: coord.z,
          y: groundLevel.y,
          blockType: groundLevel.blockType,
          biome: groundLevel.biome
        };
      }
      return null;
    });

    return Promise.all(promises);
  }

  clearCache() {
    this.blockCache.clear();
  }
}
