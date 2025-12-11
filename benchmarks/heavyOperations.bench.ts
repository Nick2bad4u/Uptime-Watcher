/**
 * Practical Performance Benchmarks for Heavy Computational Operations
 *
 * @file Focused benchmarks for performance-critical operations that can become
 *   bottlenecks in the Uptime Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Heavy-Operations
 *
 * @tags ["performance", "computation", "data-processing", "algorithms"]
 */

import { bench, describe } from "vitest";

/**
 * Synthetic site representation used by heavy-operation benchmarks.
 *
 * @internal
 */
interface BenchmarkSite {
    identifier: string;
    name: string;
    monitors: BenchmarkMonitor[];
    monitoring: boolean;
}

/**
 * Synthetic monitor structure leveraged by heavy-operation benchmarks.
 *
 * @internal
 */
interface BenchmarkMonitor {
    id: string;
    type: "http" | "ping" | "port";
    status: "up" | "down" | "pending";
    responseTime: number;
    history: StatusEntry[];
    monitoring: boolean;
    checkInterval: number;
    timeout: number;
    retryAttempts: number;
}

/**
 * Synthetic monitor status entry used to simulate uptime history.
 *
 * @internal
 */
interface StatusEntry {
    timestamp: number;
    status: "up" | "down";
    responseTime: number;
}

/**
 * Aggregated uptime metrics derived from status history.
 *
 * @internal
 */
interface UptimeStats {
    uptime: number;
    downtime: number;
    totalChecks: number;
    averageResponseTime: number;
    uptimePercentage: number;
}

/**
 * Generates synthetic site data with monitor history for benchmark runs.
 *
 * @param count - Number of synthetic sites to create.
 * @param monitorsPerSite - Number of monitors to attach to each site.
 *
 * @returns Array of synthetic {@link Site} entities with populated history.
 */
function generateSites(
    count: number,
    monitorsPerSite: number
): BenchmarkSite[] {
    const sites: BenchmarkSite[] = [];

    for (let i = 0; i < count; i++) {
        const monitors: BenchmarkMonitor[] = [];

        for (let j = 0; j < monitorsPerSite; j++) {
            const history: StatusEntry[] = [];
            const historyCount = Math.floor(Math.random() * 1000) + 100; // 100-1100 entries

            for (let k = 0; k < historyCount; k++) {
                history.push({
                    timestamp: Date.now() - k * 30_000, // 30-second intervals
                    status: Math.random() > 0.05 ? "up" : "down", // 95% uptime
                    responseTime: Math.floor(Math.random() * 500) + 10,
                });
            }

            monitors.push({
                id: `monitor-${i}-${j}`,
                type: [
                    "http",
                    "ping",
                    "port",
                ][j % 3] as any,
                status: Math.random() > 0.05 ? "up" : "down",
                responseTime: Math.floor(Math.random() * 500) + 10,
                history,
                monitoring: Math.random() > 0.1, // 90% active
                checkInterval:
                    [
                        30,
                        60,
                        300,
                    ][j % 3] * 1000,
                timeout:
                    [
                        5,
                        10,
                        30,
                    ][j % 3] * 1000,
                retryAttempts: [
                    1,
                    3,
                    5,
                ][j % 3],
            });
        }

        sites.push({
            identifier: `site-${i}`,
            name: `Site ${i}`,
            monitors,
            monitoring: Math.random() > 0.2, // 80% monitoring
        });
    }

    return sites;
}

/**
 * Generates synthetic monitor status entries to stress-test algorithms.
 *
 * @param count - Number of status entries to create.
 *
 * @returns Array of {@link StatusEntry} items ordered by timestamp.
 */
function generateStatusUpdates(count: number): StatusEntry[] {
    const updates: StatusEntry[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        updates.push({
            timestamp: now - i * 1000,
            status: Math.random() > 0.05 ? "up" : "down",
            responseTime: Math.floor(Math.random() * 1000) + 10,
        });
    }

    return updates;
}

/**
 * Calculates uptime metrics from status history datasets.
 *
 * @param history - Status entries representing monitor execution history.
 *
 * @returns Derived {@link UptimeStats} summarizing uptime performance.
 */
function calculateUptimeStatistics(history: StatusEntry[]): UptimeStats {
    if (history.length === 0) {
        return {
            uptime: 0,
            downtime: 0,
            totalChecks: 0,
            averageResponseTime: 0,
            uptimePercentage: 0,
        };
    }

    let upCount = 0;
    let downCount = 0;
    let totalResponseTime = 0;

    for (const entry of history) {
        if (entry.status === "up") {
            upCount++;
        } else {
            downCount++;
        }
        totalResponseTime += entry.responseTime;
    }

    const totalChecks = upCount + downCount;
    const uptimePercentage =
        totalChecks > 0 ? (upCount / totalChecks) * 100 : 0;
    const averageResponseTime =
        totalChecks > 0 ? totalResponseTime / totalChecks : 0;

    return {
        uptime: upCount,
        downtime: downCount,
        totalChecks,
        averageResponseTime,
        uptimePercentage,
    };
}

/**
 * Filters monitor history by an inclusive timestamp range.
 *
 * @param history - Status entries to filter.
 * @param startTime - Inclusive start timestamp.
 * @param endTime - Inclusive end timestamp.
 *
 * @returns Subset of {@link StatusEntry} values within the range.
 */
function filterHistoryByTimeRange(
    history: StatusEntry[],
    startTime: number,
    endTime: number
): StatusEntry[] {
    return history.filter(
        (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
}

/**
 * Aggregates uptime metrics across provided synthetic sites.
 *
 * @param sites - Collection of synthetic sites with monitors and history.
 *
 * @returns Map of site identifier to computed {@link UptimeStats}.
 */
function aggregateSiteStatistics(
    sites: BenchmarkSite[]
): Map<string, UptimeStats> {
    const stats = new Map<string, UptimeStats>();

    for (const site of sites) {
        let combinedHistory: StatusEntry[] = [];

        // Combine history from all monitors
        for (const monitor of site.monitors) {
            combinedHistory = combinedHistory.concat(monitor.history);
        }

        // Sort by timestamp for accurate calculations
        const sortedCombinedHistory = combinedHistory.toSorted(
            (a, b) => b.timestamp - a.timestamp
        );
        combinedHistory.length = 0;
        combinedHistory.push(...sortedCombinedHistory);

        const siteStats = calculateUptimeStatistics(combinedHistory);
        stats.set(site.identifier, siteStats);
    }

    return stats;
}

/**
 * Detects downtime windows exceeding a minimum duration within history.
 *
 * @param history - Status history to inspect.
 * @param minimumDuration - Minimum outage length in milliseconds.
 *
 * @returns Array describing outage intervals that meet the threshold.
 */
function detectOutages(
    history: StatusEntry[],
    minimumDuration: number = 60_000
): { start: number; end: number; duration: number }[] {
    const outages: { start: number; end: number; duration: number }[] = [];
    let currentOutageStart: number | null = null;

    // Sort history by timestamp for sequential processing
    const sortedHistory = history.toSorted((a, b) => a.timestamp - b.timestamp);

    for (const entry of sortedHistory) {
        if (entry.status === "down") {
            if (currentOutageStart === null) {
                currentOutageStart = entry.timestamp;
            }
        } else if (entry.status === "up" && currentOutageStart !== null) {
            const duration = entry.timestamp - currentOutageStart;
            if (duration >= minimumDuration) {
                outages.push({
                    start: currentOutageStart,
                    end: entry.timestamp,
                    duration,
                });
            }
            currentOutageStart = null;
        }
    }

    // Handle ongoing outage
    if (currentOutageStart !== null) {
        const now = Date.now();
        const duration = now - currentOutageStart;
        if (duration >= minimumDuration) {
            outages.push({
                start: currentOutageStart,
                end: now,
                duration,
            });
        }
    }

    return outages;
}

/**
 * Determines whether uptime history complies with an SLA threshold.
 *
 * @param history - Status history to evaluate.
 * @param slaThreshold - Required uptime percentage expressed as 0-100.
 *
 * @returns SLA compliance report containing actual and target uptime.
 */
function calculateSLACompliance(
    history: StatusEntry[],
    slaThreshold: number
): { compliant: boolean; actualUptime: number; requiredUptime: number } {
    const stats = calculateUptimeStatistics(history);
    return {
        compliant: stats.uptimePercentage >= slaThreshold,
        actualUptime: stats.uptimePercentage,
        requiredUptime: slaThreshold,
    };
}

describe("Heavy Computational Operations Benchmarks", () => {
    // Benchmark data setup
    const smallDataset = generateSites(10, 5); // 50 monitors
    const mediumDataset = generateSites(50, 10); // 500 monitors
    const largeDataset = generateSites(100, 20); // 2000 monitors
    const massiveDataset = generateSites(500, 10); // 5000 monitors

    const smallHistory = generateStatusUpdates(1000);
    const mediumHistory = generateStatusUpdates(10_000);
    const largeHistory = generateStatusUpdates(50_000);
    const massiveHistory = generateStatusUpdates(100_000);

    describe("Small Dataset Operations (50 monitors)", () => {
        bench(
            "Calculate uptime statistics for all sites",
            () => {
                aggregateSiteStatistics(smallDataset);
            },
            { iterations: 100 }
        );

        bench(
            "Filter history by time range (1000 entries)",
            () => {
                const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
                const now = Date.now();
                filterHistoryByTimeRange(smallHistory, last24Hours, now);
            },
            { iterations: 1000 }
        );

        bench(
            "Detect outages in monitor history",
            () => {
                detectOutages(smallHistory, 60_000);
            },
            { iterations: 500 }
        );

        bench(
            "Calculate SLA compliance",
            () => {
                calculateSLACompliance(smallHistory, 99.9);
            },
            { iterations: 1000 }
        );
    });

    describe("Medium Dataset Operations (500 monitors)", () => {
        bench(
            "Calculate uptime statistics for all sites",
            () => {
                aggregateSiteStatistics(mediumDataset);
            },
            { iterations: 50 }
        );

        bench(
            "Filter history by time range (10,000 entries)",
            () => {
                const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
                const now = Date.now();
                filterHistoryByTimeRange(mediumHistory, last24Hours, now);
            },
            { iterations: 100 }
        );

        bench(
            "Detect outages in large monitor history",
            () => {
                detectOutages(mediumHistory, 60_000);
            },
            { iterations: 50 }
        );

        bench(
            "Calculate SLA compliance for large dataset",
            () => {
                calculateSLACompliance(mediumHistory, 99.9);
            },
            { iterations: 100 }
        );

        bench(
            "Process concurrent monitor updates",
            () => {
                const sites = mediumDataset;
                const results: UptimeStats[] = [];

                for (const site of sites) {
                    for (const monitor of site.monitors) {
                        const stats = calculateUptimeStatistics(
                            monitor.history.slice(0, 100)
                        );
                        results.push(stats);
                    }
                }
            },
            { iterations: 20 }
        );
    });

    describe("Large Dataset Operations (2000 monitors)", () => {
        bench(
            "Calculate uptime statistics for all sites",
            () => {
                aggregateSiteStatistics(largeDataset);
            },
            { iterations: 10 }
        );

        bench(
            "Filter history by time range (50,000 entries)",
            () => {
                const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
                const now = Date.now();
                filterHistoryByTimeRange(largeHistory, last24Hours, now);
            },
            { iterations: 20 }
        );

        bench(
            "Detect outages in massive history",
            () => {
                detectOutages(largeHistory, 60_000);
            },
            { iterations: 10 }
        );

        bench(
            "Calculate comprehensive site analytics",
            () => {
                const analytics = new Map();

                for (const site of largeDataset.slice(0, 50)) {
                    // Limit for benchmark
                    const siteStats = {
                        totalMonitors: site.monitors.length,
                        activeMonitors: site.monitors.filter(
                            (m) => m.monitoring
                        ).length,
                        averageResponseTime: 0,
                        worstResponseTime: 0,
                        outageCount: 0,
                        slaCompliance: true,
                    };

                    let totalResponseTime = 0;
                    let worstResponseTime = 0;
                    let totalOutages = 0;

                    for (const monitor of site.monitors) {
                        const stats = calculateUptimeStatistics(
                            monitor.history
                        );
                        totalResponseTime += stats.averageResponseTime;
                        worstResponseTime = Math.max(
                            worstResponseTime,
                            stats.averageResponseTime
                        );

                        const outages = detectOutages(monitor.history, 60_000);
                        totalOutages += outages.length;

                        const sla = calculateSLACompliance(
                            monitor.history,
                            99.5
                        );
                        if (!sla.compliant) {
                            siteStats.slaCompliance = false;
                        }
                    }

                    siteStats.averageResponseTime =
                        totalResponseTime / site.monitors.length;
                    siteStats.worstResponseTime = worstResponseTime;
                    siteStats.outageCount = totalOutages;

                    analytics.set(site.identifier, siteStats);
                }
            },
            { iterations: 5 }
        );
    });

    describe("Massive Dataset Operations (5000 monitors) - Stress Test", () => {
        bench(
            "Calculate uptime statistics for massive dataset",
            () => {
                aggregateSiteStatistics(massiveDataset.slice(0, 100)); // Limit for benchmark
            },
            { iterations: 3 }
        );

        bench(
            "Process 100,000 status updates",
            () => {
                const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const now = Date.now();

                // Simulate processing massive amount of status updates
                const filteredHistory = filterHistoryByTimeRange(
                    massiveHistory,
                    last7Days,
                    now
                );
                const stats = calculateUptimeStatistics(filteredHistory);
                const outages = detectOutages(filteredHistory, 300_000); // 5-minute minimum outages
            },
            { iterations: 2 }
        );

        bench(
            "Memory-intensive data aggregation",
            () => {
                const aggregatedData = new Map();
                const timeRanges = [
                    { name: "last1h", duration: 60 * 60 * 1000 },
                    { name: "last24h", duration: 24 * 60 * 60 * 1000 },
                    { name: "last7d", duration: 7 * 24 * 60 * 60 * 1000 },
                    { name: "last30d", duration: 30 * 24 * 60 * 60 * 1000 },
                ];

                const now = Date.now();

                // Process large dataset with multiple time ranges
                for (const site of massiveDataset.slice(0, 50)) {
                    const siteData = {};

                    for (const range of timeRanges) {
                        const startTime = now - range.duration;
                        let combinedHistory: StatusEntry[] = [];

                        for (const monitor of site.monitors) {
                            const filtered = filterHistoryByTimeRange(
                                monitor.history,
                                startTime,
                                now
                            );
                            combinedHistory = combinedHistory.concat(filtered);
                        }

                        siteData[range.name] =
                            calculateUptimeStatistics(combinedHistory);
                    }

                    aggregatedData.set(site.identifier, siteData);
                }
            },
            { iterations: 1 }
        );
    });

    describe("Algorithm Performance - Edge Cases", () => {
        bench(
            "Handle empty datasets gracefully",
            () => {
                const emptySites = generateSites(100, 0); // Sites with no monitors
                const results = aggregateSiteStatistics(emptySites);

                // Process sites with empty history
                for (const site of emptySites) {
                    calculateUptimeStatistics([]);
                    detectOutages([], 60_000);
                    calculateSLACompliance([], 99.9);
                }
            },
            { iterations: 100 }
        );

        bench(
            "Handle single-status datasets",
            () => {
                // Create history with only "up" status
                const upOnlyHistory = Array.from({ length: 1000 })
                    .fill(null)
                    .map((_, i) => ({
                        timestamp: Date.now() - i * 1000,
                        status: "up" as const,
                        responseTime: 100,
                    }));

                // Create history with only "down" status
                const downOnlyHistory = Array.from({ length: 1000 })
                    .fill(null)
                    .map((_, i) => ({
                        timestamp: Date.now() - i * 1000,
                        status: "down" as const,
                        responseTime: 0,
                    }));

                calculateUptimeStatistics(upOnlyHistory);
                calculateUptimeStatistics(downOnlyHistory);
                detectOutages(upOnlyHistory, 60_000);
                detectOutages(downOnlyHistory, 60_000);
            },
            { iterations: 200 }
        );

        bench(
            "Handle rapid status changes",
            () => {
                // Create history with status changing every second
                const rapidChanges = Array.from({ length: 5000 })
                    .fill(null)
                    .map((_, i) => ({
                        timestamp: Date.now() - i * 1000,
                        status:
                            i % 2 === 0 ? ("up" as const) : ("down" as const),
                        responseTime: Math.floor(Math.random() * 100),
                    }));

                const stats = calculateUptimeStatistics(rapidChanges);
                const outages = detectOutages(rapidChanges, 5000); // 5-second minimum
                const sla = calculateSLACompliance(rapidChanges, 50); // 50% threshold
            },
            { iterations: 50 }
        );
    });
});
