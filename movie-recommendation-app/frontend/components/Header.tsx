import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { authAPI, getAuthToken, removeAuthToken, performComprehensiveLogout, checkTokenExpiration } from '../utils/api';
import { persistLanguagePreference } from '@/utils/settings';

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
  outline: none;
  
  &:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
  
  &:focus {
    outline: none;
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
  display: none; /* Hidden by default on desktop */
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    color: #00D4FF;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    display: flex; /* Show on mobile */
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const MobileLogoutButton = styled.button`
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1rem;
  color: #EF4444;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: none; /* Hidden by default on desktop */
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 44px;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #DC2626;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
  }
  
  @media (max-width: 768px) {
    display: flex; /* Show on mobile */
  }
  
  @media (max-width: 480px) {
    min-width: 70px;
    height: 40px;
    font-size: 0.8rem;
    padding: 0.75rem 0.75rem;
  }
`;



// Mobile Search Overlay Components
const MobileSearchOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 36, 0.98) 100%);
  backdrop-filter: blur(25px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
`;

const MobileSearchContainer = styled.div`
  width: 92%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  padding: 24px;
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 50%, #6a11cb 100%);
    animation: gradientFlow 3s linear infinite;
    background-size: 200% auto;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(106, 17, 203, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
  }
  
  @keyframes gradientFlow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
  }
`;

const MobileSearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const MobileSearchTitle = styled.h2`
  color: #FFFFFF;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #6a11cb 50%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  animation: titleGlow 3s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 3px;
    animation: titleUnderline 2s ease-in-out infinite;
  }
  
  @keyframes titleGlow {
    0%, 100% { filter: drop-shadow(0 0 20px rgba(106, 17, 203, 0.3)); }
    50% { filter: drop-shadow(0 0 30px rgba(106, 17, 203, 0.6)); }
  }
  
  @keyframes titleUnderline {
    0%, 100% { width: 60px; opacity: 0.7; }
    50% { width: 100px; opacity: 1; }
  }
`;

const MobileSearchCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: #FFFFFF;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #EF4444;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MobileSearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileSearchInput = styled.input`
  width: 100%;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  color: #FFFFFF;
  font-size: 1.2rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
  }
  
  &:focus {
    border-color: rgba(106, 17, 203, 0.6);
    box-shadow: 
      0 0 25px rgba(106, 17, 203, 0.4),
      0 0 0 1px rgba(106, 17, 203, 0.2) inset;
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.02);
  }
`;

const MobileSearchButton = styled.button`
  padding: 20px 32px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 18px;
  color: #FFFFFF;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(106, 17, 203, 0.3);
  position: relative;
  overflow: hidden;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(106, 17, 203, 0.4);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: none;
  }
`;

const MobileSearchSuggestions = styled.div`
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
`;

const MobileSuggestionItem = styled.div`
  padding: 16px 22px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(106, 17, 203, 0.1), transparent);
    transition: left 0.3s ease;
  }
  
  &:hover {
    background: rgba(106, 17, 203, 0.08);
    transform: translateX(4px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    background: rgba(106, 17, 203, 0.15);
    transform: translateX(2px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MobileSuggestionTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 6px;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const MobileSuggestionType = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileSearchTypeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
`;

const MobileSearchTypeLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const MobileSearchTypeButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const MobileSearchTypeButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  color: ${props => props.active ? '#000' : '#FFFFFF'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.active ? '0 4px 16px rgba(0, 212, 255, 0.3)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' : 'rgba(0, 212, 255, 0.15)'};
    border-color: ${props => props.active ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 212, 255, 0.4)'};
    color: ${props => props.active ? '#000' : '#00D4FF'};
    transform: translateY(-1px);
    box-shadow: ${props => props.active ? '0 8px 32px rgba(0, 212, 255, 0.3)' : 'none'};
  }
`;


interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'general' | 'actor' | 'genre'>('general');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    // First check if token is expired
    if (checkTokenExpiration()) {
      return; // Token was expired and handled
    }
    
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
      // Ensure language preference is maintained when user logs in
      persistLanguagePreference();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Check authentication status on component mount
    checkAuthStatus();
    
    // Set up periodic token expiration check (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Listen for storage changes (when token is set/removed)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // Listen for custom auth state change event
    const handleAuthStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { reason } = customEvent.detail || {};
      
      if (reason === 'token_expired') {
        // Token expired - clear user state immediately
        setIsAuthenticated(false);
        setUser(null);
        console.log('Token expired, cleared user state');
      } else {
        // Normal auth state change
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    
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
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      router.events.off('routeChangeComplete', handleRouteChange);
      clearTimeout(timeoutId);
      clearInterval(tokenCheckInterval);
    };
  }, [router, checkAuthStatus]);

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
          id: item.tmdb_id || item.id, // Use tmdb_id if available, fallback to id
          title: item.title || item.name || 'Unknown Title',
          type: item.media_type || 'movie',
          year: item.release_date ? new Date(item.release_date).getFullYear() : null,
          poster: item.poster_path
        }));
        console.log('Search suggestions created:', suggestions); // Debug log
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
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}&type=${searchType}`);
      setSearchTerm('');
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = async (suggestion: any) => {
    console.log('Suggestion clicked:', suggestion);
    
    // Navigate to movie details page for both movies and TV shows
    // since the backend handles both types in the same way
    if (suggestion.id && suggestion.id > 0) {
      console.log('Navigating to details page:', suggestion.id, 'Type:', suggestion.type);
      console.log('Router object:', router);
      try {
        await router.push(`/movies/${suggestion.id}`);
        console.log('Navigation successful');
      } catch (error) {
        console.error('Navigation failed:', error);
      }
    } else {
      console.error('Invalid ID in suggestion:', suggestion);
      // Fallback to search page
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}&type=${searchType}`);
    }
    
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleSearchIconClick = () => {
    setShowMobileSearch(true);
    // Focus the mobile search input after a short delay
    setTimeout(() => {
      if (mobileSearchInputRef.current) {
        mobileSearchInputRef.current.focus();
      }
    }, 100);
  };

  const handleMobileSearchClose = () => {
    console.log('Closing mobile search overlay');
    setShowMobileSearch(false);
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    console.log('Mobile search overlay closed');
  };

  const handleMobileSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      // Set a new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}&type=${searchType}`);
      handleMobileSearchClose();
    }
  };



  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const searchContainer = document.querySelector('[data-search-container]');
      
      // Don't close suggestions if clicking on search container or its children
      if (searchContainer && searchContainer.contains(target)) {
        return;
      }
      
      // Close suggestions if clicking outside
      setShowSuggestions(false);
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
    // Persist language preference before logout
    persistLanguagePreference();
    
    // Use the comprehensive logout function
    performComprehensiveLogout();
    
    // Update local state
    setIsAuthenticated(false);
    setUser(null);
    
    // Force a page reload to clear all cached data and state
    window.location.href = '/';
  };

  return (
    <>
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
            <SearchContainer data-search-container>
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Suggestion item clicked:', suggestion);
                          handleSuggestionClick(suggestion);
                        }}
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
                {/* Mobile logout button for authenticated users */}
                <MobileLogoutButton onClick={handleLogout} title="Logout">
                  Logout
                </MobileLogoutButton>
              </>
            ) : (
              <>
                <AuthButton href="/signin">Sign In</AuthButton>
                <PrimaryAuthButton href="/signup">Sign Up</PrimaryAuthButton>
                {/* AccountIcon only shows on mobile for non-authenticated users */}
                <AccountIcon href="/signin" title="Account">
                  👤
                </AccountIcon>
              </>
            )}
          </RightSection>
        </HeaderContent>
      </HeaderContainer>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay 
        isOpen={showMobileSearch}
        onClick={(e) => {
          // Close overlay if clicking on the background (not the container)
          if (e.target === e.currentTarget) {
            handleMobileSearchClose();
          }
        }}
      >
        <MobileSearchContainer>
          <MobileSearchHeader>
            <MobileSearchTitle>Search Movies & TV Shows</MobileSearchTitle>
            <MobileSearchCloseButton onClick={handleMobileSearchClose}>
              ✕
            </MobileSearchCloseButton>
          </MobileSearchHeader>
          
          <MobileSearchForm onSubmit={handleMobileSearch}>
            <MobileSearchInput
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Search movies, TV shows, actors..."
              value={searchTerm}
              onChange={handleMobileSearchInputChange}
            />
            <MobileSearchButton type="submit" disabled={!searchTerm.trim()}>
              {isSearching ? 'Searching...' : 'Search'}
            </MobileSearchButton>
          </MobileSearchForm>
          
          <MobileSearchTypeContainer>
            <MobileSearchTypeLabel>Search Type:</MobileSearchTypeLabel>
            <MobileSearchTypeButtons>
              <MobileSearchTypeButton 
                active={searchType === 'general'} 
                onClick={() => setSearchType('general')}
                type="button"
              >
                General
              </MobileSearchTypeButton>
              <MobileSearchTypeButton 
                active={searchType === 'actor'} 
                onClick={() => setSearchType('actor')}
                type="button"
              >
                Actor
              </MobileSearchTypeButton>
              <MobileSearchTypeButton 
                active={searchType === 'genre'} 
                onClick={() => setSearchType('genre')}
                type="button"
              >
                Genre
              </MobileSearchTypeButton>
            </MobileSearchTypeButtons>
          </MobileSearchTypeContainer>

          {showSuggestions && searchSuggestions.length > 0 && (
            <MobileSearchSuggestions>
              {searchSuggestions.map((suggestion) => (
                <MobileSuggestionItem
                  key={`mobile-${suggestion.type}-${suggestion.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile suggestion item clicked:', suggestion);
                    
                    // Immediate visual feedback
                    e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
                    
                    // Close overlay and navigate immediately
                    handleMobileSearchClose();
                    
                    if (suggestion.id && suggestion.id > 0) {
                      console.log('Mobile navigating to details page:', suggestion.id, 'Type:', suggestion.type);
                      // Use direct navigation for mobile
                      window.location.href = `/movies/${suggestion.id}`;
                    } else {
                      console.error('Invalid ID in mobile suggestion:', suggestion);
                      window.location.href = `/search?q=${encodeURIComponent(suggestion.title)}`;
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile suggestion item touched:', suggestion);
                    
                    // Immediate visual feedback
                    e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
                    
                    // Close overlay and navigate immediately
                    handleMobileSearchClose();
                    
                    if (suggestion.id && suggestion.id > 0) {
                      console.log('Mobile navigating to details page:', suggestion.id, 'Type:', suggestion.type);
                      // Use direct navigation for mobile
                      window.location.href = `/movies/${suggestion.id}`;
                    } else {
                      console.error('Invalid ID in mobile suggestion:', suggestion);
                      window.location.href = `/search?q=${encodeURIComponent(suggestion.title)}`;
                    }
                  }}
                >
                  <MobileSuggestionTitle>{suggestion.title}</MobileSuggestionTitle>
                  <MobileSuggestionType>
                    {suggestion.type === 'movie' ? 'Movie' : 'TV Show'}
                    {suggestion.year && ` • ${suggestion.year}`}
                  </MobileSuggestionType>
                </MobileSuggestionItem>
              ))}
            </MobileSearchSuggestions>
          )}
        </MobileSearchContainer>
      </MobileSearchOverlay>
    </>
  );
}
