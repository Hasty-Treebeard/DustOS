import { usePlayerStatus } from "./common/usePlayerStatus";
import { usePlayerPositionQuery } from "./common/usePlayerPositionQuery";
import { useDustClient } from "./common/useDustClient";
import { useCursorPositionQuery } from "./common/useCursorPositionQuery";
import { useBiomeInfo, useBlockAnalysis, useBlockMass, useCursorStats, useForcefieldData, usePlayerEnergy } from "./hooks";
import { Toolbar, OreDistribution, ForcefieldPanel, EnergyPanel, HoldingsPanel, CursorPanel } from "./components";
import { LAYOUT_CONFIG } from "./config/layout";
import { objectsById } from "@dust/world/internal";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const { data: dustClient } = useDustClient();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const cursorPosition = useCursorPositionQuery();
  const queryClient = useQueryClient();

  
  // Panel visibility state
  const [panelVisibility, setPanelVisibility] = useState({
    ore: true,
    forcefield: true,
    energy: true,
    holdings: true,
    cursor: true,
  });

  // UI size state (percentage from 50% to 150%)
  const [uiSizePercent, setUiSizePercent] = useState<number>(100);

  // Draggable positions state
  const [positions, setPositions] = useState({
    toolbar: { x: 10, y: 10 }, // Top left
    ore: { x: 10, y: 130 }, // Below toolbar, left
    forcefield: { x: 220, y: 130 }, // Below toolbar, second from left
    energy: { x: 430, y: 130 }, // Below toolbar, third from left
    holdings: { x: 640, y: 130 }, // Below toolbar, fourth from left
    cursor: { x: 850, y: 130 }, // Below toolbar, rightmost
  });

    // Calculate scaled gap for panels
  const scale = uiSizePercent / 100;
  const scaledGap = `${10 * scale}px`;

  // Calculate scaled container dimensions
  const scaledContainerWidth = `${1500 * scale}px`;
  const scaledContainerHeight = `${800 * scale}px`;

  const togglePanel = (panelName: 'ore' | 'forcefield' | 'energy' | 'holdings' | 'cursor') => {
    setPanelVisibility(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const incrementUiSize = () => {
    setUiSizePercent(prev => Math.min(150, prev + 5));
  };

  const decrementUiSize = () => {
    setUiSizePercent(prev => Math.max(50, prev - 5));
  };

  const updatePosition = (component: keyof typeof positions, x: number, y: number) => {
    setPositions(prev => ({
      ...prev,
      [component]: { x, y }
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
  const blockMassData = useBlockMass(cursorBlockType);

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
      {/* Main Container */}
            <div style={{
        width: scaledContainerWidth,
        height: scaledContainerHeight,
        position: 'relative',
        background: 'transparent',
        overflow: 'visible',
      }}>
        
        {/* Toolbar */}
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
          uiSizePercent={uiSizePercent}
          onIncrementUiSize={incrementUiSize}
          onDecrementUiSize={decrementUiSize}
          position={positions.toolbar}
          onPositionChange={(x, y) => updatePosition('toolbar', x, y)}
        />
        
        {/* Panels */}
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: scaledGap,
          background: 'transparent',
          padding: '0',
          minHeight: 'fit-content',
          overflow: 'visible',
        }}>
          {/* Ore Distribution Panel */}
          {panelVisibility.ore && (
            <OreDistribution 
              oreMultipliers={oreMultipliers}
              uiSizePercent={uiSizePercent}
              position={positions.ore}
              onPositionChange={(x, y) => updatePosition('ore', x, y)}
            />
          )}
          
          {/* Forcefield Panel */}
          {panelVisibility.forcefield && (
            <ForcefieldPanel 
              forcefieldData={forcefieldData}
              isInsideForcefield={forcefieldData !== null}
              uiSizePercent={uiSizePercent}
              position={positions.forcefield}
              onPositionChange={(x, y) => updatePosition('forcefield', x, y)}
            />
          )}

          {/* Energy Panel */}
          {panelVisibility.energy && playerEnergy && (
            <EnergyPanel 
              currentEnergy={playerEnergy.currentEnergy}
              energyCosts={playerEnergy.energyCosts}
              uiSizePercent={uiSizePercent}
              position={positions.energy}
              onPositionChange={(x, y) => updatePosition('energy', x, y)}
            />
          )}

          {/* Holdings Panel */}
          {panelVisibility.holdings && (
            <HoldingsPanel 
              uiSizePercent={uiSizePercent}
              position={positions.holdings}
              onPositionChange={(x, y) => updatePosition('holdings', x, y)}
            />
          )}

          {/* Cursor Panel */}
          {panelVisibility.cursor && (
            <CursorPanel 
              cursorBlockName={cursorBlockType != null ? (objectsById as any)[cursorBlockType]?.name ?? "Unknown" : "Unknown"}
              blockMassData={blockMassData}
              uiSizePercent={uiSizePercent}
              position={positions.cursor}
              onPositionChange={(x, y) => updatePosition('cursor', x, y)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ToolbarItem component has been moved to components/ToolbarItem.tsx
