export const theme = {
  colors: {
    // Modern Tech Palette - Inspired by Tesla/SpaceX
    primary: '#00D4FF', // Electric blue
    secondary: '#FF6B35', // Vibrant orange
    accent: '#7C3AED', // Purple
    success: '#10B981', // Emerald green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    
    // Neutral palette
    background: '#0A0A0A', // Deep black
    surface: '#111111', // Dark gray
    card: '#1A1A1A', // Card background
    border: '#2A2A2A', // Subtle borders
    
    // Text colors
    text: '#FFFFFF', // Pure white
    textSecondary: '#A1A1AA', // Muted text
    textMuted: '#71717A', // Very muted text
    textInverse: '#000000', // For light backgrounds
    
    // Glass morphism
    glass: 'rgba(255, 255, 255, 0.05)',
    glassHover: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
    gradientSecondary: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
    gradientAccent: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    gradientBackground: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
    gradientCard: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
    gradientGlass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    gradientText: 'linear-gradient(135deg, #FFFFFF 0%, #00D4FF 50%, #FFFFFF 100%)',
    gradientGlow: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF6B35 100%)',
  },
  
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.4)',
    large: '0 8px 40px rgba(0, 0, 0, 0.5)',
    glow: '0 0 30px rgba(0, 212, 255, 0.3)',
    glowStrong: '0 0 50px rgba(0, 212, 255, 0.5)',
    card: '0 8px 32px rgba(0, 0, 0, 0.4)',
    text: '0 2px 4px rgba(0, 0, 0, 0.3)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  
  borderRadius: {
    none: '0px',
    small: '8px',
    medium: '12px',
    large: '16px',
    xl: '20px',
    round: '50%',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
      hero: '48px',
      mega: '64px',
      display: '80px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
    ultra: '1440px',
  },
  
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  effects: {
    glass: `
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
    glassHover: `
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `,
    glow: `
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
    `,
    glowStrong: `
      box-shadow: 0 0 50px rgba(0, 212, 255, 0.5);
    `,
  },
};