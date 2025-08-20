/**
 * Database Query Performance Benchmarks
 *
 * @file Performance benchmarks for database query operations including complex
 *   queries, joins, aggregations, and query optimization.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-Queries
 *
 * @tags ["performance", "database", "queries", "joins", "aggregation"]
 */

import { bench, describe } from "vitest";

// Mock query executor
class MockQueryExecutor {
    private data = new Map<string, any[]>();

    constructor() {
        this.initializeTestData();
    }

    private initializeTestData() {
        // Sites table
        const sites = Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            name: `Site ${i + 1}`,
            url: `https://site${i + 1}.com`,
            isActive: Math.random() > 0.2,
            createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        }));
        this.data.set("sites", sites);

        // Monitors table
        const monitors = Array.from({ length: 3000 }, (_, i) => ({
            id: i + 1,
            siteId: Math.floor(Math.random() * 1000) + 1,
            type: [
                "http",
                "ping",
                "port",
            ][i % 3],
            name: `Monitor ${i + 1}`,
            isEnabled: Math.random() > 0.1,
            interval: [
                30_000,
                60_000,
                120_000,
            ][i % 3],
            lastChecked: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        }));
        this.data.set("monitors", monitors);

        // History table
        const history = Array.from({ length: 50_000 }, (_, i) => ({
            id: i + 1,
            monitorId: Math.floor(Math.random() * 3000) + 1,
            siteId: Math.floor(Math.random() * 1000) + 1,
            status: [
                "online",
                "offline",
                "degraded",
            ][i % 3],
            responseTime: Math.floor(Math.random() * 2000),
            timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            eventType: [
                "status_change",
                "check_result",
                "alert",
            ][i % 3],
        }));
        this.data.set("history", history);
    }

    executeSimpleSelect(table: string, limit?: number) {
        const tableData = this.data.get(table) || [];
        return limit ? tableData.slice(0, limit) : tableData;
    }

    executeSelectWithWhere(
        table: string,
        condition: (row: any) => boolean,
        limit?: number
    ) {
        const tableData = this.data.get(table) || [];
        const filtered = tableData.filter(condition);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    executeJoin() {
        const sites = this.data.get("sites") || [];
        const monitors = this.data.get("monitors") || [];

        return sites.map((site) => ({
            ...site,
            monitors: monitors.filter((monitor) => monitor.siteId === site.id),
        }));
    }

    executeComplexJoin() {
        const sites = this.data.get("sites") || [];
        const monitors = this.data.get("monitors") || [];
        const history = this.data.get("history") || [];

        return sites.map((site) => {
            const siteMonitors = monitors.filter(
                (monitor) => monitor.siteId === site.id
            );
            return {
                ...site,
                monitors: siteMonitors.map((monitor) => ({
                    ...monitor,
                    recentHistory: history
                        .filter((h) => h.monitorId === monitor.id)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 10),
                })),
            };
        });
    }

    executeAggregation() {
        const history = this.data.get("history") || [];
        const statusCounts = history.reduce((acc: any, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {});

        return {
            total: history.length,
            statusCounts,
            avgResponseTime:
                history.reduce((sum, record) => sum + record.responseTime, 0) /
                history.length,
        };
    }

    executeGroupBy() {
        const history = this.data.get("history") || [];
        const groupedByType = history.reduce((acc: any, record) => {
            if (!acc[record.eventType]) {
                acc[record.eventType] = {
                    count: 0,
                    totalResponseTime: 0,
                    records: [],
                };
            }
            acc[record.eventType].count++;
            acc[record.eventType].totalResponseTime += record.responseTime;
            acc[record.eventType].records.push(record);
            return acc;
        }, {});

        // Calculate averages
        Object.keys(groupedByType).forEach((type) => {
            groupedByType[type].avgResponseTime =
                groupedByType[type].totalResponseTime /
                groupedByType[type].count;
        });

        return groupedByType;
    }

    executeSubquery() {
        const sites = this.data.get("sites") || [];
        const monitors = this.data.get("monitors") || [];

        return sites.filter((site) => {
            const activeMonitors = monitors.filter(
                (m) => m.siteId === site.id && m.isEnabled
            );
            return activeMonitors.length > 0;
        });
    }

    executeWindowFunction() {
        const history = this.data.get("history") || [];

        // Sort by timestamp and add row numbers within each monitor group
        const sortedHistory = history
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((record, index) => ({
                ...record,
                rowNumber: index + 1,
            }));

        // Group by monitorId and get latest 5 records for each
        const groupedByMonitor = sortedHistory.reduce((acc: any, record) => {
            if (!acc[record.monitorId]) {
                acc[record.monitorId] = [];
            }
            if (acc[record.monitorId].length < 5) {
                acc[record.monitorId].push(record);
            }
            return acc;
        }, {});

        return groupedByMonitor;
    }

    executeRangeQuery(startTime: number, endTime: number) {
        const history = this.data.get("history") || [];
        return history.filter(
            (record) =>
                record.timestamp >= startTime && record.timestamp <= endTime
        );
    }

    executeFullTextSearch(searchTerm: string) {
        const sites = this.data.get("sites") || [];
        const monitors = this.data.get("monitors") || [];

        const lowerSearchTerm = searchTerm.toLowerCase();

        const matchingSites = sites.filter(
            (site) =>
                site.name.toLowerCase().includes(lowerSearchTerm) ||
                site.url.toLowerCase().includes(lowerSearchTerm)
        );

        const matchingMonitors = monitors.filter((monitor) =>
            monitor.name.toLowerCase().includes(lowerSearchTerm)
        );

        return { sites: matchingSites, monitors: matchingMonitors };
    }

    executeStatisticalQuery() {
        const history = this.data.get("history") || [];
        const responseTimes = history
            .map((h) => h.responseTime)
            .sort((a, b) => a - b);

        const median = responseTimes[Math.floor(responseTimes.length / 2)];
        const q1 = responseTimes[Math.floor(responseTimes.length * 0.25)];
        const q3 = responseTimes[Math.floor(responseTimes.length * 0.75)];

        return {
            count: responseTimes.length,
            min: Math.min(...responseTimes),
            max: Math.max(...responseTimes),
            mean:
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            median,
            q1,
            q3,
            stdDev: this.calculateStandardDeviation(responseTimes),
        };
    }

    private calculateStandardDeviation(values: number[]) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map((value) => (value - mean) ** 2);
        const avgSquareDiff =
            squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    executePaginatedQuery(page: number, pageSize: number) {
        const history = this.data.get("history") || [];
        const offset = (page - 1) * pageSize;
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);

        return {
            data: sortedHistory.slice(offset, offset + pageSize),
            pagination: {
                page,
                pageSize,
                total: history.length,
                totalPages: Math.ceil(history.length / pageSize),
            },
        };
    }

    executeIndexOptimizedQuery() {
        // Simulate index-optimized query by filtering on indexed columns
        const sites = this.data.get("sites") || [];
        const monitors = this.data.get("monitors") || [];

        const activeSites = sites.filter((site) => site.isActive);
        const enabledMonitors = monitors.filter((monitor) => monitor.isEnabled);

        return { activeSites, enabledMonitors };
    }
}

describe("Database Query Performance", () => {
    let executor: MockQueryExecutor;

    bench(
        "query executor initialization",
        () => {
            executor = new MockQueryExecutor();
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "simple SELECT query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeSimpleSelect("sites", 100);
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "SELECT with WHERE clause",
        () => {
            executor = new MockQueryExecutor();
            executor.executeSelectWithWhere(
                "sites",
                (site) => site.isActive,
                100
            );
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "simple JOIN query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeJoin();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "complex JOIN with nested data",
        () => {
            executor = new MockQueryExecutor();
            executor.executeComplexJoin();
        },
        { warmupIterations: 2, iterations: 20 }
    );

    bench(
        "aggregation query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeAggregation();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "GROUP BY query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeGroupBy();
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "subquery execution",
        () => {
            executor = new MockQueryExecutor();
            executor.executeSubquery();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "window function simulation",
        () => {
            executor = new MockQueryExecutor();
            executor.executeWindowFunction();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "range query (last 7 days)",
        () => {
            executor = new MockQueryExecutor();
            const endTime = Date.now();
            const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
            executor.executeRangeQuery(startTime, endTime);
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "full-text search",
        () => {
            executor = new MockQueryExecutor();
            executor.executeFullTextSearch("Site");
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "statistical analysis query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeStatisticalQuery();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "paginated query (page 1, 50 items)",
        () => {
            executor = new MockQueryExecutor();
            executor.executePaginatedQuery(1, 50);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "paginated query (page 10, 100 items)",
        () => {
            executor = new MockQueryExecutor();
            executor.executePaginatedQuery(10, 100);
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "index-optimized query",
        () => {
            executor = new MockQueryExecutor();
            executor.executeIndexOptimizedQuery();
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "large dataset aggregation",
        () => {
            executor = new MockQueryExecutor();
            const history = executor["data"].get("history") || [];
            const largeDataset = history.concat(history, history); // Triple the data
            executor["data"].set("history", largeDataset);
            executor.executeAggregation();
        },
        { warmupIterations: 2, iterations: 50 }
    );
});
