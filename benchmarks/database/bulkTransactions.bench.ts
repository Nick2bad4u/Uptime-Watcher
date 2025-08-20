/**
 * Bulk Transaction Performance Benchmarks
 *
 * @file Performance benchmarks for bulk database transactions, including bulk
 *   inserts, updates, deletes, and complex transaction workflows that are
 *   critical for application performance.
 *
 * @author GitHub Copilot
 *
 * @since 2025-01-16
 *
 * @category Performance
 *
 * @benchmark Database-Transactions
 *
 * @tags ["performance", "database", "transactions", "bulk-operations", "concurrency"]
 */

import { bench, describe } from "vitest";

// Import production types
import type { Site, Monitor, StatusHistory } from "../../shared/types";

// Mock data generators for benchmarking
function generateSites(count: number): Site[] {
    const sites: Site[] = [];
    for (let i = 0; i < count; i++) {
        sites.push({
            identifier: `site-${i}`,
            name: `Test Site ${i}`,
            monitoring: i % 3 !== 0, // 2/3 active
            monitors: [],
        });
    }
    return sites;
}

function generateMonitors(count: number, siteIdentifier: string): Monitor[] {
    const monitors: Monitor[] = [];
    const types = [
        "http",
        "ping",
        "port",
    ] as const;

    for (let i = 0; i < count; i++) {
        const type = types[i % 3];
        const baseMonitor = {
            id: `monitor-${siteIdentifier}-${i}`,
            siteIdentifier,
            type,
            monitoring: true,
            checkInterval: 60_000,
            timeout: 5000,
            retryAttempts: 3,
            status: (i % 4 === 0 ? "down" : "up") as "up" | "down",
            responseTime: Math.floor(Math.random() * 1000),
            lastChecked: new Date(),
            history: [],
            activeOperations: [],
        };

        switch (type) {
            case "http": {
                monitors.push({
                    ...baseMonitor,
                    url: `https://api-${i}.example.com`,
                });
                break;
            }
            case "ping": {
                monitors.push({
                    ...baseMonitor,
                    host: `host-${i}.example.com`,
                });
                break;
            }
            case "port": {
                monitors.push({
                    ...baseMonitor,
                    host: `port-${i}.example.com`,
                    port: 80 + (i % 10),
                });
                break;
            }
        }
    }
    return monitors;
}

function generateStatusHistory(count: number): StatusHistory[] {
    const history: StatusHistory[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        history.push({
            timestamp: now - i * 60_000, // One minute intervals
            status: (i % 5 === 0 ? "down" : "up") as "up" | "down",
            responseTime: Math.floor(Math.random() * 500),
            details: i % 10 === 0 ? `Error detail for entry ${i}` : undefined,
        });
    }
    return history;
}

// Simulated heavy database operations for benchmarking
async function simulateBulkInsert<T>(
    items: T[],
    chunkSize = 100
): Promise<void> {
    // Simulate batch processing with artificial delay
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        // Simulate database write time based on chunk size
        await new Promise((resolve) => {setTimeout(resolve, chunk.length * 0.1)});
    }
}

async function simulateTransaction<T>(operation: () => Promise<T>): Promise<T> {
    // Simulate transaction overhead
    await new Promise((resolve) => {setTimeout(resolve, 1)});
    const result = await operation();
    await new Promise((resolve) => {setTimeout(resolve, 1)});
    return result;
}

async function simulateComplexQuery(complexity: number): Promise<any[]> {
    // Simulate query execution time based on complexity
    await new Promise((resolve) => {setTimeout(resolve, complexity * 2)});
    return Array.from({ length: complexity }, (_, i) => ({
        id: i,
        data: `result-${i}`,
    }));
}

describe("Bulk Transaction Performance Benchmarks", () => {
    describe("Site Operations", () => {
        bench("Bulk insert 100 sites", async () => {
            const sites = generateSites(100);
            await simulateBulkInsert(sites);
        });

        bench("Bulk insert 500 sites", async () => {
            const sites = generateSites(500);
            await simulateBulkInsert(sites);
        });

        bench("Bulk insert 1000 sites", async () => {
            const sites = generateSites(1000);
            await simulateBulkInsert(sites);
        });

        bench("Bulk update 100 sites", async () => {
            const sites = generateSites(100);

            // Simulate bulk update operation
            const updates = sites.map((site) => ({
                ...site,
                name: `Updated ${site.name}`,
                monitoring: !site.monitoring,
            }));

            await simulateBulkInsert(updates, 50); // Smaller chunks for updates
        });

        bench("Transaction: Create site with 10 monitors", async () => {
            const site = generateSites(1)[0];
            const monitors = generateMonitors(10, site.identifier);

            await simulateTransaction(async () => {
                await simulateBulkInsert([site]);
                await simulateBulkInsert(monitors);
            });
        });

        bench("Transaction: Create site with 50 monitors", async () => {
            const site = generateSites(1)[0];
            const monitors = generateMonitors(50, site.identifier);

            await simulateTransaction(async () => {
                await simulateBulkInsert([site]);
                await simulateBulkInsert(monitors);
            });
        });
    });

    describe("Monitor Operations", () => {
        bench("Bulk insert 100 monitors", async () => {
            const monitors = generateMonitors(100, "site-bulk-test");
            await simulateBulkInsert(monitors);
        });

        bench("Bulk insert 500 monitors", async () => {
            const monitors = generateMonitors(500, "site-bulk-test-500");
            await simulateBulkInsert(monitors);
        });

        bench("Bulk insert 1000 monitors", async () => {
            const monitors = generateMonitors(1000, "site-bulk-test-1000");
            await simulateBulkInsert(monitors);
        });

        bench("Bulk update monitor status (100 monitors)", async () => {
            const monitors = generateMonitors(100, "site-status-update");

            // Simulate status updates
            const updates = monitors.map((monitor) => ({
                ...monitor,
                status: monitor.status === "up" ? "down" : "up",
                responseTime: Math.floor(Math.random() * 1000),
                lastChecked: new Date(),
            }));

            await simulateBulkInsert(updates, 50);
        });

        bench(
            "Transaction: Clear active operations (500 monitors)",
            async () => {
                const monitors = generateMonitors(500, "site-clear-ops");

                await simulateTransaction(async () => {
                    // Simulate clearing operations in batches
                    for (let i = 0; i < monitors.length; i += 100) {
                        const batch = monitors.slice(i, i + 100);
                        await simulateBulkInsert(
                            batch.map((m) => ({ ...m, activeOperations: [] })),
                            100
                        );
                    }
                });
            }
        );
    });

    describe("History Operations", () => {
        bench("Bulk insert 1000 history entries", async () => {
            const history = generateStatusHistory(1000);
            await simulateBulkInsert(history);
        });

        bench("Bulk insert 5000 history entries", async () => {
            const history = generateStatusHistory(5000);
            await simulateBulkInsert(history);
        });

        bench("Bulk insert 10000 history entries", async () => {
            const history = generateStatusHistory(10_000);
            await simulateBulkInsert(history);
        });

        bench("Transaction: Add history for 50 monitors", async () => {
            const monitorIds = Array.from(
                { length: 50 },
                (_, i) => `monitor-multi-${i}`
            );

            await simulateTransaction(async () => {
                for (const monitorId of monitorIds) {
                    const history = generateStatusHistory(10);
                    await simulateBulkInsert(history);
                }
            });
        });

        bench(
            "Complex query: Get recent history for all monitors",
            async () => {
                // Simulate complex aggregation query
                await simulateComplexQuery(1000);
            }
        );
    });

    describe("Complex Transactions", () => {
        bench(
            "Complete site setup: Site + 20 monitors + initial history",
            async () => {
                const site = generateSites(1)[0];
                const monitors = generateMonitors(20, site.identifier);

                await simulateTransaction(async () => {
                    // Create site
                    await simulateBulkInsert([site]);

                    // Create monitors
                    await simulateBulkInsert(monitors);

                    // Add initial history for each monitor
                    for (const monitor of monitors) {
                        const history = generateStatusHistory(5);
                        await simulateBulkInsert(history);
                    }
                });
            }
        );

        bench("Site migration: Copy site with all data", async () => {
            const sourceSite = generateSites(1)[0];
            const sourceMonitors = generateMonitors(10, sourceSite.identifier);

            // Simulate reading existing data
            await simulateComplexQuery(100);

            // Migrate to new site
            const targetSite = {
                ...sourceSite,
                identifier: `${sourceSite.identifier}-migrated`,
                name: `${sourceSite.name} (Migrated)`,
            };

            await simulateTransaction(async () => {
                // Create new site
                await simulateBulkInsert([targetSite]);

                // Copy monitors with new IDs and site identifier
                const targetMonitors = sourceMonitors.map((monitor, index) => ({
                    ...monitor,
                    id: `${monitor.id}-migrated`,
                    siteIdentifier: targetSite.identifier,
                }));

                await simulateBulkInsert(targetMonitors);

                // Copy history with new monitor IDs
                for (const monitor of sourceMonitors) {
                    const targetHistory = generateStatusHistory(20);
                    await simulateBulkInsert(targetHistory);
                }
            });
        });

        bench(
            "Cleanup old data: Delete history older than 30 days",
            async () => {
                // Simulate scanning for old data
                await simulateComplexQuery(500);

                // Simulate deletion in batches
                await simulateTransaction(async () => {
                    // Simulate deleting 1000 old entries in batches of 100
                    for (let i = 0; i < 10; i++) {
                        await new Promise((resolve) => setTimeout(resolve, 5)); // Delete batch delay
                    }
                });
            }
        );
    });

    describe("Concurrent Operations", () => {
        bench("Concurrent site creation (10 parallel)", async () => {
            const promises = Array.from({ length: 10 }, (_, i) => {
                const site = generateSites(1)[0];
                site.identifier = `concurrent-site-${i}`;
                return simulateBulkInsert([site]);
            });

            await Promise.all(promises);
        });

        bench("Concurrent monitor updates (50 parallel)", async () => {
            const monitors = generateMonitors(50, "concurrent-updates");

            // Concurrent updates
            const promises = monitors.map((monitor) =>
                simulateBulkInsert([
                    {
                        ...monitor,
                        status: monitor.status === "up" ? "down" : "up",
                        responseTime: Math.floor(Math.random() * 1000),
                        lastChecked: new Date(),
                    },
                ])
            );

            await Promise.all(promises);
        });

        bench(
            "Mixed concurrent operations (create + update + delete)",
            async () => {
                const promises = [
                    // Create operations
                    ...Array.from({ length: 5 }, (_, i) => {
                        const site = generateSites(1)[0];
                        site.identifier = `mixed-create-${i}`;
                        return simulateBulkInsert([site]);
                    }),

                    // Update operations
                    ...Array.from({ length: 5 }, (_, i) => {
                        const site = generateSites(1)[0];
                        site.identifier = `mixed-update-${i}`;
                        return simulateBulkInsert([
                            { ...site, name: `Updated ${site.name}` },
                        ]);
                    }),

                    // History inserts
                    ...Array.from({ length: 10 }, (_, i) => {
                        const history = generateStatusHistory(10);
                        return simulateBulkInsert(history);
                    }),
                ];

                await Promise.all(promises);
            }
        );
    });

    describe("Memory-Intensive Operations", () => {
        bench(
            "Process large dataset: 10,000 monitor status updates",
            async () => {
                const monitors = generateMonitors(10_000, "memory-test");

                // Simulate processing large dataset in memory
                const updates = monitors.map((monitor) => ({
                    ...monitor,
                    status: Math.random() > 0.9 ? "down" : "up",
                    responseTime: Math.floor(Math.random() * 2000),
                    lastChecked: new Date(),
                }));

                // Process in chunks to simulate real-world batching
                await simulateBulkInsert(updates, 200);
            }
        );

        bench(
            "Aggregate statistics: Calculate uptime for 1000 monitors",
            async () => {
                const monitors = generateMonitors(1000, "stats-test");

                // Generate history for each monitor
                const allHistory = monitors.flatMap((monitor) =>
                    generateStatusHistory(100)
                );

                // Simulate statistics calculation
                const stats = allHistory.reduce(
                    (acc, entry) => {
                        acc.totalChecks++;
                        if (entry.status === "up") {
                            acc.upChecks++;
                        }
                        acc.totalResponseTime += entry.responseTime;
                        return acc;
                    },
                    { totalChecks: 0, upChecks: 0, totalResponseTime: 0 }
                );

                // Simulate complex calculation
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        );

        bench("Data export: Serialize all site data", async () => {
            const sites = generateSites(100);
            const allMonitors = sites.flatMap((site) =>
                generateMonitors(10, site.identifier)
            );
            const allHistory = allMonitors.flatMap((monitor) =>
                generateStatusHistory(50)
            );

            // Simulate JSON serialization
            const exportData = {
                sites,
                monitors: allMonitors,
                history: allHistory,
                exportedAt: new Date(),
            };

            // Simulate serialization time
            const jsonData = JSON.stringify(exportData);
            await new Promise((resolve) =>
                setTimeout(resolve, jsonData.length / 100_000)
            ); // Simulate based on size
        });
    });
});
