/**
 * Simplified orchestration tests for MonitorRepository.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const withDatabaseOperationMock = vi.hoisted(() =>
    vi.fn(
        async <T>(
            operation: () => Promise<T>,
            _operationName: string,
            _eventEmitter?: unknown,
            _context?: unknown
        ) => await operation()
    )
);

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("../../../utils/operationalHooks", () => ({
    withDatabaseOperation: withDatabaseOperationMock,
}));

vi.mock("../../../utils/logger", () => ({
    logger: loggerMock,
}));

vi.mock("../../../electronUtils", () => ({
    isDev: () => false,
}));

interface MockDatabaseService {
    executeTransaction: ReturnType<typeof vi.fn>;
    getDatabase: ReturnType<typeof vi.fn>;
}

interface MockDb {
    run: ReturnType<typeof vi.fn>;
    prepare: ReturnType<typeof vi.fn>;
}

let mockDatabaseService: MockDatabaseService;
let mockDb: MockDb;

// Import after mocks so the repository picks up the mocked collaborators.
import { MonitorRepository } from "../../../services/database/MonitorRepository";

describe("MonitorRepository simple orchestration", () => {
    beforeEach(() => {
        mockDb = {
            prepare: vi.fn(() => ({
                run: vi.fn(),
                finalize: vi.fn(),
            })),
            run: vi.fn(() => ({ changes: 1 })),
        };

        mockDatabaseService = {
            executeTransaction: vi.fn(
                async (callback: (db: MockDb) => Promise<void> | void) =>
                    await callback(mockDb)
            ),
            getDatabase: vi.fn(() => mockDb),
        };

        withDatabaseOperationMock.mockImplementation(
            async <T>(operation: () => Promise<T>) => operation()
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("clears active operations via transactional adapter", async () => {
        const repository = new MonitorRepository({
            databaseService: mockDatabaseService as never,
        });

        const updateInternalSpy = vi
            .spyOn(
                repository as unknown as {
                    updateInternal: (
                        db: MockDb,
                        identifier: string,
                        payload: { activeOperations: [] }
                    ) => void;
                },
                "updateInternal"
            )
            .mockImplementation(() => undefined);

        await repository.clearActiveOperations("monitor-123");

        expect(withDatabaseOperationMock).toHaveBeenCalledTimes(1);
        const firstCall = withDatabaseOperationMock.mock.calls[0];
        expect(firstCall).toBeDefined();
        const [operationFn, operationName] = firstCall!;
        expect(typeof operationFn).toBe("function");
        expect(operationName).toBe("MonitorRepository.clearActiveOperations");
        expect(mockDatabaseService.executeTransaction).toHaveBeenCalledTimes(1);
        expect(updateInternalSpy).toHaveBeenCalledWith(mockDb, "monitor-123", {
            activeOperations: [],
        });
    });

    it("deletes monitors by site identifier inside a transaction", async () => {
        const repository = new MonitorRepository({
            databaseService: mockDatabaseService as never,
        });

        const deleteInternalSpy = vi
            .spyOn(
                repository as unknown as {
                    deleteBySiteIdentifierInternal: (
                        db: MockDb,
                        siteIdentifier: string
                    ) => void;
                },
                "deleteBySiteIdentifierInternal"
            )
            .mockImplementation(() => undefined);

        await repository.deleteBySiteIdentifier("site-007");

        expect(withDatabaseOperationMock).toHaveBeenCalled();
        const deleteCall = withDatabaseOperationMock.mock.calls[0];
        expect(deleteCall).toBeDefined();
        const [, operationName] = deleteCall!;
        expect(operationName).toBe("monitor-delete-by-site");
        expect(mockDatabaseService.executeTransaction).toHaveBeenCalledTimes(1);
        expect(deleteInternalSpy).toHaveBeenCalledWith(mockDb, "site-007");
    });

    it("propagates transactional failures when deleting by site", async () => {
        const boom = new Error("transaction failed");
        mockDatabaseService.executeTransaction.mockRejectedValueOnce(boom);

        const repository = new MonitorRepository({
            databaseService: mockDatabaseService as never,
        });

        const deleteInternalSpy = vi
            .spyOn(
                repository as unknown as {
                    deleteBySiteIdentifierInternal: (
                        db: MockDb,
                        siteIdentifier: string
                    ) => void;
                },
                "deleteBySiteIdentifierInternal"
            )
            .mockImplementation(() => undefined);

        await expect(
            repository.deleteBySiteIdentifier("faulty-site")
        ).rejects.toThrow(boom);

        expect(deleteInternalSpy).not.toHaveBeenCalled();
    });
});
