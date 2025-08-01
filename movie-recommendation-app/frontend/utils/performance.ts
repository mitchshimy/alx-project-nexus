// Performance optimization utilities

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if device is low-end (for performance optimizations)
export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for low memory
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check for slow CPU
  const cores = (navigator as any).hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  // Check for mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return isMobile;
};

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

// Performance monitoring
export const performanceMonitor = {
  startTime: 0,
  
  start() {
    this.startTime = performance.now();
  },
  
  end(label: string) {
    const duration = performance.now() - this.startTime;
    if (duration > 100) {
      console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms`);
    }
    return duration;
  }
};

// Optimize backdrop-filter usage
export const shouldUseBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Disable backdrop-filter on low-end devices
  if (isLowEndDevice()) return false;
  
  // Check if backdrop-filter is supported
  const testElement = document.createElement('div');
  testElement.style.backdropFilter = 'blur(1px)';
  return testElement.style.backdropFilter !== '';
};

// Get optimized blur value based on device performance
export const getOptimizedBlur = (defaultBlur: string): string => {
  if (!shouldUseBackdropFilter()) return 'none';
  if (isLowEndDevice()) return 'blur(5px)'; // Reduced blur for low-end devices
  return defaultBlur;
}; 