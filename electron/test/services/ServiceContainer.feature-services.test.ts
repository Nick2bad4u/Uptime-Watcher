/**
 * Focused tests for feature service creation in ServiceContainer
 *
 * @file ServiceContainer Feature Services Tests
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

// Mock simple feature services
vi.mock("../../services/notifications/NotificationService.js", () => ({
    NotificationService: vi.fn(),
}));

vi.mock("../../services/updater/AutoUpdaterService.js", () => ({
    AutoUpdaterService: vi.fn(),
}));

vi.mock("../../services/window/WindowService.js", () => ({
    WindowService: vi.fn(),
}));

describe("ServiceContainer - Feature Services", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Notification Services", () => {
        it("should create NotificationService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getNotificationService();
            }).not.toThrowError();
        });

        it("should create NotificationService with default settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getNotificationService();
            }).not.toThrowError();
        });

        it("should maintain NotificationService singleton pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const notification1 = container.getNotificationService();
            const notification2 = container.getNotificationService();
            expect(notification1).toBe(notification2);
        });
    });

    describe("Auto Updater Services", () => {
        it("should create AutoUpdaterService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getAutoUpdaterService();
            }).not.toThrowError();
        });

        it("should handle AutoUpdaterService initialization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const updater = container.getAutoUpdaterService();
            expect(updater).toBeDefined();
        });
    });

    describe("Window Services", () => {
        it("should create WindowService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getWindowService();
            }).not.toThrowError();
        });

        it("should maintain WindowService singleton pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window1 = container.getWindowService();
            const window2 = container.getWindowService();
            expect(window1).toBe(window2);
        });
    });

    describe("Feature Service Integration", () => {
        it("should create all feature services without conflicts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(() => {
                container.getNotificationService();
                container.getAutoUpdaterService();
                container.getWindowService();
            }).not.toThrowError();
        });

        it("should handle service creation without configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                container.getNotificationService();
                container.getAutoUpdaterService();
                container.getWindowService();
            }).not.toThrowError();
        });

        it("should maintain service independence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const notification = container.getNotificationService();
            const updater = container.getAutoUpdaterService();
            const window = container.getWindowService();

            expect(notification).not.toBe(updater);
            expect(updater).not.toBe(window);
            expect(notification).not.toBe(window);
        });
    });

    describe("Service Error Handling", () => {
        it("should handle repeated service creation calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                for (let i = 0; i < 3; i++) {
                    container.getNotificationService();
                    container.getAutoUpdaterService();
                    container.getWindowService();
                }
            }).not.toThrowError();
        });

        it("should maintain service references across multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ServiceContainer.feature-services",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const notification1 = container.getNotificationService();
            const notification2 = container.getNotificationService();
            const notification3 = container.getNotificationService();

            expect(notification1).toBe(notification2);
            expect(notification2).toBe(notification3);
        });
    });
});
