import { useState } from 'react';

interface HoldingsPanelProps {
  
}

export function HoldingsPanel({}: HoldingsPanelProps) {
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
        Holdings:
      </div>
      
      {isExpanded && (
        <>
          <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
            Player wallet coming soon
          </div>
        </>
      )}
    </div>
  );
}
