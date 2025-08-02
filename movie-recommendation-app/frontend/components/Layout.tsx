import { useState, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';
import React from 'react';
import { getAuthToken } from '@/utils/api';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #0A0A0A 0%, #111111 100%);
  color: #FFFFFF;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  position: relative;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div<{ isSidebarOpen: boolean }>`
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '280px' : '80px')};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 8rem 2rem 3rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  }
  
  @media (max-width: 1024px) {
    padding: 7rem 1.5rem 2rem;
  }
  
  @media (max-width: 768px) {
    padding: 6rem 1rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 8rem 0.5rem 1.5rem;
  }
`;

// Special wrapper for hero sections
const HeroWrapper = styled.div`
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  position: relative;
  z-index: 1;
`;

const Footer = styled.footer`
  background: rgba(10, 10, 10, 0.95);
  color: #FFFFFF;
  padding: 4rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 0.5rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  text-align: left;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #00D4FF;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 1px;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #00D4FF 0%, #0099CC 100%);
      border-radius: 2px;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-weight: 400;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 0.8rem;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateX(5px);
      }
      
      @media (max-width: 480px) {
        margin-bottom: 0.6rem;
      }

      a {
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        font-weight: 500;

        &::before {
          content: '→';
          color: #00D4FF;
          margin-right: 8px;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &:hover {
          color: #00D4FF;

          &::before {
            opacity: 1;
            margin-right: 12px;
          }
        }
        
        @media (max-width: 480px) {
          justify-content: center;
          font-size: 0.85rem;
        }
      }
    }
  }
`;

const Copyright = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  font-weight: 400;
  
  @media (max-width: 480px) {
    margin-top: 2rem;
    padding-top: 1.5rem;
    font-size: 0.8rem;
  }
`;

// Performance-optimized floating particles - only show on desktop and if user hasn't disabled animations
const FloatingParticles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  display: none; // Hidden by default for performance

  @media (min-width: 1024px) {
    display: block; // Only show on desktop
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.02) 0%, transparent 70%);
    animation: rotate 120s linear infinite;

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.02) 0%, transparent 70%);
    animation: rotate 180s linear infinite reverse;

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
`;

// Simplified gradient overlay for better performance
const GradientOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.02) 0%, transparent 50%);
`;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle authentication state changes
  useEffect(() => {
    // Check initial auth state
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    // Listen for auth state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      const { isAuthenticated: authState, reason } = event.detail || {};
      setIsAuthenticated(authState);
      
      // If token expired, we might want to redirect to login
      if (reason === 'token_expired') {
        console.log('Token expired, user should be redirected to login');
        // You can add redirect logic here if needed
      }
    };

    // Add event listener
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isSidebarOpen } as any);
    }
    return child;
  });

  return (
    <>
      <Head>
        <title>SHIMY | Modern Movie Discovery</title>
        <meta name="description" content="Discover the best movies in a sleek, modern interface." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <LayoutWrapper>
        {/* Only show particles if user doesn't prefer reduced motion */}
        {!prefersReducedMotion && <FloatingParticles />}
        <GradientOverlay />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        <ContentWrapper isSidebarOpen={isSidebarOpen}>
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <MainContent>{childrenWithProps}</MainContent>
          <Footer>
            <FooterContent>
              <FooterSection>
                <h3>SHIMY</h3>
                <p>
                  Your gateway to the world of cinema. Discover, explore, and enjoy the finest films in stunning
                  quality with our modern, intuitive interface.
                </p>
              </FooterSection>
              <FooterSection>
                <h3>Explore</h3>
                <ul>
                  <li><a href="/trending">Trending</a></li>
                  <li><a href="/discover">Discover</a></li>
                  <li><a href="/upcoming">Upcoming</a></li>
                  <li><a href="/top-imdb">Top Rated</a></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>Account</h3>
                <ul>
                  <li><a href="/profile">Profile</a></li>
                  <li><a href="/favorites">Favorites</a></li>
                  <li><a href="/watchlist">Watchlist</a></li>
                  <li><a href="/settings">Settings</a></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>Support</h3>
                <ul>
                  <li><a href="/contact">Contact</a></li>
                  <li><a href="/help">Help Center</a></li>
                  <li><a href="/feedback">Feedback</a></li>
                </ul>
              </FooterSection>
            </FooterContent>
            <Copyright>
              © {new Date().getFullYear()} SHIMY. All movie data provided by TMDB.
            </Copyright>
          </Footer>
        </ContentWrapper>
      </LayoutWrapper>
    </>
  );
}
