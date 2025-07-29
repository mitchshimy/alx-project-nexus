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
  transition: width 0.3s ease;
  width: ${({ isOpen }) => (isOpen ? '220px' : '70px')};
`;

const ContentWrapper = styled.div<{ isOpen: boolean }>`
  flex: 1;
  margin-left: ${({ isOpen }) => (isOpen ? '220px' : '70px')};
  transition: margin-left 0.3s ease;
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
`;

const Footer = styled.footer`
  background: rgba(10, 10, 20, 0.95);
  color: #fff;
  padding: 4rem 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 3rem;
  text-align: left;
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
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 1.5rem;
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

      a {
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;

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

        <ContentWrapper isOpen={isSidebarOpen}>
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
                  <li><a href="/genres">Genres</a></li>
                  <li><a href="/upcoming">Upcoming</a></li>
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
                <h3>Legal</h3>
                <ul>
                  <li><a href="/terms">Terms</a></li>
                  <li><a href="/privacy">Privacy</a></li>
                  <li><a href="/cookies">Cookies</a></li>
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
