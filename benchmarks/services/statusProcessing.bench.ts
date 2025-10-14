/**
 * Status Processing Benchmarks.
 *
 * @packageDocumentation
 *
 * Exercises status processing benchmark scenarios to measure service throughput and resilience.
 */

import { bench, describe } from "vitest";

// Core interfaces for status processing
/**
 * Represents status entry data in the status processing benchmark.
 */
interface StatusEntry {
    timestamp: number;
    status: "up" | "down" | "degraded";
    responseTime: number;
    details?: string;
    monitorId: string;
    siteIdentifier: string;
}

/**
 * Represents uptime statistics data in the status processing benchmark.
 */
interface UptimeStatistics {
    uptime: number;
    downtime: number;
    degradedTime: number;
    totalChecks: number;
    averageResponseTime: number;
    uptimePercentage: number;
    availability: number;
    meanTimeToRecovery: number;
    meanTimeBetweenFailures: number;
}

/**
 * Represents outage event data in the status processing benchmark.
 */
interface OutageEvent {
    start: number;
    end: number;
    duration: number;
    severity: "minor" | "major" | "critical";
    affectedMonitors: string[];
    impactScope: "single" | "multiple" | "site-wide";
}

/**
 * Represents slacompliance data in the status processing benchmark.
 */
interface SLACompliance {
    compliant: boolean;
    actualUptime: number;
    requiredUptime: number;
    slaThreshold: number;
    violationDuration: number;
    violationCount: number;
}

/**
 * Represents time window stats data in the status processing benchmark.
 */
interface TimeWindowStats {
    windowStart: number;
    windowEnd: number;
    duration: number;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageResponseTime: number;
    uptimePercentage: number;
}

/**
 * Represents status aggregation result data in the status processing benchmark.
 */
interface StatusAggregationResult {
    siteIdentifier: string;
    totalMonitors: number;
    activeMonitors: number;
    overallStatus: "healthy" | "degraded" | "critical" | "unknown";
    statistics: UptimeStatistics;
    recentOutages: OutageEvent[];
    slaCompliance: SLACompliance;
    timeWindowStats: TimeWindowStats[];
    trends: {
        responseTimeTrend: "improving" | "degrading" | "stable";
        uptimeTrend: "improving" | "degrading" | "stable";
        reliabilityScore: number;
    };
}

// Mock status processing service
/**
 * Mock status processing service used to drive the status processing benchmark.
 */
class MockStatusProcessingService {
    private cache = new Map<string, StatusAggregationResult>();
    private operationCount = 0;

    /**
     * Processes raw status entries into uptime statistics
     */
    calculateUptimeStatistics(entries: StatusEntry[]): UptimeStatistics {
        this.operationCount++;

        if (entries.length === 0) {
            return {
                uptime: 0,
                downtime: 0,
                degradedTime: 0,
                totalChecks: 0,
                averageResponseTime: 0,
                uptimePercentage: 0,
                availability: 0,
                meanTimeToRecovery: 0,
                meanTimeBetweenFailures: 0,
            };
        }

        // Sort entries by timestamp for accurate calculations
        const sortedEntries = entries.toSorted(
            (a, b) => a.timestamp - b.timestamp
        );

        let upCount = 0;
        let downCount = 0;
        let degradedCount = 0;
        let totalResponseTime = 0;
        const downPeriods: { start: number; end: number }[] = [];
        let currentDownStart: number | null = null;

        for (const entry of sortedEntries) {
            switch (entry.status) {
                case "up": {
                    upCount++;
                    if (currentDownStart !== null) {
                        downPeriods.push({
                            start: currentDownStart,
                            end: entry.timestamp,
                        });
                        currentDownStart = null;
                    }
                    break;
                }
                case "down": {
                    downCount++;
                    if (currentDownStart === null) {
                        currentDownStart = entry.timestamp;
                    }
                    break;
                }
                case "degraded": {
                    degradedCount++;
                    break;
                }
            }

            totalResponseTime += entry.responseTime;
        }

        const totalChecks = sortedEntries.length;
        const uptimePercentage =
            totalChecks > 0 ? (upCount / totalChecks) * 100 : 0;
        const availability =
            totalChecks > 0
                ? ((upCount + degradedCount * 0.5) / totalChecks) * 100
                : 0;
        const averageResponseTime =
            totalChecks > 0 ? totalResponseTime / totalChecks : 0;

        // Calculate MTTR and MTBF
        const totalDowntime = downPeriods.reduce(
            (sum, period) => sum + (period.end - period.start),
            0
        );
        const meanTimeToRecovery =
            downPeriods.length > 0 ? totalDowntime / downPeriods.length : 0;
        const operationalTime =
            sortedEntries.length > 1
                ? (sortedEntries.at(-1)?.timestamp ?? 0) -
                  sortedEntries[0].timestamp
                : 0;
        const meanTimeBetweenFailures =
            downPeriods.length > 0
                ? (operationalTime - totalDowntime) / downPeriods.length
                : operationalTime;

        return {
            uptime: upCount,
            downtime: downCount,
            degradedTime: degradedCount,
            totalChecks,
            averageResponseTime,
            uptimePercentage,
            availability,
            meanTimeToRecovery,
            meanTimeBetweenFailures,
        };
    }

    /**
     * Detects outage events from status history
     */
    detectOutages(
        entries: StatusEntry[],
        minimumDuration: number = 60_000,
        severityThresholds?: { minor: number; major: number }
    ): OutageEvent[] {
        this.operationCount++;

        const thresholds = severityThresholds ?? {
            minor: 300_000,
            major: 1_800_000,
        };
        const sortedEntries = entries.toSorted(
            (a, b) => a.timestamp - b.timestamp
        );
        const outages: OutageEvent[] = [];
        let currentOutage: { start: number; monitors: Set<string> } | null =
            null;

        for (const entry of sortedEntries) {
            if (entry.status === "down") {
                if (currentOutage === null) {
                    currentOutage = {
                        start: entry.timestamp,
                        monitors: new Set([entry.monitorId]),
                    };
                } else {
                    currentOutage.monitors.add(entry.monitorId);
                }
            } else if (currentOutage !== null) {
                const duration = entry.timestamp - currentOutage.start;

                if (duration >= minimumDuration) {
                    const severity =
                        duration >= thresholds.major
                            ? "critical"
                            : duration >= thresholds.minor
                              ? "major"
                              : "minor";

                    const impactScope =
                        currentOutage.monitors.size === 1
                            ? "single"
                            : currentOutage.monitors.size <= 3
                              ? "multiple"
                              : "site-wide";

                    outages.push({
                        start: currentOutage.start,
                        end: entry.timestamp,
                        duration,
                        severity,
                        affectedMonitors: Array.from(currentOutage.monitors),
                        impactScope,
                    });
                }

                currentOutage = null;
            }
        }

        return outages;
    }

    /**
     * Calculates SLA compliance for given status history
     */
    calculateSLACompliance(
        entries: StatusEntry[],
        slaThreshold: number,
        timeWindow?: { start: number; end: number }
    ): SLACompliance {
        this.operationCount++;

        let filteredEntries = entries;
        if (timeWindow) {
            filteredEntries = entries.filter(
                (entry) =>
                    entry.timestamp >= timeWindow.start &&
                    entry.timestamp <= timeWindow.end
            );
        }

        const stats = this.calculateUptimeStatistics(filteredEntries);
        const actualUptime = stats.uptimePercentage;
        const compliant = actualUptime >= slaThreshold;

        // Calculate violation metrics
        const violations = filteredEntries.filter(
            (entry) => entry.status === "down"
        );
        const violationDuration =
            violations.length > 0
                ? violations.reduce((sum, v, i, arr) => {
                      if (i === 0) return 0;
                      const prevTimestamp = arr[i - 1].timestamp;
                      return sum + (v.timestamp - prevTimestamp);
                  }, 0)
                : 0;

        return {
            compliant,
            actualUptime,
            requiredUptime: slaThreshold,
            slaThreshold,
            violationDuration,
            violationCount: violations.length,
        };
    }

    /**
     * Processes bulk status updates and aggregates by site
     */
    async processBulkStatusUpdates(
        statusUpdates: StatusEntry[],
        aggregationWindows: number[] = [
            3_600_000,
            86_400_000,
            604_800_000,
        ] // 1h, 1d, 1w
    ): Promise<Map<string, StatusAggregationResult>> {
        this.operationCount++;

        const siteGroups = this.groupStatusBySite(statusUpdates);
        const results = new Map<string, StatusAggregationResult>();

        for (const [siteIdentifier, siteEntries] of siteGroups) {
            const monitors = new Set(
                siteEntries.map((entry) => entry.monitorId)
            );
            const activeMonitors = monitors.size;

            // Calculate overall statistics
            const overallStats = this.calculateUptimeStatistics(siteEntries);

            // Detect outages
            const outages = this.detectOutages(siteEntries);

            // Calculate SLA compliance
            const slaCompliance = this.calculateSLACompliance(
                siteEntries,
                99.9
            );

            // Calculate time window statistics
            const now = Date.now();
            const timeWindowStats = aggregationWindows.map((windowSize) => {
                const windowStart = now - windowSize;
                const windowEntries = siteEntries.filter(
                    (entry) => entry.timestamp >= windowStart
                );

                const windowStats =
                    this.calculateUptimeStatistics(windowEntries);

                return {
                    windowStart,
                    windowEnd: now,
                    duration: windowSize,
                    totalChecks: windowStats.totalChecks,
                    successfulChecks: windowStats.uptime,
                    failedChecks: windowStats.downtime,
                    averageResponseTime: windowStats.averageResponseTime,
                    uptimePercentage: windowStats.uptimePercentage,
                };
            });

            // Determine overall status
            const recentEntries = siteEntries.filter(
                (entry) => entry.timestamp > now - 300_000
            ); // Last 5 minutes
            const overallStatus = this.determineOverallStatus(
                recentEntries,
                activeMonitors
            );

            // Calculate trends
            const trends = this.calculateTrends(siteEntries, timeWindowStats);

            results.set(siteIdentifier, {
                siteIdentifier,
                totalMonitors: activeMonitors,
                activeMonitors,
                overallStatus,
                statistics: overallStats,
                recentOutages: outages.slice(-5), // Last 5 outages
                slaCompliance,
                timeWindowStats,
                trends,
            });
        }

        return results;
    }

    /**
     * Performs real-time status aggregation with streaming updates
     */
    async processStreamingStatusUpdates(
        statusStream: StatusEntry[],
        batchSize: number = 100
    ): Promise<void> {
        this.operationCount++;

        for (let i = 0; i < statusStream.length; i += batchSize) {
            const batch = statusStream.slice(i, i + batchSize);

            // Process batch in parallel
            const batchPromises = batch.map(async (entry) => {
                // Simulate real-time processing
                await this.processIndividualStatusUpdate(entry);

                // Update aggregated statistics
                this.updateRunningStatistics(entry);

                // Check for immediate alerts
                this.checkAlertConditions(entry);
            });

            await Promise.all(batchPromises);
        }
    }

    /**
     * Generates complex analytics reports
     */
    generateAnalyticsReport(
        statusHistory: StatusEntry[],
        reportPeriod: { start: number; end: number }
    ): {
        summary: UptimeStatistics;
        trends: any;
        patterns: any;
        recommendations: string[];
    } {
        this.operationCount++;

        const filteredHistory = statusHistory.filter(
            (entry) =>
                entry.timestamp >= reportPeriod.start &&
                entry.timestamp <= reportPeriod.end
        );

        const summary = this.calculateUptimeStatistics(filteredHistory);

        // Analyze patterns (simplified for benchmark)
        const hourlyPatterns = this.analyzeHourlyPatterns(filteredHistory);
        const dowPatterns = this.analyzeDayOfWeekPatterns(filteredHistory);

        // Generate trends
        const trends = this.generateTrendAnalysis(filteredHistory);

        // Create recommendations
        const recommendations = this.generateRecommendations(summary, trends);

        return {
            summary,
            trends,
            patterns: { hourly: hourlyPatterns, dayOfWeek: dowPatterns },
            recommendations,
        };
    }

    // Helper methods
    private groupStatusBySite(
        entries: StatusEntry[]
    ): Map<string, StatusEntry[]> {
        const groups = new Map<string, StatusEntry[]>();

        for (const entry of entries) {
            const existing = groups.get(entry.siteIdentifier) || [];
            existing.push(entry);
            groups.set(entry.siteIdentifier, existing);
        }

        return groups;
    }

    private determineOverallStatus(
        recentEntries: StatusEntry[],
        totalMonitors: number
    ): "healthy" | "degraded" | "critical" | "unknown" {
        if (recentEntries.length === 0) return "unknown";

        const downCount = recentEntries.filter(
            (entry) => entry.status === "down"
        ).length;
        const degradedCount = recentEntries.filter(
            (entry) => entry.status === "degraded"
        ).length;

        const failureRate = (downCount + degradedCount) / recentEntries.length;

        if (failureRate >= 0.5) return "critical";
        if (failureRate >= 0.2) return "degraded";
        return "healthy";
    }

    private calculateTrends(
        entries: StatusEntry[],
        windows: TimeWindowStats[]
    ): any {
        // Simplified trend calculation
        if (windows.length < 2)
            return {
                responseTimeTrend: "stable",
                uptimeTrend: "stable",
                reliabilityScore: 95,
            };

        const recent = windows[0];
        const previous = windows[1];

        const responseTimeTrend =
            recent.averageResponseTime > previous.averageResponseTime * 1.1
                ? "degrading"
                : recent.averageResponseTime <
                    previous.averageResponseTime * 0.9
                  ? "improving"
                  : "stable";

        const uptimeTrend =
            recent.uptimePercentage > previous.uptimePercentage + 1
                ? "improving"
                : recent.uptimePercentage < previous.uptimePercentage - 1
                  ? "degrading"
                  : "stable";

        const reliabilityScore = Math.min(
            100,
            recent.uptimePercentage +
                (recent.averageResponseTime < 1000 ? 5 : 0)
        );

        return { responseTimeTrend, uptimeTrend, reliabilityScore };
    }

    private async processIndividualStatusUpdate(
        entry: StatusEntry
    ): Promise<void> {
        // Simulate individual processing
        const processingTime = Math.random() * 5;
        await new Promise((resolve) => setTimeout(resolve, processingTime));
    }

    private updateRunningStatistics(entry: StatusEntry): void {
        // Update running statistics (simplified)
        const cacheKey = `running-${entry.siteIdentifier}`;
        // Implementation would update running averages, counters, etc.
    }

    private checkAlertConditions(entry: StatusEntry): void {
        // Check if entry triggers any alert conditions
        if (entry.status === "down" || entry.responseTime > 5000) {
            // Would trigger alert in real implementation
        }
    }

    private analyzeHourlyPatterns(entries: StatusEntry[]): any {
        const hourlyData = Array.from({ length: 24 })
            .fill(0)
            .map(() => ({ count: 0, failures: 0 }));

        for (const entry of entries) {
            const hour = new Date(entry.timestamp).getHours();
            hourlyData[hour].count++;
            if (entry.status === "down") {
                hourlyData[hour].failures++;
            }
        }

        return hourlyData;
    }

    private analyzeDayOfWeekPatterns(entries: StatusEntry[]): any {
        const dowData = Array.from({ length: 7 })
            .fill(0)
            .map(() => ({ count: 0, failures: 0 }));

        for (const entry of entries) {
            const dow = new Date(entry.timestamp).getDay();
            dowData[dow].count++;
            if (entry.status === "down") {
                dowData[dow].failures++;
            }
        }

        return dowData;
    }

    private generateTrendAnalysis(entries: StatusEntry[]): any {
        // Simplified trend analysis
        return {
            overallTrend: "stable",
            seasonality: "none detected",
            anomalies: [],
        };
    }

    private generateRecommendations(
        stats: UptimeStatistics,
        trends: any
    ): string[] {
        const recommendations: string[] = [];

        if (stats.uptimePercentage < 99) {
            recommendations.push(
                "Consider implementing additional monitoring redundancy"
            );
        }

        if (stats.averageResponseTime > 2000) {
            recommendations.push(
                "Investigate performance optimization opportunities"
            );
        }

        if (trends.uptimeTrend === "degrading") {
            recommendations.push("Review recent infrastructure changes");
        }

        return recommendations;
    }

    getOperationCount(): number {
        return this.operationCount;
    }

    clearCache(): void {
        this.cache.clear();
    }
}

// Helper functions for generating test data
/**
 * Creates status entries for the status processing benchmark.
 */
function generateStatusEntries(
    count: number,
    siteIdentifiers: string[],
    monitorsPerSite: number = 5,
    timeSpan: number = 24 * 60 * 60 * 1000 // 24 hours
): StatusEntry[] {
    const entries: StatusEntry[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const siteIdentifier =
            siteIdentifiers[Math.floor(Math.random() * siteIdentifiers.length)];
        const monitorId = `${siteIdentifier}-monitor-${Math.floor(Math.random() * monitorsPerSite)}`;
        const timestamp = now - Math.random() * timeSpan;

        // Simulate realistic failure patterns (5% down, 2% degraded)
        let status: "up" | "down" | "degraded" = "up";
        const rand = Math.random();
        if (rand < 0.05) status = "down";
        else if (rand < 0.07) status = "degraded";

        // Response time based on status
        let responseTime: number;
        switch (status) {
            case "up": {
                responseTime = Math.random() * 1000 + 100; // 100-1100ms
                break;
            }
            case "degraded": {
                responseTime = Math.random() * 2000 + 1000; // 1000-3000ms
                break;
            }
            case "down": {
                responseTime = 0;
                break;
            }
        }

        entries.push({
            timestamp,
            status,
            responseTime,
            details: status === "down" ? "Connection timeout" : undefined,
            monitorId,
            siteIdentifier,
        });
    }

    return entries.toSorted((a, b) => a.timestamp - b.timestamp);
}

/**
 * Creates site ids for the status processing benchmark.
 */
function generateSiteIdentifiers(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `site-${i + 1}`);
}

// Benchmark test suites
describe("Status Processing and Aggregation Benchmarks", () => {
    let statusService: MockStatusProcessingService;

    beforeEach(() => {
        statusService = new MockStatusProcessingService();
    });

    describe("Core Statistical Calculations", () => {
        bench(
            "Calculate uptime statistics - small dataset (100 entries)",
            () => {
                const entries = generateStatusEntries(100, ["site-1"], 5);
                statusService.calculateUptimeStatistics(entries);
            },
            { iterations: 500 }
        );

        bench(
            "Calculate uptime statistics - medium dataset (1,000 entries)",
            () => {
                const entries = generateStatusEntries(1000, ["site-1"], 10);
                statusService.calculateUptimeStatistics(entries);
            },
            { iterations: 100 }
        );

        bench(
            "Calculate uptime statistics - large dataset (10,000 entries)",
            () => {
                const entries = generateStatusEntries(10_000, ["site-1"], 20);
                statusService.calculateUptimeStatistics(entries);
            },
            { iterations: 10 }
        );

        bench(
            "Calculate uptime statistics - massive dataset (100,000 entries)",
            () => {
                const entries = generateStatusEntries(
                    100_000,
                    generateSiteIdentifiers(5),
                    50
                );
                statusService.calculateUptimeStatistics(entries);
            },
            { iterations: 2 }
        );
    });

    describe("Outage Detection", () => {
        bench(
            "Detect outages - normal patterns",
            () => {
                const entries = generateStatusEntries(1000, ["site-1"], 5);
                statusService.detectOutages(entries, 60_000);
            },
            { iterations: 200 }
        );

        bench(
            "Detect outages - high failure rate",
            () => {
                const entries = generateStatusEntries(2000, ["site-1"], 10);
                // Artificially increase failure rate for this benchmark
                entries.forEach((entry, index) => {
                    if (index % 10 < 3) entry.status = "down"; // 30% failure rate
                });
                statusService.detectOutages(entries, 30_000);
            },
            { iterations: 50 }
        );

        bench(
            "Detect outages - multiple severity thresholds",
            () => {
                const entries = generateStatusEntries(
                    5000,
                    generateSiteIdentifiers(3),
                    15
                );
                statusService.detectOutages(entries, 60_000, {
                    minor: 300_000,
                    major: 1_800_000,
                });
            },
            { iterations: 20 }
        );
    });

    describe("SLA Compliance Calculations", () => {
        bench(
            "SLA compliance - single site",
            () => {
                const entries = generateStatusEntries(1000, ["site-1"], 10);
                statusService.calculateSLACompliance(entries, 99.9);
            },
            { iterations: 200 }
        );

        bench(
            "SLA compliance - with time windows",
            () => {
                const entries = generateStatusEntries(2000, ["site-1"], 10);
                const timeWindow = {
                    start: Date.now() - 24 * 60 * 60 * 1000,
                    end: Date.now(),
                };
                statusService.calculateSLACompliance(
                    entries,
                    99.95,
                    timeWindow
                );
            },
            { iterations: 100 }
        );

        bench(
            "SLA compliance - multiple thresholds",
            () => {
                const entries = generateStatusEntries(1500, ["site-1"], 8);
                const thresholds = [
                    99,
                    99.5,
                    99.9,
                    99.95,
                    99.99,
                ];

                for (const threshold of thresholds) {
                    statusService.calculateSLACompliance(entries, threshold);
                }
            },
            { iterations: 50 }
        );
    });

    describe("Bulk Status Processing", () => {
        bench(
            "Process bulk updates - 10 sites, 1,000 entries",
            async () => {
                const siteIdentifiers = generateSiteIdentifiers(10);
                const entries = generateStatusEntries(1000, siteIdentifiers, 5);
                await statusService.processBulkStatusUpdates(entries);
            },
            { iterations: 20 }
        );

        bench(
            "Process bulk updates - 50 sites, 5,000 entries",
            async () => {
                const siteIdentifiers = generateSiteIdentifiers(50);
                const entries = generateStatusEntries(
                    5000,
                    siteIdentifiers,
                    10
                );
                await statusService.processBulkStatusUpdates(entries);
            },
            { iterations: 5 }
        );

        bench(
            "Process bulk updates - 100 sites, 10,000 entries",
            async () => {
                const siteIdentifiers = generateSiteIdentifiers(100);
                const entries = generateStatusEntries(
                    10_000,
                    siteIdentifiers,
                    15
                );
                await statusService.processBulkStatusUpdates(
                    entries,
                    [3_600_000, 86_400_000]
                );
            },
            { iterations: 2 }
        );

        bench(
            "Process bulk updates - with multiple time windows",
            async () => {
                const siteIdentifiers = generateSiteIdentifiers(25);
                const entries = generateStatusEntries(2500, siteIdentifiers, 8);
                const windows = [
                    3_600_000, // 1 hour
                    21_600_000, // 6 hours
                    86_400_000, // 1 day
                    604_800_000, // 1 week
                    2_592_000_000, // 1 month
                ];
                await statusService.processBulkStatusUpdates(entries, windows);
            },
            { iterations: 10 }
        );
    });

    describe("Real-time Stream Processing", () => {
        bench(
            "Streaming updates - small batches (100 entries, batch size 10)",
            async () => {
                const entries = generateStatusEntries(100, ["site-1"], 5);
                await statusService.processStreamingStatusUpdates(entries, 10);
            },
            { iterations: 50 }
        );

        bench(
            "Streaming updates - medium batches (500 entries, batch size 25)",
            async () => {
                const entries = generateStatusEntries(
                    500,
                    generateSiteIdentifiers(5),
                    10
                );
                await statusService.processStreamingStatusUpdates(entries, 25);
            },
            { iterations: 20 }
        );

        bench(
            "Streaming updates - large batches (2,000 entries, batch size 50)",
            async () => {
                const entries = generateStatusEntries(
                    2000,
                    generateSiteIdentifiers(10),
                    20
                );
                await statusService.processStreamingStatusUpdates(entries, 50);
            },
            { iterations: 5 }
        );

        bench(
            "High-frequency updates (1,000 entries, batch size 5)",
            async () => {
                const entries = generateStatusEntries(
                    1000,
                    generateSiteIdentifiers(3),
                    15
                );
                await statusService.processStreamingStatusUpdates(entries, 5);
            },
            { iterations: 10 }
        );
    });

    describe("Analytics and Reporting", () => {
        bench(
            "Generate analytics report - 1 week period",
            () => {
                const entries = generateStatusEntries(
                    5000,
                    generateSiteIdentifiers(10),
                    12,
                    7 * 24 * 60 * 60 * 1000
                );
                const reportPeriod = {
                    start: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                };
                statusService.generateAnalyticsReport(entries, reportPeriod);
            },
            { iterations: 20 }
        );

        bench(
            "Generate analytics report - 1 month period",
            () => {
                const entries = generateStatusEntries(
                    20_000,
                    generateSiteIdentifiers(25),
                    20,
                    30 * 24 * 60 * 60 * 1000
                );
                const reportPeriod = {
                    start: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                };
                statusService.generateAnalyticsReport(entries, reportPeriod);
            },
            { iterations: 5 }
        );

        bench(
            "Multiple concurrent reports",
            () => {
                const entries = generateStatusEntries(
                    8000,
                    generateSiteIdentifiers(15),
                    15,
                    14 * 24 * 60 * 60 * 1000
                );

                const periods = [
                    {
                        start: Date.now() - 24 * 60 * 60 * 1000,
                        end: Date.now(),
                    }, // 1 day
                    {
                        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
                        end: Date.now(),
                    }, // 1 week
                    {
                        start: Date.now() - 14 * 24 * 60 * 60 * 1000,
                        end: Date.now(),
                    }, // 2 weeks
                ];

                for (const period of periods) {
                    statusService.generateAnalyticsReport(entries, period);
                }
            },
            { iterations: 10 }
        );
    });

    describe("Complex Aggregation Scenarios", () => {
        bench(
            "Multi-site aggregation with trend analysis",
            async () => {
                const siteIdentifiers = generateSiteIdentifiers(30);
                const entries = generateStatusEntries(
                    15_000,
                    siteIdentifiers,
                    25
                );

                // Process with extensive time windows
                const aggregationWindows = [
                    900_000, // 15 minutes
                    3_600_000, // 1 hour
                    21_600_000, // 6 hours
                    86_400_000, // 1 day
                    604_800_000, // 1 week
                ];

                const results = await statusService.processBulkStatusUpdates(
                    entries,
                    aggregationWindows
                );

                // Additional processing on results
                for (const [siteIdentifier, result] of results) {
                    const outages = statusService.detectOutages(
                        entries.filter(
                            (e) => e.siteIdentifier === siteIdentifier
                        ),
                        60_000
                    );

                    const slaCompliance = statusService.calculateSLACompliance(
                        entries.filter(
                            (e) => e.siteIdentifier === siteIdentifier
                        ),
                        99.9
                    );
                }
            },
            { iterations: 3 }
        );

        bench(
            "High-volume real-time processing simulation",
            async () => {
                // Simulate continuous stream of status updates
                const siteIdentifiers = generateSiteIdentifiers(20);
                const batchSizes = [
                    50,
                    100,
                    200,
                ];

                for (const batchSize of batchSizes) {
                    const entries = generateStatusEntries(
                        batchSize * 10,
                        siteIdentifiers,
                        15
                    );
                    await statusService.processStreamingStatusUpdates(
                        entries,
                        batchSize
                    );

                    // Simulate concurrent batch processing
                    const bulkEntries = generateStatusEntries(
                        1000,
                        siteIdentifiers,
                        10
                    );
                    await statusService.processBulkStatusUpdates(bulkEntries, [
                        3_600_000,
                    ]);
                }
            },
            { iterations: 5 }
        );
    });

    describe("Edge Cases and Performance Limits", () => {
        bench(
            "Handle empty datasets gracefully",
            () => {
                statusService.calculateUptimeStatistics([]);
                statusService.detectOutages([]);
                statusService.calculateSLACompliance([], 99.9);
            },
            { iterations: 1000 }
        );

        bench(
            "Handle single-status datasets",
            () => {
                // All up
                const allUpEntries = generateStatusEntries(1000, ["site-1"], 5);
                allUpEntries.forEach((entry) => {
                    entry.status = "up";
                });
                statusService.calculateUptimeStatistics(allUpEntries);

                // All down
                const allDownEntries = generateStatusEntries(
                    1000,
                    ["site-1"],
                    5
                );
                allDownEntries.forEach((entry) => {
                    entry.status = "down";
                });
                statusService.calculateUptimeStatistics(allDownEntries);
            },
            { iterations: 100 }
        );

        bench(
            "Extreme failure scenarios (50% failure rate)",
            () => {
                const entries = generateStatusEntries(
                    2000,
                    generateSiteIdentifiers(5),
                    10
                );
                entries.forEach((entry, index) => {
                    if (index % 2 === 0) entry.status = "down";
                });

                statusService.calculateUptimeStatistics(entries);
                statusService.detectOutages(entries);
                statusService.calculateSLACompliance(entries, 99.9);
            },
            { iterations: 20 }
        );

        bench(
            "Very short time windows (1 minute aggregation)",
            async () => {
                const entries = generateStatusEntries(
                    500,
                    ["site-1"],
                    5,
                    60_000
                ); // 1 minute span
                await statusService.processBulkStatusUpdates(entries, [60_000]); // 1 minute window
            },
            { iterations: 50 }
        );
    });
});
