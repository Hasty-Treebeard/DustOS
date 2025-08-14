import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WorldModule } from './world';
import { MapDatabase } from './browserDatabase';
import { IndexingService } from './indexingService';
import { IndexingPage } from './components/IndexingPage';
import { MapCanvas } from './components/MapCanvas';
import { AnalyticsPage } from './components/AnalyticsPage';

interface TotalBlocksCounterProps {
  database: MapDatabase;
}

const TotalBlocksCounter: React.FC<TotalBlocksCounterProps> = ({ database }) => {
  const [totalBlocks, setTotalBlocks] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await database.getTotalBlocks();
        setTotalBlocks(count);
      } catch (error) {
        console.error('Failed to get total blocks:', error);
      }
    };

    updateCount();
    
    // Update every 5 seconds
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, [database]);

  return (
    <div className="text-sm text-gray-600">
      Total indexed: {totalBlocks}
    </div>
  );
};

enum Page {
  INDEXING = 'indexing',
  MAP = 'map',
  ANALYTICS = 'analytics',
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.INDEXING);
  const [services, setServices] = useState<{
    world: WorldModule;
    database: MapDatabase;
    indexing: IndexingService;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsConnecting(true);
      setError('');

      // Initialize database first
      const database = new MapDatabase();
      // Wait for database to initialize properly
      await database.waitForInit();
      console.log('Database initialized successfully');
      
      // Test database functionality
      const initialCount = await database.getTotalBlocks();
      console.log(`Initial database count: ${initialCount}`);

      // Connect to the real Dust world contract on Redstone Chain
      const provider = new ethers.JsonRpcProvider('https://rpc.redstonechain.com');
      
      // Dust world contract on Redstone Chain
      const worldContract = new ethers.Contract(
        '0x253eb85B3C953bFE3827CC14a151262482E7189C',
        [
          'function getRecord(bytes32 table, bytes32[] keys) view returns (bytes staticData, bytes dynamicData)'
        ],
        provider
      );

      const world = new WorldModule(provider, worldContract);
      const indexing = new IndexingService(world, database);

      setServices({ world, database, indexing });
    } catch (err) {
      console.error('Failed to initialize services:', err);
      setError(`Failed to initialize: ${err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Initializing Dust World Map</div>
          <div className="text-gray-600">Connecting to services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xl font-semibold mb-2 text-red-600">Connection Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={initializeServices}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <div className="mt-4 text-sm text-gray-500">
            Make sure you have internet access to connect to Redstone Chain.
          </div>
        </div>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Dust World Map</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentPage(Page.INDEXING)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === Page.INDEXING
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Indexing
                </button>
                <button
                  onClick={() => setCurrentPage(Page.MAP)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === Page.MAP
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setCurrentPage(Page.ANALYTICS)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === Page.ANALYTICS
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <TotalBlocksCounter database={services.database} />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {currentPage === Page.INDEXING ? (
          <IndexingPage indexingService={services.indexing} />
        ) : currentPage === Page.ANALYTICS ? (
          <AnalyticsPage database={services.database} />
        ) : (
          <div className="h-screen pt-16">
            <MapCanvas 
              database={services.database} 
              width={window.innerWidth} 
              height={window.innerHeight - 64} // Account for nav bar
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
