import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { authAPI, getAuthToken, removeAuthToken, performComprehensiveLogout } from '../utils/api';

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

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #FFFFFF;
  padding: 8px 16px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  border: none;
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 12px;
  margin-top: 8px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionTitle = styled.div`
  color: #FFFFFF;
  font-weight: 500;
  margin-bottom: 4px;
`;

const SuggestionType = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const SearchLoading = styled.div`
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-size: 0.9rem;
`;

const SearchIcon = styled.button`
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 768px) {
    display: none;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    try {
      // Import movieAPI dynamically to avoid circular dependencies
      const { movieAPI } = await import('@/utils/api');
      const data = await movieAPI.searchMovies(query, 1);
      
      // Check if response has error property
      if (data && data.error) {
        console.error('Error fetching search suggestions:', data.error);
        setSearchSuggestions([]);
        return;
      }
      
      if (data?.results?.length) {
        const suggestions = data.results.slice(0, 5).map((item: any) => ({
          id: item.id,
          title: item.title || item.name || 'Unknown Title',
          type: item.media_type || 'movie',
          year: item.release_date ? new Date(item.release_date).getFullYear() : null,
          poster: item.poster_path
        }));
        setSearchSuggestions(suggestions);
      } else {
        setSearchSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value);
      }, 300); // 300ms debounce
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'movie') {
      router.push(`/movies/${suggestion.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
    }
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleSearchIconClick = () => {
    router.push('/search');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    // Use the comprehensive logout function
    performComprehensiveLogout();
    
    // Update local state
    setIsAuthenticated(false);
    setUser(null);
    
    // Force a page reload to clear all cached data and state
    window.location.href = '/';
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
          <SearchContainer>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              <SearchButton type="submit" disabled={!searchTerm.trim()}>
                {isSearching ? '...' : 'Search'}
              </SearchButton>
            </SearchForm>
            
            {showSuggestions && (searchSuggestions.length > 0 || isSearching) && (
              <SearchSuggestions>
                {isSearching ? (
                  <SearchLoading>Searching...</SearchLoading>
                ) : (
                  searchSuggestions.map((suggestion) => (
                    <SuggestionItem
                      key={`${suggestion.type}-${suggestion.id}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                      <SuggestionType>
                        {suggestion.type === 'movie' ? 'Movie' : 'TV Show'}
                        {suggestion.year && ` • ${suggestion.year}`}
                      </SuggestionType>
                    </SuggestionItem>
                  ))
                )}
              </SearchSuggestions>
            )}
          </SearchContainer>
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
