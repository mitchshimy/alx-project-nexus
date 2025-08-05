import { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import SplashScreen from '@/components/SplashScreen';
import { theme } from '@/styles/theme';
import GlobalStyle from '@/styles/GlobalStyle';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchPopularMovies, warmCache } from '@/utils/api';
import { setGlobalErrorHandler, checkTokenExpiration } from '@/utils/api';
import { initializeSettings } from '@/utils/settings';
import { initializeLanguageSystem } from '@/utils/translations';

// Dynamically import ErrorModal to reduce initial bundle size
const ErrorModal = dynamic(() => import('@/components/ErrorModal'), {
  ssr: false,
  loading: () => null
});

// Global state for preloaded content
export const preloadedContent = {
  trending: null,
  topRated: null,
  popular: null,
  isPreloaded: false
};

// Cache duration: 30 minutes (increased from 15 minutes)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Check if we should show splash screen
const shouldShowSplash = () => {
  if (typeof window === 'undefined') return true; // SSR: always show splash
  

  
  const lastPreload = sessionStorage.getItem('shimy_last_preload');
  const hasCachedContent = sessionStorage.getItem('shimy_cached_content');
  
  console.log('Cache check:', { lastPreload, hasCachedContent });
  
  if (lastPreload && hasCachedContent) {
    const timeSinceLastPreload = Date.now() - parseInt(lastPreload || '0');
    const ageInMinutes = Math.round(timeSinceLastPreload / 1000 / 60);
    
    // If less than 15 minutes, use cached content (NO SPLASH)
    if (timeSinceLastPreload < CACHE_DURATION) {
      try {
        const cached = JSON.parse(hasCachedContent);
        preloadedContent.trending = cached.trending;
        preloadedContent.topRated = cached.topRated;
        preloadedContent.popular = cached.popular;
        preloadedContent.isPreloaded = true;
        console.log('Using cached content (age:', ageInMinutes, 'minutes) - NO SPLASH');
        return false;
              } catch {
          console.log('Failed to parse cached content, showing splash');
          return true;
        }
    } else {
      console.log('Cache expired (age:', ageInMinutes, 'minutes), showing splash');
      return true;
    }
  } else {
    console.log('No cached content found, showing splash');
    return true;
  }
};

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true); // Always start with true for SSR

  const [status, setStatus] = useState('Initializing...');
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isClient, setIsClient] = useState(false); // Added for hydration fix
  const [isInitialized, setIsInitialized] = useState(false); // Added for hydration fix
  
  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  // Set up global error handler
  useEffect(() => {
    setGlobalErrorHandler((title, message, type = 'error') => {
      setErrorModal({
        isOpen: true,
        title,
        message,
        type
      });
    });
  }, []);

  // Set up periodic token expiration check
  useEffect(() => {
    if (!isClient) return;
    
    // Check token expiration every 10 minutes
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isClient]);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    
    // Check for token expiration first
    checkTokenExpiration();
    
    // Initialize user settings
    initializeSettings();
    
    // Initialize language system
    initializeLanguageSystem();
    
    // Check if we should show splash (only on client)
    const shouldShow = shouldShowSplash();
    console.log('Should show splash:', shouldShow);
    
    // If we shouldn't show splash, set preloaded content immediately
    if (!shouldShow) {
      // Set preloaded content from cache immediately
      const cachedContent = sessionStorage.getItem('shimy_cached_content');
      if (cachedContent) {
        try {
          const cached = JSON.parse(cachedContent);
          preloadedContent.trending = cached.trending;
          preloadedContent.topRated = cached.topRated;
          preloadedContent.popular = cached.popular;
          preloadedContent.isPreloaded = true;
          console.log('Preloaded content set from cache immediately');
        } catch (e) {
          console.error('Failed to parse cached content:', e);
        }
      }
    }
    
    setShowSplash(shouldShow);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!showSplash || !isClient || !isInitialized) return; // Only run if splash should show

    const preloadContent = async () => {
      try {
        // Start preloading content immediately but don't wait for completion
        setStatus('Loading trending movies...');
        setPreloadProgress(40);

        // Start all API calls in parallel but don't await them
        const trendingPromise = fetchTrendingMovies();
        const topRatedPromise = fetchTopRatedMovies();
        const popularPromise = fetchPopularMovies();
        
        // Also warm the cache for better performance
        warmCache().catch(error => {
          console.error('Cache warming failed:', error);
        });

        setStatus('Loading top rated movies...');
        setPreloadProgress(70);

        setStatus('Loading popular movies...');
        setPreloadProgress(90);

        setStatus('Preparing your experience...');
        setPreloadProgress(95);

        // Show splash for a minimum time (1.5 seconds) then hide it
        setTimeout(() => {
          setStatus('Welcome to Shimy!');
          setPreloadProgress(100);
          
          // Hide splash screen after minimum time
          setTimeout(() => {
            setShowSplash(false);
          }, 100);
        }, 1500); // Show splash for at least 1.5 seconds

        // Continue loading content in background
        Promise.all([trendingPromise, topRatedPromise, popularPromise])
          .then(([trending, topRated, popular]) => {
            // Store preloaded content globally and in session storage
            preloadedContent.trending = trending;
            preloadedContent.topRated = topRated;
            preloadedContent.popular = popular;
            preloadedContent.isPreloaded = true;

            // Cache in session storage with timestamp
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('shimy_last_preload', Date.now().toString());
              sessionStorage.setItem('shimy_cached_content', JSON.stringify({
                trending,
                topRated,
                popular
              }));
            }
            console.log('Content loaded in background');
          })
          .catch((error) => {
            console.error('Error loading content in background:', error);
          });

      } catch (error) {
        console.error('Error in preload setup:', error);
        setStatus('Ready to explore!');
        setPreloadProgress(100);
        setTimeout(() => {
          setShowSplash(false);
        }, 100);
      }
    };

    const interval = setInterval(() => {
      // Progress tracking removed as it was unused
    }, 16); // Reduced from 25ms to 16ms for 60fps smooth animation

    preloadContent();

    return () => clearInterval(interval);
  }, [showSplash, isClient, isInitialized]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {showSplash && isClient && isInitialized ? (
        <SplashScreen progress={preloadProgress} status={status} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </ThemeProvider>
  );
}
