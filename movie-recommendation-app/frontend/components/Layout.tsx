import { useState, ReactNode } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  color: #f0f0f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const SidebarWrapper = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 999;
  transition: all 0.3s ease;
  width: ${({ isOpen }) => (isOpen ? '220px' : '70px')};
  
  @media (max-width: 768px) {
    width: ${({ isOpen }) => (isOpen ? '100%' : '0')};
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  }
  
  @media (max-width: 480px) {
    width: ${({ isOpen }) => (isOpen ? '100%' : '0')};
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
    background: linear-gradient(90deg, transparent, rgba(229, 9, 20, 0.5), transparent);
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

const Footer = styled.footer`
  background: rgba(10, 10, 20, 0.95);
  color: #fff;
  padding: 4rem 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 3rem;
  text-align: left;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
    color: #e50914;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
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
      background: #e50914;
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
      transition: transform 0.2s ease;

      &:hover {
        transform: translateX(5px);
      }
      
      @media (max-width: 480px) {
        margin-bottom: 0.6rem;
      }

      a {
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        font-size: 0.9rem;

        &::before {
          content: '→';
          color: #e50914;
          margin-right: 8px;
          opacity: 0;
          transition: all 0.2s ease;
        }

        &:hover {
          color: #fff;

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
  
  @media (max-width: 480px) {
    margin-top: 2rem;
    padding-top: 1.5rem;
    font-size: 0.8rem;
  }
`;

const FloatingParticles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(229, 9, 20, 0.03) 0%, transparent 70%);
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
`;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <>
      <Head>
        <title>SHIMY | Modern Movie Discovery</title>
        <meta name="description" content="Discover the best movies in a sleek, modern interface." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <LayoutWrapper>
        <FloatingParticles />
        <SidebarWrapper isOpen={isSidebarOpen}>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </SidebarWrapper>

        <ContentWrapper>
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <MainContent>{children}</MainContent>
          <Footer>
            <FooterContent>
              <FooterSection>
                <h3>SHIMY</h3>
                <p>
                  Your gateway to the world of cinema. Discover, explore, and enjoy the finest films in stunning
                  quality.
                </p>
              </FooterSection>
              <FooterSection>
                <h3>Explore</h3>
                <ul>
                  <li><a href="/trending">Trending</a></li>
                  <li><a href="/discover">Discover</a></li>
                  <li><a href="/upcoming">Upcoming</a></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>Account</h3>
                <ul>
                  <li><a href="/profile">Profile</a></li>
                  <li><a href="/favorites">Favorites</a></li>
                  <li><a href="/settings">Settings</a></li>
                </ul>
              </FooterSection>
              <FooterSection>
                <h3>Legal</h3>
                <ul>
                  <li><a href="/terms">Terms</a></li>
                  <li><a href="/contact">Contact</a></li>
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
