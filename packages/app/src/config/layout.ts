// Layout Configuration
// Easy to modify variables for adjusting the center panel and overall layout

export const LAYOUT_CONFIG = {
  
  // Overall container dimensions
  CONTAINER: {
    WIDTH: '1320px',
    HEIGHT: '800px',
  },
  
  // Grid layout
  GRID: {
    COLUMNS: '1fr 30px 1fr',
    ROWS: '110px 40px 1fr',
  },

  // UI Alignment (easily adjustable)
  ALIGNMENT: {
    HORIZONTAL: 'flex-start',    // 'flex-start' = left, 'center' = center, 'flex-end' = right
    VERTICAL: 'flex-start',    // 'flex-start' = top, 'center' = center, 'flex-end' = bottom
    POSITION: 'relative',         // 'fixed' = stays in place, 'relative' = scrolls with page
  },
} as const;

// Helper function to get CSS custom properties
