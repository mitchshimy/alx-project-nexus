import styled from 'styled-components';
import Link from 'next/link';

const HeaderBar = styled.header`
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #111;
  padding: 1.5rem 2rem;
  position: fixed;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const HeaderContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleLink = styled(Link)`
  text-decoration: none;

  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #111;

    span {
      color: #e50914;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #555;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    color: #e50914;
  }
`;

const SearchButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

export default function Header() {
  return (
    <HeaderBar>
      <HeaderContainer>
        <TitleLink href="/">
          <h1>
            Shimy<span>Movies</span>
          </h1>
        </TitleLink>

        <Nav>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/trending">Trending</NavLink>
          <NavLink href="/favorites">Favorites</NavLink>
          <SearchButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </SearchButton>
        </Nav>
      </HeaderContainer>
    </HeaderBar>
  );
}
