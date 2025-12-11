/**
 * Tests for shared store utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

/** Arbitrary for generating valid store names */
const storeNameArbitrary = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((value) => value.trim().length > 0)
    .map((value) => value.replaceAll(/\s/g, ""))
    .filter((value) => /^[\w-]+$/u.test(value));

/** Arbitrary for generating valid action names */
const actionNameArbitrary = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((value) => value.trim().length > 0)
    .map((value) => value.replaceAll(/\s/g, ""))
    .filter((value) => /^[\w-]+$/u.test(value));

/** Arbitrary for generating valid payload objects */
const payloadArbitrary = fc.oneof(
    fc.object({ maxDepth: 2, maxKeys: 5 }),
    fc.array(fc.anything(), { maxLength: 10 }),
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null)
);

// Mock the logger
vi.mock("../../../services/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        app: {
            started: vi.fn(),
            error: vi.fn(),
        },
        site: {
            error: vi.fn(),
            info: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
        system: {
            error: vi.fn(),
            info: vi.fn(),
        },
    },
}));

// Mock environment functions
vi.mock("../../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(),
}));

import { logStoreAction } from "../../../stores/utils";
import { isDevelopment } from "../../../../shared/utils/environment";
import { logger } from "../../../services/logger";

// Get the mocked versions
const mockIsDevelopment = vi.mocked(isDevelopment);
const mockLogger = vi.mocked(logger);

describe("Store Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(logStoreAction, () => {
        it("should log action without payload in development", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction");

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction"
            );
        });

        it("should log action with payload in development", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);
            const payload = { test: "data" };

            logStoreAction("TestStore", "testAction", payload);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                payload
            );
        });

        it("should not log action in production", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            mockIsDevelopment.mockReturnValue(false);

            logStoreAction("TestStore", "testAction");

            expect(mockLogger.info).not.toHaveBeenCalled();
        });

        it("should not log action with payload in production", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(false);
            const payload = { test: "data" };

            logStoreAction("TestStore", "testAction", payload);

            expect(mockLogger.info).not.toHaveBeenCalled();
        });

        it("should handle undefined payload explicitly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", undefined);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction"
            );
        });

        it("should handle null payload", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", null);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                null
            );
        });

        it("should handle empty string payload", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", "");

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                ""
            );
        });

        it("should handle number payload", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", 42);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                42
            );
        });

        it("should handle boolean payload", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: utils", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", true);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                true
            );
        });

        describe("Property-based Tests", () => {
            test.prop([storeNameArbitrary, actionNameArbitrary])(
                "should format log message correctly for any valid store and action names in development",
                (storeName, actionName) => {
                    mockIsDevelopment.mockReturnValue(true);
                    vi.clearAllMocks();

                    logStoreAction(storeName, actionName);

                    expect(mockLogger.info).toHaveBeenCalledWith(
                        `[${storeName}] ${actionName}`
                    );
                }
            );

            test.prop([
                storeNameArbitrary,
                actionNameArbitrary,
                payloadArbitrary,
            ])("should log any valid payload in development mode", (
                storeName,
                actionName,
                payload
            ) => {
                mockIsDevelopment.mockReturnValue(true);
                vi.clearAllMocks();

                logStoreAction(storeName, actionName, payload);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    `[${storeName}] ${actionName}`,
                    payload
                );
            });

            test.prop([
                storeNameArbitrary,
                actionNameArbitrary,
                payloadArbitrary,
            ])("should never log in production mode regardless of payload", (
                storeName,
                actionName,
                payload
            ) => {
                mockIsDevelopment.mockReturnValue(false);
                vi.clearAllMocks();

                logStoreAction(storeName, actionName, payload);

                expect(mockLogger.info).not.toHaveBeenCalled();
            });

            test.prop([storeNameArbitrary, actionNameArbitrary])(
                "should handle undefined payload consistently",
                (storeName, actionName) => {
                    mockIsDevelopment.mockReturnValue(true);
                    vi.clearAllMocks();

                    logStoreAction(storeName, actionName, undefined);

                    expect(mockLogger.info).toHaveBeenCalledWith(
                        `[${storeName}] ${actionName}`
                    );
                }
            );
        });
    });
});
