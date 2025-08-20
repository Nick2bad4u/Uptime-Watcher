import { createTemplateLogger } from '../../utils/logTemplates';
import { describe, test, expect, vi, afterEach } from 'vitest';

describe('LogTemplates - Missing Coverage', () => {
  describe('createTemplateLogger branch coverage', () => {
    const mockLogger = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    afterEach(() => {
      vi.clearAllMocks();
    });

    test('should handle debug logging without variables (line 472)', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // This should hit the `: message` branch on line 472 where variables is undefined
      templateLogger.debug('Simple debug message without variables');
      
      expect(mockLogger.debug).toHaveBeenCalledWith('Simple debug message without variables', undefined);
    });

    test('should handle info logging without variables (line 481)', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // This should hit the `: message` branch on line 481 where variables is undefined
      templateLogger.info('Simple info message without variables');
      
      expect(mockLogger.info).toHaveBeenCalledWith('Simple info message without variables', undefined);
    });

    test('should handle warn logging without variables (line 499)', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // This should hit the `: message` branch on line 499 where variables is undefined
      templateLogger.warn('Simple warning message without variables');
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Simple warning message without variables', undefined);
    });

    test('should handle error logging without variables', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // This should hit the `: message` branch where variables is undefined
      templateLogger.error('Simple error message without variables');
      
      expect(mockLogger.error).toHaveBeenCalledWith('Simple error message without variables', undefined);
    });

    test('should handle all logging methods with and without variables for complete branch coverage', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // Test without variables (hitting the `: message` branches)
      templateLogger.debug('Debug without vars');
      templateLogger.info('Info without vars');
      templateLogger.warn('Warn without vars');
      templateLogger.error('Error without vars');
      
      // Test with variables (hitting the interpolateLogTemplate branches)
      templateLogger.debug('Debug with {name}', { name: 'test' });
      templateLogger.info('Info with {value}', { value: '123' });
      templateLogger.warn('Warn with {count}', { count: '5' });
      templateLogger.error('Error with {id}', { id: 'abc' });
      
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });

    test('should verify ternary operator branches explicitly', () => {
      const templateLogger = createTemplateLogger(mockLogger);
      
      // Explicitly test the ternary conditions
      
      // variables is undefined -> should use message directly
      templateLogger.debug('Test message');
      expect(mockLogger.debug).toHaveBeenLastCalledWith('Test message', undefined);
      
      // variables is defined -> should use interpolateLogTemplate
      templateLogger.debug('Test {placeholder}', { placeholder: 'value' });
      expect(mockLogger.debug).toHaveBeenLastCalledWith('Test value', { placeholder: 'value' });
      
      // Empty variables object -> should still use interpolateLogTemplate
      templateLogger.debug('Test message', {});
      expect(mockLogger.debug).toHaveBeenLastCalledWith('Test message', {});
    });
  });
});
