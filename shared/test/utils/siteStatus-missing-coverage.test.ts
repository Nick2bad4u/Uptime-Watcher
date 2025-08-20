import { getSiteStatusDescription } from '../../utils/siteStatus';

describe('SiteStatus - Missing Coverage', () => {
  describe('getSiteStatusDescription default case', () => {
    test('should handle unknown status values (lines 199-200)', () => {
      // Test the default case in getSiteStatusDescription
      // This should hit lines 199-200 where we return "Unknown status"
      
      const siteWithUnknownStatus = {
        id: '1',
        name: 'Test Site',
        url: 'https://example.com',
        isActive: true,
        monitors: [{
          id: '1',
          name: 'Monitor 1',
          type: 'http' as const,
          status: 'invalid-status' as any, // This should trigger the default case
          monitoring: true,
          responseTime: 100,
          checkInterval: 60000,
          timeout: 5000,
          retryAttempts: 3,
          url: 'https://example.com',
          lastChecked: Date.now(),
        }],
      };

      const description = getSiteStatusDescription(siteWithUnknownStatus);
      expect(description).toBe('Unknown status');
    });

    test('should handle various invalid status values', () => {
      // Test multiple invalid status values to ensure we hit the default case
      const invalidStatuses = [
        'invalid',
        'random',
        'not-a-status',
        '',
        null,
        undefined,
        123,
        true,
      ];

      invalidStatuses.forEach(invalidStatus => {
        const siteWithInvalidStatus = {
          id: '1',
          name: 'Test Site', 
          url: 'https://example.com',
          isActive: true,
          monitors: [{
            id: '1',
            name: 'Monitor 1',
            type: 'http' as const,
            status: invalidStatus as any,
            monitoring: true,
            responseTime: 100,
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
            url: 'https://example.com',
            lastChecked: Date.now(),
          }],
        };

        const description = getSiteStatusDescription(siteWithInvalidStatus);
        expect(description).toBe('Unknown status');
      });
    });

    test('should hit default case with mixed invalid statuses', () => {
      // Test a site with multiple monitors having invalid statuses
      const siteWithMixedInvalidStatuses = {
        id: '1',
        name: 'Test Site',
        url: 'https://example.com', 
        isActive: true,
        monitors: [
          {
            id: '1',
            name: 'Monitor 1',
            type: 'http' as const,
            status: 'invalid-status-1' as any,
            monitoring: true,
            responseTime: 100,
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
            url: 'https://example.com',
            lastChecked: Date.now(),
          },
          {
            id: '2', 
            name: 'Monitor 2',
            type: 'port' as const,
            status: 'invalid-status-2' as any,
            monitoring: true,
            responseTime: 150,
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
            host: 'example.com',
            port: 80,
            lastChecked: Date.now(),
          }
        ],
      };

      const description = getSiteStatusDescription(siteWithMixedInvalidStatuses);
      // The function will calculate this as "mixed" status since monitors have different statuses
      expect(description).toBe('Mixed status (2/2 monitoring active)');
    });

    test('should verify the switch statement default behavior', () => {
      // Explicitly test the switch statement default case
      // by providing a status that doesn't match any known cases
      
      const testSite = {
        id: '1',
        name: 'Test Site',
        url: 'https://example.com',
        isActive: true,
        monitors: [{
          id: '1',
          name: 'Test Monitor',
          type: 'http' as const,
          status: 'definitely-not-a-valid-status' as any,
          monitoring: true,
          responseTime: 100,
          checkInterval: 60000,
          timeout: 5000,
          retryAttempts: 3,
          url: 'https://example.com',
          lastChecked: Date.now(),
        }],
      };

      // This should definitely hit the default case
      const result = getSiteStatusDescription(testSite);
      expect(result).toBe('Unknown status');
      expect(typeof result).toBe('string');
    });
  });
});
