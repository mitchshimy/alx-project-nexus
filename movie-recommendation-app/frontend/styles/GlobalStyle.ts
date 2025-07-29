import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.5;
    min-height: 100vh;
  }

  a:focus-visible, 
  button:focus-visible,
  select:focus-visible,
  input:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyle;