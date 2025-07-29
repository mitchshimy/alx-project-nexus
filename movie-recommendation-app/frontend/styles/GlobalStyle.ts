import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    color: #f0f0f0;
    overflow-x: hidden;
  }

  /* Mobile-first responsive design */
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    html {
      font-size: 15px;
    }
  }

  @media (min-width: 1024px) {
    html {
      font-size: 16px;
    }
  }

  /* Touch-friendly interactions */
  @media (hover: none) and (pointer: coarse) {
    button, a, [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Improved scrolling on mobile */
  @media (max-width: 768px) {
    body {
      -webkit-overflow-scrolling: touch;
    }
  }

  /* Prevent zoom on input focus on iOS */
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    select,
    textarea,
    input {
      font-size: 16px;
    }
  }

  /* Smooth transitions for all interactive elements */
  * {
    transition: all 0.2s ease;
  }

  /* Focus styles for accessibility */
  button:focus,
  input:focus,
  select:focus,
  textarea:focus,
  a:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Loading states */
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }

  /* Responsive images */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.7);
  }

  /* Mobile-specific optimizations */
  @media (max-width: 768px) {
    /* Reduce motion for better performance */
    * {
      transition: none;
    }
    
    /* Optimize for touch */
    button, a {
      touch-action: manipulation;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: #000 !important;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Print styles */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

export default GlobalStyle;