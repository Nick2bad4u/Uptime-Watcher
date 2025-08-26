import { tmpdir } from "node:os";
import path from "node:path";

import { DatabaseService } from "../../electron/services/database/DatabaseService";
import { HistoryRepository } from "../../electron/services/database/HistoryRepository";
import { MonitorRepository } from "../../electron/services/database/MonitorRepository";
import { SiteRepository } from "../../electron/services/database/SiteRepository";
import type { Monitor, Site, StatusHistory } from "../../shared/types";
import type { SiteRow } from "../../electron/services/database/utils/siteMapper";

import { bench, describe, beforeAll, afterAll } from "vitest";

describe("Enhanced Database Operations Benchmarks", () => {
    let databaseService: DatabaseService;
    let siteRepository: SiteRepository;
    let monitorRepository: MonitorRepository;
    let historyRepository: HistoryRepository;
    let tempDbPath: string;

    beforeAll(async () => {
        // Create temporary database for benchmarking
        tempDbPath = path.join(tmpdir(), `benchmark-db-${Date.now()}.db`);

        // Initialize services with actual production code
        databaseService = DatabaseService.getInstance();
        databaseService.initialize();

        // Initialize repositories
        siteRepository = new SiteRepository({ databaseService });
        monitorRepository = new MonitorRepository({ databaseService });
        historyRepository = new HistoryRepository({ databaseService });
    });

    afterAll(async () => {
        if (databaseService) {
            databaseService.close();
        }
    });

    // Data generators for realistic benchmarking
    function generateSite(id: number): SiteRow {
        return {
            identifier: `benchmark-site-${id}`,
            name: `Benchmark Site ${id}`,
            monitoring: Math.random() > 0.2, // 80% monitoring
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
                timestamp: now - i * 30_000, // 30-second intervals in milliseconds
                status: Math.random() > 0.05 ? "up" : "down",
                responseTime: Math.floor(Math.random() * 1000) + 10,
                details: Math.random() > 0.9 ? `Error ${i}` : undefined,
            });
        }

        return history;
    }

    // Small-scale operations (typical usage)
    describe("Small-Scale Operations (1-10 sites)", () => {
        bench(
            "Insert 10 sites with 5 monitors each",
            async () => {
                const sites: SiteRow[] = [];
                for (let i = 0; i < 10; i++) {
                    sites.push(generateSite(i));
                }

                // Use bulkInsert for better performance
                await siteRepository.bulkInsert(sites);

                // Create monitors for each site
                for (let i = 0; i < 10; i++) {
                    const monitors: Monitor[] = [];
                    for (let j = 0; j < 5; j++) {
                        monitors.push(
                            generateMonitor(sites[i].identifier, i * 5 + j)
                        );
                    }
                    await monitorRepository.bulkCreate(
                        sites[i].identifier,
                        monitors
                    );
                }
            },
            { iterations: 5 }
        );

        bench(
            "Query all sites",
            async () => {
                await siteRepository.findAll();
            },
            { iterations: 50 }
        );

        bench(
            "Query monitors by site",
            async () => {
                const siteId = "benchmark-site-0";
                await monitorRepository.findBySiteIdentifier(siteId);
            },
            { iterations: 50 }
        );
    });

    // Medium-scale operations (realistic production load)
    describe("Medium-Scale Operations (50-100 sites)", () => {
        bench(
            "Bulk insert 100 sites with 10 monitors each",
            async () => {
                const sites: SiteRow[] = [];
                for (let i = 100; i < 200; i++) {
                    sites.push(generateSite(i));
                }

                await siteRepository.bulkInsert(sites);

                for (const site of sites) {
                    const monitors: Monitor[] = [];
                    for (let j = 0; j < 10; j++) {
                        monitors.push(generateMonitor(site.identifier, j));
                    }
                    await monitorRepository.bulkCreate(
                        site.identifier,
                        monitors
                    );
                }
            },
            { iterations: 2 }
        );

        bench(
            "Bulk history insertion (1000 entries)",
            async () => {
                const monitorId = "benchmark-monitor-0";
                const history = generateStatusHistory(monitorId, 1000);

                await historyRepository.bulkInsert(monitorId, history);
            },
            { iterations: 5 }
        );

        bench(
            "History cleanup (remove entries for monitor)",
            async () => {
                const monitorId = "benchmark-monitor-0";
                await historyRepository.deleteByMonitorId(monitorId);
            },
            { iterations: 10 }
        );
    });

    // Large-scale operations (stress testing)
    describe("Large-Scale Operations (500+ sites)", () => {
        bench(
            "Massive bulk insert: 500 sites with 5 monitors each",
            async () => {
                const sites: SiteRow[] = [];
                for (let i = 500; i < 1000; i++) {
                    sites.push(generateSite(i));
                }

                await siteRepository.bulkInsert(sites);

                for (const site of sites) {
                    const monitors: Monitor[] = [];
                    for (let j = 0; j < 5; j++) {
                        monitors.push(generateMonitor(site.identifier, j));
                    }
                    await monitorRepository.bulkCreate(
                        site.identifier,
                        monitors
                    );
                }
            },
            { iterations: 1 }
        );

        bench(
            "Full database query: All sites",
            async () => {
                await siteRepository.findAll();
            },
            { iterations: 10 }
        );
    });

    // Memory pressure operations
    describe("Memory Pressure Operations", () => {
        bench(
            "Load large result set (history entries)",
            async () => {
                const monitorId = "benchmark-monitor-0";
                await historyRepository.findByMonitorId(monitorId);
            },
            { iterations: 5 }
        );

        bench(
            "Get history count for monitor",
            async () => {
                const monitorId = "benchmark-monitor-0";
                await historyRepository.getHistoryCount(monitorId);
            },
            { iterations: 20 }
        );
    });

    // Transaction performance
    describe("Transaction Performance", () => {
        bench(
            "Complex transaction: Site with monitors and history",
            async () => {
                await databaseService.executeTransaction(async (db) => {
                    const site = generateSite(9999);
                    siteRepository.upsertInternal(db, site);

                    const monitors: Monitor[] = [];
                    for (let i = 0; i < 5; i++) {
                        monitors.push(generateMonitor(site.identifier, i));
                    }

                    // Create monitors within transaction
                    for (const monitor of monitors) {
                        monitorRepository.createInternal(
                            db,
                            site.identifier,
                            monitor
                        );
                    }
                });
            },
            { iterations: 5 }
        );

        bench(
            "Transaction rollback simulation",
            async () => {
                try {
                    await databaseService.executeTransaction(async (db) => {
                        const site = generateSite(8888);
                        siteRepository.upsertInternal(db, site);

                        // Simulate an error that would cause rollback
                        throw new Error("Simulated error for rollback");
                    });
                } catch {
                    // Expected error for rollback simulation
                }
            },
            { iterations: 10 }
        );
    });

    // Real-world simulation scenarios
    describe("Real-World Simulation Scenarios", () => {
        bench(
            "Morning startup: Load all sites",
            async () => {
                // Simulate app startup - load all sites
                const sites = await siteRepository.findAll();

                // Get monitors for first 50 sites (limit for benchmark)
                for (const site of sites.slice(0, 50)) {
                    await monitorRepository.findBySiteIdentifier(
                        site.identifier
                    );
                }
            },
            { iterations: 3 }
        );

        bench(
            "Data maintenance: Prune history",
            async () => {
                // Simulate maintenance operations - prune history to last 1000 entries
                const monitorIds = await monitorRepository.getAllMonitorIds();

                for (const { id } of monitorIds.slice(0, 10)) {
                    await historyRepository.pruneHistory(id.toString(), 1000);
                }
            },
            { iterations: 2 }
        );
    });
});
