/**
 * Focused tests for core service creation in ServiceContainer
 *
 * @file ServiceContainer Core Services Tests
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

// Mock all other dependencies to focus on core service creation
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

describe("ServiceContainer - Core Services", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Database Core Services", () => {
        it("should create DatabaseService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getDatabaseService();
            }).not.toThrowError();
        });

        it("should create HistoryRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getHistoryRepository();
            }).not.toThrowError();
        });

        it("should create MonitorRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getMonitorRepository();
            }).not.toThrowError();
        });

        it("should create SettingsRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getSettingsRepository();
            }).not.toThrowError();
        });

        it("should create SiteRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getSiteRepository();
            }).not.toThrowError();
        });

        it("should return same instance on multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const db1 = container.getDatabaseService();
            const db2 = container.getDatabaseService();
            expect(db1).toBe(db2);
        });
    });

    describe("Service Singleton Pattern", () => {
        it("should maintain singleton across all core services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const history1 = container.getHistoryRepository();
            const history2 = container.getHistoryRepository();
            const monitor1 = container.getMonitorRepository();
            const monitor2 = container.getMonitorRepository();

            expect(history1).toBe(history2);
            expect(monitor1).toBe(monitor2);
        });

        it("should handle service dependencies without circular references", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                container.getDatabaseService();
                container.getHistoryRepository();
                container.getMonitorRepository();
                container.getSettingsRepository();
                container.getSiteRepository();
            }).not.toThrowError();
        });
    });

    describe("Service Management", () => {
        it("should handle service creation without errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                container.getDatabaseService();
                container.getHistoryRepository();
            }).not.toThrowError();
        });

        it("should maintain service state across calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.core-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const db1 = container.getDatabaseService();
            const db2 = container.getDatabaseService();
            expect(db1).toBe(db2);
        });
    });
});
