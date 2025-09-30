import { useState, useEffect } from 'react';
import { getScaleFactorFromPercent } from '../config/layout';

interface CursorPanelProps {
  cursorBlockName: string;
  blockMassData?: {
    blockName: string;
    mass: number;
    objectType: number;
  } | null;
  uiSizePercent?: number;
  position?: { x: number; y: number };
  onPositionChange?: (x: number, y: number) => void;
}

export function CursorPanel({ cursorBlockName, blockMassData, uiSizePercent = 100, position = { x: 0, y: 0 }, onPositionChange }: CursorPanelProps) {
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
      background: 'rgba(6, 51, 19, 0)',
      padding: '1px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      fontFamily: 'Press Start 2P, monospace',
      imageRendering: 'pixelated',
      borderRadius: '0',
      zIndex: 999,
      width: '200px',
      minHeight: '20px',
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
          top: '2px',
          left: '2px',
          cursor: 'grab',
          fontSize: '16px',
          color: 'rgba(174, 255, 208, 0.21)',
          userSelect: 'none',
          padding: '2px',
          zIndex: 1000,
        }}
      >
        💢
      </div>

      <div style={{
        color: '#fff',
        fontSize: 16,
        textAlign: 'left',
        padding: '12px',
        wordBreak: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div>
          {blockMassData ? (
            `${blockMassData.blockName} (${blockMassData.mass.toFixed(1)} kg)`
          ) : (
            cursorBlockName
          )}
        </div>
      </div>
    </div>
  );
}
