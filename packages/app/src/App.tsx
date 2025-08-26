import { usePlayerStatus } from "./common/usePlayerStatus";
import { useSyncStatus } from "./mud/useSyncStatus";
import { usePlayerPositionQuery } from "./common/usePlayerPositionQuery";
import { useDustClient } from "./common/useDustClient";
import { useCursorPositionQuery } from "./common/useCursorPositionQuery";
import { useBiomeInfo, useBlockAnalysis, useCursorStats, useForcefieldData } from "./hooks";
import { Toolbar, OreDistribution, ForcefieldPanel } from "./components";
import { LAYOUT_CONFIG } from "./config/layout";
import { objectsById } from "@dust/world/internal";

export default function App() {
  const { data: dustClient } = useDustClient();
  const syncStatus = useSyncStatus();
  const playerStatus = usePlayerStatus();
  const playerPosition = usePlayerPositionQuery();
  const cursorPosition = useCursorPositionQuery();

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
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-center bg-white px-2 py-1 rounded shadow">
        <span className="block">DUST OS v1.2 - Loading... {syncStatus.percentage.toFixed(2)}%</span>
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
        outline: '1px solid red',
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
        
        {/* Bottom Left - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffff',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Bottom Center - Debug Panel */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#808080',
          fontSize: '12px',
          fontFamily: 'monospace',
          padding: '0',
        }}>
        </div>
        
        {/* Bottom Right - Ore Multipliers + Forcefield Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'transparent',
          padding: '0',
        }}>
          <div style={{
            color: '#800080',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'center',
            marginBottom: '10px',
          }}>
          </div>
          <OreDistribution oreMultipliers={oreMultipliers} />
          <ForcefieldPanel 
            forcefieldData={forcefieldData}
            isInsideForcefield={forcefieldData !== null}
          />
        </div>
      </div>
    </div>
  );
}

// ToolbarItem component has been moved to components/ToolbarItem.tsx
