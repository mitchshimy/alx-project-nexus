// components/Sidebar.tsx
import styled from 'styled-components';
import Link from 'next/link';
import { MdHome, MdMovie, MdLiveTv, MdStar, MdWhatshot, MdFavorite, MdLogin, MdPersonAdd, MdMenu } from 'react-icons/md';

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
`;

const Label = styled.span<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'inline' : 'none')};
`;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <SidebarContainer isOpen={isOpen}>
      <NavItem href="/"><MdHome /><Label isOpen={isOpen}>Home</Label></NavItem>
      <NavItem href="/movies"><MdMovie /><Label isOpen={isOpen}>Movies</Label></NavItem>
      <NavItem href="/tv"><MdLiveTv /><Label isOpen={isOpen}>TV Shows</Label></NavItem>
      <NavItem href="/anime"><MdStar /><Label isOpen={isOpen}>Anime</Label></NavItem>
      <NavItem href="/kdrama"><MdStar /><Label isOpen={isOpen}>K-Drama</Label></NavItem>
      <NavItem href="/trending"><MdWhatshot /><Label isOpen={isOpen}>Trending</Label></NavItem>
      <NavItem href="/top-imdb"><MdStar /><Label isOpen={isOpen}>Top IMDb</Label></NavItem>
      <NavItem href="/favorites"><MdFavorite /><Label isOpen={isOpen}>Favorites</Label></NavItem>
    </SidebarContainer>
  );
}
