import { useState, useEffect } from 'react';
import { getScaleFactorFromPercent } from '../config/layout';

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
  uiSizePercent?: number;
  position?: { x: number; y: number };
  onPositionChange?: (x: number, y: number) => void;
}

export function OreDistribution({ oreMultipliers, uiSizePercent = 100, position = { x: 0, y: 0 }, onPositionChange }: OreDistributionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate scale factor based on UI size percentage
  const scale = getScaleFactorFromPercent(uiSizePercent);

  // Draggable functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onPositionChange) return;
    // Calculate position relative to the viewport
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onPositionChange(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, onPositionChange]);

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
      minHeight: isExpanded ? '230px' : '60px',
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      zoom: scale,
      cursor: isDragging ? 'grabbing' : 'default',
    }}>
      {/* Grabber Icon */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          cursor: 'grab',
          fontSize: '12px',
          color: 'rgb(174, 255, 208)',
          userSelect: 'none',
          padding: '2px',
          zIndex: 1000,
        }}
      >
        📍
      </div>

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
