// Performance optimization utilities
import { useCallback, useRef, useEffect } from 'react';

// Debounce function for performance
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

// Throttle function for performance
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
  callback: IntersectionObserverCallback,
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
  
  // Preload critical API endpoints
  const criticalEndpoints = [
    '/api/movies/trending',
    '/api/movies/discover',
    '/api/movies/search',
  ];
  
  criticalEndpoints.forEach(endpoint => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = endpoint;
    document.head.appendChild(link);
  });
};

// Get optimized image URL
export const getOptimizedImageUrl = (src: string, width: number = 300): string => {
  if (!src) return '';
  
  // If it's already a TMDB image, return as is
  if (src.includes('image.tmdb.org')) {
    return src;
  }
  
  return src;
};

// Create virtualized list for large datasets
export const createVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(window.scrollY / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  return items.slice(startIndex, endIndex);
};

// Measure performance metrics
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
};

// Create LRU cache
export const createCache = <K, V>(maxSize: number = 100) => {
  const cache = new Map<K, V>();
  
  return {
    get: (key: K): V | undefined => {
      const value = cache.get(key);
      if (value !== undefined) {
        cache.delete(key);
        cache.set(key, value);
      }
      return value;
    },
    set: (key: K, value: V): void => {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    has: (key: K): boolean => cache.has(key),
    delete: (key: K): boolean => cache.delete(key),
    clear: (): void => cache.clear(),
    size: (): number => cache.size,
  };
};

// Dynamic import with error handling
export const dynamicImport = async (modulePath: string) => {
  try {
    const module = await import(modulePath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error);
    return null;
  }
};

// Get memory usage
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }
  
  const memory = (performance as any).memory;
  if (!memory) return null;
  
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
};

// Optimize imports for better tree shaking
export const optimizeImports = () => {
  // This function can be used to dynamically import heavy components
  // when they're actually needed
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered: ', registration);
  } catch (error) {
    console.log('SW registration failed: ', error);
  }
};

// Add resource hints
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;
  
  // Add DNS prefetch for external domains
  const domains = ['image.tmdb.org', 'fonts.googleapis.com'];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Get optimal image format
export const getOptimalImageFormat = (): string => {
  if (typeof window === 'undefined') return 'webp';
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    canvas.toDataURL('image/avif');
    return 'avif';
  } catch {
    try {
      canvas.toDataURL('image/webp');
      return 'webp';
    } catch {
      return 'jpeg';
    }
  }
};

// Performance Monitor class
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  logMetrics() {
    console.log('Performance Metrics:', Object.fromEntries(this.metrics));
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 