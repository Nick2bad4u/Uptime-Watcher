/**
 * Benchmark tests for site analytics calculations
 * 
 * @fileoverview Performance benchmarks for heavy computational areas in site analytics
 * including downtime calculations, response time statistics, and data processing.
 * 
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category Performance
 * @benchmark Analytics
 * @tags ["performance", "analytics", "site-monitoring", "statistics"]
 */

import { bench, describe } from "vitest";

// Type definitions for benchmarking
interface StatusHistory {
    timestamp: number;
    status: "up" | "down";
    responseTime: number;
}

interface DowntimePeriod {
    duration: number;
    end: number;
    start: number;
}

type TimePeriod = "1h" | "12h" | "24h" | "7d" | "30d";

// Mock data generators for benchmarking
function generateStatusHistory(count: number): StatusHistory[] {
    const history: StatusHistory[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
        history.push({
            timestamp: now - (i * 60000), // 1 minute intervals
            status: Math.random() > 0.1 ? "up" : "down", // 90% uptime
            responseTime: Math.floor(Math.random() * 1000) + 50, // 50-1050ms
        });
    }
    
    return history;
}

function generateLargeDataset(count: number): StatusHistory[] {
    const history: StatusHistory[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
        const isDown = Math.random() < 0.05; // 5% downtime
        history.push({
            timestamp: now - (i * 30000), // 30 second intervals
            status: isDown ? "down" : "up",
            responseTime: isDown ? 0 : Math.floor(Math.random() * 500) + 100,
        });
    }
    
    return history;
}

// Benchmark implementation functions (simplified versions)
function calculateDowntimePeriods(filteredHistory: StatusHistory[]): DowntimePeriod[] {
    const downtimePeriods: DowntimePeriod[] = [];
    let downtimeEnd: number | undefined = undefined;
    let downtimeStart: number | undefined = undefined;

    for (let i = filteredHistory.length - 1; i >= 0; i--) {
        const record = filteredHistory[i];
        if (!record) continue;

        if (record.status === "down") {
            if (downtimeEnd === undefined) {
                downtimeEnd = record.timestamp;
                downtimeStart = record.timestamp;
            } else {
                downtimeStart = record.timestamp;
            }
        } else if (downtimeEnd !== undefined && downtimeStart !== undefined) {
            downtimePeriods.push({
                duration: downtimeEnd - downtimeStart,
                end: downtimeEnd,
                start: downtimeStart,
            });
            downtimeEnd = undefined;
            downtimeStart = undefined;
        }
    }

    if (downtimeEnd !== undefined && downtimeStart !== undefined) {
        downtimePeriods.push({
            duration: downtimeEnd - downtimeStart,
            end: downtimeEnd,
            start: downtimeStart,
        });
    }

    return downtimePeriods;
}

function calculateResponseMetrics(filteredHistory: StatusHistory[]) {
    const responseTimes = filteredHistory.map((h) => h.responseTime);
    const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    const sortedResponseTimes = Array.from(responseTimes).sort((a, b) => a - b);
    const getPercentile = (p: number): number => {
        const safeP = Math.max(0, Math.min(1, p));
        const arrayLength = sortedResponseTimes.length;
        if (arrayLength === 0) return 0;
        const index = Math.floor(arrayLength * safeP);
        const safeIndex = Math.max(0, Math.min(index, arrayLength - 1));
        return sortedResponseTimes[safeIndex] ?? 0;
    };

    return {
        fastestResponse,
        p50: getPercentile(0.5),
        p95: getPercentile(0.95),
        p99: getPercentile(0.99),
        slowestResponse,
    };
}

function filterHistoryByTimeRange(history: StatusHistory[], timeRange: TimePeriod): StatusHistory[] {
    const periods = {
        "1h": 60 * 60 * 1000,
        "12h": 12 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = Date.now() - (periods[timeRange] || periods["24h"]);
    return history.filter(h => h.timestamp >= cutoff);
}

describe("Site Analytics Performance Benchmarks", () => {
    // Small dataset benchmarks (100 records)
    const smallDataset = generateStatusHistory(100);
    
    bench("Calculate downtime periods - Small dataset (100 records)", () => {
        calculateDowntimePeriods(smallDataset);
    }, {
        time: 1000,
        iterations: 100,
        warmupTime: 100,
        warmupIterations: 5,
    });

    bench("Calculate response metrics - Small dataset (100 records)", () => {
        calculateResponseMetrics(smallDataset);
    }, {
        time: 1000,
        iterations: 100,
        warmupTime: 100,
        warmupIterations: 5,
    });

    // Medium dataset benchmarks (1,000 records)
    const mediumDataset = generateStatusHistory(1000);
    
    bench("Calculate downtime periods - Medium dataset (1K records)", () => {
        calculateDowntimePeriods(mediumDataset);
    }, {
        time: 1000,
        iterations: 50,
        warmupTime: 200,
        warmupIterations: 3,
    });

    bench("Calculate response metrics - Medium dataset (1K records)", () => {
        calculateResponseMetrics(mediumDataset);
    }, {
        time: 1000,
        iterations: 50,
        warmupTime: 200,
        warmupIterations: 3,
    });

    // Large dataset benchmarks (10,000 records)
    const largeDataset = generateLargeDataset(10000);
    
    bench("Calculate downtime periods - Large dataset (10K records)", () => {
        calculateDowntimePeriods(largeDataset);
    }, {
        time: 2000,
        iterations: 10,
        warmupTime: 500,
        warmupIterations: 2,
    });

    bench("Calculate response metrics - Large dataset (10K records)", () => {
        calculateResponseMetrics(largeDataset);
    }, {
        time: 2000,
        iterations: 10,
        warmupTime: 500,
        warmupIterations: 2,
    });

    // History filtering benchmarks
    const veryLargeDataset = generateLargeDataset(50000);
    
    bench("Filter history by time range - Very large dataset (50K records)", () => {
        filterHistoryByTimeRange(veryLargeDataset, "24h");
    }, {
        time: 2000,
        iterations: 5,
        warmupTime: 1000,
        warmupIterations: 1,
    });

    // Combined operations benchmark
    bench("Complete analytics calculation - Large dataset (10K records)", () => {
        const filtered = filterHistoryByTimeRange(largeDataset, "7d");
        calculateDowntimePeriods(filtered);
        calculateResponseMetrics(filtered);
    }, {
        time: 3000,
        iterations: 5,
        warmupTime: 1000,
        warmupIterations: 1,
    });
});
