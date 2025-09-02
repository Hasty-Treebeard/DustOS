import { useState } from 'react';
import { ToolbarItem } from './ToolbarItem';
import { AccountName } from '../common/AccountName';
import type { PlayerEnergyData } from '../hooks/usePlayerEnergy';



interface ToolbarProps {
  playerPosition?: { x: number; y: number; z: number } | null;
  playerBlockName?: string | null;
  distanceToCave?: number | null;
  distanceToSurface?: number | null;
  cursorPosition?: { x: number; y: number; z: number } | null;
  cursorBlockName?: string | null;
  biomeName?: string | null;
  dustClient?: any;
  playerEnergy: PlayerEnergyData | null;
  onTogglePanel?: (panelName: 'ore' | 'forcefield' | 'energy' | 'holdings') => void;
  panelVisibility?: { ore: boolean; forcefield: boolean; energy: boolean; holdings: boolean };
}

export function Toolbar({ 
  playerPosition, 
  playerBlockName, 
  distanceToCave, 
  distanceToSurface, 
  cursorPosition, 
  cursorBlockName, 
  biomeName,
  dustClient,
  playerEnergy,
  onTogglePanel,
  panelVisibility
}: ToolbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleStats, setVisibleStats] = useState({
    position: true,
    standingOn: true,
    depthToCave: true,
    upToSurface: true,
    cursor: true,
    pointingAt: true,
    biome: true,
    energy: true,
  });

  const toggleStat = (statKey: keyof typeof visibleStats) => {
    setVisibleStats(prev => ({
      ...prev,
      [statKey]: !prev[statKey]
    }));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toolbar component renders player data

  return (
    <div style={{
      background: 'rgba(6, 51, 19, 0.7)',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
      fontFamily: 'Press Start 2P, monospace',
      borderRadius: '0',
      zIndex: 1000,
      height: 'fit-content',
      minHeight: '110px',
      position: 'relative',
      width: 'fit-content', // Allow toolbar to shrink to content
      alignSelf: 'flex-end', // Ensure toolbar aligns to the right
      marginLeft: 'auto', // Push toolbar to the right side
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
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
            fontSize: 16,
            color: '#eee',
            background: 'none',
            letterSpacing: '0.5px',
            fontWeight: 600,
            textShadow: '0 1px 2px #222',
          }}>
            DUST OS v1.3 - The Lorax
          </div>
          
          {/* Stats Menu Button */}
          <button
            onClick={toggleMenu}
            style={{
              background: 'rgba(174, 255, 208, 0.2)',
              border: '1px solid rgb(174, 255, 208)',
              color: 'rgb(174, 255, 208)',
              width: '20px',
              height: '20px',
              borderRadius: '2px',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(174, 255, 208, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(174, 255, 208, 0.2)';
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Stats Visibility Dropdown Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '16px',
          background: 'rgba(6, 51, 19, 0.95)',
          border: '1px solid rgb(174, 255, 208)',
          borderRadius: '4px',
          padding: '12px',
          zIndex: 1002,
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgb(174, 255, 208)',
            marginBottom: '8px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(174, 255, 208, 0.3)',
            paddingBottom: '4px',
          }}>
            Stats Visibility
          </div>
          
          {Object.entries({
            position: 'Position',
            standingOn: 'Standing on',
            depthToCave: 'Depth to Cave',
            upToSurface: 'Up to Surface',
            cursor: 'Cursor',
            pointingAt: 'Pointing at',
            biome: 'Biome',
            energy: 'Energy',
          }).map(([key, label]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              marginBottom: '6px',
            }}>
              <span style={{
                color: '#fff',
                fontSize: 12,
                fontFamily: 'monospace',
              }}>
                {label}
              </span>
              <button
                onClick={() => toggleStat(key as keyof typeof visibleStats)}
                style={{
                  background: visibleStats[key as keyof typeof visibleStats] 
                    ? 'rgba(174, 255, 208, 0.3)' 
                    : 'rgba(255, 100, 100, 0.3)',
                  border: `1px solid ${visibleStats[key as keyof typeof visibleStats] 
                    ? 'rgb(174, 255, 208)' 
                    : 'rgb(255, 100, 100)'}`,
                  color: visibleStats[key as keyof typeof visibleStats] 
                    ? 'rgb(174, 255, 208)' 
                    : 'rgb(255, 100, 100)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = visibleStats[key as keyof typeof visibleStats]
                    ? 'rgba(174, 255, 208, 0.4)'
                    : 'rgba(255, 100, 100, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = visibleStats[key as keyof typeof visibleStats]
                    ? 'rgba(174, 255, 208, 0.3)'
                    : 'rgba(255, 100, 100, 0.3)';
                }}
              >
                {visibleStats[key as keyof typeof visibleStats] ? '👁️' : '🚫'}
              </button>
            </div>
          ))}
          
          {/* Panel Controls */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            marginTop: '8px',
            paddingTop: '8px',
          }}>
            <div style={{
              color: '#fff',
              fontSize: 11,
              fontFamily: 'monospace',
              marginBottom: '6px',
              opacity: 0.8,
            }}>
              Panels
            </div>
            {Object.entries({
              ore: 'Ore Distribution',
              forcefield: 'Forcefield',
              energy: 'Energy Stats',
              holdings: 'Holdings',
            }).map(([key, label]) => (
                             <div key={key} style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 padding: '4px 8px',
                 marginBottom: '6px',
               }}>
                <span style={{
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}>
                  {label}
                </span>
                <button
                  onClick={() => onTogglePanel?.(key as 'ore' | 'forcefield')}
                  style={{
                    background: panelVisibility?.[key as keyof typeof panelVisibility] 
                      ? 'rgba(174, 255, 208, 0.3)' 
                      : 'rgba(255, 100, 100, 0.3)',
                    border: `1px solid ${panelVisibility?.[key as keyof typeof panelVisibility] 
                      ? 'rgb(174, 255, 208)' 
                      : 'rgb(255, 100, 100)'}`,
                    color: panelVisibility?.[key as keyof typeof panelVisibility] 
                      ? 'rgb(174, 255, 208)' 
                      : 'rgb(255, 100, 100)',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = panelVisibility?.[key as keyof typeof panelVisibility]
                      ? 'rgba(174, 255, 208, 0.4)'
                      : 'rgba(255, 100, 100, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = panelVisibility?.[key as keyof typeof panelVisibility]
                      ? 'rgba(174, 255, 208, 0.3)'
                      : 'rgba(255, 100, 100, 0.3)';
                  }}
                >
                  {panelVisibility?.[key as keyof typeof panelVisibility] ? '👁️' : '🚫'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        overflow: 'hidden',
      }}>
        {playerPosition ? (
          <>
            {visibleStats.position && (
              <ToolbarItem title="Position:" value={`${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}`} />
            )}
            {visibleStats.standingOn && (
              <ToolbarItem title="Standing on:" value={playerBlockName} />
            )}
            {visibleStats.depthToCave && (
              <ToolbarItem title="Depth to Cave:" value={distanceToCave == null ? "Bedrock" : distanceToCave} />
            )}
            {visibleStats.upToSurface && (
              <ToolbarItem title="Up to Surface" value={distanceToSurface == 2 ? "Here" : distanceToSurface} />
            )}
            {visibleStats.cursor && (
              <ToolbarItem title="Cursor:" value={cursorPosition ? `${cursorPosition.x}, ${cursorPosition.y}, ${cursorPosition.z}` : "-"} />
            )}
            {visibleStats.pointingAt && (
              <ToolbarItem title="Pointing at:" value={cursorBlockName} />
            )}
            {visibleStats.biome && (
              <ToolbarItem title="Biome:" value={biomeName || "Loading..."} />
            )}
            {visibleStats.energy && (
              <ToolbarItem 
                title="Energy:"
                value={`${playerEnergy ? `${playerEnergy.energyPercentage.toFixed(1)}% | ${playerEnergy.formattedEnergy}` : "Loading..."}`}
              />
            )}
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
