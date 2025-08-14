import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { MapDatabase } from '../browserDatabase';
import { BlockData } from '../types';
import { ObjectTypes } from '../objectTypes';
import { WORLD_CENTER } from '../worldBounds';

interface MapCanvasProps {
  database: MapDatabase;
  width: number;
  height: number;
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ database, width, height }) => {
  const stageRef = useRef<any>();
  const [viewState, setViewState] = useState<ViewState>({
    x: width / 2,
    y: height / 2,
    scale: 1,
  });
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAirBlocks, setShowAirBlocks] = useState(true);

  // Calculate visible area based on current view state
  const getVisibleBounds = useCallback(() => {
    const stageWidth = width / viewState.scale;
    const stageHeight = height / viewState.scale;
    
    const minX = Math.floor(-viewState.x / viewState.scale);
    const maxX = Math.ceil((stageWidth - viewState.x) / viewState.scale);
    const minZ = Math.floor(-viewState.y / viewState.scale);
    const maxZ = Math.ceil((stageHeight - viewState.y) / viewState.scale);
    
    return { minX, maxX, minZ, maxZ };
  }, [viewState, width, height]);

  // Load blocks for the visible area
  const loadVisibleBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const bounds = getVisibleBounds();
      console.log('Loading blocks in bounds:', bounds);
      const visibleBlocks = await database.getBlocksInRange(
        bounds.minX,
        bounds.maxX,
        bounds.minZ,
        bounds.maxZ
      );
      console.log('Loaded blocks:', visibleBlocks.length);
      setBlocks(visibleBlocks);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  }, [database, getVisibleBounds]);

  // Load blocks when view changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVisibleBlocks();
    }, 100); // Debounce to avoid too many requests while panning

    return () => clearTimeout(timeoutId);
  }, [loadVisibleBlocks]);

  // Refresh blocks periodically when indexing might be happening
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadVisibleBlocks();
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(refreshInterval);
  }, [loadVisibleBlocks]);

  // Handle stage drag
  const handleDragEnd = (e: any) => {
    setViewState(prev => ({
      ...prev,
      x: e.target.x(),
      y: e.target.y(),
    }));
  };

  // Handle zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom levels
    const clampedScale = Math.max(0.1, Math.min(10, newScale));
    
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / clampedScale) * clampedScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / clampedScale) * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    stage.batchDraw();

    setViewState({
      x: newPos.x,
      y: newPos.y,
      scale: clampedScale,
    });
  };

  // Reset view to origin (0,0)
  const resetView = () => {
    const stage = stageRef.current;
    // Center on origin (0,0) where we indexed blocks
    const centerX = width / 2;
    const centerY = height / 2;
    stage.position({ x: centerX, y: centerY });
    stage.scale({ x: 1, y: 1 });
    stage.batchDraw();
    
    setViewState({
      x: centerX,
      y: centerY,
      scale: 1,
    });
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldZ: number) => {
    return {
      x: worldX,
      y: worldZ,
    };
  };

  // Get color for block type
  const getBlockColor = (blockType: number) => {
    const objectType = ObjectTypes[blockType];
    return objectType?.color || '#808080';
  };

  const [totalBlocks, setTotalBlocks] = useState(0);

  // Load total blocks count
  useEffect(() => {
    database.getTotalBlocks().then(setTotalBlocks);
  }, [database, blocks]); // Refetch when blocks change

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
        <div className="text-sm text-gray-700 space-y-1">
          <div>Zoom: {viewState.scale.toFixed(2)}x</div>
          <div>Position: ({Math.round(-viewState.x / viewState.scale)}, {Math.round(-viewState.y / viewState.scale)})</div>
          <div>Solid blocks: {blocks.filter(b => b.blockType !== 0 && b.blockType !== 1).length}</div>
          <div>Air blocks: {blocks.filter(b => b.blockType === 0 || b.blockType === 1).length}</div>
          <div>Total loaded: {blocks.length}</div>
          <div>Total indexed: {totalBlocks}</div>
          <div className="h-4">
            {loading && <div className="text-blue-600">Loading...</div>}
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <button
            onClick={resetView}
            className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Center on Origin
          </button>
          <button
            onClick={() => loadVisibleBlocks()}
            disabled={loading}
            className={`w-full px-3 py-1 text-sm rounded ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button
            onClick={() => setShowAirBlocks(!showAirBlocks)}
            className={`w-full px-3 py-1 text-sm rounded ${
              showAirBlocks
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showAirBlocks ? 'Hide Air Blocks' : 'Show Air Blocks'}
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
        <div className="text-sm text-gray-700 mb-2 font-medium">Controls:</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Drag: Pan the map</div>
          <div>Scroll: Zoom in/out</div>
          <div>Each pixel = 1 block (all Y levels)</div>
          <div>Light gray = Air blocks</div>
          <div>Colors = Solid blocks</div>
          <div>Auto-refreshes every 2s</div>
        </div>
      </div>

      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        x={viewState.x}
        y={viewState.y}
        scaleX={viewState.scale}
        scaleY={viewState.scale}
      >
        <Layer>
          {blocks
            .filter(block => showAirBlocks || (block.blockType !== 0 && block.blockType !== 1))
            .map((block) => {
              const screenPos = worldToScreen(block.x, block.z);
              const isAir = block.blockType === 0 || block.blockType === 1;
              
              return (
                <Rect
                  key={`${block.x},${block.z}`}
                  x={screenPos.x}
                  y={screenPos.y}
                  width={1}
                  height={1}
                  fill={isAir ? '#f0f0f0' : getBlockColor(block.blockType)} // Light gray for air, normal color for solid blocks
                  opacity={isAir ? 0.3 : 1.0} // Make air blocks semi-transparent
                  // Add a subtle border for better visibility at high zoom
                  stroke={viewState.scale > 5 ? '#333' : undefined}
                  strokeWidth={viewState.scale > 5 ? 0.1 : 0}
                />
              );
            })}
        </Layer>
      </Stage>

      {blocks.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">No map data available</div>
            <div className="text-sm">
              {totalBlocks === 0 
                ? 'No blocks have been indexed yet. Go to the Indexing tab to start scanning the world.'
                : 'Zoom out or pan to see indexed areas.'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
