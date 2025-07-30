import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      background: string;
      surface: string;
      card: string;
      border: string;
      text: string;
      textSecondary: string;
      textMuted: string;
      textInverse: string;
      glass: string;
      glassHover: string;
      glassBorder: string;
      gradientPrimary: string;
      gradientSecondary: string;
      gradientAccent: string;
      gradientBackground: string;
      gradientCard: string;
      gradientGlass: string;
      gradientText: string;
      gradientGlow: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      glow: string;
      glowStrong: string;
      card: string;
      text: string;
      glass: string;
    };
    borderRadius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      xl: string;
      round: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
        xxxl: string;
        hero: string;
        mega: string;
        display: string;
      };
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
        black: number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
      ultra: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
      bounce: string;
    };
    effects: {
      glass: string;
      glassHover: string;
      glow: string;
      glowStrong: string;
    };
  }
}