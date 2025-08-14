import React, { useState, useRef, useEffect } from 'react';
import { IndexingService } from '../indexingService';
import { IndexingProgress } from '../types';
import { WORLD_BOUNDS, WORLD_CENTER, WORLD_SIZE } from '../worldBounds';

interface IndexingPageProps {
  indexingService: IndexingService;
}

export const IndexingPage: React.FC<IndexingPageProps> = ({ indexingService }) => {
  const [progress, setProgress] = useState<IndexingProgress>({
    totalBlocks: 0,
    indexedBlocks: 0,
  });
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingParams, setIndexingParams] = useState({
    centerX: WORLD_CENTER.X, // Start at world center (512)
    centerZ: WORLD_CENTER.Z, // Start at world center (-1024)
    radius: 50,
    yLevel: 64, // Good surface level
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if indexing is already running when component mounts
    setIsIndexing(indexingService.isIndexing());
    if (indexingService.isIndexing()) {
      startProgressUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [indexingService]);

  const startProgressUpdates = () => {
    intervalRef.current = setInterval(() => {
      const currentProgress = indexingService.getProgress();
      setProgress(currentProgress);
      
      if (!indexingService.isIndexing()) {
        setIsIndexing(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 1000);
  };

  const startIndexing = async () => {
    if (isIndexing) return;

    // Validate bounds
    const minX = indexingParams.centerX - indexingParams.radius;
    const maxX = indexingParams.centerX + indexingParams.radius;
    const minZ = indexingParams.centerZ - indexingParams.radius;
    const maxZ = indexingParams.centerZ + indexingParams.radius;
    
    if (minX < WORLD_BOUNDS.MIN_X || maxX > WORLD_BOUNDS.MAX_X || 
        minZ < WORLD_BOUNDS.MIN_Z || maxZ > WORLD_BOUNDS.MAX_Z ||
        indexingParams.yLevel < WORLD_BOUNDS.MIN_Y || indexingParams.yLevel > WORLD_BOUNDS.MAX_Y) {
      alert(`Indexing area is outside world bounds!\nWorld: X(${WORLD_BOUNDS.MIN_X} to ${WORLD_BOUNDS.MAX_X}), Y(${WORLD_BOUNDS.MIN_Y} to ${WORLD_BOUNDS.MAX_Y}), Z(${WORLD_BOUNDS.MIN_Z} to ${WORLD_BOUNDS.MAX_Z})\nYour area: X(${minX} to ${maxX}), Y(${indexingParams.yLevel}), Z(${minZ} to ${maxZ})`);
      return;
    }

    try {
      setIsIndexing(true);
      startProgressUpdates();

      await indexingService.indexArea(
        indexingParams.centerX,
        indexingParams.centerZ,
        indexingParams.radius,
        indexingParams.yLevel,
        (progress) => {
          setProgress(progress);
        }
      );
    } catch (error) {
      console.error('Indexing failed:', error);
      alert(`Indexing failed: ${error}`);
    } finally {
      setIsIndexing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const stopIndexing = () => {
    indexingService.stopIndexing();
    setIsIndexing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const progressPercentage = progress.totalBlocks > 0 
    ? (progress.indexedBlocks / progress.totalBlocks) * 100 
    : 0;

  const formatTime = (date?: Date) => {
    return date ? date.toLocaleTimeString() : 'Unknown';
  };

  const getTimeRemaining = () => {
    if (!progress.estimatedCompletion) return 'Calculating...';
    const now = new Date();
    const remaining = progress.estimatedCompletion.getTime() - now.getTime();
    if (remaining <= 0) return 'Almost done...';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">World Indexer</h1>
      <p className="text-gray-600 mb-4">
        Index block data from the Dust world to generate a topdown map. 
        This process scans a horizontal slice of the world at a specific Y level and saves the data to a local database for fast map rendering.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">🌍 World Bounds</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>X:</strong> {WORLD_BOUNDS.MIN_X.toLocaleString()} to {WORLD_BOUNDS.MAX_X.toLocaleString()} ({WORLD_SIZE.WIDTH.toLocaleString()} blocks wide)</div>
          <div><strong>Y:</strong> {WORLD_BOUNDS.MIN_Y} to {WORLD_BOUNDS.MAX_Y} ({WORLD_SIZE.HEIGHT} blocks tall)</div>
          <div><strong>Z:</strong> {WORLD_BOUNDS.MIN_Z.toLocaleString()} to {WORLD_BOUNDS.MAX_Z.toLocaleString()} ({WORLD_SIZE.DEPTH.toLocaleString()} blocks deep)</div>
          <div><strong>Center:</strong> ({WORLD_CENTER.X}, {WORLD_CENTER.Y}, {WORLD_CENTER.Z})</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Indexing Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center X
            </label>
            <input
              type="number"
              value={indexingParams.centerX}
              onChange={(e) => setIndexingParams(prev => ({ ...prev, centerX: parseInt(e.target.value) || 0 }))}
              disabled={isIndexing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center Z
            </label>
            <input
              type="number"
              value={indexingParams.centerZ}
              onChange={(e) => setIndexingParams(prev => ({ ...prev, centerZ: parseInt(e.target.value) || 0 }))}
              disabled={isIndexing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius
            </label>
            <input
              type="number"
              value={indexingParams.radius}
              onChange={(e) => setIndexingParams(prev => ({ ...prev, radius: parseInt(e.target.value) || 50 }))}
              disabled={isIndexing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y Level
              <span className="text-xs text-gray-500 block">64=surface, 10=underground</span>
            </label>
            <input
              type="number"
              value={indexingParams.yLevel}
              min={WORLD_BOUNDS.MIN_Y}
              max={WORLD_BOUNDS.MAX_Y}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value === '-') {
                  setIndexingParams(prev => ({ ...prev, yLevel: value as any }));
                } else {
                  const parsed = parseInt(value);
                  if (!isNaN(parsed)) {
                    setIndexingParams(prev => ({ ...prev, yLevel: parsed }));
                  }
                }
              }}
              disabled={isIndexing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This will index a {(indexingParams.radius * 2 + 1)}×{(indexingParams.radius * 2 + 1)} area at Y={indexingParams.yLevel}
          <br />
          ({Math.pow(indexingParams.radius * 2 + 1, 2)} total coordinates)
          <br />
          <span className="text-blue-600">💡 Each Y level is stored separately - you can index multiple levels!</span>
        </p>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIndexingParams(prev => ({ ...prev, centerX: WORLD_CENTER.X, centerZ: WORLD_CENTER.Z }))}
              disabled={isIndexing}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              World Center ({WORLD_CENTER.X}, {WORLD_CENTER.Z})
            </button>
            <button
              onClick={() => setIndexingParams(prev => ({ ...prev, centerX: 0, centerZ: 0 }))}
              disabled={isIndexing}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
            >
              Origin (0, 0)
            </button>
            <button
              onClick={() => setIndexingParams(prev => ({ ...prev, centerX: 500, centerZ: -500 }))}
              disabled={isIndexing}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              Near Center (500, -500)
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={startIndexing}
            disabled={isIndexing}
            className={`px-6 py-2 rounded-md font-medium ${
              isIndexing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isIndexing ? 'Indexing...' : 'Start Indexing'}
          </button>
          {isIndexing && (
            <button
              onClick={stopIndexing}
              className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {progress.totalBlocks > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Blocks Indexed
              </span>
              <span className="text-sm text-gray-600">
                {progress.indexedBlocks.toLocaleString()} / {progress.totalBlocks.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-sm text-gray-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Started:</span>
              <br />
              {formatTime(progress.startedAt)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Time Remaining:</span>
              <br />
              {getTimeRemaining()}
            </div>
            <div>
              <span className="font-medium text-gray-700">Current Position:</span>
              <br />
              {progress.currentChunk ? `(${progress.currentChunk.x}, ${progress.currentChunk.z})` : 'Unknown'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
