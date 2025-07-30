import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { authAPI, getAuthToken, removeAuthToken } from '../utils/api';

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: transparent;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 70px;
  }
  
  @media (max-width: 480px) {
    padding: 0 0.5rem;
    height: 65px;
  }
`;

// Shadow overlay that creates the emerging effect
const HeaderShadowOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px; // Match header height exactly
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.8) 50%, rgba(10, 10, 10, 0.3) 100%);
  z-index: 999;
  pointer-events: none;
  
  @media (max-width: 768px) {
    height: 70px; // Match header height exactly
  }
  
  @media (max-width: 480px) {
    height: 65px; // Match header height exactly
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1001;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Hamburger = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.75rem;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const AppTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #FFFFFF 0%, #00D4FF 50%, #FFFFFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const AppTitleSpan = styled.span`
  background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AppTitleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 450px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(0, 212, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }
`;

const SearchButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  border: none;
  border-radius: 12px;
  color: #000000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.4);
  }
`;

const AuthButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const PrimaryAuthButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
  border: none;
  border-radius: 12px;
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #FFFFFF;
  font-weight: 600;
  
  span:first-child {
    font-size: 0.9rem;
    color: #FFFFFF;
  }
  
  span:last-child {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #FFFFFF;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #EF4444;
  }
  
  @media (max-width: 768px) {
  display: none;
  }
`;

const SearchIcon = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.75rem;
  color: #FFFFFF;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: none;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const AccountIcon = styled(Link)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.75rem;
  color: #FFFFFF;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: none;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.75rem;
  color: #FFFFFF;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: none;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    display: block;
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check authentication status
  const checkAuthStatus = () => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check authentication status on component mount
    checkAuthStatus();
    
    // Listen for storage changes (when token is set/removed)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // Listen for custom auth state change event
    const handleAuthStateChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Also check on route changes
    const handleRouteChange = () => {
      // Force a small delay to ensure token is set
      setTimeout(() => {
        checkAuthStatus();
      }, 100);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Check again after a short delay to catch any delayed token setting
    const timeoutId = setTimeout(() => {
      checkAuthStatus();
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      router.events.off('routeChangeComplete', handleRouteChange);
      clearTimeout(timeoutId);
    };
  }, [router]);

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
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Clear the search input after submitting
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  const handleSearchIconClick = () => {
    // For mobile, you could show a search modal or navigate to search page
    router.push('/search');
  };

  return (
    <HeaderContainer>
      <HeaderShadowOverlay />
      <HeaderContent>
        <LeftSection>
          <Hamburger onClick={toggleSidebar}>
            ☰
          </Hamburger>
          <AppTitleLink href="/">
            <AppTitle>
              Shimy<AppTitleSpan>Movies</AppTitleSpan>
            </AppTitle>
          </AppTitleLink>
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
          <SearchIcon onClick={handleSearchIconClick} title="Search">
            🔍
          </SearchIcon>
          {isAuthenticated ? (
            <>
              <UserSection>
                <span>{user?.first_name || user?.username || 'User'}</span>
                <span>{user?.email}</span>
              </UserSection>
                <LogoutButton onClick={handleLogout}>
                  Logout
                </LogoutButton>
              <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
                ⋯
              </MobileMenuButton>
            </>
          ) : (
            <>
              <AuthButton href="/signin">Sign In</AuthButton>
              <PrimaryAuthButton href="/signup">Sign Up</PrimaryAuthButton>
              <AccountIcon href="/signin" title="Account">
                👤
              </AccountIcon>
            </>
          )}
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
}
