/**
 * Enhanced Database Performance Benchmarks
 *
 * @file Comprehensive performance benchmarks for database operations in the
 *   Uptime Watcher application. Focuses on realistic workloads and
 *   performance-critical scenarios.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Database
 *
 * @tags ["performance", "database", "heavy-operations", "scalability"]
 */

import { bench, describe, beforeAll, afterAll } from "vitest";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";

// Import actual production types and services
import type { Site, Monitor, StatusHistory } from "../../shared/types";
import { DatabaseService } from "../../electron/services/database/DatabaseService";
import { SiteRepository } from "../../electron/services/database/SiteRepository";
import { MonitorRepository } from "../../electron/services/database/MonitorRepository";
import { HistoryRepository } from "../../electron/services/database/HistoryRepository";

describe("Enhanced Database Performance Benchmarks", () => {
    let databaseService: DatabaseService;
    let siteRepository: SiteRepository;
    let monitorRepository: MonitorRepository;
    let historyRepository: HistoryRepository;
    let tempDbPath: string;

    beforeAll(async () => {
        // Create temporary database for benchmarking
        tempDbPath = path.join(tmpdir(), `benchmark-db-${Date.now()}.db`);

        // Initialize services with actual production code
        databaseService = new DatabaseService({
            databasePath: tempDbPath,
            enableWAL: true,
        });

        await databaseService.initialize();

        // Initialize repositories
        siteRepository = new SiteRepository(databaseService);
        monitorRepository = new MonitorRepository(databaseService);
        historyRepository = new HistoryRepository(databaseService);
    });

    afterAll(async () => {
        if (databaseService) {
            await databaseService.close();
        }
    });

    // Data generators for realistic benchmarking
    function generateSite(id: number): Site {
        return {
            identifier: `benchmark-site-${id}`,
            name: `Benchmark Site ${id}`,
            monitoring: Math.random() > 0.2, // 80% monitoring
            monitors: [],
        };
    }

    function generateMonitor(siteId: string, monitorId: number): Monitor {
        const types = [
            "http",
            "ping",
            "port",
        ] as const;
        const type = types[monitorId % types.length];

        return {
            id: `benchmark-monitor-${monitorId}`,
            siteIdentifier: siteId,
            type,
            url:
                type === "http" ? `https://example${monitorId}.com` : undefined,
            host: type === "http" ? undefined : `host${monitorId}.example.com`,
            port: type === "port" ? 8080 + (monitorId % 100) : undefined,
            checkInterval:
                [
                    30,
                    60,
                    300,
                    600,
                ][monitorId % 4] * 1000,
            timeout:
                [
                    5,
                    10,
                    30,
                ][monitorId % 3] * 1000,
            retryAttempts: [
                1,
                3,
                5,
            ][monitorId % 3],
            monitoring: Math.random() > 0.1, // 90% active
            status: Math.random() > 0.05 ? "up" : "down", // 95% uptime
            responseTime: Math.floor(Math.random() * 500) + 10,
            lastChecked: new Date(Date.now() - Math.random() * 3_600_000),
            history: [],
        };
    }

    function generateStatusHistory(
        monitorId: string,
        count: number
    ): StatusHistory[] {
        const history: StatusHistory[] = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            history.push({
                id: `history-${monitorId}-${i}`,
                monitorId,
                timestamp: new Date(now - i * 30_000), // 30-second intervals
                status: Math.random() > 0.05 ? "up" : "down",
                responseTime: Math.floor(Math.random() * 1000) + 10,
                errorMessage: Math.random() > 0.9 ? `Error ${i}` : undefined,
            });
        }

        return history;
    }

    // Small-scale operations (typical usage)
    describe("Small-Scale Operations (1-10 sites)", () => {
        bench(
            "Insert 10 sites with 5 monitors each",
            async () => {
                await databaseService.executeTransaction(async () => {
                    for (let i = 0; i < 10; i++) {
                        const site = generateSite(i);
                        await siteRepository.upsertInternal(site);

                        for (let j = 0; j < 5; j++) {
                            const monitor = generateMonitor(
                                site.identifier,
                                i * 5 + j
                            );
                            await monitorRepository.createInternal(monitor);
                        }
                    }
                });
            },
            { iterations: 5 }
        );

        bench(
            "Query all sites with monitors (small dataset)",
            async () => {
                await siteRepository.findAll();
            },
            { iterations: 100 }
        );

        bench(
            "Update 50 monitors status",
            async () => {
                await databaseService.executeTransaction(async () => {
                    for (let i = 0; i < 50; i++) {
                        const monitorId = `benchmark-monitor-${i}`;
                        await monitorRepository.updateStatus(
                            monitorId,
                            Math.random() > 0.5 ? "up" : "down",
                            Math.floor(Math.random() * 500) + 10
                        );
                    }
                });
            },
            { iterations: 10 }
        );
    });

    // Medium-scale operations (realistic production load)
    describe("Medium-Scale Operations (50-100 sites)", () => {
        bench(
            "Bulk insert 100 sites with 10 monitors each",
            async () => {
                await databaseService.executeTransaction(async () => {
                    for (let i = 100; i < 200; i++) {
                        const site = generateSite(i);
                        await siteRepository.upsertInternal(site);

                        for (let j = 0; j < 10; j++) {
                            const monitor = generateMonitor(
                                site.identifier,
                                i * 10 + j
                            );
                            await monitorRepository.createInternal(monitor);
                        }
                    }
                });
            },
            { iterations: 2 }
        );

        bench(
            "Complex query: Sites with failing monitors",
            async () => {
                await siteRepository.findSitesWithStatus("down");
            },
            { iterations: 50 }
        );

        bench(
            "Bulk history insertion (1000 entries)",
            async () => {
                const monitorId = "benchmark-monitor-0";
                const history = generateStatusHistory(monitorId, 1000);

                await databaseService.executeTransaction(async () => {
                    for (const entry of history) {
                        await historyRepository.create(entry);
                    }
                });
            },
            { iterations: 5 }
        );

        bench(
            "History cleanup (remove old entries)",
            async () => {
                const cutoffDate = new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000
                ); // 30 days ago
                await historyRepository.deleteOlderThan(cutoffDate);
            },
            { iterations: 10 }
        );
    });

    // Large-scale operations (stress testing)
    describe("Large-Scale Operations (500+ sites)", () => {
        bench(
            "Massive bulk insert: 500 sites with 5 monitors each",
            async () => {
                await databaseService.executeTransaction(async () => {
                    for (let i = 500; i < 1000; i++) {
                        const site = generateSite(i);
                        await siteRepository.upsertInternal(site);

                        for (let j = 0; j < 5; j++) {
                            const monitor = generateMonitor(
                                site.identifier,
                                i * 5 + j
                            );
                            await monitorRepository.createInternal(monitor);
                        }
                    }
                });
            },
            { iterations: 1 }
        );

        bench(
            "Full database query: All sites with all data",
            async () => {
                await siteRepository.findAllWithMonitors();
            },
            { iterations: 10 }
        );

        bench(
            "Concurrent status updates (2500 monitors)",
            async () => {
                const updatePromises = [];
                for (let i = 0; i < 2500; i++) {
                    const monitorId = `benchmark-monitor-${i}`;
                    const promise = monitorRepository.updateStatus(
                        monitorId,
                        Math.random() > 0.5 ? "up" : "down",
                        Math.floor(Math.random() * 500) + 10
                    );
                    updatePromises.push(promise);
                }
                await Promise.all(updatePromises);
            },
            { iterations: 2 }
        );

        bench(
            "Database backup operation",
            async () => {
                await databaseService.backup();
            },
            { iterations: 1 }
        );
    });

    // Memory pressure operations
    describe("Memory Pressure Operations", () => {
        bench(
            "Load large result set (10,000 history entries)",
            async () => {
                const monitorId = "benchmark-monitor-0";
                await historyRepository.findByMonitorId(monitorId, 10_000);
            },
            { iterations: 5 }
        );

        bench(
            "Aggregate operations: Calculate uptime statistics",
            async () => {
                const monitorId = "benchmark-monitor-0";
                const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
                await historyRepository.calculateUptimePercentage(
                    monitorId,
                    last24Hours
                );
            },
            { iterations: 20 }
        );

        bench(
            "Complex JOIN: Sites with monitor statistics",
            async () => {
                await siteRepository.findSitesWithStatistics();
            },
            { iterations: 10 }
        );
    });

    // Transaction performance
    describe("Transaction Performance", () => {
        bench(
            "Nested transactions: Site with monitors and history",
            async () => {
                await databaseService.executeTransaction(async () => {
                    const site = generateSite(9999);
                    await siteRepository.upsertInternal(site);

                    await databaseService.executeTransaction(async () => {
                        for (let i = 0; i < 5; i++) {
                            const monitor = generateMonitor(
                                site.identifier,
                                9999 * 5 + i
                            );
                            await monitorRepository.createInternal(monitor);

                            const history = generateStatusHistory(
                                monitor.id,
                                100
                            );
                            for (const entry of history.slice(0, 10)) {
                                await historyRepository.create(entry);
                            }
                        }
                    });
                });
            },
            { iterations: 5 }
        );

        bench(
            "Transaction rollback simulation",
            async () => {
                try {
                    await databaseService.executeTransaction(async () => {
                        const site = generateSite(8888);
                        await siteRepository.upsertInternal(site);

                        // Simulate an error that would cause rollback
                        throw new Error("Simulated error for rollback");
                    });
                } catch {
                    // Expected error for rollback simulation
                }
            },
            { iterations: 10 }
        );

        bench(
            "Long-running transaction (100 operations)",
            async () => {
                await databaseService.executeTransaction(async () => {
                    for (let i = 0; i < 100; i++) {
                        const monitor = generateMonitor(
                            "long-transaction-site",
                            i
                        );
                        await monitorRepository.createInternal(monitor);
                    }
                });
            },
            { iterations: 3 }
        );
    });

    // Real-world simulation scenarios
    describe("Real-World Simulation Scenarios", () => {
        bench(
            "Morning startup: Load all sites and refresh status",
            async () => {
                // Simulate app startup - load all sites
                const sites = await siteRepository.findAll();

                // Simulate status refresh for all monitors
                for (const site of sites.slice(0, 50)) {
                    // Limit for benchmark
                    for (const monitor of site.monitors) {
                        await monitorRepository.updateStatus(
                            monitor.id,
                            Math.random() > 0.05 ? "up" : "down",
                            Math.floor(Math.random() * 500) + 10
                        );
                    }
                }
            },
            { iterations: 3 }
        );

        bench(
            "Peak monitoring: Concurrent updates from all monitors",
            async () => {
                // Simulate peak monitoring period with many concurrent updates
                const updatePromises = [];

                for (let i = 0; i < 200; i++) {
                    const monitorId = `benchmark-monitor-${i}`;
                    const historyEntry = {
                        id: `peak-${i}-${Date.now()}`,
                        monitorId,
                        timestamp: new Date(),
                        status:
                            Math.random() > 0.05
                                ? ("up" as const)
                                : ("down" as const),
                        responseTime: Math.floor(Math.random() * 500) + 10,
                    };

                    updatePromises.push(historyRepository.create(historyEntry));
                }

                await Promise.all(updatePromises);
            },
            { iterations: 5 }
        );

        bench(
            "Data maintenance: Cleanup and optimization",
            async () => {
                // Simulate daily maintenance operations
                const thirtyDaysAgo = new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000
                );

                // Cleanup old history
                await historyRepository.deleteOlderThan(thirtyDaysAgo);

                // Optimize database (VACUUM equivalent)
                await databaseService.optimize();
            },
            { iterations: 2 }
        );
    });
});
