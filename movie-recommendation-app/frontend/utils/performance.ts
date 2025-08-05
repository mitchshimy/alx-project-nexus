// Performance optimization utilities

// Debounce function for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options,
  });
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = '/fonts/inter-var.woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  // Preload critical images
  const criticalImages = [
    '/images/shimy.png',
    // Add other critical images here
  ];

  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Optimize images based on device
export const getOptimizedImageUrl = (
  baseUrl: string,
  width: number,
  quality: number = 80
): string => {
  if (!baseUrl) return '';
  
  // Use TMDB's image optimization
  if (baseUrl.includes('image.tmdb.org')) {
    return `${baseUrl}?w=${width}&q=${quality}`;
  }
  
  return baseUrl;
};

// Memory management for large lists
export const createVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(window.scrollY / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  } else {
    fn();
  }
};

// Cache management
export const createCache = <T>(maxSize: number = 100) => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string): T | undefined => {
      return cache.get(key);
    },
    set: (key: string, value: T): void => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    clear: (): void => {
      cache.clear();
    },
  };
};

// Bundle size optimization
export const dynamicImport = (importFn: () => Promise<any>) => {
  return importFn().catch(err => {
    console.error('Dynamic import failed:', err);
    return null;
  });
}; 