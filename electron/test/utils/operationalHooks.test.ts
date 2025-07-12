/**
 * Test file to verify operational hooks implementation.
 */

import { describe, expect, it, vi } from "vitest";
import { withOperationalHooks, withDatabaseOperation } from "../../utils/operationalHooks";

describe("Operational Hooks", () => {
    describe("withOperationalHooks", () => {
        it("should successfully execute operation", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");
            
            const result = await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 1,
                emitEvents: false,
            });
            
            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });

        it("should retry on failure", async () => {
            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockResolvedValue("success");
            
            const result = await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 2,
                initialDelay: 1, // Very short delay for testing
                emitEvents: false,
            });
            
            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });

        it("should fail after max retries", async () => {
            const mockOperation = vi.fn().mockRejectedValue(new Error("Persistent failure"));
            
            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "test-operation",
                    maxRetries: 2,
                    initialDelay: 1,
                    emitEvents: false,
                })
            ).rejects.toThrow("Persistent failure");
            
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });

        it("should call callbacks correctly", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");
            const onSuccess = vi.fn();
            const onRetry = vi.fn();
            const onFailure = vi.fn();
            
            await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 1,
                emitEvents: false,
                onSuccess,
                onRetry,
                onFailure,
            });
            
            expect(onSuccess).toHaveBeenCalledWith("success");
            expect(onRetry).not.toHaveBeenCalled();
            expect(onFailure).not.toHaveBeenCalled();
        });
    });

    describe("withDatabaseOperation", () => {
        it("should be a specialized wrapper with correct defaults", async () => {
            const mockOperation = vi.fn().mockResolvedValue("db-result");
            
            const result = await withDatabaseOperation(
                mockOperation,
                "test-db-operation"
            );
            
            expect(result).toBe("db-result");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
    });
});
