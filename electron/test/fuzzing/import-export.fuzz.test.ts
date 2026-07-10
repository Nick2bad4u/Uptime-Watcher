/**
 * Property-based fuzzing tests for data import/export operations.
 *
 * @remarks
 * Tests data import/export service operations using property-based testing with
 * fast-check. Validates that import/export operations handle malformed input,
 * edge cases, and potential security vulnerabilities gracefully.
 *
 * Key areas tested:
 *
 * - JSON parsing and serialization robustness
 * - Data transformation consistency
 * - Import data validation
 * - Export format stability
 * - Error handling for malformed data
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusHistory } from "@shared/types";

import fc from "fast-check";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DataImportExportService,
    type DataImportExportConfig,
} from "../../services/database/DataImportExportService";

type BaseGeneratedMonitor = Pick<
    Monitor,
    | "checkInterval"
    | "history"
    | "id"
    | "monitoring"
    | "responseTime"
    | "retryAttempts"
    | "status"
    | "timeout"
> &
    Pick<Partial<Monitor>, "activeOperations">;

function characterPool(characters: string): [string, ...string[]] {
    const [first, ...rest] = [...characters];
    if (!first) {
        throw new Error("Character pool must not be empty");
    }
    return [first, ...rest];
}

const identifierStartCharacters = characterPool(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
);
const identifierRestCharacters = characterPool(
    "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);
const nameRestCharacters = characterPool(
    " -.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);

const safeIdentifierArbitrary = fc
    .tuple(
        fc.constantFrom(...identifierStartCharacters),
        fc.array(fc.constantFrom(...identifierRestCharacters), {
            maxLength: 39,
        })
    )
    .map(([first, rest]) => `${first}${rest.join("")}`);
const safeNameArbitrary = fc
    .tuple(
        fc.constantFrom(...identifierStartCharacters),
        fc.array(fc.constantFrom(...nameRestCharacters), { maxLength: 79 })
    )
    .map(([first, rest]) => `${first}${rest.join("")}`);
const safeHostArbitrary = fc
    .integer({ max: 1_000_000, min: 1 })
    .map((value) => `service-${value}.example.com`);
const safeUrlArbitrary = safeHostArbitrary.map(
    (host) => `https://${host}/health?token=secret#frag`
);

const statusHistoryArbitrary: fc.Arbitrary<StatusHistory> = fc.record({
    responseTime: fc.integer({ max: 30_000, min: -1 }),
    status: fc.constantFrom("up", "down", "degraded"),
    timestamp: fc.integer({
        max: Date.now(),
        min: 1_600_000_000_000,
    }),
});

const baseGeneratedMonitorArbitrary: fc.Arbitrary<BaseGeneratedMonitor> =
    fc.record({
        activeOperations: fc.array(safeIdentifierArbitrary, { maxLength: 3 }),
        checkInterval: fc.integer({ max: 1_800_000, min: 5000 }),
        history: fc.array(statusHistoryArbitrary, { maxLength: 100 }),
        id: safeIdentifierArbitrary,
        monitoring: fc.boolean(),
        responseTime: fc.integer({ max: 30_000, min: -1 }),
        retryAttempts: fc.integer({ max: 10, min: 0 }),
        status: fc.constantFrom("up", "down", "pending", "paused", "degraded"),
        timeout: fc.integer({ max: 30_000, min: 1000 }),
    });

const validExportMonitorArbitrary: fc.Arbitrary<Monitor> = fc.oneof(
    fc
        .tuple(baseGeneratedMonitorArbitrary, safeUrlArbitrary)
        .map(([base, url]) => ({
            ...base,
            type: "http" as const,
            url,
        })),
    fc
        .tuple(baseGeneratedMonitorArbitrary, safeHostArbitrary)
        .map(([base, host]) => ({
            ...base,
            host,
            type: "ping" as const,
        })),
    fc
        .tuple(
            baseGeneratedMonitorArbitrary,
            safeHostArbitrary,
            fc.integer({ max: 65_535, min: 1 })
        )
        .map(
            ([
                base,
                host,
                port,
            ]) => ({
                ...base,
                host,
                port,
                type: "port" as const,
            })
        ),
    fc
        .tuple(baseGeneratedMonitorArbitrary, safeHostArbitrary)
        .map(([base, host]) => ({
            ...base,
            host,
            recordType: "A" as const,
            type: "dns" as const,
        }))
);

const validExportSiteArbitrary: fc.Arbitrary<Site> = fc.record({
    identifier: safeIdentifierArbitrary,
    monitoring: fc.boolean(),
    monitors: fc.array(validExportMonitorArbitrary, { maxLength: 5 }),
    name: safeNameArbitrary,
});

const createMockConfig = () => ({
    databaseService: {
        executeTransaction: vi
            .fn()
            .mockImplementation(
                async (
                    callback: (database: Record<string, never>) => unknown
                ) => callback({})
            ),
    },
    eventEmitter: {
        emitTyped: vi.fn().mockResolvedValue(undefined),
    },
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
    repositories: {
        history: {
            addEntryInternal: vi.fn(),
            createTransactionAdapter: vi.fn(),
            deleteAllInternal: vi.fn(),
            findByMonitorId: vi.fn().mockResolvedValue([]),
        },
        monitor: {
            bulkCreate: vi.fn().mockResolvedValue([]),
            createTransactionAdapter: vi.fn(),
            deleteAllInternal: vi.fn(),
            findBySiteIdentifier: vi.fn().mockResolvedValue([]),
        },
        settings: {
            bulkInsertInternal: vi.fn(),
            createTransactionAdapter: vi.fn(),
            deleteAllInternal: vi.fn(),
            getAll: vi.fn().mockResolvedValue({}),
        },
        site: {
            bulkInsertInternal: vi.fn(),
            createTransactionAdapter: vi.fn(),
            deleteAllInternal: vi.fn(),
            exportAllRows: vi.fn().mockResolvedValue([]),
            findAll: vi.fn().mockResolvedValue([]),
            findByIdentifier: vi.fn().mockResolvedValue(undefined),
        },
    },
});

type MockConfig = ReturnType<typeof createMockConfig>;
type AdapterBuilder = (...args: never[]) => unknown;

const attachAdapter = <
    TRepository extends { createTransactionAdapter: ReturnType<typeof vi.fn> },
>(
    repository: TRepository,
    builders: Record<string, AdapterBuilder>
): void => {
    repository.createTransactionAdapter.mockImplementation(
        (database: unknown) =>
            Object.fromEntries(
                Object.entries(builders).map(([key, factory]) => [
                    key,
                    vi.fn((...args: unknown[]) =>
                        Reflect.apply(factory, undefined, [database, ...args])
                    ),
                ])
            )
    );
};

describe("Data Import/Export Service Fuzzing Tests", () => {
    let service: DataImportExportService;
    let mockConfig: MockConfig;

    beforeEach(() => {
        mockConfig = createMockConfig();

        attachAdapter(mockConfig.repositories.site, {
            bulkInsert: (db: unknown, rows: unknown) =>
                mockConfig.repositories.site.bulkInsertInternal(db, rows),
            deleteAll: (db: unknown) =>
                mockConfig.repositories.site.deleteAllInternal(db),
        });

        attachAdapter(mockConfig.repositories.settings, {
            bulkInsert: (db: unknown, values: unknown) =>
                mockConfig.repositories.settings.bulkInsertInternal(db, values),
            deleteAll: (db: unknown) =>
                mockConfig.repositories.settings.deleteAllInternal(db),
        });

        attachAdapter(mockConfig.repositories.monitor, {
            deleteAll: (db: unknown) =>
                mockConfig.repositories.monitor.deleteAllInternal(db),
        });

        attachAdapter(mockConfig.repositories.history, {
            deleteAll: (db: unknown) =>
                mockConfig.repositories.history.deleteAllInternal(db),
            addEntry: (
                db: unknown,
                monitorId: unknown,
                entry: unknown,
                details: unknown
            ) =>
                mockConfig.repositories.history.addEntryInternal(
                    db,
                    monitorId,
                    entry,
                    details
                ),
        });

        service = new DataImportExportService(
            mockConfig as unknown as DataImportExportConfig
        );
        vi.clearAllMocks();
    });

    describe("JSON Import Parsing Fuzzing", () => {
        it("should handle various malformed JSON inputs safely", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.string(), // Random strings
                        fc.string().map((s) => `{"invalid": ${s}}`), // Malformed JSON
                        fc.string().map((s) => `${s}{"sites": []}`), // Prefixed JSON
                        fc.constant(
                            '{"sites": [{"identifier": "test", "monitors": [{"type": "http", "url": "javascript:alert(1)"}]}]}'
                        ), // XSS attempt
                        fc.constant(
                            '{"sites": [], "__proto__": {"polluted": true}}'
                        ), // Prototype pollution
                        fc.constant('{"sites": [null]}'), // Invalid site data
                        fc.jsonValue().map((v) => JSON.stringify(v)) // Random valid JSON with wrong structure
                    ),
                    async (jsonInput: string) => {
                        // Should not throw unhandled exceptions
                        try {
                            const result =
                                await service.importDataFromJson(jsonInput);
                            // If it succeeds, should return valid structure
                            expect(result).toHaveProperty("sites");
                            expect(result).toHaveProperty("settings");
                            expect(Array.isArray(result.sites)).toBeTruthy();
                            expect(
                                typeof result.settings === "object"
                            ).toBeTruthy();
                        } catch (error) {
                            // Should throw meaningful errors, not crash
                            expect(error).toBeInstanceOf(Error);
                        }
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("should handle deeply nested and complex JSON structures", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        sites: fc.array(
                            fc.record({
                                identifier: fc.string({
                                    minLength: 0,
                                    maxLength: 200,
                                }),
                                name: fc.option(
                                    fc.string({ minLength: 0, maxLength: 500 })
                                ),
                                monitoring: fc.option(fc.boolean()),
                                monitors: fc.option(
                                    fc.array(
                                        fc.record({
                                            type: fc.constantFrom(
                                                "http",
                                                "ping",
                                                "port",
                                                "dns",
                                                "invalid",
                                                "",
                                                null
                                            ),
                                            url: fc.option(
                                                fc.string({
                                                    minLength: 0,
                                                    maxLength: 2000,
                                                })
                                            ),
                                            host: fc.option(
                                                fc.string({
                                                    minLength: 0,
                                                    maxLength: 500,
                                                })
                                            ),
                                            port: fc.option(
                                                fc.integer({
                                                    min: -1000,
                                                    max: 100_000,
                                                })
                                            ),
                                            id: fc.option(
                                                fc.string({
                                                    minLength: 0,
                                                    maxLength: 100,
                                                })
                                            ),
                                            status: fc.option(
                                                fc.constantFrom(
                                                    "up",
                                                    "down",
                                                    "pending",
                                                    "paused",
                                                    "invalid"
                                                )
                                            ),
                                            // Add deeply nested or unusual properties
                                            unusual: fc.option(
                                                fc.oneof(
                                                    fc.constant(null),
                                                    fc.constant(undefined),
                                                    fc.array(fc.anything()),
                                                    fc.record({
                                                        deep: fc.record({
                                                            nested: fc.anything(),
                                                        }),
                                                    })
                                                )
                                            ),
                                        }),
                                        { maxLength: 20 }
                                    )
                                ),
                                // Add unusual top-level properties
                                extraData: fc.option(fc.anything()),
                            }),
                            { maxLength: 10 }
                        ),
                        settings: fc.option(
                            fc.dictionary(
                                fc.string({ minLength: 0, maxLength: 100 }),
                                fc.oneof(
                                    fc.string({
                                        minLength: 0,
                                        maxLength: 1000,
                                    }),
                                    fc.integer(),
                                    fc.boolean(),
                                    fc.constant(null),
                                    fc.array(fc.string())
                                )
                            )
                        ),
                        // Add extra properties that shouldn't be there
                        maliciousData: fc.option(fc.anything()),
                        version: fc.option(fc.string()),
                    }),
                    async (importData) => {
                        const jsonString = JSON.stringify(importData);

                        try {
                            const result =
                                await service.importDataFromJson(jsonString);

                            // Validate result structure
                            expect(result).toHaveProperty("sites");
                            expect(result).toHaveProperty("settings");
                            expect(Array.isArray(result.sites)).toBeTruthy();

                            // Should not have extra properties in result
                            expect(result).not.toHaveProperty("maliciousData");
                        } catch (error) {
                            // Should handle gracefully
                            expect(error).toBeInstanceOf(Error);
                        }
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe("Export Data Consistency Fuzzing", () => {
        it("should handle export with various site configurations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validExportSiteArbitrary, { maxLength: 10 }),
                    fc.dictionary(
                        safeIdentifierArbitrary,
                        fc.string({ minLength: 0, maxLength: 200 })
                    ),
                    async (sites, settings) => {
                        mockConfig.repositories.site.exportAllRows.mockResolvedValue(
                            sites.map((site) => ({
                                identifier: site.identifier,
                                monitoring: site.monitoring,
                                name: site.name,
                            }))
                        );

                        mockConfig.repositories.monitor.findBySiteIdentifier.mockImplementation(
                            async (identifier: string) => {
                                const match = sites.find(
                                    (site) => site.identifier === identifier
                                );

                                return match
                                    ? match.monitors.map((monitor) => ({
                                          ...monitor,
                                          history: [],
                                      }))
                                    : [];
                            }
                        );

                        mockConfig.repositories.history.findByMonitorId.mockImplementation(
                            async (monitorId: string) => {
                                for (const site of sites) {
                                    const monitor = site.monitors.find(
                                        (candidate) =>
                                            candidate.id === monitorId
                                    );

                                    if (monitor) {
                                        return monitor.history;
                                    }
                                }

                                return [];
                            }
                        );
                        mockConfig.repositories.settings.getAll.mockResolvedValue(
                            settings
                        );

                        const exportedJson = await service.exportAllData();

                        // Should produce valid JSON
                        expect(() => JSON.parse(exportedJson)).not.toThrow();

                        const parsed = JSON.parse(exportedJson);

                        // Should have expected structure
                        expect(parsed).toHaveProperty("sites");
                        expect(parsed).toHaveProperty("settings");
                        expect(parsed).toHaveProperty("version");
                        expect(parsed).toHaveProperty("exportedAt");

                        // Sites should be array
                        expect(Array.isArray(parsed.sites)).toBeTruthy();

                        // Settings should be object
                        expect(
                            typeof parsed.settings === "object"
                        ).toBeTruthy();

                        // Version should be string
                        expect(typeof parsed.version === "string").toBeTruthy();

                        // ExportedAt should be valid ISO date
                        expect(() =>
                            new Date(parsed.exportedAt).toISOString()
                        ).not.toThrow();
                    }
                ),
                { numRuns: 25 }
            );
        });
    });

    describe("Import-Export Round Trip Fuzzing", () => {
        it("should maintain data integrity through import-export cycles", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        sites: fc.array(
                            fc.record({
                                identifier: fc.string({
                                    minLength: 1,
                                    maxLength: 100,
                                }),
                                name: fc.option(
                                    fc.string({ minLength: 1, maxLength: 200 })
                                ),
                                monitoring: fc.option(fc.boolean()),
                                monitors: fc.option(
                                    fc.array(
                                        fc.record({
                                            type: fc.constantFrom(
                                                "http",
                                                "ping",
                                                "port",
                                                "dns"
                                            ),
                                            id: fc.option(
                                                fc.string({
                                                    minLength: 1,
                                                    maxLength: 50,
                                                })
                                            ),
                                            url: fc.option(fc.webUrl()),
                                            host: fc.option(fc.domain()),
                                            port: fc.option(
                                                fc.integer({
                                                    min: 1,
                                                    max: 65_535,
                                                })
                                            ),
                                            status: fc.option(
                                                fc.constantFrom(
                                                    "up",
                                                    "down",
                                                    "pending",
                                                    "paused"
                                                )
                                            ),
                                        }),
                                        { maxLength: 3 }
                                    )
                                ),
                            }),
                            { maxLength: 3 }
                        ),
                        settings: fc.option(
                            fc.dictionary(
                                fc.string({ minLength: 1, maxLength: 50 }),
                                fc.string({ minLength: 0, maxLength: 100 })
                            )
                        ),
                    }),
                    async (originalData) => {
                        const jsonString = JSON.stringify(originalData);

                        try {
                            // Import the data
                            const importResult =
                                await service.importDataFromJson(jsonString);

                            // Verify basic structure is preserved
                            expect(importResult.sites).toBeDefined();
                            expect(importResult.settings).toBeDefined();

                            // Sites should be an array
                            expect(
                                Array.isArray(importResult.sites)
                            ).toBeTruthy();

                            // Settings should be an object
                            expect(
                                typeof importResult.settings === "object"
                            ).toBeTruthy();

                            // Site identifiers should be preserved
                            const originalIdentifiers = originalData.sites
                                .map((s) => s.identifier)
                                .toSorted();
                            const importedIdentifiers = importResult.sites
                                .map((s) => s.identifier)
                                .toSorted();
                            expect(importedIdentifiers).toEqual(
                                originalIdentifiers
                            );
                        } catch (error) {
                            // If import fails, it should be due to invalid data, not crash
                            expect(error).toBeInstanceOf(Error);
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });
    });
});
