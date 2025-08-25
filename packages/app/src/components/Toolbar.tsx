import { ToolbarItem } from './ToolbarItem';
import { AccountName } from '../common/AccountName';

interface ToolbarProps {
  playerPosition: any;
  playerBlockName: string;
  distanceToCave: number | null;
  distanceToSurface: number | null;
  cursorPosition: any;
  cursorBlockName: string;
  biomeName: string | null;
  dustClient?: any;
}

export function Toolbar({ 
  playerPosition, 
  playerBlockName, 
  distanceToCave, 
  distanceToSurface, 
  cursorPosition, 
  cursorBlockName, 
  biomeName,
  dustClient
}: ToolbarProps) {
  // Toolbar component renders player data

  return (
    <div style={{
      background: 'rgba(6, 51, 19, 0.7)',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
      fontFamily: 'Press Start 2P, monospace',
      imageRendering: 'pixelated',
      borderRadius: '0',
      zIndex: 1000,
      height: 'fit-content',
      minHeight: '110px'
    }}>
      {/* Title Bar Row */}
      <div style={{
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: 18,
        color: '#eee',
        background: '#000',
        paddingLeft: '16px',
        paddingRight: '16px',
        boxSizing: 'border-box',
        letterSpacing: '1px',
        textShadow: '0 1px 2px #013220',
      }}>
        <div>
          {playerPosition && dustClient?.appContext?.userAddress ? (
            <AccountName address={dustClient.appContext.userAddress} />
          ) : (
            <span style={{ fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace', fontSize: 16, color: '#eee' }}>
              Connecting...
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
          fontSize: 16,
          color: '#eee',
          background: 'none',
          letterSpacing: '0.5px',
          fontWeight: 600,
          textShadow: '0 1px 2px #222',
        }}>
          DUST OS v1.1 - The Lorax
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        padding: '6px 0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {playerPosition ? (
          <>
            <ToolbarItem title="Position:" value={`${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}`} />
            <ToolbarItem title="Standing on:" value={playerBlockName} />
            <ToolbarItem title="Depth to Cave:" value={distanceToCave == null ? "Bedrock" : distanceToCave} />
            <ToolbarItem title="Up to Surface" value={distanceToSurface == 2 ? "Here" : distanceToSurface} />
            <ToolbarItem title="Cursor:" value={cursorPosition ? `${cursorPosition.x}, ${cursorPosition.y}, ${cursorPosition.z}` : "-"} />
            <ToolbarItem title="Pointing at:" value={cursorBlockName} />
            <ToolbarItem title="Biome:" value={biomeName || "Loading..."} />
          </>
        ) : (
          <div style={{ color: '#fff', fontSize: 14, padding: '10px' }}>
            Loading player data...
          </div>
        )}
      </div>
    </div>
  );
}
