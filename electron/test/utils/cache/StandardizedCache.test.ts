import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StandardizedCache } from '../../utils/cache/StandardizedCache';

describe('StandardizedCache', () => {
  let cache: StandardizedCache<string>;

  beforeEach(() => {
    cache = new StandardizedCache<string>();
  });

  describe('basic operations', () => {
    it('should create an empty cache', () => {
      expect(cache.size()).toBe(0);
      expect(cache.isEmpty()).toBe(true);
    });

    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.isEmpty()).toBe(true);
    });
  });

  describe('size and capacity', () => {
    it('should track size correctly', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });

    it('should handle empty state', () => {
      expect(cache.isEmpty()).toBe(true);
      
      cache.set('key1', 'value1');
      expect(cache.isEmpty()).toBe(false);
      
      cache.delete('key1');
      expect(cache.isEmpty()).toBe(true);
    });

    it('should respect maximum capacity', () => {
      const limitedCache = new StandardizedCache<string>(2);
      
      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');
      expect(limitedCache.size()).toBe(2);
      
      // Adding third item should evict the first (LRU)
      limitedCache.set('key3', 'value3');
      expect(limitedCache.size()).toBe(2);
      expect(limitedCache.has('key1')).toBe(false);
      expect(limitedCache.has('key2')).toBe(true);
      expect(limitedCache.has('key3')).toBe(true);
    });
  });

  describe('iteration', () => {
    it('should provide all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const keys = cache.getAllKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should provide all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const values = cache.getAllValues();
      expect(values).toHaveLength(3);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });

    it('should provide all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const entries = cache.getAllEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['key1', 'value1']);
      expect(entries).toContainEqual(['key2', 'value2']);
    });

    it('should support forEach iteration', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const collected: Array<[string, string]> = [];
      cache.forEach((value, key) => {
        collected.push([key, value]);
      });
      
      expect(collected).toHaveLength(2);
      expect(collected).toContainEqual(['key1', 'value1']);
      expect(collected).toContainEqual(['key2', 'value2']);
    });
  });

  describe('complex data types', () => {
    it('should handle object values', () => {
      interface TestObject {
        id: number;
        name: string;
        active: boolean;
      }
      
      const objectCache = new StandardizedCache<TestObject>();
      const testObj: TestObject = { id: 1, name: 'test', active: true };
      
      objectCache.set('obj1', testObj);
      const retrieved = objectCache.get('obj1');
      
      expect(retrieved).toEqual(testObj);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('test');
      expect(retrieved?.active).toBe(true);
    });

    it('should handle array values', () => {
      const arrayCache = new StandardizedCache<number[]>();
      const testArray = [1, 2, 3, 4, 5];
      
      arrayCache.set('array1', testArray);
      const retrieved = arrayCache.get('array1');
      
      expect(retrieved).toEqual(testArray);
      expect(retrieved).toHaveLength(5);
    });

    it('should handle null and undefined values', () => {
      const nullableCache = new StandardizedCache<string | null | undefined>();
      
      nullableCache.set('null', null);
      nullableCache.set('undefined', undefined);
      
      expect(nullableCache.get('null')).toBeNull();
      expect(nullableCache.get('undefined')).toBeUndefined();
      expect(nullableCache.has('null')).toBe(true);
      expect(nullableCache.has('undefined')).toBe(true);
    });
  });

  describe('LRU behavior', () => {
    it('should maintain LRU order on access', () => {
      const lruCache = new StandardizedCache<string>(3);
      
      lruCache.set('key1', 'value1');
      lruCache.set('key2', 'value2');
      lruCache.set('key3', 'value3');
      
      // Access key1 to make it most recently used
      lruCache.get('key1');
      
      // Add new item, should evict key2 (least recently used)
      lruCache.set('key4', 'value4');
      
      expect(lruCache.has('key1')).toBe(true);  // Recently accessed
      expect(lruCache.has('key2')).toBe(false); // Evicted
      expect(lruCache.has('key3')).toBe(true);  // Still there
      expect(lruCache.has('key4')).toBe(true);  // Newly added
    });

    it('should maintain LRU order on update', () => {
      const lruCache = new StandardizedCache<string>(3);
      
      lruCache.set('key1', 'value1');
      lruCache.set('key2', 'value2');
      lruCache.set('key3', 'value3');
      
      // Update key1 to make it most recently used
      lruCache.set('key1', 'updated1');
      
      // Add new item, should evict key2 (least recently used)
      lruCache.set('key4', 'value4');
      
      expect(lruCache.get('key1')).toBe('updated1'); // Updated and kept
      expect(lruCache.has('key2')).toBe(false);      // Evicted
      expect(lruCache.has('key3')).toBe(true);       // Still there
      expect(lruCache.has('key4')).toBe(true);       // Newly added
    });
  });

  describe('performance and edge cases', () => {
    it('should handle large numbers of items efficiently', () => {
      const largeCache = new StandardizedCache<number>(1000);
      
      // Add many items
      for (let i = 0; i < 1000; i++) {
        largeCache.set(`key${i}`, i);
      }
      
      expect(largeCache.size()).toBe(1000);
      
      // Access some items
      for (let i = 0; i < 100; i++) {
        expect(largeCache.get(`key${i}`)).toBe(i);
      }
      
      // Add more items, should start evicting
      for (let i = 1000; i < 1100; i++) {
        largeCache.set(`key${i}`, i);
      }
      
      expect(largeCache.size()).toBe(1000); // Should maintain max size
    });

    it('should handle rapid set/get operations', () => {
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        cache.set(`key${i}`, `value${i}`);
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
      
      expect(cache.size()).toBe(iterations);
    });

    it('should handle empty keys and special characters', () => {
      cache.set('', 'empty key');
      cache.set(' ', 'space key');
      cache.set('\n', 'newline key');
      cache.set('\t', 'tab key');
      
      expect(cache.get('')).toBe('empty key');
      expect(cache.get(' ')).toBe('space key');
      expect(cache.get('\n')).toBe('newline key');
      expect(cache.get('\t')).toBe('tab key');
    });

    it('should be thread-safe for synchronous operations', () => {
      // Simulate concurrent operations
      const operations = [];
      
      for (let i = 0; i < 100; i++) {
        operations.push(() => cache.set(`key${i}`, `value${i}`));
        operations.push(() => cache.get(`key${i}`));
        operations.push(() => cache.has(`key${i}`));
      }
      
      // Execute all operations
      operations.forEach(op => op());
      
      // Verify final state
      expect(cache.size()).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid capacity gracefully', () => {
      expect(() => new StandardizedCache<string>(-1)).not.toThrow();
      expect(() => new StandardizedCache<string>(0)).not.toThrow();
    });

    it('should handle delete of non-existent keys', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should handle multiple deletes of same key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.delete('key1')).toBe(false);
    });

    it('should handle forEach with empty cache', () => {
      let called = false;
      cache.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should handle forEach with callback errors', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      expect(() => cache.forEach(errorCallback)).toThrow();
      expect(errorCallback).toHaveBeenCalledTimes(1); // Should stop on first error
    });
  });

  describe('cache statistics and monitoring', () => {
    it('should provide accurate size information', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.set('key1', 'updated1'); // Update, not add
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should maintain internal consistency', () => {
      // Add items
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Verify consistency between different access methods
      const keys = cache.getAllKeys();
      const values = cache.getAllValues();
      const entries = cache.getAllEntries();
      
      expect(keys.length).toBe(cache.size());
      expect(values.length).toBe(cache.size());
      expect(entries.length).toBe(cache.size());
      
      // Verify all keys can be retrieved
      keys.forEach(key => {
        expect(cache.has(key)).toBe(true);
        expect(cache.get(key)).toBeDefined();
      });
    });
  });
});
