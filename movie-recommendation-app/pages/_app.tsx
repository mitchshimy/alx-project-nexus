import { useState } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import SplashScreen from '@/components/SplashScreen';
import theme from '@/styles/theme'; // make sure this path is correct

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f5f5f5;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashDone = () => {
    setShowSplash(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {showSplash ? (
        <SplashScreen onDone={handleSplashDone} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </ThemeProvider>
  );
}
