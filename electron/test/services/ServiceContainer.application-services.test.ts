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

    // eslint-disable-next-line unicorn/prefer-event-target -- Tests rely on Node.js EventEmitter semantics for parity with production TypedEventBus.
    class MockTypedEventBus extends EventEmitter {
        public readonly busId: string;

        public readonly emitTyped = vi.fn().mockResolvedValue(undefined);

        public readonly destroy = vi.fn();

        public constructor(name?: string) {
            super();
            this.busId = name ?? "test-bus";
        }

        public onTyped(
            event: string,
            listener: (payload: unknown) => void
        ): this {
            const emitter = this as unknown as {
                on: (
                    eventName: string,
                    registered: (payload: unknown) => void
                ) => MockTypedEventBus;
            };
            emitter.on(event, listener);
            return this;
        }
    }

    return {
        TypedEventBus: MockTypedEventBus,
    };
});

// Mock simple application services
vi.mock("../../managers/ConfigurationManager.js", () => ({
    ConfigurationManager: vi.fn(),
}));

vi.mock("../../managers/DatabaseManager.js", () => ({
    DatabaseManager: vi.fn(),
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
        it("should create ConfigurationManager singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getConfigurationManager();
            }).not.toThrowError();
        });

        it("should return same ConfigurationManager instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config1 = container.getConfigurationManager();
            const config2 = container.getConfigurationManager();
            expect(config1).toBe(config2);
        });
    });

    describe("Database Management Services", () => {
        it("should create DatabaseManager singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getDatabaseManager();
            }).not.toThrowError();
        });

        it("should maintain DatabaseManager singleton pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const manager1 = container.getDatabaseManager();
            const manager2 = container.getDatabaseManager();
            expect(manager1).toBe(manager2);
        });
    });

    describe("Site Manager", () => {
        it("should create SiteManager singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getSiteManager();
            }).not.toThrowError();
        });

        it("should handle SiteManager dependencies correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const siteManager = container.getSiteManager();
            expect(siteManager).toBeDefined();
        });
    });

    describe("Service Integration", () => {
        it("should create all application services without conflicts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getConfigurationManager();
                container.getDatabaseManager();
                container.getSiteManager();
            }).not.toThrowError();
        });

        it("should maintain proper service isolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.application-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config = container.getConfigurationManager();
            const dbManager = container.getDatabaseManager();
            const siteManager = container.getSiteManager();

            expect(config).not.toBe(dbManager);
            expect(dbManager).not.toBe(siteManager);
            expect(config).not.toBe(siteManager);
        });
    });
});
