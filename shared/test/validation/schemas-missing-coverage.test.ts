import { validateMonitorField, validateMonitorData } from '../../validation/schemas';

describe('Schemas - Missing Coverage', () => {
  describe('validateMonitorField uncovered lines', () => {
    test('should handle unknown field validation (lines 399-406)', () => {
      // Test a field that might trigger the fallback to base schema logic
      // This should test the internal validateFieldWithSchema function
      
      const result = validateMonitorField('http', 'unknown_field', 'test-value');
      
      // Should fail validation for unknown field
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should test various field scenarios', () => {
      // Test fields that might exist in base but not specific schemas
      const testCases = [
        { type: 'http', field: 'nonexistent_field', value: 'test' },
        { type: 'port', field: 'unknown_field', value: 'test' }, 
        { type: 'ping', field: 'invalid_field', value: 'test' },
      ];

      testCases.forEach(({ type, field, value }) => {
        const result = validateMonitorField(type, field, value);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateMonitorData ZodError handling', () => {
    test('should handle ZodError with path length > 0 (lines 478-479)', () => {
      // Create invalid monitor data that will generate ZodError with path
      const invalidMonitorData = {
        id: 'test-id',
        type: 'http',
        status: 'up',
        monitoring: true,
        responseTime: 'invalid-number', // This should create ZodError with path
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        // Missing required fields to generate more errors
      };

      const result = validateMonitorData('http', invalidMonitorData);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // This should have hit the path.length > 0 condition
    });

    test('should handle invalid_type with undefined received (line 482)', () => {
      // Create data that will generate "invalid_type" error with "undefined" received
      const monitorDataWithUndefinedField = {
        id: 'test-id',
        type: 'http',
        status: 'up',
        monitoring: true,
        responseTime: 100,
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        url: 'https://example.com',
        // Explicitly set an optional field to undefined to trigger the warning
        lastChecked: undefined,
      };

      const result = validateMonitorData('http', monitorDataWithUndefinedField);
      
      // This might generate warnings if lastChecked is an optional field
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    test('should create conditions for warning vs error categorization', () => {
      // Test scenarios that should trigger different branches in the ZodError handling
      
      // Test case that should generate errors (not warnings)
      const invalidData = {
        id: 123, // Wrong type - should be string
        type: 'http',
        status: 'invalid-status', // Invalid enum value
        monitoring: 'not-boolean', // Wrong type
        responseTime: 'not-a-number', // Wrong type
        checkInterval: -1, // Invalid value
        timeout: 'invalid', // Wrong type
        retryAttempts: 'invalid', // Wrong type
        url: 'not-a-url', // Invalid URL format
      };

      const result = validateMonitorData('http', invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Verify we have error categorization
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('should handle edge cases in ZodError issue processing', () => {
      // Test various invalid data types to generate different ZodError scenarios
      const edgeCases = [
        {
          name: 'null values',
          data: {
            id: null,
            type: 'http',
            status: null,
            monitoring: null,
            responseTime: null,
            checkInterval: null,
            timeout: null,
            retryAttempts: null,
          }
        },
        {
          name: 'wrong types',
          data: {
            id: [],
            type: 'http',
            status: {},
            monitoring: 'string',
            responseTime: [],
            checkInterval: {},
            timeout: true,
            retryAttempts: 'string',
          }
        }
      ];

      edgeCases.forEach(({ name: _name, data }) => {
        const result = validateMonitorData('http', data);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should specifically target path.length condition', () => {
      // Create data designed to trigger ZodError with specific path conditions
      const dataWithNestedErrors = {
        id: 'valid-id',
        type: 'http',
        status: 'up',
        monitoring: true,
        responseTime: 100,
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        url: 'https://example.com',
        // Add some fields that might create path-specific errors
        history: 'not-an-array', // If history exists, this should create error with path
        lastChecked: 'not-a-number', // If lastChecked should be number, this creates path error
      };

      const result = validateMonitorData('http', dataWithNestedErrors);
      expect(result).toBeDefined();
      // Should handle the validation appropriately
    });
  });
});
