import { useState } from 'react';

interface OreMultipliers {
  coal: number;
  copper: number;
  iron: number;
  gold: number;
  diamond: number;
  neptunium: number;
}

interface OreDistributionProps {
  oreMultipliers: OreMultipliers | null;
}

export function OreDistribution({ oreMultipliers }: OreDistributionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      background: 'rgba(6, 51, 19, 0.7)',
      padding: '20px 30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
      fontFamily: 'Press Start 2P, monospace',
      imageRendering: 'pixelated',
      borderRadius: '0',
      zIndex: 999,
      width: '200px',
      minHeight: isExpanded ? '200px' : '60px',
      position: 'relative',
    }}>
      {/* Expand/Collapse Button */}
      <button
        onClick={toggleExpanded}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
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
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(174, 255, 208, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(174, 255, 208, 0.2)';
        }}
      >
        {isExpanded ? '-' : '+'}
      </button>

      <div style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: '5px',
        color: 'rgb(174, 255, 208)',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        textShadow: '0 1px 2px #013220',
        alignSelf: 'flex-start',
        width: '100%',
      }}>
        Ore Chance:
      </div>
      
      {isExpanded && oreMultipliers ? (
        <>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Coal:</span> {oreMultipliers.coal}%
          </div>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Copper:</span> {oreMultipliers.copper}%
          </div>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Iron:</span> {oreMultipliers.iron}%
          </div>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Gold:</span> {oreMultipliers.gold}%
          </div>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Diamond:</span> {oreMultipliers.diamond}%
          </div>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Neptunium:</span> {oreMultipliers.neptunium}%
          </div>
        </>
      ) : isExpanded && (
        <div style={{ color: '#fff', fontSize: 14, alignSelf: 'center' }}>No ore data available</div>
      )}
    </div>
  );
}
