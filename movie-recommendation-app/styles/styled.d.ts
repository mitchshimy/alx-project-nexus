import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      card: string;
      border: string;
    };
    spacing: (factor: number) => string;
  }
}