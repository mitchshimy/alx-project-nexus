import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { authAPI, getAuthToken, removeAuthToken } from '../utils/api';

const HeaderContainer = styled.div<{ isSidebarOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e1e5e9;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  margin-left: ${props => props.isSidebarOpen ? '0' : '70px'};
  transition: margin-left 0.3s ease;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-left: 0;
`;

const Hamburger = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const AppTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
  margin: 0 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  width: 100%;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-50%) scale(1.05);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

const AuthButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const UserEmail = styled.span`
  color: #666;
  font-size: 12px;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #c0392b;
  }
`;

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication status on component mount
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      // Fetch user profile
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Token might be invalid, remove it
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/trending?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  return (
    <HeaderContainer isSidebarOpen={isSidebarOpen}>
      <LeftSection>
        <Hamburger onClick={toggleSidebar}>
          ☰
        </Hamburger>
        <AppTitle>ShimyMovies</AppTitle>
      </LeftSection>

      <CenterSection>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search movies, TV shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton type="submit">Search</SearchButton>
        </SearchForm>
      </CenterSection>

      <RightSection>
        {isAuthenticated ? (
          <UserMenu>
            <UserInfo>
              <UserName>{user?.first_name || user?.username || 'User'}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </UserMenu>
        ) : (
          <>
            <NavLink href="/signin">Sign In</NavLink>
            <AuthButton onClick={() => router.push('/signup')}>
              Sign Up
            </AuthButton>
          </>
        )}
      </RightSection>
    </HeaderContainer>
  );
}
