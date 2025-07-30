import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background: #0A0A0A;
    color: #FFFFFF;
    line-height: 1.6;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #__next {
    min-height: 100vh;
  }

  /* Modern scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.5);
  }

  /* Selection styles */
  ::selection {
    background: rgba(0, 212, 255, 0.3);
    color: #FFFFFF;
  }

  ::-moz-selection {
    background: rgba(0, 212, 255, 0.3);
    color: #FFFFFF;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid rgba(0, 212, 255, 0.5);
    outline-offset: 2px;
  }

  /* Button and input resets */
  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  input, textarea, select {
    font-family: inherit;
    border: none;
    outline: none;
    background: none;
  }

  /* Link styles */
  a {
    color: inherit;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Image styles */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  /* List styles */
  ul, ol {
    list-style: none;
  }

  /* Table styles */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Form styles */
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  legend {
    padding: 0;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation keyframes */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
    }
  }

  /* Responsive utilities */
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }
  }

  /* Glass morphism utility */
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Gradient text utility */
  .gradient-text {
    background: linear-gradient(135deg, #FFFFFF 0%, #00D4FF 50%, #FFFFFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Loading animation */
  .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 212, 255, 0.3);
    border-radius: 50%;
    border-top-color: #00D4FF;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default GlobalStyle;