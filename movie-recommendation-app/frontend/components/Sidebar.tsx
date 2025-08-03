// components/Sidebar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { t } from '@/utils/translations';
import { 
  MdHome, 
  MdMovie, 
  MdLiveTv, 
  MdWhatshot, 
  MdStar, 
  MdFavorite, 
  MdBookmark, 
  MdLogin, 
  MdPersonAdd, 
  MdPerson, 
  MdSettings, 
  MdClose 
} from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    top: 70px;
  }
  
  @media (max-width: 480px) {
    top: 65px;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 80px;
  left: 0;
  height: calc(100vh - 80px);
  width: ${props => props.isOpen ? '280px' : '80px'};
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  overflow: hidden;
  
  @media (max-width: 768px) {
    top: 70px;
    height: calc(100vh - 70px);
    width: ${props => props.isOpen ? '280px' : '0px'};
  }
  
  @media (max-width: 480px) {
    top: 65px;
    height: calc(100vh - 65px);
  }
`;

const NavItem = styled(Link)<{ isActive?: boolean; isOpen?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid transparent;
  position: relative;
  margin: 0.25rem 0.75rem;
  border-radius: 12px;
  
  svg {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.3rem;
    margin-right: 1rem;
    min-width: 1.3rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    color: #00D4FF;
    border-left-color: #00D4FF;
    transform: translateX(4px);
    
    svg {
      color: #00D4FF;
      transform: scale(1.1);
    }
  }
  
  ${props => props.isActive && `
    background: rgba(0, 212, 255, 0.15);
    color: #00D4FF;
    border-left-color: #00D4FF;
    
    svg {
      color: #00D4FF;
    }
  `}
  
  ${({ isOpen }) => !isOpen && `
    svg {
      font-size: 1.5rem;
      margin-right: 0;
      min-width: 1.5rem;
    }
    
    &:hover svg {
      transform: scale(1.2);
    }
  `}
`;

const Label = styled.span<{ isOpen: boolean }>`
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-weight: 500;
  
  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const HoverTooltip = styled.div<{ isOpen: boolean }>`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  color: #FFFFFF;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  margin-left: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 8px solid transparent;
    border-right-color: rgba(10, 10, 10, 0.95);
  }
`;

const NavItemWrapper = styled.div<{ isOpen: boolean }>`
  position: relative;
  
  &:hover ${HoverTooltip} {
    opacity: ${({ isOpen }) => !isOpen ? 1 : 0};
    visibility: ${({ isOpen }) => !isOpen ? 'visible' : 'hidden'};
    transform: translateY(-50%) translateX(10px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 1.3rem;
  padding: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  z-index: 1002;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    transform: scale(1.05);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const NavList = styled.div`
  padding: 1rem 0;
  overflow-y: auto;
  height: 100%;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NavText = styled.span`
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-weight: 500;
  
  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 1.25rem;
`;

const SectionTitle = styled.h3<{ isOpen: boolean }>`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 1rem 1.25rem 0.5rem;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const SidebarContent = styled.div`
  padding: 1rem 0;
  height: 100%;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Get current language from settings
    const getLanguage = () => {
      if (typeof window === 'undefined') {
        return 'en';
      }
      
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          return parsedSettings.language || 'en';
        }
      } catch (error) {
        console.error('Error loading language setting:', error);
      }
      return 'en';
    };

    setCurrentLanguage(getLanguage());

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLanguageChange as EventListener);

      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      };
    }
  }, []);

  const navItems = [
    { href: "/", icon: <MdHome />, label: t('nav.home') },
    { href: "/movies", icon: <MdMovie />, label: t('nav.movies') },
    { href: "/tv", icon: <MdLiveTv />, label: t('nav.tv') },
    { href: "/trending", icon: <MdWhatshot />, label: t('nav.trending') },
    { href: "/top-imdb", icon: <MdStar />, label: t('nav.topRated') },
  ];

  const personalItems = [
    { href: "/favorites", icon: <MdFavorite />, label: t('nav.favorites') },
    { href: "/watchlist", icon: <MdBookmark />, label: t('nav.watchlist') },
  ];

  const accountItems = [
    { href: "/signin", icon: <MdLogin />, label: t('auth.signIn') },
    { href: "/signup", icon: <MdPersonAdd />, label: t('auth.signUp') },
  ];

  const profileItems = isOpen ? [
    { href: "/profile", icon: <MdPerson />, label: t('nav.profile') },
    { href: "/settings", icon: <MdSettings />, label: t('nav.settings') },
  ] : [];

  return (
    <>
      <MobileOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <CloseButton onClick={onClose}>
          <MdClose />
        </CloseButton>
        
        <NavList>
          {/* Main Navigation */}
          {navItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem 
                href={item.href}
                isActive={router.pathname === item.href}
                isOpen={isOpen}
              >
                {item.icon}
                {isOpen && <NavText>{item.label}</NavText>}
              </NavItem>
              <HoverTooltip isOpen={isOpen}>
                {item.label}
              </HoverTooltip>
            </NavItemWrapper>
          ))}
          
          <Divider />
          
          <SectionTitle isOpen={isOpen}>Personal</SectionTitle>
          
          {/* Personal Navigation */}
          {personalItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem 
                href={item.href}
                isActive={router.pathname === item.href}
                isOpen={isOpen}
              >
                {item.icon}
                {isOpen && <NavText>{item.label}</NavText>}
              </NavItem>
              <HoverTooltip isOpen={isOpen}>
                {item.label}
              </HoverTooltip>
            </NavItemWrapper>
          ))}
          
          <Divider />
          
          <SectionTitle isOpen={isOpen}>Account</SectionTitle>
          
          {/* Account Navigation */}
          {accountItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem 
                href={item.href}
                isActive={router.pathname === item.href}
                isOpen={isOpen}
              >
                {item.icon}
                {isOpen && <NavText>{item.label}</NavText>}
              </NavItem>
              <HoverTooltip isOpen={isOpen}>
                {item.label}
              </HoverTooltip>
            </NavItemWrapper>
          ))}
          
          {/* Profile Navigation (only show when sidebar is open) */}
          {profileItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem 
                href={item.href}
                isActive={router.pathname === item.href}
                isOpen={isOpen}
              >
                {item.icon}
                {isOpen && <NavText>{item.label}</NavText>}
              </NavItem>
              <HoverTooltip isOpen={isOpen}>
                {item.label}
              </HoverTooltip>
            </NavItemWrapper>
          ))}
        </NavList>
      </SidebarContainer>
    </>
  );
}