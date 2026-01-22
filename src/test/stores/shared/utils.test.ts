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

import { logStoreAction } from "../../../stores/utils";
import {
    resetProcessSnapshotOverrideForTesting,
    setProcessSnapshotOverrideForTesting,
} from "@shared/utils/environment";
import { logger } from "@app/services/logger";

const mockLogger = vi.mocked(logger);

describe("Store Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(logger, "info").mockReturnValue(undefined);

        // Default to development mode (logStoreAction should log).
        setProcessSnapshotOverrideForTesting({
            env: {
                NODE_ENV: "development",
            },
        });
    });

    afterEach(() => {
        resetProcessSnapshotOverrideForTesting();

        vi.restoreAllMocks();
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

            setProcessSnapshotOverrideForTesting({
                env: {
                    NODE_ENV: "production",
                },
            });

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

            setProcessSnapshotOverrideForTesting({
                env: {
                    NODE_ENV: "production",
                },
            });
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
            ])(
                "should log any valid payload in development mode",
                (storeName, actionName, payload) => {
                    vi.clearAllMocks();

                    logStoreAction(storeName, actionName, payload);

                    expect(mockLogger.info).toHaveBeenCalledWith(
                        `[${storeName}] ${actionName}`,
                        payload
                    );
                }
            );

            test.prop([
                storeNameArbitrary,
                actionNameArbitrary,
                payloadArbitrary,
            ])(
                "should never log in production mode regardless of payload",
                (storeName, actionName, payload) => {
                    setProcessSnapshotOverrideForTesting({
                        env: {
                            NODE_ENV: "production",
                        },
                    });
                    vi.clearAllMocks();

                    logStoreAction(storeName, actionName, payload);

                    expect(mockLogger.info).not.toHaveBeenCalled();
                }
            );

            test.prop([storeNameArbitrary, actionNameArbitrary])(
                "should handle undefined payload consistently",
                (storeName, actionName) => {
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
