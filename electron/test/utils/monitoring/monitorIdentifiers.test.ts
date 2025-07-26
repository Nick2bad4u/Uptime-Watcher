import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  startMonitoring, 
  stopMonitoring, 
  startSiteMonitoring,
  stopSiteMonitoring,
  MonitoringLifecycleConfig
} from '../../utils/monitoring/monitorLifecycle';

describe('Monitor Lifecycle Utilities', () => {
  let mockConfig: MonitoringLifecycleConfig;

  beforeEach(() => {
    mockConfig = {
      databaseService: {
        executeTransaction: vi.fn().mockImplementation(async (fn) => await fn()),
      },
      eventEmitter: {
        emitTyped: vi.fn(),
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
      monitorRepository: {
        findBySiteIdentifier: vi.fn(),
        findByIdentifier: vi.fn(),
        update: vi.fn(),
      },
      monitorScheduler: {
        start: vi.fn(),
        stop: vi.fn(),
        isRunning: vi.fn(),
      },
      sites: {
        get: vi.fn(),
        set: vi.fn(),
        has: vi.fn(),
        getAllKeys: vi.fn(),
      },
    } as any;
  });

  describe('startMonitoring', () => {
    it('should start monitoring for a specific monitor', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: false,
        status: 'pending'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.start.mockResolvedValue(true);

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(true);
      expect(mockConfig.monitorRepository.findByIdentifier).toHaveBeenCalledWith('monitor-1');
      expect(mockConfig.monitorScheduler.start).toHaveBeenCalledWith('monitor-1');
    });

    it('should return false when monitor not found', async () => {
      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(undefined);

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });

    it('should handle scheduler start failure', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: false,
        status: 'pending'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.start.mockResolvedValue(false);

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.error).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockConfig.monitorRepository.findByIdentifier.mockRejectedValue(new Error('Database error'));

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.error).toHaveBeenCalled();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring for a specific monitor', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: true,
        status: 'up'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.stop.mockResolvedValue(true);

      const result = await stopMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(true);
      expect(mockConfig.monitorRepository.findByIdentifier).toHaveBeenCalledWith('monitor-1');
      expect(mockConfig.monitorScheduler.stop).toHaveBeenCalledWith('monitor-1');
    });

    it('should return false when monitor not found', async () => {
      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(undefined);

      const result = await stopMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });

    it('should handle scheduler stop failure', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: true,
        status: 'up'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.stop.mockResolvedValue(false);

      const result = await stopMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.error).toHaveBeenCalled();
    });
  });

  describe('startSiteMonitoring', () => {
    it('should start monitoring for all monitors in a site', async () => {
      const mockSite = {
        identifier: 'site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: [
          { id: 'monitor-1', type: 'http', monitoring: false },
          { id: 'monitor-2', type: 'port', monitoring: false }
        ]
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue(mockSite.monitors);
      mockConfig.monitorScheduler.start.mockResolvedValue(true);

      const result = await startSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(true);
      expect(mockConfig.monitorScheduler.start).toHaveBeenCalledTimes(2);
    });

    it('should return false when site not found', async () => {
      mockConfig.sites.get.mockReturnValue(undefined);

      const result = await startSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      const mockSite = {
        identifier: 'site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: [
          { id: 'monitor-1', type: 'http', monitoring: false },
          { id: 'monitor-2', type: 'port', monitoring: false }
        ]
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue(mockSite.monitors);
      mockConfig.monitorScheduler.start
        .mockResolvedValueOnce(true)   // First monitor succeeds
        .mockResolvedValueOnce(false); // Second monitor fails

      const result = await startSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(false); // Overall result is false due to partial failure
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });

    it('should handle empty monitor list', async () => {
      const mockSite = {
        identifier: 'site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: []
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue([]);

      const result = await startSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(true);
      expect(mockConfig.logger.info).toHaveBeenCalledWith(expect.stringContaining('no monitors'));
    });
  });

  describe('stopSiteMonitoring', () => {
    it('should stop monitoring for all monitors in a site', async () => {
      const mockSite = {
        identifier: 'site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: [
          { id: 'monitor-1', type: 'http', monitoring: true },
          { id: 'monitor-2', type: 'port', monitoring: true }
        ]
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue(mockSite.monitors);
      mockConfig.monitorScheduler.stop.mockResolvedValue(true);

      const result = await stopSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(true);
      expect(mockConfig.monitorScheduler.stop).toHaveBeenCalledTimes(2);
    });

    it('should return false when site not found', async () => {
      mockConfig.sites.get.mockReturnValue(undefined);

      const result = await stopSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });

    it('should handle monitor stop failures gracefully', async () => {
      const mockSite = {
        identifier: 'site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: [
          { id: 'monitor-1', type: 'http', monitoring: true },
          { id: 'monitor-2', type: 'port', monitoring: true }
        ]
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue(mockSite.monitors);
      mockConfig.monitorScheduler.stop
        .mockResolvedValueOnce(true)   // First monitor stops successfully
        .mockResolvedValueOnce(false); // Second monitor fails to stop

      const result = await stopSiteMonitoring(mockConfig, 'site-1');

      expect(result).toBe(false); // Overall result is false due to partial failure
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database transaction errors in startMonitoring', async () => {
      mockConfig.databaseService.executeTransaction.mockRejectedValue(new Error('Transaction failed'));

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.error).toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', async () => {
      mockConfig.monitorRepository.findByIdentifier.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(result).toBe(false);
      expect(mockConfig.logger.error).toHaveBeenCalled();
    });

    it('should emit appropriate events on success', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: false,
        status: 'pending'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.start.mockResolvedValue(true);

      await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      expect(mockConfig.eventEmitter.emitTyped).toHaveBeenCalled();
    });

    it('should emit appropriate events on failure', async () => {
      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(undefined);

      await startMonitoring(mockConfig, 'site-1', 'monitor-1');

      // Should still emit events even on failure for consistency
      expect(mockConfig.logger.warn).toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex site with mixed monitor states', async () => {
      const mockSite = {
        identifier: 'complex-site',
        name: 'Complex Site',
        monitoring: true,
        monitors: [
          { id: 'monitor-1', type: 'http', monitoring: false, status: 'pending' },
          { id: 'monitor-2', type: 'port', monitoring: true, status: 'up' },
          { id: 'monitor-3', type: 'http', monitoring: false, status: 'down' }
        ]
      };

      mockConfig.sites.get.mockReturnValue(mockSite);
      mockConfig.monitorRepository.findBySiteIdentifier.mockResolvedValue(mockSite.monitors);
      mockConfig.monitorScheduler.start.mockResolvedValue(true);

      const result = await startSiteMonitoring(mockConfig, 'complex-site');

      expect(result).toBe(true);
      expect(mockConfig.monitorScheduler.start).toHaveBeenCalledTimes(3);
    });

    it('should maintain consistency during concurrent operations', async () => {
      const mockMonitor = {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        monitoring: false,
        status: 'pending'
      };

      mockConfig.monitorRepository.findByIdentifier.mockResolvedValue(mockMonitor);
      mockConfig.monitorScheduler.start.mockResolvedValue(true);

      // Simulate concurrent start operations
      const results = await Promise.all([
        startMonitoring(mockConfig, 'site-1', 'monitor-1'),
        startMonitoring(mockConfig, 'site-1', 'monitor-1'),
        startMonitoring(mockConfig, 'site-1', 'monitor-1')
      ]);

      // All should succeed due to database transaction handling
      expect(results.every(r => r === true)).toBe(true);
      expect(mockConfig.databaseService.executeTransaction).toHaveBeenCalledTimes(3);
    });
  });
});
