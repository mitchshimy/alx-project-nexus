import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#0070f3',
    secondary: '#1db954',
    background: '#f8f9fa',
    text: '#222',
    card: '#fff',
    border: '#eaeaea',
  },
  spacing: (factor: number) => `${factor * 8}px`,
};

export default theme;