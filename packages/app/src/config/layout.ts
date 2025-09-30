// Layout Configuration
// Easy to modify variables for adjusting the center panel and overall layout

export const LAYOUT_CONFIG = {
  
  // Overall container dimensions
  CONTAINER: {
    WIDTH: '1500px',
    HEIGHT: '800px',
  },
  

  // UI Alignment (easily adjustable)
  ALIGNMENT: {
    HORIZONTAL: 'flex-end',    // 'flex-start' = left, 'center' = center, 'flex-end' = right
    VERTICAL: 'flex-start',    // 'flex-start' = top, 'center' = center, 'flex-end' = bottom
    POSITION: 'relative',         // 'fixed' = stays in place, 'relative' = scrolls with page
  },

  // UI Scale Configuration
  SCALE: {
    LARGE: 1.0,    // Full size
    SMALL: 0.85,    // 80% size (20% reduction)
  },
} as const;

// Helper function to get scale factor from percentage
export const getScaleFactorFromPercent = (percent: number): number => {
  return percent / 100;
};
