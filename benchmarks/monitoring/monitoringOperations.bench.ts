/**
 * Benchmark tests for monitoring operations
 *
 * @file Performance benchmarks for monitoring-related computational operations
 *   including network operations, data processing, and status calculations.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Monitoring
 *
 * @tags ["performance", "monitoring", "network", "ping", "status-processing"]
 */

import { bench, describe, beforeAll } from "vitest";

// Type definitions for benchmarking
interface MonitorConfig {
    timeout: number;
    retryAttempts?: number;
    checkInterval?: number;
}

interface MonitorCheckResult {
    success: boolean;
    responseTime: number;
    timestamp: number;
    status: "up" | "down";
    error?: string;
}

interface BenchmarkStatusUpdate {
    monitorId: string;
    status: "up" | "down";
    responseTime: number;
    timestamp: number;
    correlationId: string;
}

// Mock data generators for benchmarking
function generateMonitorConfigs(count: number): MonitorConfig[] {
    const configs: MonitorConfig[] = [];

    for (let i = 0; i < count; i++) {
        configs.push({
            timeout: [5000, 10_000, 30_000][i % 3],
            retryAttempts: [1, 3, 5][i % 3],
            checkInterval: [60, 300, 600][i % 3] * 1000,
        });
    }

    return configs;
}

function generateStatusUpdates(count: number): BenchmarkStatusUpdate[] {
    const updates: BenchmarkStatusUpdate[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        updates.push({
            monitorId: `monitor-${i}`,
            status: Math.random() > 0.05 ? "up" : "down",
            responseTime: Math.floor(Math.random() * 1000) + 50,
            timestamp: now - i * 1000,
            correlationId: `corr-${i}-${Date.now()}`,
        });
    }

    return updates;
}

function generateMonitorCheckResults(count: number): MonitorCheckResult[] {
    const results: MonitorCheckResult[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const success = Math.random() > 0.05;
        results.push({
            success,
            responseTime: success ? Math.floor(Math.random() * 1000) + 50 : 0,
            timestamp: now - i * 1000,
            status: success ? "up" : "down",
            error: success ? undefined : `Network error ${i}`,
        });
    }

    return results;
}

// Benchmark implementation functions
function simulatePingCheck(host: string, timeout: number): MonitorCheckResult {
    // Simulate network operation delay based on timeout
    const latencyFactor = Math.random();
    const simulatedResponseTime = Math.floor(latencyFactor * timeout * 0.5);
    const success = latencyFactor > 0.05; // 95% success rate

    return {
        success,
        responseTime: success ? simulatedResponseTime : 0,
        timestamp: Date.now(),
        status: success ? "up" : "down",
        error: success ? undefined : "Network timeout",
    };
}

function simulateHttpCheck(url: string, timeout: number): MonitorCheckResult {
    // Simulate HTTP request processing
    const latencyFactor = Math.random();
    const simulatedResponseTime = Math.floor(latencyFactor * timeout * 0.3);
    const success = latencyFactor > 0.03; // 97% success rate

    return {
        success,
        responseTime: success ? simulatedResponseTime : 0,
        timestamp: Date.now(),
        status: success ? "up" : "down",
        error: success ? undefined : "HTTP error",
    };
}

function processStatusUpdates(
    updates: BenchmarkStatusUpdate[]
): Map<string, BenchmarkStatusUpdate> {
    const latestUpdates = new Map<string, BenchmarkStatusUpdate>();

    for (const update of updates) {
        const existing = latestUpdates.get(update.monitorId);
        if (!existing || update.timestamp > existing.timestamp) {
            latestUpdates.set(update.monitorId, update);
        }
    }

    return latestUpdates;
}

function calculateUptimeFromResults(results: MonitorCheckResult[]): number {
    if (results.length === 0) return 100;

    const upCount = results.filter((r) => r.status === "up").length;
    return (upCount / results.length) * 100;
}

function aggregateResponseTimes(results: MonitorCheckResult[]): {
    average: number;
    min: number;
    max: number;
    p95: number;
} {
    const responseTimes = results
        .filter((r) => r.success)
        .map((r) => r.responseTime)
        .toSorted((a, b) => a - b);

    if (responseTimes.length === 0) {
        return { average: 0, min: 0, max: 0, p95: 0 };
    }

    const average =
        responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length;
    const min = responseTimes[0]!;
    const max = responseTimes.at(-1)!;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95 = responseTimes[p95Index] ?? responseTimes.at(-1)!;

    return { average, min, max, p95 };
}

function validateMonitorConfig(config: MonitorConfig): boolean {
    return (
        config.timeout > 0 &&
        config.timeout <= 300_000 &&
        (config.retryAttempts === undefined || config.retryAttempts >= 0) &&
        (config.checkInterval === undefined || config.checkInterval >= 30_000)
    );
}

function simulateRetryLogic(
    checkFunction: () => MonitorCheckResult,
    maxRetries: number
): MonitorCheckResult {
    let lastResult: MonitorCheckResult;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        lastResult = checkFunction();
        if (lastResult.success) {
            break;
        }
    }

    return lastResult!;
}

describe("Monitoring Operations Performance Benchmarks", () => {
    let smallConfigs: MonitorConfig[];
    let mediumConfigs: MonitorConfig[];
    let largeConfigs: MonitorConfig[];
    let smallUpdates: BenchmarkStatusUpdate[];
    let mediumUpdates: BenchmarkStatusUpdate[];
    let largeUpdates: BenchmarkStatusUpdate[];
    let smallResults: MonitorCheckResult[];
    let mediumResults: MonitorCheckResult[];
    let largeResults: MonitorCheckResult[];

    beforeAll(() => {
        // Pre-generate datasets to avoid affecting benchmark timing
        smallConfigs = generateMonitorConfigs(50);
        mediumConfigs = generateMonitorConfigs(500);
        largeConfigs = generateMonitorConfigs(2000);
        smallUpdates = generateStatusUpdates(100);
        mediumUpdates = generateStatusUpdates(1000);
        largeUpdates = generateStatusUpdates(10_000);
        smallResults = generateMonitorCheckResults(100);
        mediumResults = generateMonitorCheckResults(1000);
        largeResults = generateMonitorCheckResults(10_000);
    });

    // Monitor check simulation benchmarks
    bench(
        "Simulate ping checks - Small batch (50 monitors)",
        () => {
            for (const config of smallConfigs) {
                simulatePingCheck("example.com", config.timeout);
            }
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 100,
            warmupIterations: 3,
        }
    );

    bench(
        "Simulate HTTP checks - Small batch (50 monitors)",
        () => {
            for (const config of smallConfigs) {
                simulateHttpCheck("https://example.com", config.timeout);
            }
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 100,
            warmupIterations: 3,
        }
    );

    bench(
        "Simulate ping checks - Large batch (2K monitors)",
        () => {
            for (const config of largeConfigs) {
                simulatePingCheck("example.com", config.timeout);
            }
        },
        {
            time: 2000,
            iterations: 5,
            warmupTime: 500,
            warmupIterations: 1,
        }
    );

    // Status update processing benchmarks
    bench(
        "Process status updates - Medium dataset (1K updates)",
        () => {
            processStatusUpdates(mediumUpdates);
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    bench(
        "Process status updates - Large dataset (10K updates)",
        () => {
            processStatusUpdates(largeUpdates);
        },
        {
            time: 2000,
            iterations: 10,
            warmupTime: 500,
            warmupIterations: 2,
        }
    );

    // Statistics calculation benchmarks
    bench(
        "Calculate uptime from results - Medium dataset (1K results)",
        () => {
            calculateUptimeFromResults(mediumResults);
        },
        {
            time: 1000,
            iterations: 100,
            warmupTime: 100,
            warmupIterations: 5,
        }
    );

    bench(
        "Calculate uptime from results - Large dataset (10K results)",
        () => {
            calculateUptimeFromResults(largeResults);
        },
        {
            time: 1000,
            iterations: 50,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    bench(
        "Aggregate response times - Large dataset (10K results)",
        () => {
            aggregateResponseTimes(largeResults);
        },
        {
            time: 1000,
            iterations: 30,
            warmupTime: 200,
            warmupIterations: 3,
        }
    );

    // Configuration validation benchmarks
    bench(
        "Validate monitor configs - Large batch (2K configs)",
        () => {
            for (const config of largeConfigs) {
                validateMonitorConfig(config);
            }
        },
        {
            time: 1000,
            iterations: 100,
            warmupTime: 100,
            warmupIterations: 5,
        }
    );

    // Retry logic simulation benchmarks
    bench(
        "Simulate retry logic - Medium batch (500 monitors)",
        () => {
            for (const config of mediumConfigs) {
                simulateRetryLogic(
                    () => simulatePingCheck("example.com", config.timeout),
                    config.retryAttempts || 3
                );
            }
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
        "Complete monitoring cycle - Large dataset",
        () => {
            // Simulate a complete monitoring cycle
            const results: MonitorCheckResult[] = [];

            for (const config of mediumConfigs) {
                const result = simulateRetryLogic(
                    () =>
                        simulateHttpCheck(
                            "https://example.com",
                            config.timeout
                        ),
                    config.retryAttempts || 3
                );
                results.push(result);
            }

            calculateUptimeFromResults(results);
            aggregateResponseTimes(results);
        },
        {
            time: 3000,
            iterations: 3,
            warmupTime: 1000,
            warmupIterations: 1,
        }
    );
});
