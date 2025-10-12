/**
 * Monitor Service Management Benchmarks.
 *
 * @packageDocumentation
 *
 * Exercises monitor service management benchmark scenarios to measure service throughput and resilience.
 */

import { bench, describe } from "vitest";

// Core monitor management interfaces (aligned with shared/types.ts)
/**
 * Represents monitor data in the monitor service management benchmark.
 */
interface Monitor {
    id: string;
    siteId: string;
    type: "http" | "port" | "dns" | "ping";
    name: string;
    url?: string;
    host?: string;
    port?: number;
    interval: number;
    timeout: number;
    retryAttempts: number;
    enabled: boolean;
    lastChecked?: number;
    status: "pending" | "up" | "down" | "degraded";
    responseTime?: number;
    metadata: Record<string, unknown>;
}

/**
 * Represents monitor check result data in the monitor service management benchmark.
 */
interface MonitorCheckResult {
    monitorId: string;
    status: "up" | "down" | "degraded";
    responseTime: number;
    timestamp: number;
    error?: string;
    details?: string;
    retryCount: number;
    success: boolean;
}

/**
 * Represents monitor schedule data in the monitor service management benchmark.
 */
interface MonitorSchedule {
    monitorId: string;
    nextCheck: number;
    lastCheck: number;
    intervalMs: number;
    priority: "critical" | "high" | "normal" | "low";
    consecutiveFailures: number;
    adaptiveInterval: number;
}

/**
 * Represents monitor service metrics data in the monitor service management benchmark.
 */
interface MonitorServiceMetrics {
    totalMonitors: number;
    activeMonitors: number;
    checksPerMinute: number;
    averageResponseTime: number;
    successRate: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        networkConnections: number;
    };
    queueMetrics: {
        queueSize: number;
        averageWaitTime: number;
        processingRate: number;
    };
}

/**
 * Represents health check report data in the monitor service management benchmark.
 */
interface HealthCheckReport {
    serviceId: string;
    status: "healthy" | "degraded" | "unhealthy";
    lastCheck: number;
    metrics: MonitorServiceMetrics;
    issues: string[];
    recommendations: string[];
}

// Mock Monitor Service Management implementation
/**
 * Mock monitor service manager used to drive the monitor service management benchmark.
 */
class MockMonitorServiceManager {
    private monitors = new Map<string, Monitor>();
    private schedules = new Map<string, MonitorSchedule>();
    private activeChecks = new Map<string, Promise<MonitorCheckResult>>();
    private checkQueue: string[] = [];
    private metrics: MonitorServiceMetrics = {
        totalMonitors: 0,
        activeMonitors: 0,
        checksPerMinute: 0,
        averageResponseTime: 0,
        successRate: 0,
        resourceUtilization: { cpu: 0, memory: 0, networkConnections: 0 },
        queueMetrics: { queueSize: 0, averageWaitTime: 0, processingRate: 0 },
    };
    private checkHistory: MonitorCheckResult[] = [];
    private concurrencyLimit = 50;
    private operationCount = 0;

    /**
     * Registers a new monitor in the system
     */
    async registerMonitor(monitor: Monitor): Promise<void> {
        this.operationCount++;

        this.monitors.set(monitor.id, { ...monitor });

        // Create schedule
        const schedule: MonitorSchedule = {
            monitorId: monitor.id,
            nextCheck: Date.now() + monitor.interval,
            lastCheck: 0,
            intervalMs: monitor.interval,
            priority: this.determinePriority(monitor),
            consecutiveFailures: 0,
            adaptiveInterval: monitor.interval,
        };

        this.schedules.set(monitor.id, schedule);
        this.updateMetrics();
    }

    /**
     * Registers multiple monitors in bulk
     */
    async bulkRegisterMonitors(monitors: Monitor[]): Promise<void> {
        this.operationCount++;

        const registrationPromises = monitors.map((monitor) =>
            this.registerMonitor(monitor)
        );

        await Promise.all(registrationPromises);
    }

    /**
     * Performs a single monitor check
     */
    async performMonitorCheck(monitorId: string): Promise<MonitorCheckResult> {
        this.operationCount++;

        const monitor = this.monitors.get(monitorId);
        if (!monitor) {
            throw new Error(`Monitor ${monitorId} not found`);
        }

        const startTime = performance.now();

        try {
            // Simulate monitor check based on type
            const result = await this.simulateMonitorCheck(monitor);

            // Update monitor status
            monitor.lastChecked = Date.now();
            monitor.status = result.status;
            monitor.responseTime = result.responseTime;

            // Update schedule
            this.updateMonitorSchedule(monitorId, result);

            // Add to history
            this.checkHistory.push(result);

            // Trim history to prevent memory issues
            if (this.checkHistory.length > 10_000) {
                this.checkHistory = this.checkHistory.slice(-5000);
            }

            return result;
        } catch (error) {
            const result: MonitorCheckResult = {
                monitorId,
                status: "down",
                responseTime: 0,
                timestamp: Date.now(),
                error: error instanceof Error ? error.message : String(error),
                retryCount: 0,
                success: false,
            };

            this.checkHistory.push(result);
            return result;
        } finally {
            const processingTime = performance.now() - startTime;
            this.updateProcessingMetrics(processingTime);
        }
    }

    /**
     * Performs concurrent checks with concurrency control
     */
    async performConcurrentChecks(
        monitorIds: string[],
        maxConcurrency: number = this.concurrencyLimit
    ): Promise<MonitorCheckResult[]> {
        this.operationCount++;

        const results: MonitorCheckResult[] = [];

        // Process in batches to control concurrency
        for (let i = 0; i < monitorIds.length; i += maxConcurrency) {
            const batch = monitorIds.slice(i, i + maxConcurrency);
            const batchPromises = batch.map((id) =>
                this.performMonitorCheck(id)
            );
            const batchResults = await Promise.allSettled(batchPromises);

            for (const result of batchResults) {
                if (result.status === "fulfilled") {
                    results.push(result.value);
                } else {
                    // Handle failed checks
                    results.push({
                        monitorId: "unknown",
                        status: "down",
                        responseTime: 0,
                        timestamp: Date.now(),
                        error: result.reason,
                        retryCount: 0,
                        success: false,
                    });
                }
            }
        }

        return results;
    }

    /**
     * Processes the monitor check queue
     */
    async processCheckQueue(): Promise<void> {
        this.operationCount++;

        const now = Date.now();
        const dueMonitors: string[] = [];

        // Find monitors due for checking
        for (const [monitorId, schedule] of Array.from(
            this.schedules.entries()
        )) {
            if (
                schedule.nextCheck <= now &&
                this.monitors.get(monitorId)?.enabled
            ) {
                dueMonitors.push(monitorId);
            }
        }

        // Add to queue if not already there
        for (const monitorId of dueMonitors) {
            if (!this.checkQueue.includes(monitorId)) {
                this.checkQueue.push(monitorId);
            }
        }

        // Process queue with priority ordering
        this.checkQueue.sort((a, b) => {
            const scheduleA = this.schedules.get(a);
            const scheduleB = this.schedules.get(b);
            if (!scheduleA || !scheduleB) return 0;

            const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
            return (
                priorityOrder[scheduleA.priority] -
                priorityOrder[scheduleB.priority]
            );
        });

        // Execute checks
        const toProcess = this.checkQueue.splice(0, this.concurrencyLimit);
        if (toProcess.length > 0) {
            await this.performConcurrentChecks(toProcess);
        }
    }

    /**
     * Manages monitor lifecycle with health monitoring
     */
    async performHealthCheck(): Promise<HealthCheckReport> {
        this.operationCount++;

        const now = Date.now();
        const activeMonitors = Array.from(this.monitors.values()).filter(
            (m) => m.enabled
        );
        const recentChecks = this.checkHistory.filter(
            (check) => now - check.timestamp < 300_000 // Last 5 minutes
        );

        // Calculate success rate
        const successCount = recentChecks.filter(
            (check) => check.success
        ).length;
        const successRate =
            recentChecks.length > 0 ? successCount / recentChecks.length : 1;

        // Calculate average response time
        const totalResponseTime = recentChecks.reduce(
            (sum, check) => sum + check.responseTime,
            0
        );
        const averageResponseTime =
            recentChecks.length > 0
                ? totalResponseTime / recentChecks.length
                : 0;

        // Determine service status
        let status: "healthy" | "degraded" | "unhealthy";
        if (successRate >= 0.95 && averageResponseTime < 2000) {
            status = "healthy";
        } else if (successRate >= 0.8 && averageResponseTime < 5000) {
            status = "degraded";
        } else {
            status = "unhealthy";
        }

        // Generate issues and recommendations
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (successRate < 0.95) {
            issues.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
            recommendations.push(
                "Review monitor configurations and network connectivity"
            );
        }

        if (averageResponseTime > 2000) {
            issues.push(
                `High response time: ${averageResponseTime.toFixed(0)}ms`
            );
            recommendations.push(
                "Consider optimizing monitor timeouts or intervals"
            );
        }

        if (this.checkQueue.length > 100) {
            issues.push(`Large check queue: ${this.checkQueue.length} items`);
            recommendations.push(
                "Consider increasing concurrency limit or monitor intervals"
            );
        }

        // Update metrics
        this.metrics = {
            totalMonitors: this.monitors.size,
            activeMonitors: activeMonitors.length,
            checksPerMinute: recentChecks.length / 5, // 5-minute window to per-minute
            averageResponseTime,
            successRate,
            resourceUtilization: {
                cpu: Math.random() * 100, // Simulated
                memory: Math.random() * 100,
                networkConnections: this.activeChecks.size,
            },
            queueMetrics: {
                queueSize: this.checkQueue.length,
                averageWaitTime: this.calculateAverageWaitTime(),
                processingRate: this.calculateProcessingRate(),
            },
        };

        return {
            serviceId: "monitor-service",
            status,
            lastCheck: now,
            metrics: this.metrics,
            issues,
            recommendations,
        };
    }

    /**
     * Optimizes monitor schedules based on performance
     */
    async optimizeMonitorSchedules(): Promise<void> {
        this.operationCount++;

        for (const [monitorId, schedule] of Array.from(
            this.schedules.entries()
        )) {
            const monitor = this.monitors.get(monitorId);
            if (!monitor) continue;

            const recentChecks = this.checkHistory
                .filter((check) => check.monitorId === monitorId)
                .slice(-10); // Last 10 checks

            if (recentChecks.length < 3) continue;

            // Calculate stability score
            const consecutiveSuccesses =
                this.calculateConsecutiveSuccesses(recentChecks);
            const averageResponseTime =
                recentChecks.reduce(
                    (sum, check) => sum + check.responseTime,
                    0
                ) / recentChecks.length;

            // Adaptive interval adjustment
            let newInterval = schedule.intervalMs;

            if (consecutiveSuccesses >= 10 && averageResponseTime < 1000) {
                // Increase interval for stable, fast monitors
                newInterval = Math.min(schedule.intervalMs * 1.2, 300_000); // Max 5 minutes
            } else if (schedule.consecutiveFailures >= 3) {
                // Decrease interval for failing monitors
                newInterval = Math.max(schedule.intervalMs * 0.8, 30_000); // Min 30 seconds
            } else if (averageResponseTime > 5000) {
                // Increase interval for slow monitors
                newInterval = Math.min(schedule.intervalMs * 1.1, 180_000); // Max 3 minutes
            }

            schedule.adaptiveInterval = newInterval;
            schedule.nextCheck = Date.now() + newInterval;
        }
    }

    /**
     * Handles bulk monitor operations
     */
    async bulkUpdateMonitors(
        updates: { monitorId: string; changes: Partial<Monitor> }[]
    ): Promise<void> {
        this.operationCount++;

        const updatePromises = updates.map(async (update) => {
            const monitor = this.monitors.get(update.monitorId);
            if (monitor) {
                Object.assign(monitor, update.changes);

                // Update schedule if interval changed
                if (update.changes.interval) {
                    const schedule = this.schedules.get(update.monitorId);
                    if (schedule) {
                        schedule.intervalMs = update.changes.interval;
                        schedule.nextCheck =
                            Date.now() + update.changes.interval;
                    }
                }
            }
        });

        await Promise.all(updatePromises);
        this.updateMetrics();
    }

    /**
     * Performs stress testing on the monitor system
     */
    async performStressTest(
        monitorCount: number,
        checkInterval: number,
        duration: number
    ): Promise<{
        totalChecks: number;
        successfulChecks: number;
        averageResponseTime: number;
        peakConcurrency: number;
        resourceUsage: { cpu: number; memory: number };
    }> {
        this.operationCount++;

        // Generate test monitors with valid monitor types
        const validMonitorTypes = [
            "http",
            "dns",
            "port",
            "ping",
        ] as const;
        const testMonitors = Array.from({ length: monitorCount }, (_, i) => ({
            id: `stress-test-${i}`,
            siteId: `site-${Math.floor(i / 10)}`,
            type: validMonitorTypes[i % 4],
            name: `Stress Test Monitor ${i}`,
            url: `https://test${i}.example.com`,
            interval: checkInterval,
            timeout: 5000,
            retryAttempts: 1,
            enabled: true,
            status: "pending" as const,
            metadata: { test: true },
        }));

        // Register monitors
        await this.bulkRegisterMonitors(testMonitors);

        // Run stress test
        const startTime = Date.now();
        const endTime = startTime + duration;
        let totalChecks = 0;
        let peakConcurrency = 0;

        while (Date.now() < endTime) {
            await this.processCheckQueue();

            const currentConcurrency = this.activeChecks.size;
            peakConcurrency = Math.max(peakConcurrency, currentConcurrency);

            totalChecks += Math.min(
                this.checkQueue.length,
                this.concurrencyLimit
            );

            // Brief pause to prevent overwhelming
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Calculate results
        const testChecks = this.checkHistory.filter(
            (check) => check.timestamp >= startTime
        );

        const successfulChecks = testChecks.filter(
            (check) => check.success
        ).length;
        const averageResponseTime =
            testChecks.length > 0
                ? testChecks.reduce(
                      (sum, check) => sum + check.responseTime,
                      0
                  ) / testChecks.length
                : 0;

        // Cleanup test monitors
        for (const monitor of testMonitors) {
            this.monitors.delete(monitor.id);
            this.schedules.delete(monitor.id);
        }

        return {
            totalChecks: testChecks.length,
            successfulChecks,
            averageResponseTime,
            peakConcurrency,
            resourceUsage: {
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
            },
        };
    }

    // Helper methods
    private async simulateMonitorCheck(
        monitor: Monitor
    ): Promise<MonitorCheckResult> {
        // Simulate check duration based on monitor type
        const baseDuration = {
            http: 200,
            https: 250,
            dns: 100,
            tcp: 150,
            ping: 50,
        }[monitor.type];

        const checkDuration = baseDuration + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, checkDuration));

        // Simulate success/failure (95% success rate)
        const success = Math.random() > 0.05;

        return {
            monitorId: monitor.id,
            status: success ? "up" : "down",
            responseTime: success ? checkDuration : 0,
            timestamp: Date.now(),
            error: success ? undefined : "Simulated failure",
            details: success ? "Check completed successfully" : undefined,
            retryCount: 0,
            success,
        };
    }

    private updateMonitorSchedule(
        monitorId: string,
        result: MonitorCheckResult
    ): void {
        const schedule = this.schedules.get(monitorId);
        if (!schedule) return;

        schedule.lastCheck = result.timestamp;

        if (result.success) {
            schedule.consecutiveFailures = 0;
        } else {
            schedule.consecutiveFailures++;
        }

        // Use adaptive interval if available
        const interval = schedule.adaptiveInterval || schedule.intervalMs;
        schedule.nextCheck = result.timestamp + interval;
    }

    private determinePriority(
        monitor: Monitor
    ): "critical" | "high" | "normal" | "low" {
        // Simple priority determination based on interval
        if (monitor.interval <= 30_000) return "critical";
        if (monitor.interval <= 60_000) return "high";
        if (monitor.interval <= 300_000) return "normal";
        return "low";
    }

    private updateMetrics(): void {
        const activeMonitors = Array.from(this.monitors.values()).filter(
            (m) => m.enabled
        );
        this.metrics.totalMonitors = this.monitors.size;
        this.metrics.activeMonitors = activeMonitors.length;
    }

    private updateProcessingMetrics(processingTime: number): void {
        // Update average response time (simplified)
        const recentChecks = this.checkHistory.slice(-100);
        if (recentChecks.length > 0) {
            this.metrics.averageResponseTime =
                recentChecks.reduce(
                    (sum, check) => sum + check.responseTime,
                    0
                ) / recentChecks.length;
        }
    }

    private calculateConsecutiveSuccesses(
        checks: MonitorCheckResult[]
    ): number {
        let count = 0;
        for (let i = checks.length - 1; i >= 0; i--) {
            if (checks[i].success) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    private calculateAverageWaitTime(): number {
        // Simplified calculation
        return this.checkQueue.length * 100; // Assume 100ms per item
    }

    private calculateProcessingRate(): number {
        // Items processed per second
        const recentChecks = this.checkHistory.filter(
            (check) => Date.now() - check.timestamp < 60_000 // Last minute
        );
        return recentChecks.length / 60; // Per second
    }

    getOperationCount(): number {
        return this.operationCount;
    }

    getMetrics(): MonitorServiceMetrics {
        return { ...this.metrics };
    }

    getCheckHistory(limit?: number): MonitorCheckResult[] {
        return limit
            ? this.checkHistory.slice(-limit)
            : Array.from(this.checkHistory);
    }

    clearHistory(): void {
        this.checkHistory.length = 0;
    }

    resetMetrics(): void {
        this.operationCount = 0;
        this.metrics = {
            totalMonitors: this.monitors.size,
            activeMonitors: Array.from(this.monitors.values()).filter(
                (m) => m.enabled
            ).length,
            checksPerMinute: 0,
            averageResponseTime: 0,
            successRate: 0,
            resourceUtilization: { cpu: 0, memory: 0, networkConnections: 0 },
            queueMetrics: {
                queueSize: 0,
                averageWaitTime: 0,
                processingRate: 0,
            },
        };
    }
}

// Helper functions for generating test data
/**
 * Creates monitors for the monitor service management benchmark.
 */
function generateMonitors(count: number, siteCount: number = 10): Monitor[] {
    const monitors: Monitor[] = [];
    const types = [
        "http",
        "dns",
        "port",
        "ping",
    ] as const;

    for (let i = 0; i < count; i++) {
        const siteId = `site-${(i % siteCount) + 1}`;
        const type = types[i % types.length];

        monitors.push({
            id: `monitor-${i}`,
            siteId,
            type,
            name: `${type.toUpperCase()} Monitor ${i}`,
            url: type === "http" ? `https://example${i}.com` : undefined,
            host: type === "http" ? undefined : `host${i}.example.com`,
            port: type === "port" ? 80 + (i % 100) : undefined,
            interval: [
                30_000,
                60_000,
                120_000,
                300_000,
            ][Math.floor(Math.random() * 4)],
            timeout: [
                3000,
                5000,
                10_000,
            ][Math.floor(Math.random() * 3)],
            retryAttempts: Math.floor(Math.random() * 3) + 1,
            enabled: Math.random() > 0.1, // 90% enabled
            status: "pending",
            metadata: {
                priority: [
                    "critical",
                    "high",
                    "normal",
                    "low",
                ][Math.floor(Math.random() * 4)],
                tags: [`tag-${i % 5}`, type],
            },
        });
    }

    return monitors;
}

// Benchmark test suites
describe("Monitor Service Management Benchmarks", () => {
    let monitorService: MockMonitorServiceManager;

    beforeEach(() => {
        monitorService = new MockMonitorServiceManager();
    });

    describe("Monitor Registration and Management", () => {
        bench(
            "Register single monitor",
            async () => {
                const monitor = generateMonitors(1)[0];
                await monitorService.registerMonitor(monitor);
            },
            { iterations: 500 }
        );

        bench(
            "Bulk register monitors - 50 monitors",
            async () => {
                const monitors = generateMonitors(50);
                await monitorService.bulkRegisterMonitors(monitors);
            },
            { iterations: 50 }
        );

        bench(
            "Bulk register monitors - 200 monitors",
            async () => {
                const monitors = generateMonitors(200);
                await monitorService.bulkRegisterMonitors(monitors);
            },
            { iterations: 10 }
        );

        bench(
            "Bulk register monitors - 1000 monitors",
            async () => {
                const monitors = generateMonitors(1000);
                await monitorService.bulkRegisterMonitors(monitors);
            },
            { iterations: 2 }
        );
    });

    describe("Monitor Check Operations", () => {
        bench(
            "Single monitor check",
            async () => {
                const monitor = generateMonitors(1)[0];
                await monitorService.registerMonitor(monitor);
                await monitorService.performMonitorCheck(monitor.id);
            },
            { iterations: 200 }
        );

        bench(
            "Concurrent checks - 10 monitors",
            async () => {
                const monitors = generateMonitors(10);
                await monitorService.bulkRegisterMonitors(monitors);

                const monitorIds = monitors.map((m) => m.id);
                await monitorService.performConcurrentChecks(monitorIds, 5);
            },
            { iterations: 100 }
        );

        bench(
            "Concurrent checks - 50 monitors",
            async () => {
                const monitors = generateMonitors(50);
                await monitorService.bulkRegisterMonitors(monitors);

                const monitorIds = monitors.map((m) => m.id);
                await monitorService.performConcurrentChecks(monitorIds, 10);
            },
            { iterations: 20 }
        );

        bench(
            "Concurrent checks - 200 monitors",
            async () => {
                const monitors = generateMonitors(200);
                await monitorService.bulkRegisterMonitors(monitors);

                const monitorIds = monitors.map((m) => m.id);
                await monitorService.performConcurrentChecks(monitorIds, 25);
            },
            { iterations: 5 }
        );
    });

    describe("Queue Processing", () => {
        bench(
            "Process check queue - small load",
            async () => {
                const monitors = generateMonitors(20);
                await monitorService.bulkRegisterMonitors(monitors);
                await monitorService.processCheckQueue();
            },
            { iterations: 100 }
        );

        bench(
            "Process check queue - medium load",
            async () => {
                const monitors = generateMonitors(100);
                await monitorService.bulkRegisterMonitors(monitors);
                await monitorService.processCheckQueue();
            },
            { iterations: 20 }
        );

        bench(
            "Process check queue - high load",
            async () => {
                const monitors = generateMonitors(500);
                await monitorService.bulkRegisterMonitors(monitors);
                await monitorService.processCheckQueue();
            },
            { iterations: 5 }
        );

        bench(
            "Continuous queue processing",
            async () => {
                const monitors = generateMonitors(100);
                await monitorService.bulkRegisterMonitors(monitors);

                // Process queue multiple times to simulate continuous operation
                for (let i = 0; i < 5; i++) {
                    await monitorService.processCheckQueue();
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            },
            { iterations: 20 }
        );
    });

    describe("Health Monitoring and Optimization", () => {
        bench(
            "Health check - basic system",
            async () => {
                const monitors = generateMonitors(50);
                await monitorService.bulkRegisterMonitors(monitors);

                // Perform some checks to generate history
                await monitorService.processCheckQueue();

                await monitorService.performHealthCheck();
            },
            { iterations: 50 }
        );

        bench(
            "Health check - complex system",
            async () => {
                const monitors = generateMonitors(300);
                await monitorService.bulkRegisterMonitors(monitors);

                // Generate check history
                for (let i = 0; i < 3; i++) {
                    await monitorService.processCheckQueue();
                }

                await monitorService.performHealthCheck();
            },
            { iterations: 10 }
        );

        bench(
            "Schedule optimization",
            async () => {
                const monitors = generateMonitors(100);
                await monitorService.bulkRegisterMonitors(monitors);

                // Generate some check history for optimization
                await monitorService.processCheckQueue();

                await monitorService.optimizeMonitorSchedules();
            },
            { iterations: 30 }
        );

        bench(
            "Bulk monitor updates",
            async () => {
                const monitors = generateMonitors(200);
                await monitorService.bulkRegisterMonitors(monitors);

                // Create bulk updates
                const updates = monitors.slice(0, 50).map((monitor) => ({
                    monitorId: monitor.id,
                    changes: {
                        interval: monitor.interval * 1.5,
                        timeout: monitor.timeout + 1000,
                        enabled: !monitor.enabled,
                    },
                }));

                await monitorService.bulkUpdateMonitors(updates);
            },
            { iterations: 20 }
        );
    });

    describe("Stress Testing and Performance Limits", () => {
        bench(
            "Stress test - small scale",
            async () => {
                await monitorService.performStressTest(
                    50, // 50 monitors
                    30_000, // 30 second interval
                    5000 // 5 second duration
                );
            },
            { iterations: 10 }
        );

        bench(
            "Stress test - medium scale",
            async () => {
                await monitorService.performStressTest(
                    200, // 200 monitors
                    60_000, // 1 minute interval
                    10_000 // 10 second duration
                );
            },
            { iterations: 3 }
        );

        bench(
            "Stress test - large scale",
            async () => {
                await monitorService.performStressTest(
                    500, // 500 monitors
                    120_000, // 2 minute interval
                    15_000 // 15 second duration
                );
            },
            { iterations: 1 }
        );

        bench(
            "High-frequency monitoring",
            async () => {
                const monitors = generateMonitors(100);

                // Set very short intervals for high-frequency testing
                monitors.forEach((monitor) => {
                    monitor.interval = 5000; // 5 seconds
                    monitor.timeout = 2000; // 2 seconds
                });

                await monitorService.bulkRegisterMonitors(monitors);

                // Process multiple queue cycles
                for (let i = 0; i < 10; i++) {
                    await monitorService.processCheckQueue();
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            },
            { iterations: 5 }
        );
    });

    describe("Mixed Workload Scenarios", () => {
        bench(
            "Mixed monitor types and intervals",
            async () => {
                const monitors = generateMonitors(150, 20);

                // Vary intervals and types for realistic mixed workload
                monitors.forEach((monitor, index) => {
                    switch (0) {
                        case index % 5: {
                            monitor.type = "dns";
                            monitor.interval = 30_000; // 30 seconds

                            break;
                        }
                        case index % 4: {
                            monitor.type = "ping";
                            monitor.interval = 60_000; // 1 minute

                            break;
                        }
                        case index % 3: {
                            monitor.type = "port";
                            monitor.interval = 120_000; // 2 minutes

                            break;
                        }
                        default: {
                            monitor.type = Math.random() > 0.5 ? "http" : "dns";
                            monitor.interval = 300_000; // 5 minutes
                        }
                    }
                });

                await monitorService.bulkRegisterMonitors(monitors);

                // Process queue and perform health check
                await monitorService.processCheckQueue();
                await monitorService.performHealthCheck();
                await monitorService.optimizeMonitorSchedules();
            },
            { iterations: 10 }
        );

        bench(
            "Production-like workload simulation",
            async () => {
                // Simulate a production environment with mixed priorities
                const criticalMonitors = generateMonitors(50, 10).map((m) => ({
                    ...m,
                    interval: 30_000, // 30 seconds
                    metadata: { ...m.metadata, priority: "critical" },
                }));

                const normalMonitors = generateMonitors(200, 50).map((m) => ({
                    ...m,
                    interval: 300_000, // 5 minutes
                    metadata: { ...m.metadata, priority: "normal" },
                }));

                const lowPriorityMonitors = generateMonitors(100, 25).map(
                    (m) => ({
                        ...m,
                        interval: 600_000, // 10 minutes
                        metadata: { ...m.metadata, priority: "low" },
                    })
                );

                const allMonitors = [
                    ...criticalMonitors,
                    ...normalMonitors,
                    ...lowPriorityMonitors,
                ];

                await monitorService.bulkRegisterMonitors(allMonitors);

                // Simulate continuous operation
                for (let cycle = 0; cycle < 5; cycle++) {
                    await monitorService.processCheckQueue();

                    if (cycle % 2 === 0) {
                        await monitorService.performHealthCheck();
                    }

                    if (cycle === 3) {
                        await monitorService.optimizeMonitorSchedules();
                    }

                    // Brief pause between cycles
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
            },
            { iterations: 3 }
        );

        bench(
            "Resource utilization under load",
            async () => {
                const monitors = generateMonitors(300, 30);
                await monitorService.bulkRegisterMonitors(monitors);

                // Simulate high-load conditions
                const operations = [
                    () => monitorService.processCheckQueue(),
                    () => monitorService.performHealthCheck(),
                    () => monitorService.optimizeMonitorSchedules(),
                    () => {
                        const updates = monitors.slice(0, 10).map((m) => ({
                            monitorId: m.id,
                            changes: { interval: m.interval * 1.1 },
                        }));
                        return monitorService.bulkUpdateMonitors(updates);
                    },
                ];

                // Execute operations concurrently
                const operationPromises = Array.from({ length: 20 }, (_, i) => {
                    const operation = operations[i % operations.length];
                    return operation();
                });

                await Promise.all(operationPromises);
            },
            { iterations: 5 }
        );
    });

    describe("Error Handling and Recovery", () => {
        bench(
            "Handle monitor check failures",
            async () => {
                const monitors = generateMonitors(100);

                // Simulate some monitors that will fail
                monitors.forEach((monitor, index) => {
                    if (index % 10 === 0) {
                        monitor.url = "https://nonexistent-domain-12345.com";
                        monitor.timeout = 1000; // Short timeout to force failures
                    }
                });

                await monitorService.bulkRegisterMonitors(monitors);
                await monitorService.processCheckQueue();

                // Check health after failures
                await monitorService.performHealthCheck();
            },
            { iterations: 20 }
        );

        bench(
            "Recovery and optimization after failures",
            async () => {
                const monitors = generateMonitors(150);
                await monitorService.bulkRegisterMonitors(monitors);

                // Initial check to establish baseline
                await monitorService.processCheckQueue();

                // Simulate system recovery cycle
                await monitorService.performHealthCheck();
                await monitorService.optimizeMonitorSchedules();

                // Additional check cycle after optimization
                await monitorService.processCheckQueue();
                await monitorService.performHealthCheck();
            },
            { iterations: 10 }
        );
    });
});
