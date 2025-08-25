# Layout Configuration Guide

## 🎯 **Easy Layout Adjustments**

The app now uses a **3x3 grid layout** with easily adjustable center panel dimensions. You can modify the layout by editing just one file!

## 📁 **Configuration File**

Edit `src/config/layout.ts` to adjust the layout:

```typescript
export const LAYOUT_CONFIG = {
  // Center panel dimensions (easily adjustable)
  CENTER_PANEL: {
    WIDTH: '400px',    // ← Change this to adjust center panel width
    HEIGHT: '300px',   // ← Change this to adjust center panel height
  },
  
  // Overall container dimensions
  CONTAINER: {
    WIDTH: '1100px',   // ← Change this to adjust overall width
    HEIGHT: '500px',   // ← Change this to adjust overall height
  },
  
  // Grid layout (usually keep as 3x3)
  GRID: {
    COLUMNS: '1fr 1fr 1fr',  // 3 equal columns
    ROWS: '1fr 1fr 1fr',     // 3 equal rows
  },

  // UI Alignment (easily adjustable)
  ALIGNMENT: {
    HORIZONTAL: 'flex-end',    // ← 'flex-start' = left, 'center' = center, 'flex-end' = right
    VERTICAL: 'flex-start',    // ← 'flex-start' = top, 'center' = center, 'flex-end' = bottom
    POSITION: 'fixed',         // ← 'fixed' = stays in place, 'relative' = scrolls with page
  },
} as const;
```

## 🔧 **Quick Adjustments**

### **Make Center Panel Larger**
```typescript
CENTER_PANEL: {
  WIDTH: '500px',   // Increased from 400px
  HEIGHT: '400px',  // Increased from 300px
}
```

### **Make Center Panel Smaller**
```typescript
CENTER_PANEL: {
  WIDTH: '300px',   // Decreased from 400px
  HEIGHT: '200px',  // Decreased from 300px
}
```

### **Change Overall Size**
```typescript
CONTAINER: {
  WIDTH: '1200px',  // Increased from 1100px
  HEIGHT: '600px',  // Increased from 500px
}
```

### **Change UI Alignment**
```typescript
// Top-Right Corner (current)
ALIGNMENT: {
  HORIZONTAL: 'flex-end',    // Right side
  VERTICAL: 'flex-start',    // Top
  POSITION: 'fixed',         // Stays in place
}

// Top-Left Corner
ALIGNMENT: {
  HORIZONTAL: 'flex-start',  // Left side
  VERTICAL: 'flex-start',    // Top
  POSITION: 'fixed',
}

// Center of Screen
ALIGNMENT: {
  HORIZONTAL: 'center',      // Center horizontally
  VERTICAL: 'center',        // Center vertically
  POSITION: 'fixed',
}

// Bottom-Right Corner
ALIGNMENT: {
  HORIZONTAL: 'flex-end',    // Right side
  VERTICAL: 'flex-end',      // Bottom
  POSITION: 'fixed',
}
```

## 🎨 **Layout Structure**

```
┌─────────────┬─────────────┬─────────────┐
│   Toolbar   │ Transparent │ Transparent │ ← Row 1
│  (Top Left) │             │             │
│ ┌─────────┐ │             │             │
│ │Title Bar│ │             │             │
│ ├─────────┤ │             │             │
│ │ Stats   │ │             │             │
│ └─────────┘ │             │             │
├─────────────┼─────────────┼─────────────┤
│ Transparent │   Center    │ Transparent │ ← Row 2
│             │   Panel     │             │
│             │(Adjustable) │             │
├─────────────┼─────────────┼─────────────┤
│ Transparent │ Transparent │┌───────────┐│ ← Row 3
│             │             ││Ore Panel  ││(Bottom Rt)
│             │             │├───────────┤│
│             │             ││Forcefield ││
│             │             ││  Panel    ││
│             │             │└───────────┘│
└─────────────┴─────────────┴─────────────┘
```

**Note**: The Toolbar now includes both the title bar and stats in one integrated panel. The bottom-right grid cell contains both the Ore Distribution and Forcefield panels stacked vertically.

## 🚀 **Benefits**

1. **Easy to Modify**: Change dimensions in one place
2. **Responsive**: Center panel automatically centers itself
3. **Clean Code**: No hardcoded values in components
4. **Flexible**: Easy to experiment with different sizes

## 💡 **Pro Tips**

- **Width**: Use `px` for fixed sizes, `%` for responsive
- **Height**: Consider the overall container height when adjusting
- **Testing**: Try different values to find the perfect balance
- **Grid**: The 3x3 grid ensures consistent spacing

## 🔄 **After Making Changes**

1. Save the `layout.ts` file
2. The app will automatically rebuild
3. Refresh your browser to see the changes

**That's it! No need to touch any other files.** 🎯
