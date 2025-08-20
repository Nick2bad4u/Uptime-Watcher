/**
 * Comprehensive tests for cache keys utility functions to achieve 95%+ coverage.
 * Focuses on testing all functions and branches including error paths.
 */

import { describe, expect, it } from 'vitest';

import {
	CacheKeys,
	isStandardizedCacheKey,
	parseCacheKey,
	type StandardizedCacheKey,
} from '@shared/utils/cacheKeys';

describe('CacheKeys - Complete Function Coverage', () => {
	describe('Config cache keys', () => {
		it('should generate config by name key', () => {
			const key = CacheKeys.config.byName('test-setting');
			expect(key).toBe('config:test-setting');
		});

		it('should generate config validation key', () => {
			const key = CacheKeys.config.validation('monitor-config');
			expect(key).toBe('config:validation:monitor-config');
		});

		it('should handle empty config name', () => {
			const key = CacheKeys.config.byName('');
			expect(key).toBe('config:');
		});

		it('should handle special characters in config name', () => {
			const key = CacheKeys.config.byName('config-with-dashes_and_underscores');
			expect(key).toBe('config:config-with-dashes_and_underscores');
		});

		it('should handle unicode characters in config name', () => {
			const key = CacheKeys.config.byName('配置名称');
			expect(key).toBe('config:配置名称');
		});
	});

	describe('Monitor cache keys', () => {
		it('should generate monitor by ID key', () => {
			const key = CacheKeys.monitor.byId('monitor-123');
			expect(key).toBe('monitor:monitor-123');
		});

		it('should generate monitor by site key', () => {
			const key = CacheKeys.monitor.bySite('site-456');
			expect(key).toBe('monitor:site:site-456');
		});

		it('should generate monitor operation key', () => {
			const key = CacheKeys.monitor.operation('monitor-789');
			expect(key).toBe('monitor:operation:monitor-789');
		});

		it('should handle empty monitor IDs', () => {
			const key = CacheKeys.monitor.byId('');
			expect(key).toBe('monitor:');
		});

		it('should handle numeric-like monitor IDs', () => {
			const key = CacheKeys.monitor.byId('12345');
			expect(key).toBe('monitor:12345');
		});

		it('should handle UUID-like monitor IDs', () => {
			const key = CacheKeys.monitor.byId('550e8400-e29b-41d4-a716-446655440000');
			expect(key).toBe('monitor:550e8400-e29b-41d4-a716-446655440000');
		});
	});

	describe('Site cache keys', () => {
		it('should generate bulk operation key', () => {
			const key = CacheKeys.site.bulkOperation();
			expect(key).toBe('site:bulk');
		});

		it('should generate site by identifier key', () => {
			const key = CacheKeys.site.byIdentifier('site-abc');
			expect(key).toBe('site:site-abc');
		});

		it('should generate site loading key', () => {
			const key = CacheKeys.site.loading('site-def');
			expect(key).toBe('site:loading:site-def');
		});

		it('should handle empty site identifiers', () => {
			const key = CacheKeys.site.byIdentifier('');
			expect(key).toBe('site:');
		});

		it('should handle special characters in site identifiers', () => {
			const key = CacheKeys.site.byIdentifier('site-123_test.domain.com');
			expect(key).toBe('site:site-123_test.domain.com');
		});
	});

	describe('Validation cache keys', () => {
		it('should generate validation by type key', () => {
			const key = CacheKeys.validation.byType('monitor', 'config-123');
			expect(key).toBe('validation:monitor:config-123');
		});

		it('should generate monitor type validation key', () => {
			const key = CacheKeys.validation.monitorType('http');
			expect(key).toBe('validation:monitor-type:http');
		});

	it('should handle empty validation types', () => {
		const key = CacheKeys.validation.byType('', 'identifier');
		expect(key).toBe('validation:identifier'); // Empty type results in 2-part key
	});		it('should handle empty identifiers in validation', () => {
			const key = CacheKeys.validation.byType('monitor', '');
			expect(key).toBe('validation:monitor:');
		});

		it('should handle all monitor types', () => {
			const httpKey = CacheKeys.validation.monitorType('http');
			const pingKey = CacheKeys.validation.monitorType('ping');
			const portKey = CacheKeys.validation.monitorType('port');
			const dnsKey = CacheKeys.validation.monitorType('dns');

			expect(httpKey).toBe('validation:monitor-type:http');
			expect(pingKey).toBe('validation:monitor-type:ping');
			expect(portKey).toBe('validation:monitor-type:port');
			expect(dnsKey).toBe('validation:monitor-type:dns');
		});
	});

	describe('isStandardizedCacheKey function coverage', () => {
		it('should validate correct 2-part keys', () => {
			expect(isStandardizedCacheKey('config:setting')).toBe(true);
			expect(isStandardizedCacheKey('monitor:id-123')).toBe(true);
			expect(isStandardizedCacheKey('site:site-456')).toBe(true);
			expect(isStandardizedCacheKey('validation:test-123')).toBe(true);
		});

		it('should validate correct 3-part keys', () => {
			expect(isStandardizedCacheKey('config:validation:setting')).toBe(true);
			expect(isStandardizedCacheKey('monitor:site:site-123')).toBe(true);
			expect(isStandardizedCacheKey('site:loading:site-456')).toBe(true);
			expect(isStandardizedCacheKey('validation:monitor:config-789')).toBe(true);
		});

		it('should reject keys with invalid part counts', () => {
			expect(isStandardizedCacheKey('')).toBe(false);
			expect(isStandardizedCacheKey('single')).toBe(false);
			expect(isStandardizedCacheKey('one:two:three:four')).toBe(false);
			expect(isStandardizedCacheKey('too:many:parts:here:now')).toBe(false);
		});

		it('should reject keys with empty prefix', () => {
			expect(isStandardizedCacheKey(':identifier')).toBe(false);
			expect(isStandardizedCacheKey(':operation:identifier')).toBe(false);
		});

		it('should reject keys with invalid prefixes', () => {
			expect(isStandardizedCacheKey('invalid:identifier')).toBe(false);
			expect(isStandardizedCacheKey('wrong:operation:identifier')).toBe(false);
			expect(isStandardizedCacheKey('unknown:test')).toBe(false);
		});

		it('should handle edge cases', () => {
			expect(isStandardizedCacheKey('monitor::')).toBe(false); // empty operation in 3-part
			expect(isStandardizedCacheKey('site::identifier')).toBe(false); // empty operation
		});
	});

	describe('parseCacheKey function coverage', () => {
		it('should parse 2-part keys correctly', () => {
			const result = parseCacheKey('config:setting-name' as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'config',
				identifier: 'setting-name',
			});
		});

		it('should parse 3-part keys correctly', () => {
			const result = parseCacheKey('monitor:operation:monitor-123' as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'monitor',
				operation: 'operation',
				identifier: 'monitor-123',
			});
		});

		it('should handle keys with empty identifiers in 2-part format', () => {
			const result = parseCacheKey('site:' as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'site',
				identifier: '',
			});
		});

		it('should throw error for invalid 2-part format with empty prefix', () => {
			expect(() => {
				parseCacheKey(':identifier' as StandardizedCacheKey);
			}).toThrow('Invalid cache key format: :identifier');
		});

		it('should handle keys with empty identifiers in 2-part format', () => {
			const result = parseCacheKey('config:' as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'config',
				identifier: '',
			});
		});

		it('should throw error for invalid 3-part format with empty prefix', () => {
			expect(() => {
				parseCacheKey(':operation:identifier' as StandardizedCacheKey);
			}).toThrow('Invalid cache key format: :operation:identifier');
		});

		it('should throw error for invalid 3-part format with empty operation', () => {
			expect(() => {
				parseCacheKey('prefix::identifier' as StandardizedCacheKey);
			}).toThrow('Invalid cache key format: prefix::identifier');
		});

		it('should throw error for invalid 3-part format with empty identifier', () => {
			expect(() => {
				parseCacheKey('prefix:operation:' as StandardizedCacheKey);
			}).toThrow('Invalid cache key format: prefix:operation:');
		});

		it('should handle complex identifiers', () => {
			const result = parseCacheKey('site:loading:site-123_test.domain.com' as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'site',
				operation: 'loading',
				identifier: 'site-123_test.domain.com',
			});
		});

		it('should handle UUID identifiers', () => {
			const uuid = '550e8400-e29b-41d4-a716-446655440000';
			const result = parseCacheKey(`monitor:${uuid}` as StandardizedCacheKey);
			expect(result).toEqual({
				prefix: 'monitor',
				identifier: uuid,
			});
		});
	});

	describe('All cache key functions integration', () => {
		it('should generate and parse keys consistently', () => {
			// Test all key generation and parsing combinations
			const keys = [
				CacheKeys.config.byName('test'),
				CacheKeys.config.validation('test'),
				CacheKeys.monitor.byId('123'),
				CacheKeys.monitor.bySite('site-123'),
				CacheKeys.monitor.operation('mon-123'),
				CacheKeys.site.bulkOperation(),
				CacheKeys.site.byIdentifier('site-456'),
				CacheKeys.site.loading('site-789'),
				CacheKeys.validation.byType('monitor', 'test'),
				CacheKeys.validation.monitorType('http'),
			];

			keys.forEach((key) => {
				expect(isStandardizedCacheKey(key)).toBe(true);
				const parsed = parseCacheKey(key);
				expect(parsed.prefix).toBeDefined();
				expect(parsed.identifier).toBeDefined();
			});
		});

		it('should handle stress test with many cache keys', () => {
			const keys: string[] = [];
			
			// Generate many keys
			for (let i = 0; i < 100; i++) {
				keys.push(CacheKeys.config.byName(`config-${i}`));
				keys.push(CacheKeys.monitor.byId(`monitor-${i}`));
				keys.push(CacheKeys.site.byIdentifier(`site-${i}`));
			}

			// Validate all keys
			keys.forEach((key) => {
				expect(isStandardizedCacheKey(key)).toBe(true);
				const parsed = parseCacheKey(key as StandardizedCacheKey);
				expect(parsed).toBeDefined();
			});
		});
	});
});
