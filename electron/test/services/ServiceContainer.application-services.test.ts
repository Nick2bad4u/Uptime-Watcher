/**
 * @fileoverview ServiceContainer Application Services Tests
 * @description Focused tests for application service creation in ServiceContainer
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

// Mock simple application services
vi.mock('../../managers/ConfigurationManager.js', () => ({
    ConfigurationManager: vi.fn()
}));

vi.mock('../../managers/DatabaseManager.js', () => ({
    DatabaseManager: vi.fn()
}));

vi.mock('../../services/site/SiteService.js', () => ({
    SiteService: vi.fn()
}));

// Mock dependencies for application services
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

describe('ServiceContainer - Application Services', () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe('Configuration Services', () => {
        it('should create ConfigurationManager singleton', () => {
            expect(() => {
                container.getConfigurationManager();
            }).not.toThrow();
        });

        it('should return same ConfigurationManager instance', () => {
            const config1 = container.getConfigurationManager();
            const config2 = container.getConfigurationManager();
            expect(config1).toBe(config2);
        });
    });

    describe('Database Management Services', () => {
        it('should create DatabaseManager singleton', () => {
            expect(() => {
                container.getDatabaseManager();
            }).not.toThrow();
        });

        it('should maintain DatabaseManager singleton pattern', () => {
            const manager1 = container.getDatabaseManager();
            const manager2 = container.getDatabaseManager();
            expect(manager1).toBe(manager2);
        });
    });

    describe('Site Services', () => {
        it('should create SiteService singleton', () => {
            expect(() => {
                container.getSiteService();
            }).not.toThrow();
        });

        it('should handle SiteService dependencies correctly', () => {
            const siteService = container.getSiteService();
            expect(siteService).toBeDefined();
        });
    });

    describe('Service Integration', () => {
        it('should create all application services without conflicts', () => {
            expect(() => {
                container.getConfigurationManager();
                container.getDatabaseManager();
                container.getSiteService();
            }).not.toThrow();
        });

        it('should maintain proper service isolation', () => {
            const config = container.getConfigurationManager();
            const dbManager = container.getDatabaseManager();
            const siteService = container.getSiteService();

            expect(config).not.toBe(dbManager);
            expect(dbManager).not.toBe(siteService);
            expect(config).not.toBe(siteService);
        });
    });
});
