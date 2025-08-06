import { getCDNUrl, getAssetUrl, getOptimizedImageUrl } from '../cdn.config';

/**
 * CDN Utility Functions for optimized asset delivery
 */

// Get optimized image URL with CDN
export const getOptimizedImage = (src: string, width: number, quality: number = 85): string => {
  if (!src) return '';
  
  // If it's already a full URL, return as is
  if (src.startsWith('http')) {
    return src;
  }
  
  // Use CDN optimization if available
  const cdnUrl = getCDNUrl();
  if (cdnUrl) {
    return getOptimizedImageUrl(src, width, quality);
  }
  
  return src;
};

// Get CDN asset URL
export const getCDNAsset = (path: string): string => {
  return getAssetUrl(path);
};

// Get optimized font URL
export const getOptimizedFont = (fontUrl: string): string => {
  const cdnUrl = getCDNUrl();
  if (!cdnUrl) return fontUrl;
  
  // Add font optimization parameters
  const params = new URLSearchParams({
    display: 'swap',
    preload: 'true',
  });
  
  return `${cdnUrl}/fonts/${fontUrl}?${params.toString()}`;
};

// Get optimized CSS URL
export const getOptimizedCSS = (cssPath: string): string => {
  const cdnUrl = getCDNUrl();
  if (!cdnUrl) return cssPath;
  
  // Add CSS optimization parameters
  const params = new URLSearchParams({
    minify: 'true',
    compress: 'true',
  });
  
  return `${cdnUrl}/css/${cssPath}?${params.toString()}`;
};

// Get optimized JS URL
export const getOptimizedJS = (jsPath: string): string => {
  const cdnUrl = getCDNUrl();
  if (!cdnUrl) return jsPath;
  
  // Add JS optimization parameters
  const params = new URLSearchParams({
    minify: 'true',
    compress: 'true',
  });
  
  return `${cdnUrl}/js/${jsPath}?${params.toString()}`;
};

// Performance monitoring for CDN
export const monitorCDNPerformance = () => {
  if (typeof window === 'undefined') return;
  
  // Monitor CDN performance
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('your-cdn-domain.com')) {
        console.log('CDN Performance:', {
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['resource'] });
};

// Preload critical assets
export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;
  
  const criticalAssets = [
    '/images/shimy.png',
    '/_next/static/css/app.css',
    '/_next/static/js/app.js',
  ];
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asset.endsWith('.css') ? 'style' : 
              asset.endsWith('.js') ? 'script' : 'image';
    link.href = getCDNAsset(asset);
    document.head.appendChild(link);
  });
};

// CDN health check
export const checkCDNHealth = async (): Promise<boolean> => {
  const cdnUrl = getCDNUrl();
  if (!cdnUrl) return true;
  
  try {
    const response = await fetch(`${cdnUrl}/health`, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    console.warn('CDN health check failed:', error);
    return false;
  }
};

// Fallback to origin if CDN fails
export const getFallbackUrl = (path: string): string => {
  const cdnUrl = getCDNUrl();
  if (!cdnUrl) return path;
  
  // Check if CDN is healthy, if not, use origin
  checkCDNHealth().then(isHealthy => {
    if (!isHealthy) {
      console.warn('CDN unhealthy, using origin fallback');
    }
  });
  
  return path;
}; 