/**
 * Status Aggregator Performance Benchmarks
 *
 * @file Performance benchmarks for status aggregation operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-StatusAggregator
 * @tags ["performance", "monitoring", "status", "aggregation"]
 */

import { bench, describe } from "vitest";

class MockStatusAggregator {
    aggregateStatuses(statuses: { id: string; status: string; timestamp: number }[]): any {
        const grouped = statuses.reduce((acc: any, status) => {
            acc[status.status] = (acc[status.status] || 0) + 1;
            return acc;
        }, {});
        return grouped;
    }

    getOverallStatus(statuses: { status: string }[]): string {
        if (statuses.some(s => s.status === 'critical')) return 'critical';
        if (statuses.some(s => s.status === 'degraded')) return 'degraded';
        if (statuses.every(s => s.status === 'online')) return 'online';
        return 'mixed';
    }
}

describe("Status Aggregator Performance", () => {
    let aggregator: MockStatusAggregator;

    bench("status aggregation", () => {
        aggregator = new MockStatusAggregator();
        const statuses = Array.from({ length: 1000 }, (_, i) => ({
            id: `status-${i}`,
            status: ['online', 'offline', 'degraded', 'critical'][i % 4],
            timestamp: Date.now() - i * 1000
        }));
        aggregator.aggregateStatuses(statuses);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("overall status calculation", () => {
        aggregator = new MockStatusAggregator();
        const statuses = Array.from({ length: 500 }, (_, i) => ({
            status: ['online', 'offline', 'degraded'][i % 3]
        }));
        aggregator.getOverallStatus(statuses);
    }, { warmupIterations: 5, iterations: 2000 });
});
