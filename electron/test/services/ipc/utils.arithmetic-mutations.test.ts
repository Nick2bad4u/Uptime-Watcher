/**
 * Tests for ArithmeticOperator mutations in electron/services/ipc/utils.ts
 * These tests target specific mutations that survived Stryker testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock logger and environment utilities used indirectly via electronUtils.isDev()
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

// Mock electronUtils isDev (actual utils.ts imports from ../../electronUtils)
vi.mock("../../electronUtils", () => ({
    isDev: vi.fn(() => true),
}));

import {
    withIpcHandler,
    withIpcHandlerValidation,
} from "../../../services/ipc/utils";

describe("ArithmeticOperator Mutations - electron/services/ipc/utils.ts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("withIpcHandler duration calculation (Line 234: Date.now() - startTime)", () => {
        it("should calculate duration correctly for successful operations", async () => {
            const handler = vi.fn().mockResolvedValue("test-result");

            const startTime = 1000;
            const endTime = 1750;
            vi.setSystemTime(startTime);

            const resultPromise = withIpcHandler("test-channel", handler);

            vi.setSystemTime(endTime);
            const result = await resultPromise;

            // Verify the result includes the correct duration (750ms)
            expect(result).toEqual({
                success: true,
                data: "test-result",
                metadata: {
                    duration: 750,
                    handler: "test-channel",
                },
            });

            // If mutation (Date.now() + startTime) was applied, we'd get 2750ms instead of 750ms
            expect(result.metadata?.["duration"]).not.toBe(2750);
        });
        it("should calculate duration correctly for failed operations", async () => {
            const error = new Error("Test error");
            const handler = vi.fn().mockRejectedValue(error);

            const startTime = 2000;
            const endTime = 2500;
            vi.setSystemTime(startTime);

            const resultPromise = withIpcHandler("test-channel", handler);

            vi.setSystemTime(endTime);
            const result = await resultPromise;

            // Verify the error result includes the correct duration (500ms)
            expect(result).toEqual({
                success: false,
                error: "Test error",
                metadata: {
                    duration: 500,
                    handler: "test-channel",
                },
            });

            // If mutation (Date.now() + startTime) was applied, we'd get 4500ms instead of 500ms
            expect(result.metadata?.["duration"]).not.toBe(4500);
        });
    });

    describe("withIpcHandlerValidation duration calculations (Lines 315, 326)", () => {
        it("should calculate duration correctly for successful parameterized operations", async () => {
            const handler = vi.fn().mockResolvedValue("param-result");
            const validateParams = vi.fn().mockReturnValue(null); // No validation errors

            const startTime = 3000;
            const endTime = 3300;
            vi.setSystemTime(startTime);

            const resultPromise = withIpcHandlerValidation(
                "param-channel",
                handler,
                validateParams,
                ["param1", "param2"]
            );

            vi.setSystemTime(endTime);
            const result = await resultPromise;

            // Verify the result includes the correct duration (300ms)
            expect(result).toEqual({
                success: true,
                data: "param-result",
                metadata: {
                    duration: 300,
                    handler: "param-channel",
                    paramCount: 2,
                },
            });

            // Verify handler was called with correct parameters
            expect(handler).toHaveBeenCalledWith("param1", "param2");

            // If mutation (Date.now() + startTime) was applied, we'd get 6300ms instead of 300ms
            expect(result.metadata?.["duration"]).not.toBe(6300);
        });

        it("should calculate duration correctly for failed parameterized operations", async () => {
            const error = new Error("Param error");
            const handler = vi.fn().mockRejectedValue(error);
            const validateParams = vi.fn().mockReturnValue(null); // No validation errors

            const startTime = 4000;
            const endTime = 4600;
            vi.setSystemTime(startTime);

            const resultPromise = withIpcHandlerValidation(
                "param-channel",
                handler,
                validateParams,
                ["param1"]
            );

            vi.setSystemTime(endTime);
            const result = await resultPromise;

            // Verify the error result includes the correct duration (600ms)
            expect(result).toEqual({
                success: false,
                error: "Param error",
                metadata: {
                    duration: 600,
                    handler: "param-channel",
                    paramCount: 1,
                },
            });

            // If mutation (Date.now() + startTime) was applied, we'd get 8600ms instead of 600ms
            expect(result.metadata?.["duration"]).not.toBe(8600);
        });

        it("should not calculate duration for validation failures (early return)", async () => {
            const handler = vi.fn();
            const validateParams = vi
                .fn()
                .mockReturnValue(["Invalid parameter"]);

            const result = await withIpcHandlerValidation(
                "validate-channel",
                handler,
                validateParams,
                ["invalid-param"]
            );

            // Verify validation error response doesn't include duration
            // (since it short-circuits before the main handler execution)
            expect(result).toEqual({
                success: false,
                error: "Parameter validation failed: Invalid parameter",
                metadata: {
                    handler: "validate-channel",
                    paramCount: 1,
                    validationErrors: ["Invalid parameter"],
                },
            });

            // Handler should not have been called due to validation failure
            expect(handler).not.toHaveBeenCalled();

            // No duration should be present in validation failures
            expect(result.metadata).not.toHaveProperty("duration");
        });
    });
});
