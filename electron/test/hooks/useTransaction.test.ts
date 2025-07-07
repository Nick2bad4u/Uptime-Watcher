/**
 * Tests for useTransaction hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Database } from "node-sqlite3-wasm";

import { useTransaction } from "../../hooks/useTransaction";

// Mock the DatabaseService
vi.mock("../../services/database", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => ({
            executeTransaction: vi.fn(),
        })),
    },
}));

// Mock the logger
vi.mock("../../utils/logger", () => ({
    dbLogger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock correlation utils
vi.mock("../../hooks/correlationUtils", () => ({
    generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

import { DatabaseService } from "../../services/database";
import { dbLogger } from "../../utils/logger";
import { generateCorrelationId } from "../../hooks/correlationUtils";

describe("useTransaction", () => {
    const mockExecuteTransaction = vi.fn();
    const mockDbLogger = vi.mocked(dbLogger);
    const mockGenerateCorrelationId = vi.mocked(generateCorrelationId);

    beforeEach(() => {
        vi.clearAllMocks();
        (DatabaseService.getInstance as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            executeTransaction: mockExecuteTransaction,
        });
        mockGenerateCorrelationId.mockReturnValue("test-correlation-id");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should execute transaction successfully and log completion", async () => {
        const transaction = useTransaction();
        const mockOperation = vi.fn().mockResolvedValue("test-result");

        mockExecuteTransaction.mockImplementation(async (operation: (db: Database) => Promise<string>) => {
            return operation({} as Database);
        });

        const result = await transaction(mockOperation);

        expect(result).toBe("test-result");
        expect(mockGenerateCorrelationId).toHaveBeenCalledOnce();
        expect(mockDbLogger.info).toHaveBeenCalledWith("[Transaction:test-correlation-id] Starting transaction");
        expect(mockDbLogger.info).toHaveBeenCalledWith(
            expect.stringMatching(/\[Transaction:test-correlation-id\] Completed in \d+ms/)
        );
        expect(mockExecuteTransaction).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledWith({});
    });

    it("should handle transaction failure and log error", async () => {
        const transaction = useTransaction();
        const mockError = new Error("Database error");
        const mockOperation = vi.fn().mockRejectedValue(mockError);

        mockExecuteTransaction.mockImplementation(async (operation: (db: Database) => Promise<void>) => {
            return operation({} as Database);
        });

        await expect(transaction(mockOperation)).rejects.toThrow("Database error");

        expect(mockGenerateCorrelationId).toHaveBeenCalledOnce();
        expect(mockDbLogger.info).toHaveBeenCalledWith("[Transaction:test-correlation-id] Starting transaction");
        expect(mockDbLogger.error).toHaveBeenCalledWith(
            expect.stringMatching(/\[Transaction:test-correlation-id\] Failed after \d+ms/),
            mockError
        );
        expect(mockExecuteTransaction).toHaveBeenCalledOnce();
    });

    it("should propagate database service errors", async () => {
        const transaction = useTransaction();
        const mockOperation = vi.fn();
        const dbError = new Error("Transaction rollback failed");

        mockExecuteTransaction.mockRejectedValue(dbError);

        await expect(transaction(mockOperation)).rejects.toThrow("Transaction rollback failed");

        expect(mockGenerateCorrelationId).toHaveBeenCalledOnce();
        expect(mockDbLogger.info).toHaveBeenCalledWith("[Transaction:test-correlation-id] Starting transaction");
        expect(mockDbLogger.error).toHaveBeenCalledWith(
            expect.stringMatching(/\[Transaction:test-correlation-id\] Failed after \d+ms/),
            dbError
        );
        expect(mockExecuteTransaction).toHaveBeenCalledOnce();
        expect(mockOperation).not.toHaveBeenCalled();
    });

    it("should track execution time accurately", async () => {
        const transaction = useTransaction();
        const mockOperation = vi.fn().mockImplementation(async () => {
            // Simulate a delay
            await new Promise((resolve) => setTimeout(resolve, 10));
            return "result";
        });

        mockExecuteTransaction.mockImplementation(async (operation: (db: Database) => Promise<string>) => {
            return operation({} as Database);
        });

        await transaction(mockOperation);

        expect(mockDbLogger.info).toHaveBeenCalledWith(
            expect.stringMatching(/\[Transaction:test-correlation-id\] Completed in \d+ms/)
        );

        // Extract the duration from the log call
        const logCall = mockDbLogger.info.mock.calls.find((call) =>
            call[0].includes("Completed in")
        );
        expect(logCall).toBeDefined();
        const duration = parseInt(logCall![0].match(/(\d+)ms/)?.[1] || "0");
        expect(duration).toBeGreaterThanOrEqual(10);
    });
});
