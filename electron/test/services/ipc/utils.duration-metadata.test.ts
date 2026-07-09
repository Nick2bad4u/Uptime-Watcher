/**
 * Tests for IPC handler duration metadata.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    withIpcHandler,
    withIpcHandlerValidation,
} from "../../../services/ipc/utils";

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

describe("IPC handler duration metadata", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe("withIpcHandler duration calculation", () => {
        it("should calculate duration correctly for successful operations", async () => {
            const handler = vi.fn().mockResolvedValue("test-result");

            const startTime = 1000;
            const endTime = 1750;
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const result = await withIpcHandler("test-channel", handler);

            expect(result).toEqual({
                success: true,
                data: "test-result",
                metadata: {
                    duration: 750,
                    handler: "test-channel",
                },
            });

            expect(result.metadata?.["duration"]).not.toBe(2750);
        });
        it("should calculate duration correctly for failed operations", async () => {
            const error = new Error("Test error");
            const handler = vi.fn().mockRejectedValue(error);

            const startTime = 2000;
            const endTime = 2500;
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const result = await withIpcHandler("test-channel", handler);

            expect(result).toEqual({
                success: false,
                error: "Test error",
                metadata: {
                    duration: 500,
                    handler: "test-channel",
                },
            });

            expect(result.metadata?.["duration"]).not.toBe(4500);
        });

        it("uses monotonic time when the wall clock moves backward", async () => {
            const handler = vi.fn().mockResolvedValue("test-result");

            vi.spyOn(Date, "now")
                .mockReturnValueOnce(10_000)
                .mockReturnValueOnce(9000);
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(175);

            const result = await withIpcHandler("test-channel", handler);

            expect(result.metadata?.["duration"]).toBe(75);
        });
    });

    describe("withIpcHandlerValidation duration calculations", () => {
        it("should calculate duration correctly for successful parameterized operations", async () => {
            const handler = vi.fn().mockResolvedValue("param-result");
            const validateParams = vi.fn().mockReturnValue(null); // No validation errors

            const startTime = 3000;
            const endTime = 3300;
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const result = await withIpcHandlerValidation(
                "param-channel",
                handler,
                validateParams,
                ["param1", "param2"]
            );

            expect(result).toEqual({
                success: true,
                data: "param-result",
                metadata: {
                    duration: 300,
                    handler: "param-channel",
                    paramCount: 2,
                },
            });

            expect(handler).toHaveBeenCalledWith("param1", "param2");

            expect(result.metadata?.["duration"]).not.toBe(6300);
        });

        it("should calculate duration correctly for failed parameterized operations", async () => {
            const error = new Error("Param error");
            const handler = vi.fn().mockRejectedValue(error);
            const validateParams = vi.fn().mockReturnValue(null); // No validation errors

            const startTime = 4000;
            const endTime = 4600;
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const result = await withIpcHandlerValidation(
                "param-channel",
                handler,
                validateParams,
                ["param1"]
            );

            expect(result).toEqual({
                success: false,
                error: "Param error",
                metadata: {
                    duration: 600,
                    handler: "param-channel",
                    paramCount: 1,
                },
            });

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

            expect(result).toEqual({
                success: false,
                error: "Parameter validation failed: Invalid parameter",
                metadata: {
                    handler: "validate-channel",
                    paramCount: 1,
                    validationErrors: ["Invalid parameter"],
                },
            });

            expect(handler).not.toHaveBeenCalled();

            expect(result.metadata).not.toHaveProperty("duration");
        });
    });
});
