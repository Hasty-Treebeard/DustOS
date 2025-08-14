# Dust World Map

A webapp for creating and viewing topdown maps of the 3D Dust voxel world.

## Features

- **World Indexing**: Scan the Dust blockchain world to extract ground-level block data
- **Interactive Map**: Pan and zoom through a topdown view of the indexed world
- **Horizontal Slice Indexing**: Scans a specific Y level across the world for fast indexing
- **Material Colors**: Each block type is rendered with its appropriate color based on the material type
- **Browser Database**: Uses IndexedDB to store indexed block data locally in the browser

## Architecture

### Core Components

- **WorldModule** (`src/world.ts`): Interfaces with the Dust world contracts to fetch block data
- **MapDatabase** (`src/browserDatabase.ts`): Browser-compatible IndexedDB wrapper for storing block data
- **IndexingService** (`src/indexingService.ts`): Coordinates the indexing process between world data and database
- **IndexingPage** (`src/components/IndexingPage.tsx`): UI for starting and monitoring indexing progress
- **MapCanvas** (`src/components/MapCanvas.tsx`): Interactive map display using Konva.js

### Block Data Flow

1. **Indexing Phase**: 
   - User specifies area to index (center coordinates + radius + Y level)
   - Service fetches block data from world contracts in batches at the specified Y level
   - All blocks at that height are indexed (including air blocks)
   - Data is stored in local IndexedDB

2. **Map Display Phase**:
   - Map component requests visible blocks based on current view
   - Blocks are rendered as colored pixels based on material type
   - User can pan and zoom to explore the world

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Access to deployed Dust world contracts

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Configuration

Update the contract addresses and provider settings in `src/App.tsx`:

```typescript
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const worldContract = new ethers.Contract(
  'YOUR_WORLD_CONTRACT_ADDRESS',
  [...],
  provider
);
```

## Usage

1. **Start the development server** and navigate to the Indexing tab
2. **Configure indexing parameters**:
   - Center X/Z: World coordinates to center the scan
   - Radius: How far to scan in each direction (creates a square area)
   - Y Level: The height level to scan (e.g., Y=50 for above-ground, Y=10 for underground)
3. **Start indexing** and monitor progress
4. **Switch to Map View** to see the indexed areas
5. **Navigate the map**:
   - Drag to pan
   - Scroll to zoom
   - Each pixel represents one block

## Horizontal Slice Algorithm

For each (x,z) coordinate at the specified Y level:
1. Fetch block data at coordinate (x, Y, z)
2. Store block type and biome data
3. Save to database (including air blocks for completeness)
4. Display only non-air blocks on the map for visual clarity

## Material Colors

Each block type has an associated color defined in `src/objectTypes.ts`. The colors are designed to represent the natural appearance of the materials:

- Stone: Gray tones
- Grass: Green
- Sand: Beige/yellow
- Water: Blue
- Wood: Brown tones
- Ores: Metallic colors
- etc.

## Browser Compatibility

The app uses modern web APIs:
- IndexedDB for local storage
- Canvas API for map rendering (via Konva.js)
- Modern JavaScript features

Tested on Chrome, Firefox, Safari, and Edge.

## Performance Notes

- Indexing is done in batches to avoid overwhelming the blockchain provider
- Horizontal slice approach is much faster than ground-level detection
- Map rendering uses Konva.js for efficient canvas management
- Only visible and non-air blocks are rendered for better performance
- Auto-refresh every 2 seconds during indexing
- Database queries are optimized for range-based lookups

## Future Enhancements

- [ ] Chunk-based indexing for more efficient scanning
- [ ] Layer visualization (show different Y levels)
- [ ] Player/entity overlay
- [ ] Export map as image
- [ ] 3D height visualization
- [ ] Real-time updates as world changes
