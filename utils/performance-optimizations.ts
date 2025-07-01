/**
 * Performance Optimization Utilities - Phase 4 Implementation
 * 
 * Utilities for optimizing performance in large racing datasets,
 * including memoization, virtual scrolling, and lazy loading.
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Enhanced memoization hook with expiration and cache size limits
 */
export function useEnhancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxCacheSize?: number;
    expirationMs?: number;
  } = {}
): T {
  const { maxCacheSize = 10, expirationMs = 300000 } = options; // 5 minutes default
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  
  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cache = cacheRef.current;
    const now = Date.now();
    
    // Check if we have a valid cached value
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < expirationMs) {
      return cached.value;
    }
    
    // Compute new value
    const value = factory();
    
    // Clean up expired entries and maintain cache size
    for (const [cacheKey, cacheEntry] of cache.entries()) {
      if (now - cacheEntry.timestamp >= expirationMs) {
        cache.delete(cacheKey);
      }
    }
    
    // Remove oldest entries if cache is too large
    if (cache.size >= maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    
    // Store new value
    cache.set(key, { value, timestamp: now });
    
    return value;
  }, deps);
}

/**
 * Debounced state hook for performance-sensitive updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<number>();
  
  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
  }, [delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [immediateValue, debouncedValue, setValue];
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
): {
  visibleItems: { item: T; index: number }[];
  scrollProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  containerProps: {
    style: React.CSSProperties;
  };
} {
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  const visibleItems = items
    .slice(visibleStart, visibleEnd)
    .map((item, index) => ({
      item,
      index: visibleStart + index
    }));
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    scrollProps: {
      style: {
        height: containerHeight,
        overflowY: 'auto' as const,
      },
      onScroll: handleScroll,
    },
    containerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      },
    },
  };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  threshold: number = 0.1,
  rootMargin: string = '50px'
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
  
  return [ref, isVisible];
}

/**
 * Batch processing hook for heavy computations
 */
export function useBatchProcessor<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 50,
  delayMs: number = 16
): {
  processedItems: R[];
  isProcessing: boolean;
  progress: number;
} {
  const [processedItems, setProcessedItems] = useState<R[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (items.length === 0) {
      setProcessedItems([]);
      setProgress(0);
      return;
    }
    
    setIsProcessing(true);
    setProcessedItems([]);
    setProgress(0);
    
    let currentIndex = 0;
    const results: R[] = [];
    
    const processBatch = () => {
      const batchEnd = Math.min(currentIndex + batchSize, items.length);
      
      for (let i = currentIndex; i < batchEnd; i++) {
        results.push(processor(items[i]));
      }
      
      currentIndex = batchEnd;
      setProcessedItems([...results]);
      setProgress(currentIndex / items.length);
      
      if (currentIndex < items.length) {
        setTimeout(processBatch, delayMs);
      } else {
        setIsProcessing(false);
      }
    };
    
    processBatch();
  }, [items, processor, batchSize, delayMs]);
  
  return { processedItems, isProcessing, progress };
}

/**
 * Memory-efficient data cache with LRU eviction
 */
export class DataCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; accessCount: number }>();
  private maxSize: number;
  private maxAge: number;
  
  constructor(maxSize = 100, maxAgeMs = 600000) { // 10 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAgeMs;
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access info for LRU
    entry.accessCount++;
    entry.timestamp = now;
    
    return entry.value;
  }
  
  set(key: K, value: V): void {
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup();
    
    // Evict LRU entries if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1
    });
  }
  
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
  
  private evictLRU(): void {
    let lruKey: K | undefined;
    let lruTime = Infinity;
    let lruCount = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < lruCount || 
          (entry.accessCount === lruCount && entry.timestamp < lruTime)) {
        lruKey = key;
        lruTime = entry.timestamp;
        lruCount = entry.accessCount;
      }
    }
    
    if (lruKey !== undefined) {
      this.cache.delete(lruKey);
    }
  }
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderTime > 16) { // Longer than one frame
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }
    
    startTime.current = performance.now();
  });
  
  return renderCount.current;
}
