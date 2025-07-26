import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonitorRepository } from '../../../services/database/MonitorRepository';

describe('MonitorRepository', () => {
  let repository: MonitorRepository;
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
    repository = new MonitorRepository(mockDependencies);
  });

  describe('findBySiteIdentifier', () => {
    it('should find all monitors for a site', async () => {
      const mockMonitors = [
        { id: 'mon1', type: 'http', url: 'https://example.com' },
        { id: 'mon2', type: 'port', host: 'example.com', port: 80 }
      ];
      
      mockDependencies.database.prepare().all.mockReturnValue(mockMonitors);
      
      const result = await repository.findBySiteIdentifier('site1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockMonitors);
    });

    it('should handle errors when finding monitors by site', async () => {
      mockDependencies.database.prepare().all.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(repository.findBySiteIdentifier('site1')).rejects.toThrow('Database error');
    });
  });

  describe('findByIdentifier', () => {
    it('should find a monitor by id', async () => {
      const mockMonitor = { id: 'mon1', type: 'http', url: 'https://example.com' };
      
      mockDependencies.database.prepare().get.mockReturnValue(mockMonitor);
      
      const result = await repository.findByIdentifier('mon1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockMonitor);
    });

    it('should return undefined when monitor not found', async () => {
      mockDependencies.database.prepare().get.mockReturnValue(undefined);
      
      const result = await repository.findByIdentifier('nonexistent');
      
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new monitor', async () => {
      const monitorData = {
        type: 'http' as const,
        url: 'https://example.com',
        checkInterval: 60000,
        timeout: 10000,
        retryAttempts: 3,
        monitoring: true,
        status: 'pending' as const,
        responseTime: 0,
        history: []
      };
      
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      const result = await repository.create('site1', monitorData);
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT'));
      expect(typeof result).toBe('string');
    });

    it('should handle creation errors', async () => {
      const monitorData = {
        type: 'http' as const,
        url: 'https://example.com',
        checkInterval: 60000,
        timeout: 10000,
        retryAttempts: 3,
        monitoring: true,
        status: 'pending' as const,
        responseTime: 0,
        history: []
      };
      
      mockDependencies.database.prepare().run.mockImplementation(() => {
        throw new Error('Insert failed');
      });

      await expect(repository.create('site1', monitorData)).rejects.toThrow('Insert failed');
    });
  });

  describe('delete', () => {
    it('should delete a monitor', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      const result = await repository.delete('mon1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE'));
      expect(result).toBe(true);
    });

    it('should return false when monitor not found', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 0 });
      
      const result = await repository.delete('nonexistent');
      
      expect(result).toBe(false);
    });

    it('should handle deletion errors', async () => {
      mockDependencies.database.prepare().run.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(repository.delete('mon1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteAll', () => {
    it('should delete all monitors', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 3 });
      
      await repository.deleteAll();
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE'));
    });
  });

  describe('deleteBySiteIdentifier', () => {
    it('should delete all monitors for a site', async () => {
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 2 });
      
      await repository.deleteBySiteIdentifier('site1');
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE'));
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple monitors', async () => {
      const monitors = [
        {
          id: 'mon1',
          type: 'http' as const,
          url: 'https://example1.com',
          checkInterval: 60000,
          timeout: 10000,
          retryAttempts: 3,
          monitoring: true,
          status: 'pending' as const,
          responseTime: 0,
          history: []
        },
        {
          id: 'mon2',
          type: 'http' as const,
          url: 'https://example2.com',
          checkInterval: 60000,
          timeout: 10000,
          retryAttempts: 3,
          monitoring: true,
          status: 'pending' as const,
          responseTime: 0,
          history: []
        }
      ];
      
      mockDependencies.database.prepare().run.mockReturnValue({ changes: 1 });
      
      const result = await repository.bulkCreate('site1', monitors);
      
      expect(result).toHaveLength(2);
      expect(result.every((m: any) => typeof m.id === 'string')).toBe(true);
    });
  });

  describe('getAllMonitorIds', () => {
    it('should return all monitor ids', async () => {
      const mockIds = [{ id: 1 }, { id: 2 }, { id: 3 }];
      
      mockDependencies.database.prepare().all.mockReturnValue(mockIds);
      
      const result = await repository.getAllMonitorIds();
      
      expect(mockDependencies.database.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(mockIds);
    });
  });
});
