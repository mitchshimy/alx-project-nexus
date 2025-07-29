// components/Header.tsx
import styled from 'styled-components';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const HeaderBar = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #111;
  padding: 1.2rem 0.5rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const HeaderContainer = styled.div<{ isSidebarOpen: boolean }>`
  max-width: 1400px;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '0' : '70px')};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 0;
`;

const Hamburger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  svg {
    width: 24px;
    height: 24px;
    stroke: #111;
  }
`;

const TitleLink = styled(Link)`
  text-decoration: none;

  h1 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 700;
    color: #111;

    span {
      color: #e50914;
    }
  }
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const SearchForm = styled.form`
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border 0.2s ease;

  &:focus {
    outline: none;
    border-color: #e50914;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #555;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: #e50914;
  }
`;

export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/trending?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <HeaderWrapper>
      <HeaderBar>
        <HeaderContainer isSidebarOpen={isSidebarOpen}>
          <LeftSection>
            <Hamburger
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Hamburger>

            <TitleLink href="/">
              <h1>
                Shimy<span>Movies</span>
              </h1>
            </TitleLink>
          </LeftSection>

          <CenterSection>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput 
                type="text" 
                placeholder="Search for movies, shows..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchForm>
          </CenterSection>

          <RightSection>
            <NavLink href="/signin">Sign In</NavLink>
            <NavLink href="/signup">Sign Up</NavLink>
          </RightSection>
        </HeaderContainer>
      </HeaderBar>
    </HeaderWrapper>
  );
}
