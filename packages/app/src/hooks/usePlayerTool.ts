import { useMemo, useState, useEffect } from "react";
import { usePlayerEntityId } from "../common/usePlayerEntityId";
import { encodePlayer } from "@dust/world/internal";
import { objectsById } from "@dust/world/internal";
import { worldAddress } from "../common/worldAddress";
import { selectFrom, fetchRecords } from "@latticexyz/store-sync/internal";
import dustWorldConfig from "@dust/world/mud.config";

export interface PlayerToolData {
  toolName: string;
  massLeft: number;
  slot: number;
  isTool: boolean;
}

export function usePlayerTool(): PlayerToolData | null {
  const { data: playerWalletAddress, isLoading: isWalletLoading } = usePlayerEntityId();
  const [currentSlot, setCurrentSlot] = useState(0);
  const [playerTools, setPlayerTools] = useState<Array<{
    slot: number;
    entityId: string;
    objectType: number;
    mass: number;
  }>>([]);

  // Convert wallet address to player entity ID using encodePlayer
  const playerEntityId = useMemo(() => {
    if (!playerWalletAddress) return null;
    try {
      const entityId = encodePlayer(playerWalletAddress);
      return entityId;
    } catch (error) {
      console.error('usePlayerTool: Error encoding player entity ID:', error);
      return null;
    }
  }, [playerWalletAddress]);

  // Fetch player's tools using SQL API
  useEffect(() => {
    if (!playerEntityId) return;

    const fetchPlayerTools = async () => {
      try {
        // First, get inventory slots for the player
        const inventoryQuery = selectFrom({
          table: dustWorldConfig.tables.InventorySlot,
          where: `"owner" = '${playerEntityId}'`,
        });

        // Execute the query using fetchRecords
        const queryResult = await fetchRecords({
          indexerUrl: "https://indexer.mud.redstonechain.com/q",
          storeAddress: worldAddress,
          queries: [inventoryQuery],
        });

        if (queryResult.result && queryResult.result[0] && queryResult.result[0].records) {
          const inventoryRecords = queryResult.result[0].records;
          
          // Filter for tools and get their mass data
          const tools = [];
          
          for (const record of inventoryRecords) {
            if (record.entityId && record.objectType) {
              // Get the object type and check if it's a tool
              const toolObjectType = Number(record.objectType);
              const toolData = (objectsById as any)[toolObjectType];
              const toolName = toolData?.name || '';
              const isTool = toolName.includes('Pick') || 
                             toolName.includes('Axe') || 
                             toolName.includes('Whacker') ||
                             toolName.includes('Tool') ||
                             toolName.includes('Hammer') ||
                             toolName.includes('Shovel');
              
              if (isTool) {
                // Try to get mass data for this tool
                try {
                  const massQuery = selectFrom({
                    table: dustWorldConfig.tables.Mass,
                    where: `"entityId" = '${record.entityId}'`,
                  });
                  
                  const massResult = await fetchRecords({
                    indexerUrl: "https://indexer.mud.redstonechain.com/q",
                    storeAddress: worldAddress,
                    queries: [massQuery],
                  });
                  
                  const mass = massResult.result && massResult.result[0] && massResult.result[0].records && massResult.result[0].records[0] 
                    ? Number(massResult.result[0].records[0].mass) 
                    : 100; // Fallback mass value
                  
                  tools.push({
                    slot: Number(record.slot),
                    entityId: String(record.entityId),
                    objectType: toolObjectType,
                    mass: mass,
                  });
                } catch (massError) {
                  console.warn('Could not fetch mass for tool:', record.entityId, massError);
                  // Add tool with fallback mass
                  tools.push({
                    slot: Number(record.slot),
                    entityId: String(record.entityId),
                    objectType: toolObjectType,
                    mass: 100,
                  });
                }
              }
            }
          }
          
                 setPlayerTools(tools);
        } else {
          setPlayerTools([]);
        }
        
      } catch (error) {
        console.error('usePlayerTool: Error fetching player tools:', error);
        // Fallback to empty array on error
        setPlayerTools([]);
      }
    };

    fetchPlayerTools();
    
    // Set up periodic refresh every 2 seconds to detect inventory changes
    const interval = setInterval(fetchPlayerTools, 2000);
    
    return () => clearInterval(interval);
  }, [playerEntityId]);

  // Listen for keyboard and mouse events to detect slot switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for number keys 1-9 (inventory slots)
      if (event.key >= '1' && event.key <= '9') {
        const slotNumber = parseInt(event.key) - 1; // Convert to 0-based index
        setCurrentSlot(slotNumber);
      }
      // Check for number key 0 (slot 9, since we use 0-based indexing)
      else if (event.key === '0') {
        setCurrentSlot(9);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      // Prevent default scrolling behavior when using mouse wheel for slot switching
      event.preventDefault();
      
      if (event.deltaY > 0) {
        // Scroll down - go to next slot
        setCurrentSlot(prev => (prev + 1) % 10);
      } else if (event.deltaY < 0) {
        // Scroll up - go to previous slot
        setCurrentSlot(prev => (prev - 1 + 10) % 10);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Get the current tool data
  const toolData = useMemo(() => {
    if (!playerEntityId || playerTools.length === 0) return null;
    
    try {
      // Find the tool in the current slot
      const currentTool = playerTools.find(tool => tool.slot === currentSlot);
      
      if (!currentTool) {
        // If no tool in current slot, try to find the first available tool
        const firstTool = playerTools[0];
        if (firstTool) {
          setCurrentSlot(firstTool.slot);
          return null; // Will re-render with the new slot
        }
        return null;
      }

      // Get tool data from objectsById
      const toolObjectType = currentTool.objectType;
      const toolData = (objectsById as any)[toolObjectType];
      
      // Check if it's a tool by looking for tool-related properties or name patterns
      const toolName = toolData?.name || '';
      const isTool = toolName.includes('Pick') || 
                     toolName.includes('Axe') || 
                     toolName.includes('Whacker') ||
                     toolName.includes('Tool') ||
                     toolName.includes('Hammer') ||
                     toolName.includes('Shovel');
      
      if (!isTool) {
        return {
          toolName: "Not a tool",
          massLeft: 0,
          slot: currentSlot,
          isTool: false
        };
      }

      return {
        toolName: toolName,
        massLeft: currentTool.mass,
        slot: currentSlot,
        isTool: true
      };
    } catch (error) {
      console.error('usePlayerTool: Error getting tool data:', error);
      return null;
    }
  }, [playerTools, currentSlot, playerEntityId]);

  // Don't proceed if wallet is still loading or not available
  if (isWalletLoading || !playerWalletAddress) {
    return null;
  }

  return toolData;
}
