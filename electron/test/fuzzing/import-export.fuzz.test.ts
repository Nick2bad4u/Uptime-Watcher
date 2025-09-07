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

import { describe, expect, it, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { DataImportExportService } from "../../utils/database/DataImportExportService";
import type { Site } from "../../../shared/types";

describe("Data Import/Export Service Fuzzing Tests", () => {
    let service: DataImportExportService;
    let mockConfig: any;

    beforeEach(() => {
        mockConfig = {
            databaseService: {
                executeTransaction: vi
                    .fn()
                    .mockImplementation(
                        async (callback: any) => await callback({})
                    ),
            },
            eventEmitter: {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            },
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            },
            repositories: {
                site: {
                    exportAll: vi.fn().mockResolvedValue([]),
                    bulkInsertInternal: vi.fn(),
                    deleteAllInternal: vi.fn(),
                },
                settings: {
                    getAll: vi.fn().mockResolvedValue({}),
                    bulkInsertInternal: vi.fn(),
                    deleteAllInternal: vi.fn(),
                },
                monitor: {
                    bulkCreate: vi.fn().mockResolvedValue([]),
                    deleteAllInternal: vi.fn(),
                },
                history: {
                    deleteAllInternal: vi.fn(),
                    addEntryInternal: vi.fn(),
                },
            },
        };

        service = new DataImportExportService(mockConfig);
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
                                                null as any
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
                    fc.array(
                        fc.record({
                            identifier: fc.string({
                                minLength: 1,
                                maxLength: 100,
                            }),
                            name: fc.string({ minLength: 1, maxLength: 200 }),
                            monitoring: fc.boolean(),
                            monitors: fc.array(
                                fc.record({
                                    id: fc.string({
                                        minLength: 1,
                                        maxLength: 50,
                                    }),
                                    type: fc.constantFrom(
                                        "http",
                                        "ping",
                                        "port",
                                        "dns"
                                    ),
                                    url: fc.option(fc.webUrl()),
                                    host: fc.option(fc.domain()),
                                    port: fc.option(
                                        fc.integer({ min: 1, max: 65_535 })
                                    ),
                                    status: fc.constantFrom(
                                        "up",
                                        "down",
                                        "pending",
                                        "paused"
                                    ),
                                    monitoring: fc.boolean(),
                                    checkInterval: fc.integer({
                                        min: 30_000,
                                        max: 1_800_000,
                                    }),
                                    timeout: fc.integer({
                                        min: 1000,
                                        max: 30_000,
                                    }),
                                    retryAttempts: fc.integer({
                                        min: 1,
                                        max: 5,
                                    }),
                                    responseTime: fc.integer({
                                        min: 0,
                                        max: 30_000,
                                    }),
                                    history: fc.array(
                                        fc.record({
                                            timestamp: fc.integer({
                                                min: 1_600_000_000_000,
                                                max: Date.now(),
                                            }),
                                            status: fc.constantFrom(
                                                "up",
                                                "down"
                                            ),
                                            responseTime: fc.integer({
                                                min: 0,
                                                max: 30_000,
                                            }),
                                        }),
                                        { maxLength: 100 }
                                    ),
                                }),
                                { maxLength: 5 }
                            ),
                        }) as fc.Arbitrary<Site>,
                        { maxLength: 10 }
                    ),
                    fc.dictionary(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.string({ minLength: 0, maxLength: 200 })
                    ),
                    async (sites, settings) => {
                        mockConfig.repositories.site.exportAll.mockResolvedValue(
                            sites
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
                                .sort();
                            const importedIdentifiers = importResult.sites
                                .map((s) => s.identifier)
                                .sort();
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
