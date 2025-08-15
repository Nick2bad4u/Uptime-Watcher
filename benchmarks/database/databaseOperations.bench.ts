/**
 * Benchmark tests for database operations
 *
 * @file Performance benchmarks for heavy computational database operations
 *   including bulk insertions, data mapping, and query processing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Database
 *
 * @tags ["performance", "database", "mapping", "bulk-operations"]
 */

import { bench, describe, beforeAll } from "vitest";

// Type definitions for benchmarking
interface StatusHistory {
    timestamp: number;
    status: "up" | "down";
    responseTime: number;
    details?: string;
}

interface DatabaseMonitorRow {
    id: string;
    site_identifier: string;
    type: string;
    url?: string;
    host?: string;
    port?: number;
    checkInterval: number;
    timeout: number;
    retryAttempts: number;
    monitoring: boolean;
    status: string;
    responseTime: number;
    lastChecked?: Date;
    active_operations?: string;
}

interface Monitor {
    id: string;
    siteIdentifier: string;
    type: string;
    url?: string;
    host?: string;
    port?: number;
    checkInterval: number;
    timeout: number;
    retryAttempts: number;
    monitoring: boolean;
    status: string;
    responseTime: number;
    lastChecked?: Date;
    activeOperations: string[];
}

// Mock data generators for benchmarking
function generateHistoryEntries(count: number): StatusHistory[] {
    const entries: StatusHistory[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        entries.push({
            timestamp: now - i * 30000, // 30 second intervals
            status: Math.random() > 0.05 ? "up" : "down", // 95% uptime
            responseTime: Math.floor(Math.random() * 1000) + 50,
            details: Math.random() > 0.8 ? `Error details ${i}` : undefined,
        });
    }

    return entries;
}

function generateDatabaseRows(count: number): DatabaseMonitorRow[] {
    const rows: DatabaseMonitorRow[] = [];

    for (let i = 0; i < count; i++) {
        rows.push({
            id: `monitor-${i}`,
            site_identifier: `site-${Math.floor(i / 10)}`,
            type: ["http", "ping", "port"][i % 3],
            url: i % 3 === 0 ? `https://example${i}.com` : undefined,
            host: i % 3 !== 0 ? `host${i}.example.com` : undefined,
            port: i % 3 === 2 ? 8080 + (i % 100) : undefined,
            checkInterval: [60, 300, 600][i % 3] * 1000,
            timeout: [5, 10, 30][i % 3] * 1000,
            retryAttempts: [1, 3, 5][i % 3],
            monitoring: Math.random() > 0.1,
            status: Math.random() > 0.05 ? "up" : "down",
            responseTime: Math.floor(Math.random() * 1000) + 50,
            lastChecked: new Date(Date.now() - Math.random() * 86400000),
            active_operations: JSON.stringify([`op-${i}-1`, `op-${i}-2`]),
        });
    }

    return rows;
}

// Benchmark implementation functions
function simulateBulkHistoryInsert(entries: StatusHistory[]): void {
    // Simulate the operations that would happen in bulkInsertHistory
    for (const entry of entries) {
        // Simulate parameter preparation
        const params = [
            "monitor-id",
            entry.timestamp,
            entry.status,
            entry.responseTime,
            entry.details ?? null,
        ];

        // Simulate some processing time
        JSON.stringify(params);
    }
}

function parseActiveOperations(activeOperationsJson: string): string[] {
    if (!activeOperationsJson) {
        return [];
    }

    try {
        const parsed = JSON.parse(activeOperationsJson);
        if (
            Array.isArray(parsed) &&
            parsed.every((op) => typeof op === "string")
        ) {
            return parsed;
        }
        return [];
    } catch {
        return [];
    }
}

function mapRowToMonitor(row: DatabaseMonitorRow): Monitor {
    return {
        id: row.id,
        siteIdentifier: row.site_identifier,
        type: row.type,
        url: row.url,
        host: row.host,
        port: row.port,
        checkInterval: row.checkInterval,
        timeout: row.timeout,
        retryAttempts: row.retryAttempts,
        monitoring: row.monitoring,
        status: row.status,
        responseTime: row.responseTime,
        lastChecked: row.lastChecked,
        activeOperations: parseActiveOperations(row.active_operations || "[]"),
    };
}

function rowsToMonitors(rows: DatabaseMonitorRow[]): Monitor[] {
    return rows.map((row) => mapRowToMonitor(row));
}

function simulateValidation(data: unknown[]): boolean {
    return data.every(
        (item) =>
            item !== null && item !== undefined && typeof item === "object"
    );
}

function simulateParameterGeneration(monitors: Monitor[]): unknown[][] {
    return monitors.map((monitor) => [
        monitor.siteIdentifier,
        monitor.type,
        monitor.url,
        monitor.host,
        monitor.port,
        monitor.checkInterval,
        monitor.timeout,
        monitor.retryAttempts,
        monitor.monitoring,
        monitor.status,
        monitor.responseTime,
        monitor.lastChecked?.getTime(),
        JSON.stringify(monitor.activeOperations),
    ]);
}

describe("Database Operations Performance Benchmarks", () => {
    let smallHistoryDataset: StatusHistory[];
    let mediumHistoryDataset: StatusHistory[];
    let largeHistoryDataset: StatusHistory[];
    let smallRowDataset: DatabaseMonitorRow[];
    let mediumRowDataset: DatabaseMonitorRow[];
    let largeRowDataset: DatabaseMonitorRow[];

    beforeAll(() => {
        // Pre-generate datasets to avoid affecting benchmark timing
        smallHistoryDataset = generateHistoryEntries(100);
        mediumHistoryDataset = generateHistoryEntries(1000);
        largeHistoryDataset = generateHistoryEntries(10000);
        smallRowDataset = generateDatabaseRows(100);
        mediumRowDataset = generateDatabaseRows(1000);
        largeRowDataset = generateDatabaseRows(5000);
    });

    // Bulk history insertion benchmarks
    bench(
        "Bulk history insert simulation - Small dataset (100 entries)",
        () => {
            simulateBulkHistoryInsert(smallHistoryDataset);
        },
        {
            time: 1000,
            iterations: 100,
            warmupTime: 100,
            warmupIterations: 5,
        }
    );

    bench(
        "Bulk history insert simulation - Medium dataset (1K entries)",
        () => {
            simulateBulkHistoryInsert(mediumHistoryDataset);
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    bench(
        "Bulk history insert simulation - Large dataset (10K entries)",
        () => {
            simulateBulkHistoryInsert(largeHistoryDataset);
        },
        {
            time: 2000,
            iterations: 10,
            warmupTime: 500,
            warmupIterations: 2,
        }
    );

    // Monitor mapping benchmarks
    bench(
        "Row to monitor mapping - Small dataset (100 rows)",
        () => {
            rowsToMonitors(smallRowDataset);
        },
        {
            time: 1000,
            iterations: 100,
            warmupTime: 100,
            warmupIterations: 5,
        }
    );

    bench(
        "Row to monitor mapping - Medium dataset (1K rows)",
        () => {
            rowsToMonitors(mediumRowDataset);
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    bench(
        "Row to monitor mapping - Large dataset (5K rows)",
        () => {
            rowsToMonitors(largeRowDataset);
        },
        {
            time: 2000,
            iterations: 20,
            warmupTime: 500,
            warmupIterations: 2,
        }
    );

    // JSON parsing benchmarks (active operations)
    bench(
        "JSON parsing for active operations - Medium dataset (1K operations)",
        () => {
            for (const row of mediumRowDataset) {
                parseActiveOperations(row.active_operations || "[]");
            }
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    // Data validation benchmarks
    bench(
        "Data validation simulation - Large dataset (5K items)",
        () => {
            simulateValidation(largeRowDataset);
        },
        {
            time: 1000,
            iterations: 30,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    // Parameter generation benchmarks
    bench(
        "Parameter generation - Large dataset (5K monitors)",
        () => {
            const monitors = rowsToMonitors(largeRowDataset);
            simulateParameterGeneration(monitors);
        },
        {
            time: 2000,
            iterations: 10,
            warmupTime: 500,
            warmupIterations: 2,
        }
    );

    // Complex combined operations
    bench(
        "Complete mapping pipeline - Large dataset (5K rows)",
        () => {
            const monitors = rowsToMonitors(largeRowDataset);
            simulateValidation(monitors);
            simulateParameterGeneration(monitors);
        },
        {
            time: 3000,
            iterations: 5,
            warmupTime: 1000,
            warmupIterations: 1,
        }
    );
});
