/**
 * Focused tests for application service creation in ServiceContainer
 *
 * @file ServiceContainer Application Services Tests
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../../services/ServiceContainer.js";

// Mock the TypedEventBus module with factory function
vi.mock("../../events/TypedEventBus.js", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");

    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();

            // Add TypedEventBus-specific methods
            return Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn().mockResolvedValue(undefined),
                busId: name || "test-bus",
                destroy: vi.fn(),
            });
        }),
    };
});

// Mock simple application services
vi.mock("../../managers/ConfigurationManager.js", () => ({
    ConfigurationManager: vi.fn(),
}));

vi.mock("../../managers/DatabaseManager.js", () => ({
    DatabaseManager: vi.fn(),
}));

vi.mock("../../services/site/SiteService.js", () => ({
    SiteService: vi.fn(),
}));

// Mock dependencies for application services
vi.mock("../../services/database/DatabaseService.js", () => ({
    DatabaseService: { getInstance: vi.fn() },
}));

vi.mock("../../services/database/HistoryRepository.js", () => ({
    HistoryRepository: vi.fn(),
}));

vi.mock("../../services/database/MonitorRepository.js", () => ({
    MonitorRepository: vi.fn(),
}));

vi.mock("../../services/database/SettingsRepository.js", () => ({
    SettingsRepository: vi.fn(),
}));

vi.mock("../../services/database/SiteRepository.js", () => ({
    SiteRepository: vi.fn(),
}));

describe("ServiceContainer - Application Services", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Configuration Services", () => {
        it("should create ConfigurationManager singleton", () => {
            expect(() => {
                container.getConfigurationManager();
            }).not.toThrow();
        });

        it("should return same ConfigurationManager instance", () => {
            const config1 = container.getConfigurationManager();
            const config2 = container.getConfigurationManager();
            expect(config1).toBe(config2);
        });
    });

    describe("Database Management Services", () => {
        it("should create DatabaseManager singleton", () => {
            expect(() => {
                container.getDatabaseManager();
            }).not.toThrow();
        });

        it("should maintain DatabaseManager singleton pattern", () => {
            const manager1 = container.getDatabaseManager();
            const manager2 = container.getDatabaseManager();
            expect(manager1).toBe(manager2);
        });
    });

    describe("Site Services", () => {
        it("should create SiteService singleton", () => {
            expect(() => {
                container.getSiteService();
            }).not.toThrow();
        });

        it("should handle SiteService dependencies correctly", () => {
            const siteService = container.getSiteService();
            expect(siteService).toBeDefined();
        });
    });

    describe("Service Integration", () => {
        it("should create all application services without conflicts", () => {
            expect(() => {
                container.getConfigurationManager();
                container.getDatabaseManager();
                container.getSiteService();
            }).not.toThrow();
        });

        it("should maintain proper service isolation", () => {
            const config = container.getConfigurationManager();
            const dbManager = container.getDatabaseManager();
            const siteService = container.getSiteService();

            expect(config).not.toBe(dbManager);
            expect(dbManager).not.toBe(siteService);
            expect(config).not.toBe(siteService);
        });
    });
});
