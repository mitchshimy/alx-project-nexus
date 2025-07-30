import { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import SplashScreen from '@/components/SplashScreen';
import { theme } from '@/styles/theme';
import GlobalStyle from '@/styles/GlobalStyle';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchPopularMovies } from '@/utils/api';

// Global state for preloaded content
export const preloadedContent = {
  trending: null,
  topRated: null,
  popular: null,
  isPreloaded: false
};

// Cache duration: 15 minutes
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

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
      } catch (e) {
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
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    
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

    const startTime = Date.now();
    const duration = 3000; // 3 seconds total for preloading

    const preloadContent = async () => {
      try {
        // Start preloading content
        setStatus('Loading trending movies...');
        setPreloadProgress(30);

        const trendingPromise = fetchTrendingMovies();

        setStatus('Loading top rated movies...');
        setPreloadProgress(60);

        const topRatedPromise = fetchTopRatedMovies();

        setStatus('Loading popular movies...');
        setPreloadProgress(90);

        const popularPromise = fetchPopularMovies();

        setStatus('Preparing your experience...');
        setPreloadProgress(95);

        // Wait for all API calls to complete
        const [trending, topRated, popular] = await Promise.all([
          trendingPromise,
          topRatedPromise,
          popularPromise
        ]);

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

        setStatus('Welcome to Shimy!');
        setPreloadProgress(100);

        // Wait a moment to show completion, then transition
        setTimeout(() => {
          setShowSplash(false);
        }, 500);

      } catch (error) {
        console.error('Error preloading content:', error);
        setStatus('Ready to explore!');
        setPreloadProgress(100);
        setTimeout(() => {
          setShowSplash(false);
        }, 500);
      }
    };

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);

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
    </ThemeProvider>
  );
}
