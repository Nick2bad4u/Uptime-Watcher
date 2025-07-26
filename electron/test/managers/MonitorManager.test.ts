import { MonitorManager } from '../../managers/MonitorManager';
import { Site, StatusUpdate } from '../../types';
import { vi } from 'vitest';

describe('MonitorManager', () => {
  let manager: MonitorManager;
  let dependencies: any;

  beforeEach(() => {
    dependencies = {
      databaseService: { /* mock */ },
      eventEmitter: { emitTyped: vi.fn() },
      getHistoryLimit: () => 10,
      getSitesCache: () => ({ get: vi.fn(), set: vi.fn() }),
      repositories: {
        history: {},
        monitor: {},
        site: {},
      },
      siteService: {},
    };
    manager = new MonitorManager(dependencies);
  });

  it('should construct without error', () => {
    expect(manager).toBeDefined();
  });

  it('should get active monitor count (default 0)', () => {
    expect(manager.getActiveMonitorCount()).toBe(0);
  });

  it('should return false for isMonitoringActive()', () => {
    expect(manager.isMonitoringActive()).toBe(false);
  });

  it('should call checkSiteManually and emit event', async () => {
    dependencies.getSitesCache = () => ({ get: () => ({ monitors: [] }) });
    dependencies.eventEmitter.emitTyped = vi.fn();
    const result = await manager.checkSiteManually('site-1');
    expect(dependencies.eventEmitter.emitTyped).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
