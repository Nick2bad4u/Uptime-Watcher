/**
 * @fileoverview Fixed tests for MonitorFactory using correct API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonitorFactory } from '../../../services/monitoring/MonitorFactory';
import { MonitorConfig } from '../../../services/monitoring/types';

describe('MonitorFactory - Fixed', () => {
    let mockMonitorConfig: MonitorConfig;

    beforeEach(() => {
        vi.clearAllMocks();
        mockMonitorConfig = {
            timeout: 5000,
            userAgent: 'Test-Agent/1.0',
        };
    });

    describe('getMonitor', () => {
        it('should get a ping monitor', () => {
            const monitor = MonitorFactory.getMonitor('ping', mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe('function');
        });

        it('should get an http monitor', () => {
            const monitor = MonitorFactory.getMonitor('http', mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe('function');
        });

        it('should get a port monitor', () => {
            const monitor = MonitorFactory.getMonitor('port', mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe('function');
        });

        it('should handle invalid monitor type', () => {
            expect(() => MonitorFactory.getMonitor('invalid' as any, mockMonitorConfig)).toThrow();
        });

        it('should get monitor with configuration', () => {
            const monitor = MonitorFactory.getMonitor('ping', mockMonitorConfig);
            expect(monitor).toBeDefined();
        });
    });

    describe('getAvailableTypes', () => {
        it('should return available monitor types', () => {
            const types = MonitorFactory.getAvailableTypes();
            expect(types).toContain('ping');
            expect(types).toContain('http');
            expect(types).toContain('port');
        });
    });

    describe('clearCache', () => {
        it('should clear monitor cache', () => {
            // Get a monitor to populate cache
            MonitorFactory.getMonitor('ping', mockMonitorConfig);
            
            // Clear cache should not throw
            expect(() => MonitorFactory.clearCache()).not.toThrow();
        });
    });

    describe('updateConfig', () => {
        it('should update config for all monitors', () => {
            const newConfig = { timeout: 10000, userAgent: 'Updated-Agent/1.0' };
            expect(() => MonitorFactory.updateConfig(newConfig)).not.toThrow();
        });
    });
});
