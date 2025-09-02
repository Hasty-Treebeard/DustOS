// Layout Configuration
// Easy to modify variables for adjusting the center panel and overall layout

export const LAYOUT_CONFIG = {
  
  // Overall container dimensions
  CONTAINER: {
    WIDTH: '1700px',
    HEIGHT: '900px',
  },
  
  // Grid layout
  GRID: {
    COLUMNS: '1470px 30px 1fr',
    ROWS: '110px 50px 1fr',
  },

  // UI Alignment (easily adjustable)
  ALIGNMENT: {
    HORIZONTAL: 'flex-end',    // 'flex-start' = left, 'center' = center, 'flex-end' = right
    VERTICAL: 'flex-start',    // 'flex-start' = top, 'center' = center, 'flex-end' = bottom
    POSITION: 'relative',         // 'fixed' = stays in place, 'relative' = scrolls with page
  },
} as const;

// Helper function to get CSS custom properties
