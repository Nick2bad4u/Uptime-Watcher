import { isValidHistoryRow, isValidMonitorRow, isValidSiteRow } from '../../types/database';

describe('Database Types - Missing Coverage', () => {
  describe('RowValidationUtils.isValidTimestamp coverage', () => {
    test('should handle invalid string timestamps through isValidHistoryRow (line 208)', () => {
      // This should hit line 208 where we return false for string values that don't convert to valid numbers
      // Testing through isValidHistoryRow which uses the internal isValidTimestamp
      const historyRowWithInvalidTimestamp = {
        id: 1,
        monitor_id: 'test-id',
        status: 'up' as const,
        response_time: 100,
        checked_at: 'invalid-timestamp', // This should trigger the uncovered line
        details: null,
      };
      
      expect(isValidHistoryRow(historyRowWithInvalidTimestamp)).toBe(false);
    });

    test('should handle invalid string timestamps through isValidMonitorRow', () => {
      const monitorRowWithInvalidTimestamp = {
        id: 1,
        site_id: 'site-1',
        monitor_id: 'monitor-1',
        type: 'http',
        name: 'Test Monitor',
        url: 'https://example.com',
        status: 'up' as const,
        monitoring: 1,
        response_time: 100,
        check_interval: 60000,
        timeout: 5000,
        retry_attempts: 3,
        last_checked: 'not-a-number', // This should trigger the uncovered line
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      expect(isValidMonitorRow(monitorRowWithInvalidTimestamp)).toBe(false);
    });

    test('should handle invalid string timestamps through isValidSiteRow', () => {
      const siteRowWithInvalidTimestamp = {
        id: 1,
        site_id: 'site-1',
        name: 'Test Site',
        url: 'https://example.com',
        description: 'Test description',
        is_active: 1,
        created_at: '', // Empty string should trigger the uncovered line
        updated_at: Date.now(),
      };
      
      expect(isValidSiteRow(siteRowWithInvalidTimestamp)).toBe(false);
    });

    test('should handle edge case string timestamps that become NaN', () => {
      // Test various string values that would make Number() return NaN
      const testCases = [
        'NaN',
        'undefined',
        'null',
        'Infinity',
        '123abc',
        'abc123',
        '',
        ' ',
        'not-a-timestamp'
      ];

      testCases.forEach(invalidTimestamp => {
        const historyRow = {
          id: 1,
          monitor_id: 'test-id',
          status: 'up' as const,
          response_time: 100,
          checked_at: invalidTimestamp,
          details: null,
        };
        
        expect(isValidHistoryRow(historyRow)).toBe(false);
      });
    });
  });
});
