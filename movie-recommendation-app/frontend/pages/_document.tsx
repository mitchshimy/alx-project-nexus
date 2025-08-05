import Document, { DocumentContext, DocumentInitialProps, Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to external domains for faster loading */}
          <link rel="preconnect" href="https://shimy.pythonanywhere.com" />
          <link rel="preconnect" href="https://image.tmdb.org" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Handle MetaMask connection attempts gracefully
                if (typeof window !== 'undefined' && window.ethereum) {
                  // Prevent MetaMask from auto-connecting
                  window.ethereum.autoRefreshOnNetworkChange = false;
                  
                  // Handle connection requests
                  window.ethereum.on('connect', () => {
                    console.log('MetaMask connected (but not used in this app)');
                  });
                  
                  window.ethereum.on('disconnect', () => {
                    console.log('MetaMask disconnected');
                  });
                }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
} 