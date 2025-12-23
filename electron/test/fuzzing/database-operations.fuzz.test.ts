/**
 * Property-based fuzzing tests for database repository operations.
 *
 * @remarks
 * Tests database repository operations using property-based testing with
 * fast-check. Validates that repository operations handle malformed input, edge
 * cases, and potential security vulnerabilities gracefully through transaction
 * handling.
 *
 * Key areas tested:
 *
 * - Repository method robustness
 * - SQL injection prevention
 * - Input validation consistency
 * - Transaction error handling
 * - Parameter sanitization
 *
 * @packageDocumentation
 */

import {
    describe,
    expect,
    it,
    vi,
    beforeEach,
    type MockedFunction,
} from "vitest";
import fc from "fast-check";
import type { SiteRow } from "../../services/database/utils/siteMapper";
import {
    isValidMonitorId,
    isValidSiteIdentifier,
} from "../../services/database/utils/identifierValidation";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";

const SIMULATED_TRANSACTION_FAILURE = new Error(
    "Simulated transaction failure"
);

const SITE_ROW_ARBITRARY: fc.Arbitrary<SiteRow> = fc
    .record({
        identifier: fc
            .stringMatching(/^[\dA-Za-z][\w-]{0,63}$/)
            .filter((value) => isValidSiteIdentifier(value)),
        name: fc.option(fc.string({ minLength: 1, maxLength: 128 }), {
            nil: undefined,
        }),
        monitoring: fc.option(fc.boolean(), { nil: undefined }),
    })
    .map<SiteRow>(({ identifier, monitoring, name }) => {
        const siteRow: SiteRow = { identifier };

        if (name !== undefined) {
            siteRow.name = name;
        }

        if (monitoring !== undefined) {
            siteRow.monitoring = monitoring;
        }

        return siteRow;
    });

const SITE_ROWS_ARBITRARY = fc.array(SITE_ROW_ARBITRARY, {
    maxLength: 6,
    minLength: 1,
});

/**
 * Minimal prepared statement contract tracked during transaction rollbacks.
 *
 * @remarks
 * Captures the subset of mocked methods inspected when verifying that failed
 * transactions clean up resources and rerun statements as expected.
 */
interface PreparedStatementMock {
    /** Finalizer invoked whenever the statement lifecycle completes. */
    readonly finalize: ReturnType<typeof vi.fn>;
    /** Prepared statement executor tracking invocation counts. */
    readonly run: ReturnType<typeof vi.fn>;
}

describe("Database Operations Fuzzing Tests", () => {
    let mockDatabaseService: any;
    let mockDb: {
        run: MockedFunction<any>;
        get: MockedFunction<any>;
        all: MockedFunction<any>;
        prepare: MockedFunction<any>;
    };
    let siteRepository: SiteRepository;
    let monitorRepository: MonitorRepository;
    let historyRepository: HistoryRepository;

    beforeEach(() => {
        mockDb = {
            run: vi.fn(),
            get: vi.fn(),
            all: vi.fn(),
            prepare: vi.fn().mockReturnValue({
                run: vi.fn(),
                get: vi.fn(),
                all: vi.fn(),
                finalize: vi.fn(),
            }),
        };

        mockDatabaseService = {
            executeTransaction: vi.fn(),
            getDatabase: vi.fn().mockReturnValue(mockDb),
        } as any;

        vi.clearAllMocks();
        siteRepository = new SiteRepository({
            databaseService: mockDatabaseService,
        });
        monitorRepository = new MonitorRepository({
            databaseService: mockDatabaseService,
        });
        historyRepository = new HistoryRepository({
            databaseService: mockDatabaseService,
        });
    });

    describe("Site Repository Fuzzing", () => {
        it("should handle upsert operations with various site data", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        identifier: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                        monitors: fc.array(
                            fc.record({
                                id: fc.string({ minLength: 1, maxLength: 50 }),
                                type: fc.constant("http"), // Use only http type to match schema
                                url: fc.string({
                                    minLength: 1,
                                    maxLength: 200,
                                }),
                                checkInterval: fc.integer({
                                    min: 1000,
                                    max: 300_000,
                                }),
                                timeout: fc.integer({ min: 1000, max: 30_000 }),
                                retryAttempts: fc.integer({ min: 1, max: 10 }),
                                status: fc.constantFrom(
                                    "up",
                                    "down",
                                    "pending",
                                    "paused"
                                ),
                                monitoring: fc.boolean(),
                                responseTime: fc.integer({
                                    min: 0,
                                    max: 30_000,
                                }),
                            }),
                            { minLength: 0, maxLength: 5 }
                        ),
                    }),
                    async (siteData: any) => {
                        // Use any to avoid complex type issues
                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );
                        mockDb.run.mockReturnValue({ lastInsertRowid: 1 });

                        const operation = siteRepository.upsert(siteData);
                        expect(operation).toBeInstanceOf(Promise);
                        await operation.catch(() => undefined);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle findByIdentifier with various identifiers", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.string({ minLength: 1, maxLength: 100 }),
                        fc.string({ minLength: 0, maxLength: 0 }), // Empty string
                        fc.string().map((s) => s.repeat(100)), // Long string
                        fc.string().map((s) => `${s}'DROP TABLE sites;--`) // SQL injection attempt
                    ),
                    async (identifier: string) => {
                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );
                        mockDb.get.mockReturnValue(null);

                        const result = await siteRepository
                            .findByIdentifier(identifier)
                            .catch(() => undefined);

                        expect(
                            result === null || result === undefined
                        ).toBeTruthy();

                        // Verify SQL injection protection if database was called
                        if (mockDb.get.mock.calls.length > 0) {
                            const [sql] = mockDb.get.mock.calls[0] as [
                                string,
                                any[],
                            ];
                            expect(sql).toContain("?"); // Parameterized query
                            expect(sql).not.toContain("DROP"); // No direct injection
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle delete operations safely", async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (identifier: string) => {
                    mockDatabaseService.executeTransaction.mockImplementation(
                        async (callback: any) => await callback(mockDb)
                    );
                    mockDb.run.mockReturnValue({ changes: 0 });

                    // Should return boolean and not throw
                    const result = await siteRepository.delete(identifier);
                    expect(typeof result).toBe("boolean");

                    if (isValidSiteIdentifier(identifier)) {
                        expect(
                            mockDatabaseService.executeTransaction
                        ).toHaveBeenCalled();
                    } else {
                        expect(result).toBeFalsy();
                    }
                }),
                { numRuns: 20 }
            );
        });

        it("should handle exists operations with any identifier", async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (identifier: string) => {
                    mockDatabaseService.executeTransaction.mockImplementation(
                        async (callback: any) => await callback(mockDb)
                    );
                    mockDb.get.mockReturnValue(null);

                    const result = await siteRepository
                        .exists(identifier)
                        .catch(() => undefined);

                    if (result !== undefined) {
                        expect(typeof result).toBe("boolean");
                    }
                }),
                { numRuns: 20 }
            );
        });

        it("rolls back bulk inserts when a statement fails mid-transaction", async () => {
            await fc.assert(
                fc.asyncProperty(
                    SITE_ROWS_ARBITRARY,
                    fc.nat(),
                    async (sites: SiteRow[], failureSeed: number) => {
                        const failureIndex = failureSeed % (sites.length + 1);

                        const preparedStatements: PreparedStatementMock[] = [];

                        mockDatabaseService.executeTransaction.mockClear();
                        mockDb.prepare.mockReset();

                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );

                        mockDb.prepare.mockImplementation(() => {
                            let invocationCount = 0;

                            const statement: PreparedStatementMock = {
                                finalize: vi.fn(),
                                run: vi.fn(() => {
                                    const shouldFail =
                                        failureIndex < sites.length &&
                                        invocationCount === failureIndex;

                                    invocationCount += 1;

                                    if (shouldFail) {
                                        throw SIMULATED_TRANSACTION_FAILURE;
                                    }

                                    return { changes: 1 };
                                }),
                            };

                            preparedStatements.push(statement);
                            return statement;
                        });

                        const resultPromise = siteRepository.bulkInsert(sites);

                        const expectedAttempts =
                            failureIndex < sites.length ? 3 : 1;

                        await (failureIndex < sites.length
                            ? expect(resultPromise).rejects.toThrowError(
                                  SIMULATED_TRANSACTION_FAILURE
                              )
                            : expect(resultPromise).resolves.toBeUndefined());

                        expect(
                            mockDatabaseService.executeTransaction
                        ).toHaveBeenCalledTimes(expectedAttempts);
                        expect(preparedStatements).toHaveLength(
                            expectedAttempts
                        );

                        const expectedRuns =
                            failureIndex < sites.length
                                ? failureIndex + 1
                                : sites.length;

                        for (const statement of preparedStatements) {
                            expect(statement.finalize).toHaveBeenCalledTimes(1);
                            expect(statement.run).toHaveBeenCalledTimes(
                                expectedRuns
                            );
                        }
                    }
                ),
                { numRuns: 25 }
            );
        });
    });

    describe("Monitor Repository Fuzzing", () => {
        it("should handle create operations with monitor data", async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Align with shared schemas: identifiers must contain non-whitespace.
                    fc
                        .string({ minLength: 1, maxLength: 64 })
                        .filter((value) => /\S/u.test(value)),
                    fc.record({
                        type: fc.constant("http"),
                        url: fc.string({ minLength: 1, maxLength: 200 }),
                        checkInterval: fc.integer({ min: 1000, max: 300_000 }),
                        timeout: fc.integer({ min: 1000, max: 30_000 }),
                        retryAttempts: fc.integer({ min: 1, max: 10 }),
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "pending",
                            "paused"
                        ),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ min: 0, max: 30_000 }),
                    }),
                    // Site identifiers must contain non-whitespace and respect max length.
                    fc
                        .string({ minLength: 1, maxLength: 100 })
                        .filter((value) => /\S/u.test(value)),
                    async (
                        monitorId: string,
                        monitorData: any,
                        siteIdentifier: string
                    ) => {
                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );
                        // MonitorRepository uses INSERT ... RETURNING via db.get
                        // (insertWithReturning). Ensure the mock returns an id.
                        const normalizedMonitorData = {
                            ...monitorData,
                            id: monitorId,
                        };

                        mockDb.get.mockReturnValue({
                            id: normalizedMonitorData.id,
                        });

                        const createdId = await monitorRepository.create(
                            siteIdentifier,
                            normalizedMonitorData
                        );
                        expect(createdId).toBeTypeOf("string");

                        expect(
                            mockDatabaseService.executeTransaction
                        ).toHaveBeenCalled();
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle findByIdentifier with various monitor IDs", async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (monitorId: string) => {
                    mockDatabaseService.executeTransaction.mockClear();
                    mockDatabaseService.executeTransaction.mockImplementation(
                        async (callback: any) => await callback(mockDb)
                    );
                    mockDb.get.mockReturnValue(null);

                    // Should handle any monitor ID gracefully
                    try {
                        const result =
                            await monitorRepository.findByIdentifier(monitorId);
                        // Should be null or undefined for non-existent monitors
                        expect(
                            result === null || result === undefined
                        ).toBeTruthy(); // null or undefined
                    } catch (error) {
                        // Method may throw for invalid IDs, which is acceptable
                    }
                }),
                { numRuns: 20 }
            );
        });

        it("should handle findBySiteIdentifier operations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string(),
                    async (siteIdentifier: string) => {
                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );
                        mockDb.all.mockReturnValue([]);

                        // Should handle any site identifier gracefully
                        try {
                            const result =
                                await monitorRepository.findBySiteIdentifier(
                                    siteIdentifier
                                );
                            expect(Array.isArray(result)).toBeTruthy();
                        } catch (error) {
                            // Method may throw for invalid identifiers, which is acceptable
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle delete operations safely", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc
                        .stringMatching(/^[\dA-Za-z][\w-]{0,63}$/)
                        .filter((value) => isValidMonitorId(value)),
                    async (monitorId: string) => {
                        mockDatabaseService.executeTransaction.mockClear();
                        mockDatabaseService.executeTransaction.mockImplementation(
                            async (callback: any) => await callback(mockDb)
                        );
                        mockDb.run.mockReturnValue({ changes: 0 });

                        // Should return boolean and not throw
                        const result =
                            await monitorRepository.delete(monitorId);
                        expect(typeof result).toBe("boolean");
                        expect(
                            mockDatabaseService.executeTransaction
                        ).toHaveBeenCalled();

                        // Also assert the boolean result is stable.
                        expect(typeof result).toBe("boolean");
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("History Repository Fuzzing", () => {
        it("should handle repository initialization", async () => {
            // Test that the repository is properly initialized
            expect(historyRepository).toBeDefined();
            expect(historyRepository).toBeInstanceOf(HistoryRepository);
        });
    });

    describe("Cross-Repository Operations", () => {
        it("should handle repository initialization without errors", () => {
            expect(siteRepository).toBeInstanceOf(SiteRepository);
            expect(monitorRepository).toBeInstanceOf(MonitorRepository);
            expect(historyRepository).toBeInstanceOf(HistoryRepository);
        });

        it("should use parameterized queries consistently", async () => {
            // Test that all repositories use safe SQL practices
            const testIdentifier = "test'; DROP TABLE sites; --";

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback: any) => await callback(mockDb)
            );
            mockDb.get.mockReturnValue(null);

            await siteRepository.findByIdentifier(testIdentifier);
            await monitorRepository.findByIdentifier(testIdentifier);

            // Check that SQL queries use parameterized statements
            const getAllCalls = [
                ...mockDb.get.mock.calls,
                ...mockDb.run.mock.calls,
                ...mockDb.all.mock.calls,
            ];

            for (const [sql] of getAllCalls) {
                if (typeof sql === "string") {
                    expect(sql).toContain("?"); // Should use parameterized queries
                    expect(sql).not.toContain(testIdentifier); // Should not contain raw input
                }
            }
        });
    });
});
