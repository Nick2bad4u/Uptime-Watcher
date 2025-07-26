import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SiteRepository } from '../../../services/database/SiteRepository';

describe('SiteRepository', () => {
  let repository: SiteRepository;
  let mockDependencies: any;

  beforeEach(() => {
    mockDependencies = {
      database: {
        prepare: vi.fn().mockReturnValue({
          all: vi.fn(),
          get: vi.fn(),
          run: vi.fn(),
          finalize: vi.fn(),
        }),
      },
    };
    repository = new SiteRepository(mockDependencies);
  });

  describe('findAll', () => {
    it('should find all sites', async () => {
      const mockSites = [
        { identifier: 'site1', name: 'Site 1', monitoring: true },
        { identifier: 'site2', name: 'Site 2', monitoring: false }
      ];
      
      mockDependencies.database.prepare().all.mockReturnValue(mockSites);
      
      const result = await repository.findAll();
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockSites);
    });

    it('should handle errors when finding all sites', async () => {
      mockDependencies.database.prepare().all.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(repository.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findByIdentifier', () => {
    it('should find a site by identifier', async () => {
      const mockSite = { identifier: 'site1', name: 'Site 1', monitoring: true };
      
      mockDependencies.database.prepare().get.mockReturnValue(mockSite);
      
      const result = await repository.findByIdentifier('site1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockSite);
    });

    it('should return undefined when site not found', async () => {
      mockDependencies.database.prepare().get.mockReturnValue(undefined);
      
      const result = await repository.findByIdentifier('nonexistent');
      
      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should upsert a site', async () => {
      const siteData = {
        identifier: 'site1',
        name: 'New Site',
        monitoring: true
      };
      
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      await repository.upsert(siteData);
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT'));
    });

    it('should handle upsert errors', async () => {
      const siteData = {
        identifier: 'site1',
        name: 'New Site',
        monitoring: true
      };
      
      mockDependencies.database.prepare().run.mockImplementation(() => {
        throw new Error('Upsert failed');
      });

      await expect(repository.upsert(siteData)).rejects.toThrow('Upsert failed');
    });
  });

  describe('delete', () => {
    it('should delete a site', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      const result = await repository.delete('site1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE'));
      expect(result).toBe(true);
    });

    it('should return false when site not found', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 0 });
      
      const result = await repository.delete('nonexistent');
      
      expect(result).toBe(false);
    });

    it('should handle deletion errors', async () => {
      mockDependencies.database.prepare().run.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(repository.delete('site1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteAll', () => {
    it('should delete all sites', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 3 });
      
      await repository.deleteAll();
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE'));
    });
  });

  describe('exists', () => {
    it('should return true when site exists', async () => {
      mockDependencies.database.prepare().get.mockReturnValue({ count: 1 });
      
      const result = await repository.exists('site1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toBe(true);
    });

    it('should return false when site does not exist', async () => {
      mockDependencies.database.prepare().get.mockReturnValue({ count: 0 });
      
      const result = await repository.exists('nonexistent');
      
      expect(result).toBe(false);
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple sites', async () => {
      const sites = [
        { identifier: 'site1', name: 'Site 1', monitoring: true },
        { identifier: 'site2', name: 'Site 2', monitoring: false }
      ];
      
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      await repository.bulkInsert(sites);
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT'));
    });

    it('should handle bulk insert errors', async () => {
      const sites = [
        { identifier: 'site1', name: 'Site 1', monitoring: true }
      ];
      
      mockDependencies.database.prepare().run.mockImplementation(() => {
        throw new Error('Bulk insert failed');
      });

      await expect(repository.bulkInsert(sites)).rejects.toThrow('Bulk insert failed');
    });
  });

  describe('exportAll', () => {
    it('should export all sites', async () => {
      const mockSites = [
        { identifier: 'site1', name: 'Site 1', monitoring: true },
        { identifier: 'site2', name: 'Site 2', monitoring: false }
      ];
      
      mockDependencies.database.prepare().all.mockReturnValue(mockSites);
      
      const result = await repository.exportAll();
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockSites);
    });
  });
});
