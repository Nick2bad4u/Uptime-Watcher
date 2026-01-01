/**
 * Site Repository Performance Benchmarks
 *
 * @file Performance benchmarks for site repository operations using real
 *   SiteRepository implementation with mock database for performance testing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @updated 2025-09-22 - Updated to use real SiteRepository implementation
 *
 * @benchmark Database-SiteRepository
 *
 * @tags ["performance", "database", "repository", "sites", "crud"]
 */

import { bench, describe, beforeEach, vi } from "vitest";
import { SiteRepository } from "../../electron/services/database/SiteRepository";
import type { DatabaseService } from "../../electron/services/database/DatabaseService";
import type { SiteRow } from "../../electron/services/database/utils/mappers/siteMapper";
import type { Database } from "node-sqlite3-wasm";
import { randomUUID } from "node:crypto";

// Mock database that simulates real database operations but with in-memory performance
class MockDatabase {
    private sites = new Map<string, SiteRow>();

    all(query: string): SiteRow[] {
        if (query.includes("SELECT")) {
            return Array.from(this.sites.values());
        }
        return [];
    }

    get(query: string, params: string[]): SiteRow | undefined {
        if (query.includes("SELECT") && params.length > 0) {
            return this.sites.get(params[0]);
        }
        return undefined;
    }

    run(query: string, params: string[]): { changes: number } {
        if (query.includes("INSERT") || query.includes("REPLACE")) {
            const [
                identifier,
                name,
                monitoring,
            ] = params;
            this.sites.set(identifier, {
                identifier,
                name,
                monitoring: monitoring === "1" || monitoring === "true",
            });
            return { changes: 1 };
        }
        if (query.includes("DELETE")) {
            const deleted = this.sites.delete(params[0]);
            return { changes: deleted ? 1 : 0 };
        }
        return { changes: 0 };
    }

    exec(query: string): this {
        if (query.includes("DELETE FROM sites")) {
            this.sites.clear();
        }
        return this;
    }
}

// Data generators for realistic benchmarking data
function generateSiteData(index: number): SiteRow {
    return {
        identifier: `site-${index}-${randomUUID()}`,
        name: `Performance Test Site ${index}`,
        monitoring: Math.random() > 0.3, // 70% enabled
    };
}

function generateBulkSiteData(count: number): SiteRow[] {
    return Array.from({ length: count }, (_, i) => generateSiteData(i));
}

describe("Site Repository Performance", () => {
    let repository: SiteRepository;
    let mockDatabase: MockDatabase;
    let mockDatabaseService: DatabaseService;

    beforeEach(() => {
        // Create mock database
        mockDatabase = new MockDatabase();

        // Create mock database service
        mockDatabaseService = {
            getDatabase: () => mockDatabase as unknown as Database,
            executeTransaction: async (
                callback: (db: Database) => Promise<unknown>
            ) => callback(mockDatabase as unknown as Database),
            initialize: vi.fn(),
            close: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        } as unknown as DatabaseService;

        // Initialize real repository with mock database service
        repository = new SiteRepository({
            databaseService: mockDatabaseService,
        });
    });

    // Basic CRUD Operations
    bench(
        "Single site creation (upsert)",
        async () => {
            const siteData = generateSiteData(Date.now());
            await repository.upsert(siteData);
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "Single site lookup by identifier",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark lookup
            const randomSite =
                testSites[Math.floor(Math.random() * testSites.length)];
            await repository.findByIdentifier(randomSite.identifier);
        },
        { warmupIterations: 10, iterations: 50_000 }
    );

    bench(
        "Check site existence",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark existence check
            const randomSite =
                testSites[Math.floor(Math.random() * testSites.length)];
            await repository.exists(randomSite.identifier);
        },
        { warmupIterations: 10, iterations: 50_000 }
    );

    bench(
        "Find all sites - Small dataset (100 sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(100);
            await repository.bulkInsert(testSites);

            // Benchmark find all
            await repository.findAll();
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "Find all sites - Medium dataset (1K sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark find all
            await repository.findAll();
        },
        { warmupIterations: 3, iterations: 1000 }
    );

    bench(
        "Find all sites - Large dataset (10K sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(10_000);
            await repository.bulkInsert(testSites);

            // Benchmark find all
            await repository.findAll();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    // Bulk Operations
    bench(
        "Bulk insert - Small batch (100 sites)",
        async () => {
            const testSites = generateBulkSiteData(100);
            await repository.bulkInsert(testSites);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "Bulk insert - Medium batch (1K sites)",
        async () => {
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);
        },
        { warmupIterations: 3, iterations: 100 }
    );

    bench(
        "Bulk insert - Large batch (10K sites)",
        async () => {
            const testSites = generateBulkSiteData(10_000);
            await repository.bulkInsert(testSites);
        },
        { warmupIterations: 2, iterations: 10 }
    );

    // Update Operations
    bench(
        "Site upsert operations - Mixed create/update",
        async () => {
            // Pre-populate with initial data
            const initialSites = generateBulkSiteData(500);
            await repository.bulkInsert(initialSites);

            // Perform mixed upsert operations
            for (let i = 0; i < 100; i++) {
                const isUpdate = Math.random() < 0.5;
                if (isUpdate) {
                    // 50% updates to existing sites
                    const existingSite =
                        initialSites[
                            Math.floor(Math.random() * initialSites.length)
                        ];
                    await repository.upsert({
                        identifier: existingSite.identifier,
                        name: `Updated ${existingSite.name}`,
                        monitoring: !existingSite.monitoring,
                    });
                } else {
                    // 50% new sites
                    const newSite = generateSiteData(i + 1000);
                    await repository.upsert(newSite);
                }
            }
        },
        { warmupIterations: 3, iterations: 100 }
    );

    // Delete Operations
    bench(
        "Single site deletion",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark deletion
            const randomSite =
                testSites[Math.floor(Math.random() * testSites.length)];
            await repository.delete(randomSite.identifier);
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "Bulk deletion - Delete all sites",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark delete all
            await repository.deleteAll();
        },
        { warmupIterations: 3, iterations: 1000 }
    );

    // Export Operations
    bench(
        "Export all sites - Small dataset (100 sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(100);
            await repository.bulkInsert(testSites);

            // Benchmark export
            await repository.exportAllRows();
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "Export all sites - Medium dataset (1K sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(1000);
            await repository.bulkInsert(testSites);

            // Benchmark export
            await repository.exportAllRows();
        },
        { warmupIterations: 3, iterations: 1000 }
    );

    bench(
        "Export all sites - Large dataset (10K sites)",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(10_000);
            await repository.bulkInsert(testSites);

            // Benchmark export
            await repository.exportAllRows();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    // Memory and Performance Under Load
    bench(
        "Repository memory usage - Rapid operations",
        async () => {
            // Simulate rapid repository operations
            for (let i = 0; i < 50; i++) {
                const siteData = generateSiteData(i);
                await repository.upsert(siteData);

                // Alternate between create and read operations
                const operation =
                    i % 2 === 0
                        ? repository.findAll()
                        : repository.exists(siteData.identifier);
                await operation;
            }
        },
        { warmupIterations: 3, iterations: 1000 }
    );

    // Concurrent Operation Simulation
    bench(
        "Concurrent site operations simulation",
        async () => {
            // Simulate concurrent operations using Promise.all
            const operations = [];

            for (let i = 0; i < 20; i++) {
                if (i % 3 === 0) {
                    // Create operations
                    operations.push(repository.upsert(generateSiteData(i)));
                } else if (i % 3 === 1) {
                    // Read operations
                    operations.push(repository.findAll());
                } else {
                    // Existence checks
                    operations.push(repository.exists(`site-${i}`));
                }
            }

            await Promise.all(operations);
        },
        { warmupIterations: 3, iterations: 1000 }
    );

    // Edge Cases and Error Handling
    bench(
        "Repository error handling - Invalid operations",
        async () => {
            try {
                // Test various edge cases
                await repository.findByIdentifier("");
                await repository.exists("");
                await repository.bulkInsert([]);
            } catch {
                // Expected to handle errors gracefully
            }
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    // Transaction Simulation
    bench(
        "Transaction overhead simulation",
        async () => {
            // Simulate transaction by performing multiple operations
            const sites = generateBulkSiteData(50);
            await repository.bulkInsert(sites);

            // Verify all sites were inserted
            const allSites = await repository.findAll();

            // Clean up
            await repository.deleteAll();

            // Verify deletion
            await repository.findAll();
        },
        { warmupIterations: 3, iterations: 500 }
    );

    // High-frequency operations
    bench(
        "High-frequency lookups",
        async () => {
            // Pre-populate with test data
            const testSites = generateBulkSiteData(100);
            await repository.bulkInsert(testSites);

            // Perform rapid lookups
            for (let i = 0; i < 100; i++) {
                const randomSite =
                    testSites[Math.floor(Math.random() * testSites.length)];
                await repository.findByIdentifier(randomSite.identifier);
            }
        },
        { warmupIterations: 5, iterations: 1000 }
    );
});
