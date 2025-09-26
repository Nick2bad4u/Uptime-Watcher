/**
 * Test file to verify operational hooks implementation.
 */

import { describe, expect, it, vi } from "vitest";
import {
    withOperationalHooks,
    withDatabaseOperation,
} from "../../utils/operationalHooks";
import { logger } from "../../utils/logger";

describe("Operational Hooks", () => {
    describe(withOperationalHooks, () => {
        it("should successfully execute operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 1,
                emitEvents: false,
            });
            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should retry on failure", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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
        it("should fail after max retries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));

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
        it("should respect custom failure log level", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("cancelled");
            const mockOperation = vi.fn().mockRejectedValue(failure);
            const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {
                // no-op for test isolation
            });
            const errorSpy = vi
                .spyOn(logger, "error")
                .mockImplementation(() => {
                    // no-op for test isolation
                });

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "custom-log-level",
                    maxRetries: 1,
                    emitEvents: false,
                    failureLogLevel: () => "warn",
                })
            ).rejects.toThrow("cancelled");

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("custom-log-level"),
                expect.objectContaining({
                    error: failure,
                    operationId: expect.any(String),
                })
            );
            expect(errorSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
            errorSpy.mockRestore();
        });
        it("should call callbacks correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
    describe(withDatabaseOperation, () => {
        it("should be a specialized wrapper with correct defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
