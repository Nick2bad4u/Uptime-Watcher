import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SiteManager } from '../../managers/SiteManager';

describe('SiteManager', () => {
  let manager: SiteManager;
  let mockDependencies: any;

  beforeEach(() => {
    mockDependencies = {
      databaseService: {
        executeTransaction: vi.fn(),
      },
      eventEmitter: {
        emitTyped: vi.fn(),
      },
      getHistoryLimit: vi.fn().mockReturnValue(100),
      getSitesCache: vi.fn().mockReturnValue({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        has: vi.fn(),
        getAllKeys: vi.fn(),
      }),
      repositories: {
        history: {
          findBySiteIdentifier: vi.fn(),
          create: vi.fn(),
          deleteAll: vi.fn(),
        },
        monitor: {
          findBySiteIdentifier: vi.fn(),
          create: vi.fn(),
          bulkCreate: vi.fn(),
          deleteBySiteIdentifier: vi.fn(),
        },
        site: {
          findAll: vi.fn(),
          findByIdentifier: vi.fn(),
          upsert: vi.fn(),
          delete: vi.fn(),
          exists: vi.fn(),
        },
      },
      siteService: {
        validateSite: vi.fn(),
        transformToStandardFormat: vi.fn(),
      },
    };
    manager = new SiteManager(mockDependencies);
  });

  describe('constructor', () => {
    it('should construct without error', () => {
      expect(manager).toBeDefined();
    });
  });

  describe('addSite', () => {
    it('should add a new site successfully', async () => {
      const newSite = {
        identifier: 'test-site-1',
        name: 'Test Site',
        monitoring: true,
        monitors: [{
          id: 'mon1',
          type: 'http' as const,
          url: 'https://example.com',
          checkInterval: 60000,
          timeout: 10000,
          retryAttempts: 3,
          monitoring: true,
          status: 'pending' as const,
          responseTime: 0,
          history: []
        }]
      };

      mockDependencies.databaseService.executeTransaction.mockImplementation(async (fn: any) => {
        return await fn();
      });

      const result = await manager.addSite(newSite);

      expect(mockDependencies.repositories.site.upsert).toHaveBeenCalled();
      expect(mockDependencies.eventEmitter.emitTyped).toHaveBeenCalledWith(
        'internal:site:added',
        expect.objectContaining({
          operation: 'site-added',
          site: newSite
        })
      );
      expect(result).toEqual(newSite);
    });

    it('should handle database errors during site addition', async () => {
      const newSite = {
        identifier: 'test-site-2',
        name: 'Test Site 2',
        monitoring: true,
        monitors: []
      };

      mockDependencies.databaseService.executeTransaction.mockRejectedValue(
        new Error('Database transaction failed')
      );

      await expect(manager.addSite(newSite)).rejects.toThrow('Database transaction failed');
    });
  });

  describe('getSites', () => {
    it('should return all sites from cache when available', async () => {
      const cachedSites = [
        {
          identifier: 'site1',
          name: 'Site 1',
          monitoring: true,
          monitors: []
        }
      ];

      mockDependencies.getSitesCache().getAllKeys.mockReturnValue(['site1']);
      mockDependencies.getSitesCache().get.mockReturnValue(cachedSites[0]);

      const result = await manager.getSites();

      expect(result).toEqual(cachedSites);
    });

    it('should fetch from database when cache is empty', async () => {
      const dbSites = [
        { identifier: 'site1', name: 'Site 1', monitoring: true }
      ];

      mockDependencies.getSitesCache().getAllKeys.mockReturnValue([]);
      mockDependencies.repositories.site.findAll.mockResolvedValue(dbSites);
      mockDependencies.repositories.monitor.findBySiteIdentifier.mockResolvedValue([]);

      const result = await manager.getSites();

      expect(mockDependencies.repositories.site.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('removeSite', () => {
    it('should remove an existing site', async () => {
      mockDependencies.repositories.site.delete.mockResolvedValue(true);
      mockDependencies.databaseService.executeTransaction.mockImplementation(async (fn: any) => {
        return await fn();
      });

      const result = await manager.removeSite('site1');

      expect(mockDependencies.repositories.site.delete).toHaveBeenCalledWith('site1');
      expect(result).toBe(true);
    });

    it('should return false when site not found', async () => {
      mockDependencies.repositories.site.delete.mockResolvedValue(false);
      mockDependencies.databaseService.executeTransaction.mockImplementation(async (fn: any) => {
        return await fn();
      });

      const result = await manager.removeSite('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('updateSite', () => {
    it('should update an existing site', async () => {
      const existingSite = {
        identifier: 'site1',
        name: 'Old Name',
        monitoring: true,
        monitors: []
      };

      const updates = {
        name: 'New Name',
        monitoring: false
      };

      const updatedSite = {
        ...existingSite,
        ...updates
      };

      mockDependencies.databaseService.executeTransaction.mockImplementation(async (fn: any) => {
        return await fn();
      });

      const result = await manager.updateSite('site1', updates);

      expect(mockDependencies.repositories.site.upsert).toHaveBeenCalled();
      expect(result).toEqual(updatedSite);
    });
  });

  describe('removeMonitor', () => {
    it('should remove a monitor from a site', async () => {
      mockDependencies.databaseService.executeTransaction.mockImplementation(async (fn: any) => {
        return await fn();
      });
      mockDependencies.repositories.monitor.findByIdentifier = vi.fn().mockResolvedValue({
        id: 'mon1',
        type: 'http',
        url: 'https://example.com'
      });

      const result = await manager.removeMonitor('site1', 'mon1');

      expect(result).toBe(true);
    });
  });

  describe('updateSitesCache', () => {
    it('should update the sites cache', async () => {
      const sites = [
        {
          identifier: 'site1',
          name: 'Site 1',
          monitoring: true,
          monitors: []
        }
      ];

      await manager.updateSitesCache(sites);

      expect(mockDependencies.getSitesCache().set).toHaveBeenCalledWith('site1', sites[0]);
    });
  });
});
