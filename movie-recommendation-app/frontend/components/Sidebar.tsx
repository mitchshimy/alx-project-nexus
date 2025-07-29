// components/Sidebar.tsx
import styled from 'styled-components';
import Link from 'next/link';
import { MdHome, MdMovie, MdLiveTv, MdStar, MdWhatshot, MdFavorite, MdLogin, MdPersonAdd, MdMenu, MdClose } from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  width: 100%;
  height: 100vh;
  background: #111;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  
  @media (max-width: 768px) {
    padding-top: 70px;
  }
  
  @media (max-width: 480px) {
    padding-top: 60px;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #ccc;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;

  svg {
    min-width: 24px;
    min-height: 24px;
  }

  &:hover {
    background: #222;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.2rem;
    gap: 0.8rem;
    
    svg {
      min-width: 20px;
      min-height: 20px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    gap: 0.6rem;
    font-size: 0.9rem;
    
    svg {
      min-width: 18px;
      min-height: 18px;
    }
  }
`;

const Label = styled.span<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'inline' : 'none')};
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const MobileOverlay = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  }
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (max-width: 480px) {
    top: 0.8rem;
    right: 0.8rem;
    font-size: 1.3rem;
  }
`;

// Mobile-specific sidebar
const MobileSidebar = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #111;
  z-index: 999;
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease;
  
  @media (max-width: 480px) {
    display: block;
  }
`;

const MobileSidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;
  background: #0a0a0a;
`;

const MobileSidebarTitle = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 1.2rem;
`;

const MobileCloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MobileNavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #ccc;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
  border-bottom: 1px solid #222;

  svg {
    min-width: 20px;
    min-height: 20px;
  }

  &:hover {
    background: #222;
    color: #fff;
  }
`;

const MobileNavContainer = styled.div`
  padding-top: 1rem;
`;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile when minimized */}
      <MobileOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <NavItem href="/"><MdHome /><Label isOpen={isOpen}>Home</Label></NavItem>
        <NavItem href="/movies"><MdMovie /><Label isOpen={isOpen}>Movies</Label></NavItem>
        <NavItem href="/tv"><MdLiveTv /><Label isOpen={isOpen}>TV Shows</Label></NavItem>
        <NavItem href="/anime"><MdStar /><Label isOpen={isOpen}>Anime</Label></NavItem>
        <NavItem href="/kdrama"><MdStar /><Label isOpen={isOpen}>K-Drama</Label></NavItem>
        <NavItem href="/trending"><MdWhatshot /><Label isOpen={isOpen}>Trending</Label></NavItem>
        <NavItem href="/top-imdb"><MdStar /><Label isOpen={isOpen}>Top IMDb</Label></NavItem>
        <NavItem href="/favorites"><MdFavorite /><Label isOpen={isOpen}>Favorites</Label></NavItem>
      </SidebarContainer>

      {/* Mobile Sidebar - Only shows when toggled */}
      <MobileSidebar isOpen={isOpen}>
        <MobileSidebarHeader>
          <MobileSidebarTitle>Menu</MobileSidebarTitle>
          <MobileCloseButton onClick={onClose}>
            <MdClose />
          </MobileCloseButton>
        </MobileSidebarHeader>
        <MobileNavContainer>
          <MobileNavItem href="/" onClick={onClose}>
            <MdHome />
            Home
          </MobileNavItem>
          <MobileNavItem href="/movies" onClick={onClose}>
            <MdMovie />
            Movies
          </MobileNavItem>
          <MobileNavItem href="/tv" onClick={onClose}>
            <MdLiveTv />
            TV Shows
          </MobileNavItem>
          <MobileNavItem href="/anime" onClick={onClose}>
            <MdStar />
            Anime
          </MobileNavItem>
          <MobileNavItem href="/kdrama" onClick={onClose}>
            <MdStar />
            K-Drama
          </MobileNavItem>
          <MobileNavItem href="/trending" onClick={onClose}>
            <MdWhatshot />
            Trending
          </MobileNavItem>
          <MobileNavItem href="/top-imdb" onClick={onClose}>
            <MdStar />
            Top IMDb
          </MobileNavItem>
          <MobileNavItem href="/favorites" onClick={onClose}>
            <MdFavorite />
            Favorites
          </MobileNavItem>
        </MobileNavContainer>
      </MobileSidebar>
    </>
  );
}
