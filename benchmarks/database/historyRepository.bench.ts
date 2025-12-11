/**
 * History Repository Performance Benchmarks
 *
 * @file Performance benchmarks for history repository operations including
 *   event logging, bulk inserts, and historical data queries.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-HistoryRepository
 *
 * @tags ["performance", "database", "repository", "history", "logging"]
 */

import { bench, describe } from "vitest";

// Mock database connection
class MockDatabase {
    private history: any[] = [];
    private nextId = 1;

    prepare(sql: string) {
        return {
            run: (...params: any[]) => {
                if (sql.includes("INSERT")) {
                    const record = {
                        id: this.nextId++,
                        timestamp: Date.now(),
                        ...params,
                    };
                    this.history.push(record);
                    return { lastInsertRowid: record.id };
                }
                if (sql.includes("DELETE")) {
                    const initialLength = this.history.length;
                    if (sql.includes("timestamp <")) {
                        const cutoff = params[0];
                        this.history = this.history.filter(
                            (h) => h.timestamp >= cutoff
                        );
                    } else {
                        const index = this.history.findIndex(
                            (h) => h.id === params[0]
                        );
                        if (index !== -1) {
                            this.history.splice(index, 1);
                        }
                    }
                    return { changes: initialLength - this.history.length };
                }
                return {};
            },
            get: (...params: any[]) => {
                if (sql.includes("SELECT") && params.length > 0) {
                    return this.history.find((h) => h.id === params[0]);
                }
                return this.history[0];
            },
            all: () => {
                if (sql.includes("ORDER BY timestamp DESC LIMIT")) {
                    return this.history
                        .toSorted((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 100);
                }
                if (sql.includes("WHERE monitorId =")) {
                    return this.history.filter((h) => h.monitorId === 1);
                }
                if (sql.includes("WHERE site_identifier =")) {
                    return this.history.filter((h) => h.siteIdentifier === 1);
                }
                return this.history;
            },
        };
    }

    exec(sql: string) {
        return this;
    }
}

// Mock HistoryRepository
class MockHistoryRepository {
    private db: MockDatabase;

    constructor() {
        this.db = new MockDatabase();
        this.initialize();
    }

    private initialize() {
        // Seed with test data
        const now = Date.now();
        for (let i = 0; i < 10_000; i++) {
            this.logEvent({
                siteIdentifier: (i % 100) + 1,
                monitorId: (i % 1000) + 1,
                eventType: [
                    "status_change",
                    "check_result",
                    "error",
                    "recovery",
                ][i % 4],
                status: [
                    "online",
                    "offline",
                    "degraded",
                ][i % 3],
                message: `Test event ${i}`,
                metadata: JSON.stringify({
                    responseTime: Math.floor(Math.random() * 1000),
                    statusCode: [
                        200,
                        404,
                        500,
                        503,
                    ][i % 4],
                }),
                timestamp: now - i * 60_000, // 1 minute intervals
            });
        }
    }

    logEvent(event: any) {
        const stmt = this.db.prepare(`
            INSERT INTO history (site_identifier, monitorId, eventType, status, message, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            event.siteIdentifier,
            event.monitorId,
            event.eventType,
            event.status,
            event.message,
            event.metadata,
            event.timestamp
        );
    }

    findById(id: number) {
        const stmt = this.db.prepare("SELECT * FROM history WHERE id = ?");
        return stmt.get(id);
    }

    findRecent(limit: number = 100) {
        const stmt = this.db.prepare(
            "SELECT * FROM history ORDER BY timestamp DESC LIMIT ?"
        );
        return stmt.all();
    }

    findByMonitor(monitorId: number, limit: number = 100) {
        const stmt = this.db.prepare(
            "SELECT * FROM history WHERE monitorId = ? ORDER BY timestamp DESC LIMIT ?"
        );
        return stmt.all();
    }

    findBySite(siteIdentifier: number, limit: number = 100) {
        const stmt = this.db.prepare(
            "SELECT * FROM history WHERE site_identifier = ? ORDER BY timestamp DESC LIMIT ?"
        );
        return stmt.all();
    }

    findByDateRange(startDate: number, endDate: number) {
        const stmt = this.db.prepare(
            "SELECT * FROM history WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC"
        );
        return stmt.all();
    }

    findByEventType(eventType: string) {
        const stmt = this.db.prepare(
            "SELECT * FROM history WHERE eventType = ? ORDER BY timestamp DESC"
        );
        return stmt.all();
    }

    bulkLogEvents(events: any[]) {
        const stmt = this.db.prepare(`
            INSERT INTO history (site_identifier, monitorId, eventType, status, message, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return events.map((event) =>
            stmt.run(
                event.siteIdentifier,
                event.monitorId,
                event.eventType,
                event.status,
                event.message,
                event.metadata,
                event.timestamp
            ));
    }

    deleteOldRecords(cutoffTimestamp: number) {
        const stmt = this.db.prepare("DELETE FROM history WHERE timestamp < ?");
        return stmt.run(cutoffTimestamp);
    }

    getStatistics() {
        const all = this.db.prepare("SELECT * FROM history").all();
        const eventTypes = [
            "status_change",
            "check_result",
            "error",
            "recovery",
        ];
        return {
            total: all.length,
            byEventType: Object.fromEntries(
                eventTypes.map((type) => [
                    type,
                    all.filter((h: any) => h.eventType === type).length,
                ])
            ),
            lastWeek: all.filter(
                (h: any) => h.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
            ).length,
        };
    }

    cleanup(retentionDays: number = 30) {
        const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        return this.deleteOldRecords(cutoff);
    }

    getResponseTimeStats(monitorId: number, hours: number = 24) {
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        const stmt = this.db.prepare(`
            SELECT metadata FROM history
            WHERE monitorId = ? AND timestamp > ? AND eventType = 'check_result'
        `);
        const records = stmt.all();
        const responseTimes = records
            .map((r: any) => {
                try {
                    return JSON.parse(r.metadata).responseTime || 0;
                } catch {
                    return 0;
                }
            })
            .filter((rt) => rt > 0);

        if (responseTimes.length === 0)
            return { avg: 0, min: 0, max: 0, count: 0 };

        return {
            avg:
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            min: Math.min(...responseTimes),
            max: Math.max(...responseTimes),
            count: responseTimes.length,
        };
    }
}

describe("History Repository Performance", () => {
    let repository: MockHistoryRepository;

    bench(
        "repository initialization",
        () => {
            repository = new MockHistoryRepository();
        },
        { warmupIterations: 5, iterations: 50 }
    );

    bench(
        "log single event",
        () => {
            repository = new MockHistoryRepository();
            repository.logEvent({
                siteIdentifier: 1,
                monitorId: 1,
                eventType: "status_change",
                status: "online",
                message: "Site is now online",
                metadata: JSON.stringify({
                    responseTime: 150,
                    statusCode: 200,
                }),
                timestamp: Date.now(),
            });
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "find record by id",
        () => {
            repository = new MockHistoryRepository();
            repository.findById(Math.floor(Math.random() * 10_000) + 1);
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "find recent records",
        () => {
            repository = new MockHistoryRepository();
            repository.findRecent(100);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find records by monitor",
        () => {
            repository = new MockHistoryRepository();
            repository.findByMonitor(Math.floor(Math.random() * 1000) + 1, 100);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find records by site",
        () => {
            repository = new MockHistoryRepository();
            repository.findBySite(Math.floor(Math.random() * 100) + 1, 100);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find records by date range",
        () => {
            repository = new MockHistoryRepository();
            const now = Date.now();
            repository.findByDateRange(now - 24 * 60 * 60 * 1000, now);
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "find records by event type",
        () => {
            repository = new MockHistoryRepository();
            const types = [
                "status_change",
                "check_result",
                "error",
                "recovery",
            ];
            repository.findByEventType(
                types[Math.floor(Math.random() * types.length)]
            );
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "bulk log events (50 events)",
        () => {
            repository = new MockHistoryRepository();
            const events = Array.from({ length: 50 }, (_, i) => ({
                siteIdentifier: (i % 10) + 1,
                monitorId: (i % 50) + 1,
                eventType: "check_result",
                status: Math.random() > 0.5 ? "online" : "offline",
                message: `Bulk event ${i}`,
                metadata: JSON.stringify({
                    responseTime: Math.floor(Math.random() * 1000),
                }),
                timestamp: Date.now() - i * 1000,
            }));
            repository.bulkLogEvents(events);
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "delete old records",
        () => {
            repository = new MockHistoryRepository();
            const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
            repository.deleteOldRecords(cutoff);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "get statistics",
        () => {
            repository = new MockHistoryRepository();
            repository.getStatistics();
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "cleanup old records",
        () => {
            repository = new MockHistoryRepository();
            repository.cleanup(30);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "get response time stats",
        () => {
            repository = new MockHistoryRepository();
            repository.getResponseTimeStats(
                Math.floor(Math.random() * 1000) + 1,
                24
            );
        },
        { warmupIterations: 5, iterations: 500 }
    );
});
