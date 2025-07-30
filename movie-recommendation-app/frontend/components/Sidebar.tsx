// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
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

const HoverTooltip = styled.span<{ isOpen: boolean }>`
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
  font-weight: 500;
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

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #EF4444;
    transform: scale(1.05);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 1rem 1rem;
  opacity: 0.5;
`;

const SectionTitle = styled.h3<{ isOpen: boolean }>`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1.5rem 1rem 0.75rem 1rem;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  
  @media (max-width: 768px) {
    display: block;
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
  const navItems = [
    { href: "/", icon: <MdHome />, label: "Home" },
    { href: "/movies", icon: <MdMovie />, label: "Movies" },
    { href: "/tv", icon: <MdLiveTv />, label: "TV Shows" },
    { href: "/trending", icon: <MdWhatshot />, label: "Trending" },
    { href: "/top-imdb", icon: <MdStar />, label: "Top Rated" },
  ];

  const personalItems = [
    { href: "/favorites", icon: <MdFavorite />, label: "Favorites" },
    { href: "/watchlist", icon: <MdBookmark />, label: "Watchlist" },
  ];

  const accountItems = [
    { href: "/signin", icon: <MdLogin />, label: "Sign In" },
    { href: "/signup", icon: <MdPersonAdd />, label: "Sign Up" },
  ];

  const profileItems = isOpen ? [
    { href: "/profile", icon: <MdPerson />, label: "Profile" },
    { href: "/settings", icon: <MdSettings />, label: "Settings" },
  ] : [];

  return (
    <>
      <MobileOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <CloseButton onClick={onClose}>
          <MdClose />
        </CloseButton>
        
        <SidebarContent>
          {/* Main Navigation */}
          {navItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem href={item.href} isOpen={isOpen}>
                {item.icon}
                <Label isOpen={isOpen}>{item.label}</Label>
              </NavItem>
              <HoverTooltip isOpen={isOpen}>{item.label}</HoverTooltip>
            </NavItemWrapper>
          ))}
          
          <Divider />
          
          <SectionTitle isOpen={isOpen}>Personal</SectionTitle>
          
          {/* Personal Navigation */}
          {personalItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem href={item.href} isOpen={isOpen}>
                {item.icon}
                <Label isOpen={isOpen}>{item.label}</Label>
              </NavItem>
              <HoverTooltip isOpen={isOpen}>{item.label}</HoverTooltip>
            </NavItemWrapper>
          ))}
          
          <Divider />
          
          <SectionTitle isOpen={isOpen}>Account</SectionTitle>
          
          {/* Account Navigation */}
          {accountItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem href={item.href} isOpen={isOpen}>
                {item.icon}
                <Label isOpen={isOpen}>{item.label}</Label>
              </NavItem>
              <HoverTooltip isOpen={isOpen}>{item.label}</HoverTooltip>
            </NavItemWrapper>
          ))}
          
          {/* Profile Navigation (only shown when sidebar is open) */}
          {profileItems.map((item) => (
            <NavItemWrapper key={item.href} isOpen={isOpen}>
              <NavItem href={item.href} isOpen={isOpen}>
                {item.icon}
                <Label isOpen={isOpen}>{item.label}</Label>
              </NavItem>
              <HoverTooltip isOpen={isOpen}>{item.label}</HoverTooltip>
            </NavItemWrapper>
          ))}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
}