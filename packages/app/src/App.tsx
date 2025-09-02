import { usePlayerStatus } from "./common/usePlayerStatus";
import { useSyncStatus } from "./mud/useSyncStatus";
import { usePlayerPositionQuery } from "./common/usePlayerPositionQuery";
import { useDustClient } from "./common/useDustClient";
import { useCursorPositionQuery } from "./common/useCursorPositionQuery";
import { useBiomeInfo, useBlockAnalysis, useCursorStats, useForcefieldData, usePlayerEnergy } from "./hooks";
import { Toolbar, OreDistribution, ForcefieldPanel, EnergyPanel, HoldingsPanel } from "./components";
import { LAYOUT_CONFIG } from "./config/layout";
import { objectsById } from "@dust/world/internal";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const cursorPosition = useCursorPositionQuery();
  const queryClient = useQueryClient();

  // Panel visibility state
  const [panelVisibility, setPanelVisibility] = useState({
    ore: true,
    forcefield: true,
    energy: true,
    holdings: true
  });

  const togglePanel = (panelName: 'ore' | 'forcefield' | 'energy' | 'holdings') => {
    setPanelVisibility(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  // Invalidate cache on app load to ensure fresh data
  useEffect(() => {
    console.log("App loaded, invalidating React Query cache...");
    
    // Small delay to ensure invalidation happens after initial render
    setTimeout(() => {
      console.log("Executing delayed cache invalidation...");
      queryClient.invalidateQueries({ queryKey: ["dust-client"] });
      queryClient.invalidateQueries({ queryKey: ["player-entity-id"] });
      
      // Also refetch immediately after invalidation
      setTimeout(() => {
        console.log("Refetching after invalidation...");
        queryClient.refetchQueries({ queryKey: ["dust-client"] });
        queryClient.refetchQueries({ queryKey: ["player-entity-id"] });
      }, 100);
    }, 100);
  }, [queryClient]);

  // Refetch queries when app becomes visible (e.g., on page reload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("App became visible, refetching queries...");
        queryClient.refetchQueries({ queryKey: ["dust-client"] });
        queryClient.refetchQueries({ queryKey: ["player-entity-id"] });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [queryClient]);

  // Use custom hooks for better organization and performance
  const { playerBlockType, distanceToCave, distanceToSurface } = useBlockAnalysis(playerPosition);
  const { cursorBlockType } = useCursorStats(cursorPosition);
  // Only call useBiomeInfo when we have valid coordinates
  const { biomeName, oreMultipliers } = useBiomeInfo(
    playerPosition.data?.x, 
    playerPosition.data?.y, 
    playerPosition.data?.z
  );
  const forcefieldData = useForcefieldData(playerPosition);
  const playerEnergy = usePlayerEnergy();

  // All hooks are now working properly


  // The custom hooks handle all the useEffect logic internally
  // No need for manual useEffect calls here anymore
  

  if (!dustClient) {
    const url = `https://alpha.dustproject.org?debug-app=${window.location.origin}/dust-app.json`;
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <a href={url} className="text-center text-blue-500 underline">
          Open this app in DUST
        </a>
      </div>
    );
  }

  if (!syncStatus.isLive || !playerStatus) {
    return (
      <div className="flex flex-col h-screen items-center justify-start pt-4">
        <p className="text-center bg-white px-2 py-1 rounded shadow">
        <span className="block">DUST OS v1.3 - Loading... {syncStatus.percentage.toFixed(2)}%</span>
        <span className="block">Align window to top right corner for optimal experience</span>
          </p>
      </div>
    );
  }






  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: LAYOUT_CONFIG.ALIGNMENT.HORIZONTAL,
      justifyContent: LAYOUT_CONFIG.ALIGNMENT.VERTICAL,
      padding: '0',
      margin: '0',
      position: LAYOUT_CONFIG.ALIGNMENT.POSITION,
      top: 0,
      right: 0,
    }}>
      {/* 3x3 Grid Layout with Adjustable Center Panel */}
      <div style={{
        width: LAYOUT_CONFIG.CONTAINER.WIDTH,
        height: LAYOUT_CONFIG.CONTAINER.HEIGHT,
        display: 'grid',
        gridTemplateColumns: LAYOUT_CONFIG.GRID.COLUMNS,
        gridTemplateRows: LAYOUT_CONFIG.GRID.ROWS,
        gap: '0',
        background: 'transparent',
        borderCollapse: 'collapse',
        justifyItems: 'end', // Align grid items to the right
        gridColumn: '1', // Ensure toolbar spans the left column
      }}>
        
        {/* Top Left - Toolbar */}
        <div style={{
          gridColumn: '1',
          gridRow: '1',
          justifySelf: 'end', // Align toolbar to the right side of its grid cell
          width: 'fit-content', // Allow toolbar to shrink to content
          display: 'flex',
          justifyContent: 'flex-end', // Ensure content aligns to the right
        }}>
          <Toolbar 
            playerPosition={playerPosition.data}
            playerBlockName={playerBlockType != null ? (objectsById as any)[playerBlockType]?.name ?? "Unknown" : "Unknown"}
            distanceToCave={distanceToCave}
            distanceToSurface={distanceToSurface}
            cursorPosition={cursorPosition.data}
            cursorBlockName={cursorBlockType != null ? (objectsById as any)[cursorBlockType]?.name ?? "Unknown" : "Unknown"}
            biomeName={biomeName}
            dustClient={dustClient}
            playerEnergy={playerEnergy}
            onTogglePanel={togglePanel}
            panelVisibility={panelVisibility}
          />
        </div>
        
        {/* Top Center - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff0000',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Top Right - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ff00',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Middle Left - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0000ff',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Middle Center - Debug Panel (Adjustable Size) */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
          margin: '0',
        }}>
        </div>
        
        {/* Middle Right - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff00ff',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Bottom Left - Ore Distribution */}
        {/* Bottom Right - Ore Distribution + Forcefield Panel */}
        <div style={{
          gridColumn: '3',
          gridRow: '3',
          justifySelf: 'start',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'transparent',
          padding: '0',
        }}>
          {/* Ore Distribution Panel */}
          {panelVisibility.ore && (
            <OreDistribution 
              oreMultipliers={oreMultipliers}
            />
          )}
          
          {/* Forcefield Panel */}
          {panelVisibility.forcefield && (
            <ForcefieldPanel 
              forcefieldData={forcefieldData}
              isInsideForcefield={forcefieldData !== null}
            />
          )}

          {/* Energy Panel */}
          {panelVisibility.energy && playerEnergy && (
            <EnergyPanel 
              currentEnergy={playerEnergy.currentEnergy}
              energyCosts={playerEnergy.energyCosts}
            />
          )}

          {/* Holdings Panel */}
          {panelVisibility.holdings && (
            <HoldingsPanel 
              
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ToolbarItem component has been moved to components/ToolbarItem.tsx
