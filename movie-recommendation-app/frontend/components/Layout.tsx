import { useState, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from './Header';
import { t, tWithParams } from '@/utils/translations';
import React from 'react';
import { getAuthToken } from '@/utils/api';

// Dynamically import Sidebar to reduce initial bundle size
const Sidebar = dynamic(() => import('./Sidebar'), {
  ssr: false,
  loading: () => <div style={{ width: '280px', background: '#0A0A0A' }} />
});

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
  
  @media (min-width: 1920px) {
    margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '320px' : '100px')};
  }
  
  @media (min-width: 2560px) {
    margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '400px' : '120px')};
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
  
  @media (min-width: 1920px) {
    max-width: 1600px;
    padding: 10rem 3rem 4rem;
  }
  
  @media (min-width: 2560px) {
    max-width: 1800px;
    padding: 12rem 4rem 5rem;
  }
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

  const [footerContent, setFooterContent] = useState({
    description: '',
    explore: '',
    account: '',
    support: '',
    copyright: ''
  });
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Update footer content based on current language
  const updateFooterContent = () => {
    setFooterContent({
      description: t('footer.description'),
      explore: t('footer.explore'),
      account: t('footer.account'),
      support: t('footer.support'),
      copyright: tWithParams('footer.copyright', { year: new Date().getFullYear() })
    });
  };

  // Handle authentication state changes
  useEffect(() => {
    // Listen for auth state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      const { reason } = event.detail || {};
      
      // If token expired, we might want to redirect to login
      if (reason === 'token_expired') {
        // You can add redirect logic here if needed
      }
    };

    // Listen for language changes
    const handleLanguageChange = () => {
      updateFooterContent();
    };

    // Add event listeners
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    window.addEventListener('languageChanged', handleLanguageChange);

    // Initialize footer content
    updateFooterContent();

    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      window.removeEventListener('languageChanged', handleLanguageChange);
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
                  {footerContent.description}
                </p>
              </FooterSection>
              <FooterSection>
                <h3>{footerContent.explore}</h3>
                <ul>
                  <li><Link href="/trending">{t('nav.trending')}</Link></li>
                  <li><Link href="/discover">{t('nav.discover')}</Link></li>
                  <li><Link href="/upcoming">{t('footer.upcoming')}</Link></li>
                  <li><Link href="/top-imdb">{t('nav.topRated')}</Link></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>{footerContent.account}</h3>
                <ul>
                  <li><Link href="/profile">{t('nav.profile')}</Link></li>
                  <li><Link href="/favorites">{t('nav.favorites')}</Link></li>
                  <li><Link href="/watchlist">{t('nav.watchlist')}</Link></li>
                  <li><Link href="/settings">{t('nav.settings')}</Link></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>{footerContent.support}</h3>
                <ul>
                  <li><Link href="/contact">{t('footer.contact')}</Link></li>
                  <li><Link href="/help">{t('footer.help')}</Link></li>
                  <li><Link href="/feedback">{t('footer.feedback')}</Link></li>
                </ul>
              </FooterSection>
            </FooterContent>
            <Copyright>
              {footerContent.copyright}
            </Copyright>
          </Footer>
        </ContentWrapper>
      </LayoutWrapper>
    </>
  );
}
