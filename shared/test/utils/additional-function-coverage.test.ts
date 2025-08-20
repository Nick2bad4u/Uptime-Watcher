import { describe, it, expect } from 'vitest';
import * as objectSafety from '../../utils/objectSafety';
import * as typeGuards from '../../utils/typeGuards';
import * as validation from '../../utils/validation';
import * as siteStatus from '../../utils/siteStatus';
import * as errorHandling from '../../utils/errorHandling';
import * as errorCatalog from '../../utils/errorCatalog';

describe('Utils Additional Function Coverage', () => {
  describe('objectSafety module', () => {
    it('should call safeObjectIteration function', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys: string[] = [];
      const values: unknown[] = [];
      
      objectSafety.safeObjectIteration(obj, (key, value) => {
        keys.push(key);
        values.push(value);
      });
      
      expect(keys).toEqual(['a', 'b', 'c']);
      expect(values).toEqual([1, 2, 3]);
    });

    it('should call safeObjectAccess function', () => {
      const obj = { test: 'value' };
      const result1 = objectSafety.safeObjectAccess(obj, 'test', 'default');
      const result2 = objectSafety.safeObjectAccess(obj, 'missing', 'default');
      
      expect(result1).toBe('value');
      expect(result2).toBe('default');
    });

    it('should call safeObjectOmit function', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = objectSafety.safeObjectOmit(obj, ['b']);
      
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should call safeObjectPick function', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = objectSafety.safeObjectPick(obj, ['a', 'c']);
      
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should call typedObjectEntries function', () => {
      const obj = { a: 1, b: 2 };
      const result = objectSafety.typedObjectEntries(obj);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([['a', 1], ['b', 2]]);
    });

    it('should call typedObjectKeys function', () => {
      const obj = { a: 1, b: 2 };
      const result = objectSafety.typedObjectKeys(obj);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['a', 'b']);
    });

    it('should call typedObjectValues function', () => {
      const obj = { a: 1, b: 2 };
      const result = objectSafety.typedObjectValues(obj);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('typeGuards module', () => {
    it('should call isArray function', () => {
      const result1 = typeGuards.isArray([1, 2, 3]);
      const result2 = typeGuards.isArray('not array');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isFunction function', () => {
      const result1 = typeGuards.isFunction(() => {});
      const result2 = typeGuards.isFunction('not function');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isError function', () => {
      const result1 = typeGuards.isError(new Error('test'));
      const result2 = typeGuards.isError('not error');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isDate function', () => {
      const result1 = typeGuards.isDate(new Date());
      const result2 = typeGuards.isDate('not date');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call hasProperty function', () => {
      const obj = { test: 'value' };
      const result1 = typeGuards.hasProperty(obj, 'test');
      const result2 = typeGuards.hasProperty(obj, 'missing');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isPositiveNumber function', () => {
      const result1 = typeGuards.isPositiveNumber(5);
      const result2 = typeGuards.isPositiveNumber(-5);
      const result3 = typeGuards.isPositiveNumber(0);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call isBoolean function', () => {
      const result1 = typeGuards.isBoolean(true);
      const result2 = typeGuards.isBoolean('not boolean');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isFiniteNumber function', () => {
      const result1 = typeGuards.isFiniteNumber(5);
      const result2 = typeGuards.isFiniteNumber(Infinity);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isNonNegativeNumber function', () => {
      const result1 = typeGuards.isNonNegativeNumber(5);
      const result2 = typeGuards.isNonNegativeNumber(-5);
      const result3 = typeGuards.isNonNegativeNumber(0);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(true);
    });

    it('should call isNonNullObject function', () => {
      const result1 = typeGuards.isNonNullObject({});
      const result2 = typeGuards.isNonNullObject(null);
      const result3 = typeGuards.isNonNullObject([]);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call isString function', () => {
      const result1 = typeGuards.isString('test');
      const result2 = typeGuards.isString(123);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isValidPort function', () => {
      const result1 = typeGuards.isValidPort(80);
      const result2 = typeGuards.isValidPort(99999);
      const result3 = typeGuards.isValidPort(-1);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call isValidTimestamp function', () => {
      const result1 = typeGuards.isValidTimestamp(1640995200000);
      const result2 = typeGuards.isValidTimestamp(-1);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('validation module', () => {
    it('should call getMonitorValidationErrors function', () => {
      const monitor = { type: 'http' as const, url: 'https://example.com' };
      const result = validation.getMonitorValidationErrors(monitor);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should call validateMonitorType function', () => {
      const result1 = validation.validateMonitorType('http');
      const result2 = validation.validateMonitorType('invalid');
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call validateSite function', () => {
      const site = { 
        id: 'test', 
        name: 'Test Site', 
        url: 'https://example.com',
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const result = validation.validateSite(site);
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('siteStatus module', () => {
    it('should call calculateSiteMonitoringStatus function', () => {
      const site = {
        id: 'test',
        name: 'Test Site',
        url: 'https://example.com',
        enabled: true,
        monitors: [
          { status: 'up' as const, lastChecked: Date.now(), monitoring: true },
          { status: 'down' as const, lastChecked: Date.now(), monitoring: false }
        ]
      };
      const result = siteStatus.calculateSiteMonitoringStatus(site);
      
      expect(typeof result).toBe('string');
    });

    it('should call calculateSiteStatus function', () => {
      const site = {
        id: 'test',
        name: 'Test Site',
        url: 'https://example.com',
        enabled: true,
        monitors: []
      };
      const result = siteStatus.calculateSiteStatus(site);
      
      expect(typeof result).toBe('string');
    });

    it('should call getSiteDisplayStatus function', () => {
      const site = {
        id: 'test',
        name: 'Test Site',
        url: 'https://example.com',
        enabled: true,
        monitors: []
      };
      const result = siteStatus.getSiteDisplayStatus(site);
      
      expect(typeof result).toBe('string');
    });

    it('should call getSiteStatusDescription function', () => {
      const site = {
        id: 'test',
        name: 'Test Site',
        url: 'https://example.com',
        enabled: true,
        monitors: []
      };
      const result = siteStatus.getSiteStatusDescription(site);
      
      expect(typeof result).toBe('string');
    });

    it('should call getSiteStatusVariant function', () => {
      const result = siteStatus.getSiteStatusVariant('up');
      
      expect(typeof result).toBe('string');
    });
  });

  describe('errorHandling module', () => {
    it('should call withErrorHandling function', async () => {
      const testFunction = async () => 'test result';
      const context = { 
        logger: { 
          error: (_msg: string, _err: unknown) => {
            // Mock logger implementation
          }
        },
        operationName: 'test-operation'
      };
      
      const result = await errorHandling.withErrorHandling(testFunction, context);
      
      expect(result).toBe('test result');
    });
  });

  describe('errorCatalog module', () => {
    it('should call formatErrorMessage function', () => {
      const result = errorCatalog.formatErrorMessage('NETWORK_ERROR', { url: 'https://example.com' });
      
      expect(typeof result).toBe('string');
    });

    it('should call isKnownErrorMessage function', () => {
      const result = errorCatalog.isKnownErrorMessage('Network connection failed');
      
      expect(typeof result).toBe('boolean');
    });
  });
});
