import React, { useState, useEffect } from 'react';
import { MapDatabase } from '../browserDatabase';

interface AnalyticsPageProps {
  database: MapDatabase;
}

interface BlockStats {
  airBlocks: number;
  solidBlocks: number;
  totalBlocks: number;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ database }) => {
  const [stats, setStats] = useState<BlockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const blockStats = await database.getBlockStatistics();
      setStats(blockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load block statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [database]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatistics();
    }, 10000);

    return () => clearInterval(interval);
  }, [database]);

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (part: number, total: number) => 
    total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Block Analytics</h1>
        <button
          onClick={loadStatistics}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Analytics and statistics about all indexed blocks in the database.
      </p>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading statistics...</div>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-800 mb-2">
                {formatNumber(stats.totalBlocks)}
              </div>
              <div className="text-blue-700 font-medium">Total Blocks</div>
              <div className="text-blue-600 text-sm mt-1">
                All indexed blocks
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {formatNumber(stats.airBlocks)}
              </div>
              <div className="text-gray-700 font-medium">Air Blocks</div>
              <div className="text-gray-600 text-sm mt-1">
                {formatPercentage(stats.airBlocks, stats.totalBlocks)}% of total
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-green-800 mb-2">
                {formatNumber(stats.solidBlocks)}
              </div>
              <div className="text-green-700 font-medium">Solid Blocks</div>
              <div className="text-green-600 text-sm mt-1">
                {formatPercentage(stats.solidBlocks, stats.totalBlocks)}% of total
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Block Type Breakdown</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Air Blocks (Type 0 & 1)</div>
                  <div className="text-sm text-gray-600">Empty space and air</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-700">{formatNumber(stats.airBlocks)}</div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(stats.airBlocks, stats.totalBlocks)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Solid Blocks</div>
                  <div className="text-sm text-green-600">Stone, dirt, ores, structures, etc.</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">{formatNumber(stats.solidBlocks)}</div>
                  <div className="text-sm text-green-500">
                    {formatPercentage(stats.solidBlocks, stats.totalBlocks)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Block Distribution</div>
              <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                <div
                  className="bg-gray-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${formatPercentage(stats.airBlocks, stats.totalBlocks)}%` }}
                >
                  {stats.airBlocks > 0 && formatPercentage(stats.airBlocks, stats.totalBlocks)}% Air
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${formatPercentage(stats.solidBlocks, stats.totalBlocks)}%` }}
                >
                  {stats.solidBlocks > 0 && formatPercentage(stats.solidBlocks, stats.totalBlocks)}% Solid
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Unknown'}
              </div>
              <div>
                Auto-refreshes every 10 seconds
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg text-gray-500 mb-2">No data available</div>
          <div className="text-sm text-gray-400">
            No blocks have been indexed yet. Go to the Indexing tab to start scanning the world.
          </div>
        </div>
      )}
    </div>
  );
};
