/**
 * Monitor Repository Performance Benchmarks
 *
 * @file Performance benchmarks for monitor repository operations including
 *   monitor CRUD operations, status updates, and bulk processing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-MonitorRepository
 *
 * @tags ["performance", "database", "repository", "monitors", "crud"]
 */

import { bench, describe } from "vitest";

// Mock database connection
class MockDatabase {
    private monitors: any[] = [];
    private nextId = 1;

    prepare(sql: string) {
        return {
            run: (...params: any[]) => {
                if (sql.includes("INSERT")) {
                    const monitor = { id: this.nextId++, ...params };
                    this.monitors.push(monitor);
                    return { lastInsertRowid: monitor.id };
                }
                if (sql.includes("UPDATE")) {
                    const index = this.monitors.findIndex(
                        (m) => m.id === params.at(-1)
                    );
                    if (index !== -1) {
                        this.monitors[index] = {
                            ...this.monitors[index],
                            ...params,
                        };
                    }
                    return { changes: index === -1 ? 0 : 1 };
                }
                if (sql.includes("DELETE")) {
                    const index = this.monitors.findIndex(
                        (m) => m.id === params[0]
                    );
                    if (index !== -1) {
                        this.monitors.splice(index, 1);
                    }
                    return { changes: index === -1 ? 0 : 1 };
                }
                return {};
            },
            get: (...params: any[]) => {
                if (sql.includes("SELECT") && params.length > 0) {
                    return this.monitors.find((m) => m.id === params[0]);
                }
                return this.monitors[0];
            },
            all: () => this.monitors,
        };
    }

    exec(sql: string) {
        return this;
    }
}

// Mock MonitorRepository
class MockMonitorRepository {
    private db: MockDatabase;

    constructor() {
        this.db = new MockDatabase();
        this.initialize();
    }

    private initialize() {
        // Seed with test data
        for (let i = 0; i < 1000; i++) {
            this.create({
                siteIdentifier: (i % 100) + 1,
                type: [
                    "http",
                    "ping",
                    "port",
                ][i % 3],
                name: `Monitor ${i}`,
                isEnabled: Math.random() > 0.3,
                interval: [
                    30_000,
                    60_000,
                    120_000,
                ][i % 3],
                timeout: 5000,
                retries: 3,
                configuration: JSON.stringify({
                    method: "GET",
                    expectedStatus: 200,
                }),
            });
        }
    }

    create(monitor: any) {
        const stmt = this.db.prepare(`
            INSERT INTO monitors (site_identifier, type, name, isEnabled, interval, timeout, retries, configuration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            monitor.siteIdentifier,
            monitor.type,
            monitor.name,
            monitor.isEnabled,
            monitor.interval,
            monitor.timeout,
            monitor.retries,
            monitor.configuration
        );
    }

    findById(id: number) {
        const stmt = this.db.prepare("SELECT * FROM monitors WHERE id = ?");
        return stmt.get(id);
    }

    findBySiteIdentifier(siteIdentifier: number) {
        const stmt = this.db.prepare(
            "SELECT * FROM monitors WHERE site_identifier = ?"
        );
        return stmt.all();
    }

    findEnabled() {
        const stmt = this.db.prepare(
            "SELECT * FROM monitors WHERE isEnabled = 1"
        );
        return stmt.all();
    }

    findByType(type: string) {
        const stmt = this.db.prepare("SELECT * FROM monitors WHERE type = ?");
        return stmt.all();
    }

    update(id: number, updates: any) {
        const stmt = this.db.prepare(`
            UPDATE monitors SET type = ?, name = ?, isEnabled = ?, interval = ?, timeout = ?, retries = ?, configuration = ?
            WHERE id = ?
        `);
        return stmt.run(
            updates.type,
            updates.name,
            updates.isEnabled,
            updates.interval,
            updates.timeout,
            updates.retries,
            updates.configuration,
            id
        );
    }

    updateStatus(id: number, status: string, lastChecked: string) {
        const stmt = this.db.prepare(`
            UPDATE monitors SET status = ?, lastChecked = ? WHERE id = ?
        `);
        return stmt.run(status, lastChecked, id);
    }

    delete(id: number) {
        const stmt = this.db.prepare("DELETE FROM monitors WHERE id = ?");
        return stmt.run(id);
    }

    deleteBySiteIdentifier(siteIdentifier: number) {
        const stmt = this.db.prepare(
            "DELETE FROM monitors WHERE site_identifier = ?"
        );
        return stmt.run(siteIdentifier);
    }

    bulkUpdateStatus(
        updates: { id: number; status: string; lastChecked: string }[]
    ) {
        const stmt = this.db.prepare(`
            UPDATE monitors SET status = ?, lastChecked = ? WHERE id = ?
        `);
        return updates.map((update) =>
            stmt.run(update.status, update.lastChecked, update.id)
        );
    }

    getStatistics() {
        const all = this.db.prepare("SELECT * FROM monitors").all();
        return {
            total: all.length,
            enabled: all.filter((m: any) => m.isEnabled).length,
            byType: {
                http: all.filter((m: any) => m.type === "http").length,
                ping: all.filter((m: any) => m.type === "ping").length,
                port: all.filter((m: any) => m.type === "port").length,
            },
        };
    }
}

describe("Monitor Repository Performance", () => {
    let repository: MockMonitorRepository;

    bench(
        "repository initialization",
        () => {
            repository = new MockMonitorRepository();
        },
        { warmupIterations: 10, iterations: 100 }
    );

    bench(
        "create single monitor",
        () => {
            repository = new MockMonitorRepository();
            repository.create({
                siteIdentifier: 1,
                type: "http",
                name: "Test Monitor",
                isEnabled: true,
                interval: 60_000,
                timeout: 5000,
                retries: 3,
                configuration: JSON.stringify({
                    method: "GET",
                    expectedStatus: 200,
                }),
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find monitor by id",
        () => {
            repository = new MockMonitorRepository();
            repository.findById(Math.floor(Math.random() * 1000) + 1);
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "find monitors by site id",
        () => {
            repository = new MockMonitorRepository();
            repository.findBySiteIdentifier(
                Math.floor(Math.random() * 100) + 1
            );
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find enabled monitors",
        () => {
            repository = new MockMonitorRepository();
            repository.findEnabled();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "find monitors by type",
        () => {
            repository = new MockMonitorRepository();
            const types = [
                "http",
                "ping",
                "port",
            ];
            repository.findByType(
                types[Math.floor(Math.random() * types.length)]
            );
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "update monitor",
        () => {
            repository = new MockMonitorRepository();
            const id = Math.floor(Math.random() * 1000) + 1;
            repository.update(id, {
                type: "http",
                name: "Updated Monitor",
                isEnabled: false,
                interval: 120_000,
                timeout: 10_000,
                retries: 5,
                configuration: JSON.stringify({
                    method: "POST",
                    expectedStatus: 201,
                }),
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "update monitor status",
        () => {
            repository = new MockMonitorRepository();
            const id = Math.floor(Math.random() * 1000) + 1;
            repository.updateStatus(id, "online", new Date().toISOString());
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "bulk update monitor status (100 monitors)",
        () => {
            repository = new MockMonitorRepository();
            const updates = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                status: Math.random() > 0.5 ? "online" : "offline",
                lastChecked: new Date().toISOString(),
            }));
            repository.bulkUpdateStatus(updates);
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "delete monitor",
        () => {
            repository = new MockMonitorRepository();
            const id = Math.floor(Math.random() * 1000) + 1;
            repository.delete(id);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "delete monitors by site id",
        () => {
            repository = new MockMonitorRepository();
            const siteIdentifier = Math.floor(Math.random() * 100) + 1;
            repository.deleteBySiteIdentifier(siteIdentifier);
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "get statistics",
        () => {
            repository = new MockMonitorRepository();
            repository.getStatistics();
        },
        { warmupIterations: 5, iterations: 500 }
    );
});
