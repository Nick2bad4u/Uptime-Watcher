/**
 * Tests for useRetry hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useRetry } from "../../hooks/useRetry";

// Mock the logger
vi.mock("../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock correlation utils
vi.mock("../../hooks/correlationUtils", () => ({
    generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

import { monitorLogger } from "../../utils/logger";
import { generateCorrelationId } from "../../hooks/correlationUtils";

describe("useRetry", () => {
    const mockLogger = vi.mocked(monitorLogger);
    const mockGenerateCorrelationId = vi.mocked(generateCorrelationId);

    beforeEach(() => {
        vi.clearAllMocks();
        mockGenerateCorrelationId.mockReturnValue("test-correlation-id");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should succeed on first attempt", async () => {
        const retry = useRetry();
        const mockOperation = vi.fn().mockResolvedValue("success");

        const result = await retry(mockOperation, { maxAttempts: 3, delay: 100 });

        expect(result).toBe("success");
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1/3");
        expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should retry on failure and eventually succeed", async () => {
        const retry = useRetry();
        const mockOperation = vi
            .fn()
            .mockRejectedValueOnce(new Error("Attempt 1 failed"))
            .mockRejectedValueOnce(new Error("Attempt 2 failed"))
            .mockResolvedValue("success");

        const result = await retry(mockOperation, { maxAttempts: 3, delay: 50 });

        expect(result).toBe("success");
        expect(mockOperation).toHaveBeenCalledTimes(3);
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1/3");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1 failed, retrying in 50ms");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 2/3");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 2 failed, retrying in 50ms");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 3/3");
        expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should fail after max attempts with linear backoff", async () => {
        const retry = useRetry();
        const mockError = new Error("Operation failed");
        const mockOperation = vi.fn().mockRejectedValue(mockError);

        await expect(retry(mockOperation, { maxAttempts: 2, delay: 50, backoff: "linear" })).rejects.toThrow(
            "Operation failed"
        );

        expect(mockOperation).toHaveBeenCalledTimes(2);
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1/2");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1 failed, retrying in 50ms");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 2/2");
        expect(mockLogger.error).toHaveBeenCalledWith("[Retry:test-correlation-id] Failed after 2 attempts", mockError);
    });

    it("should use exponential backoff when specified", async () => {
        const retry = useRetry();
        const mockError = new Error("Operation failed");
        const mockOperation = vi.fn().mockRejectedValue(mockError);

        await expect(retry(mockOperation, { maxAttempts: 3, delay: 100, backoff: "exponential" })).rejects.toThrow(
            "Operation failed"
        );

        expect(mockOperation).toHaveBeenCalledTimes(3);
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1/3");
        expect(mockLogger.debug).toHaveBeenCalledWith(
            "[Retry:test-correlation-id] Attempt 1 failed, retrying in 100ms"
        );
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 2/3");
        expect(mockLogger.debug).toHaveBeenCalledWith(
            "[Retry:test-correlation-id] Attempt 2 failed, retrying in 200ms"
        );
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 3/3");
    });

    it("should handle single attempt scenarios", async () => {
        const retry = useRetry();
        const mockError = new Error("Single attempt failed");
        const mockOperation = vi.fn().mockRejectedValue(mockError);

        await expect(retry(mockOperation, { maxAttempts: 1, delay: 100 })).rejects.toThrow("Single attempt failed");

        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1/1");
        expect(mockLogger.error).toHaveBeenCalledWith("[Retry:test-correlation-id] Failed after 1 attempts", mockError);
    });

    it("should wait correct amount of time between retries", async () => {
        const retry = useRetry();
        const mockOperation = vi.fn().mockRejectedValue(new Error("Failed"));

        const startTime = Date.now();

        await expect(retry(mockOperation, { maxAttempts: 2, delay: 100 })).rejects.toThrow();

        const duration = Date.now() - startTime;
        // Should take at least 100ms for the delay, but allow for timing variations
        expect(duration).toBeGreaterThanOrEqual(90);
        expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it("should calculate exponential backoff correctly", async () => {
        const retry = useRetry();
        const mockOperation = vi
            .fn()
            .mockRejectedValueOnce(new Error("Attempt 1"))
            .mockRejectedValueOnce(new Error("Attempt 2"))
            .mockRejectedValueOnce(new Error("Attempt 3"));

        await expect(retry(mockOperation, { maxAttempts: 3, delay: 10, backoff: "exponential" })).rejects.toThrow();

        // Check that delays were logged correctly for exponential backoff
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 1 failed, retrying in 10ms");
        expect(mockLogger.debug).toHaveBeenCalledWith("[Retry:test-correlation-id] Attempt 2 failed, retrying in 20ms");
    });
});
