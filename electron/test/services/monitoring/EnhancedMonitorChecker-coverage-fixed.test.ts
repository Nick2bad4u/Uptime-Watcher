/**
 * @fileoverview Comprehensive coverage tests for EnhancedMonitorChecker.ts
 * 
 * This test file targets all uncovered lines and branches in EnhancedMonitorChecker.ts
 * to boost coverage from 43.4% to maximum coverage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMonitorChecker } from '../../../services/monitoring/EnhancedMonitorChecker';
import type { Site } from '../../../../shared/types';

describe('EnhancedMonitorChecker Coverage Tests', () => {
  let enhancedChecker: EnhancedMonitorChecker;
  let mockEventBus: any;
  let mockSitesCache: any;
  let mockSiteRepository: any;
  let mockMonitorRepository: any;
  let mockHistoryRepository: any;
  let mockOperationRegistry: any;
  let mockMonitorFactory: any;
  let mockTimeoutManager: any;
  let mockStatusUpdateService: any;

  beforeEach(() => {
    // Create mock dependencies
    mockEventBus = {
      emit: vi.fn(),
    };

    mockSitesCache = {
      get: vi.fn(),
    };

    mockSiteRepository = {
      findByIdentifier: vi.fn(),
    };

    mockMonitorRepository = {
      update: vi.fn(),
    };

    mockHistoryRepository = {
      create: vi.fn(),
    };

    mockOperationRegistry = {
      initiateCheck: vi.fn(),
      validateOperation: vi.fn(),
      completeOperation: vi.fn(),
      cancelOperations: vi.fn(),
    };

    mockMonitorFactory = {
      getMonitor: vi.fn(),
    };

    mockTimeoutManager = {
      createTimeout: vi.fn(),
    };

    mockStatusUpdateService = {
      updateMonitorStatus: vi.fn(),
    };

    // Create the EnhancedMonitorChecker instance
    enhancedChecker = new EnhancedMonitorChecker({
      eventBus: mockEventBus,
      sitesCache: mockSitesCache,
      siteRepository: mockSiteRepository,
      monitorRepository: mockMonitorRepository,
      historyRepository: mockHistoryRepository,
      operationRegistry: mockOperationRegistry,
      monitorFactory: mockMonitorFactory,
      timeoutManager: mockTimeoutManager,
      statusUpdateService: mockStatusUpdateService,
    });
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with all dependencies', () => {
      const checker = new EnhancedMonitorChecker({
        eventBus: mockEventBus,
        sitesCache: mockSitesCache,
        siteRepository: mockSiteRepository,
        monitorRepository: mockMonitorRepository,
        historyRepository: mockHistoryRepository,
        operationRegistry: mockOperationRegistry,
        monitorFactory: mockMonitorFactory,
        timeoutManager: mockTimeoutManager,
        statusUpdateService: mockStatusUpdateService,
      });

      expect(checker).toBeDefined();
    });
  });

  describe('checkMonitor Method Coverage', () => {
    const mockSite: Site = {
      identifier: 'test-site',
      name: 'Test Site',
      monitoring: true,
      monitors: [{
        id: 'monitor-1',
        type: 'http',
        host: 'example.com',
        path: '/',
        status: 'pending',
        lastChecked: new Date(),
        checkInterval: 30000,
        history: [],
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        timeout: 10000,
      }],
    };

    it('should handle manual check with valid site and monitor', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(true);
      
      const mockMonitorService = {
        check: vi.fn().mockResolvedValue({
          success: true,
          status: 'up',
          responseTime: 200,
        }),
      };
      mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);
      mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(true);

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', true);

      expect(result).toBeDefined();
      expect(mockOperationRegistry.initiateCheck).toHaveBeenCalled();
      expect(mockMonitorService.check).toHaveBeenCalled();
    });

    it('should return undefined for non-existent monitor', async () => {
      const result = await enhancedChecker.checkMonitor(mockSite, 'non-existent-monitor', true);

      expect(result).toBeUndefined();
    });

    it('should handle monitor check failure', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(true);
      
      const mockMonitorService = {
        check: vi.fn().mockResolvedValue({
          success: false,
          status: 'down',
          error: 'Connection timeout',
        }),
      };
      mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);
      mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(true);

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', true);

      expect(result).toBeDefined();
      expect(result?.status).toBe('down');
    });

    it('should handle monitor check returning null result', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(true);
      
      const mockMonitorService = {
        check: vi.fn().mockResolvedValue(null),
      };
      mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', true);

      expect(result).toBeUndefined();
    });

    it('should handle status update service throwing error', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(true);
      
      const mockMonitorService = {
        check: vi.fn().mockResolvedValue({
          success: true,
          status: 'up',
          responseTime: 200,
        }),
      };
      mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);
      mockStatusUpdateService.updateMonitorStatus.mockRejectedValue(new Error('Update failed'));

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', true);

      expect(result).toBeUndefined();
    });
  });

  describe('startMonitoring Method Coverage', () => {
    it('should start monitoring successfully', async () => {
      const result = await enhancedChecker.startMonitoring('test-site', 'monitor-1');

      expect(result).toBe(true);
      expect(mockMonitorRepository.update).toHaveBeenCalledWith('monitor-1', {
        activeOperations: [],
        monitoring: true,
      });
      expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith('monitor-1');
    });

    it('should handle monitor update failure', async () => {
      mockMonitorRepository.update.mockRejectedValue(new Error('Database error'));

      const result = await enhancedChecker.startMonitoring('test-site', 'monitor-1');

      expect(result).toBe(false);
    });

    it('should handle successful monitoring start with event emission', async () => {
      const result = await enhancedChecker.startMonitoring('test-site', 'monitor-2');

      expect(result).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledWith('internal:monitor:started', expect.objectContaining({
        identifier: 'test-site',
        monitorId: 'monitor-2',
        operation: 'started'
      }));
    });

    it('should handle event emission error gracefully', async () => {
      mockEventBus.emit.mockRejectedValue(new Error('Event emission failed'));

      const result = await enhancedChecker.startMonitoring('test-site', 'monitor-1');

      expect(result).toBe(false);
    });
  });

  describe('stopMonitoring Method Coverage', () => {
    it('should stop monitoring and cancel operations', async () => {
      const result = await enhancedChecker.stopMonitoring('test-site', 'monitor-1');

      expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith('monitor-1');
      expect(mockMonitorRepository.update).toHaveBeenCalledWith('monitor-1', {
        activeOperations: [],
        monitoring: false,
      });
      expect(result).toBe(true);
    });

    it('should handle successful stop with event emission', async () => {
      const result = await enhancedChecker.stopMonitoring('test-site', 'monitor-2');

      expect(result).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledWith('internal:monitor:stopped', expect.objectContaining({
        identifier: 'test-site',
        monitorId: 'monitor-2',
        operation: 'stopped',
        reason: 'user'
      }));
    });

    it('should handle stop monitoring errors', async () => {
      mockMonitorRepository.update.mockRejectedValue(new Error('Database update failed'));

      const result = await enhancedChecker.stopMonitoring('test-site', 'monitor-1');

      expect(result).toBe(false);
    });
  });

  describe('Operation Registry Integration', () => {
    it('should cover operation registry cancellation', async () => {
      const result = await enhancedChecker.startMonitoring('test-site', 'monitor-3');

      expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith('monitor-3');
      expect(result).toBe(true);
    });

    it('should cover repository integration', async () => {
      const result = await enhancedChecker.stopMonitoring('test-site', 'monitor-1');

      expect(mockMonitorRepository.update).toHaveBeenCalledWith('monitor-1', {
        activeOperations: [],
        monitoring: false,
      });
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle operation validation failure', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(false);

      const mockSite: Site = {
        identifier: 'test-site',
        name: 'Test Site',
        monitoring: true,
        monitors: [{
          id: 'monitor-1',
          type: 'http',
          host: 'example.com',
          path: '/',
          status: 'pending',
          lastChecked: new Date(),
          checkInterval: 30000,
          history: [],
          monitoring: true,
          responseTime: 0,
          retryAttempts: 3,
          timeout: 10000,
        }],
      };

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', false);

      expect(result).toBeUndefined();
    });

    it('should handle monitor factory returning null', async () => {
      const operationId = 'op-123';
      mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
      mockOperationRegistry.validateOperation.mockReturnValue(true);
      mockMonitorFactory.getMonitor.mockReturnValue(null);

      const mockSite: Site = {
        identifier: 'test-site',
        name: 'Test Site',
        monitoring: true,
        monitors: [{
          id: 'monitor-1',
          type: 'http',
          host: 'example.com',
          path: '/',
          status: 'pending',
          lastChecked: new Date(),
          checkInterval: 30000,
          history: [],
          monitoring: true,
          responseTime: 0,
          retryAttempts: 3,
          timeout: 10000,
        }],
      };

      const result = await enhancedChecker.checkMonitor(mockSite, 'monitor-1', true);

      expect(result).toBeUndefined();
    });
  });
});
