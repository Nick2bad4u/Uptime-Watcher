/**
 * @fileoverview ServiceContainer Core Services Tests
 * @description Focused tests for core service creation in ServiceContainer
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { ServiceContainer } from '../../services/ServiceContainer.js';

// Create mock TypedEventBus class that extends EventEmitter
class MockTypedEventBus extends EventEmitter {
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
    public off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }
    public addMiddleware = vi.fn();
    public removeMiddleware = vi.fn();
    public clearMiddleware = vi.fn();
    public getMiddleware = vi.fn().mockReturnValue([]);
    public destroy = vi.fn();
}

// Mock the TypedEventBus module
vi.mock('../../events/TypedEventBus.js', () => ({
    TypedEventBus: MockTypedEventBus
}));

// Mock all other dependencies to focus on core service creation
vi.mock('../../services/database/DatabaseService.js', () => ({
    DatabaseService: { getInstance: vi.fn() }
}));

vi.mock('../../services/database/HistoryRepository.js', () => ({
    HistoryRepository: vi.fn()
}));

vi.mock('../../services/database/MonitorRepository.js', () => ({
    MonitorRepository: vi.fn()
}));

vi.mock('../../services/database/SettingsRepository.js', () => ({
    SettingsRepository: vi.fn()
}));

vi.mock('../../services/database/SiteRepository.js', () => ({
    SiteRepository: vi.fn()
}));

describe('ServiceContainer - Core Services', () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe('Database Core Services', () => {
        it('should create DatabaseService singleton', () => {
            expect(() => {
                container.getDatabaseService();
            }).not.toThrow();
        });

        it('should create HistoryRepository singleton', () => {
            expect(() => {
                container.getHistoryRepository();
            }).not.toThrow();
        });

        it('should create MonitorRepository singleton', () => {
            expect(() => {
                container.getMonitorRepository();
            }).not.toThrow();
        });

        it('should create SettingsRepository singleton', () => {
            expect(() => {
                container.getSettingsRepository();
            }).not.toThrow();
        });

        it('should create SiteRepository singleton', () => {
            expect(() => {
                container.getSiteRepository();
            }).not.toThrow();
        });

        it('should return same instance on multiple calls', () => {
            const db1 = container.getDatabaseService();
            const db2 = container.getDatabaseService();
            expect(db1).toBe(db2);
        });
    });

    describe('Service Singleton Pattern', () => {
        it('should maintain singleton across all core services', () => {
            const history1 = container.getHistoryRepository();
            const history2 = container.getHistoryRepository();
            const monitor1 = container.getMonitorRepository();
            const monitor2 = container.getMonitorRepository();

            expect(history1).toBe(history2);
            expect(monitor1).toBe(monitor2);
        });

        it('should handle service dependencies without circular references', () => {
            expect(() => {
                container.getDatabaseService();
                container.getHistoryRepository();
                container.getMonitorRepository();
                container.getSettingsRepository();
                container.getSiteRepository();
            }).not.toThrow();
        });
    });

    describe('Service Management', () => {
        it('should handle service creation without errors', () => {
            expect(() => {
                container.getDatabaseService();
                container.getHistoryRepository();
            }).not.toThrow();
        });

        it('should maintain service state across calls', () => {
            const db1 = container.getDatabaseService();
            const db2 = container.getDatabaseService();
            expect(db1).toBe(db2);
        });
    });
});
