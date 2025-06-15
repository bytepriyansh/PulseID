import { Font } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { 
      src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal'
    }
  ]
});

// Font sizes
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 24,
  '3xl': 28,
};

// Colors
export const COLORS = {
  primary: '#1e293b',
  secondary: '#475569',
  muted: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  white: '#ffffff',
  danger: {
    text: '#991b1b',
    bg: '#fee2e2',
  },
  info: {
    text: '#1e40af',
    bg: '#dbeafe',
  },
};

// Spacing
export const SPACING = {
  1: '4pt',
  2: '8pt',
  3: '12pt',
  4: '16pt',
  5: '20pt',
  6: '24pt',
  8: '32pt',
  margin: '15mm',
};

// Common styles
export const COMMON_STYLES = {
  minPresenceAhead: 100,
};
