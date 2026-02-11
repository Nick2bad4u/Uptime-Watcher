/**
 * Benchmarks for Monitoring System Performance
 *
 * Tests performance of monitor scheduling, operation tracking, race condition
 * prevention, and heavy monitoring operations.
 */

import { bench, describe } from "vitest";

// Simulate monitoring operation registry
class MockMonitorOperationRegistry {
    private activeOperations = new Map<string, any>();
    private operationHistory: string[] = [];

    initiateCheck(monitorId: string): string {
        const operationId = this.generateOperationId();
        const operation = {
            id: operationId,
            monitorId,
            initiatedAt: Date.now(),
            cancelled: false,
        };

        this.activeOperations.set(operationId, operation);
        this.operationHistory.push(operationId);
        return operationId;
    }

    private generateOperationId(): string {
        return `op-${globalThis.crypto.randomUUID()}`;
    }

    validateOperation(operationId: string): boolean {
        const operation = this.activeOperations.get(operationId);
        return operation && !operation.cancelled;
    }

    completeOperation(operationId: string): void {
        this.activeOperations.delete(operationId);
    }

    cancelOperation(operationId: string): void {
        const operation = this.activeOperations.get(operationId);
        if (operation) {
            operation.cancelled = true;
        }
    }

    getActiveOperationCount(): number {
        return this.activeOperations.size;
    }

    cleanup(): void {
        const cutoff = Date.now() - 5 * 60 * 1000; // 5 minutes ago
        for (const [id, operation] of this.activeOperations) {
            if (operation.initiatedAt < cutoff) {
                this.activeOperations.delete(id);
            }
        }
    }
}

// Simulate monitor scheduler
class MockMonitorScheduler {
    private intervals = new Map<string, NodeJS.Timeout>();
    private activeMonitors = new Set<string>();
    private checkCallback?: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;

    setCheckCallback(
        callback: (siteIdentifier: string, monitorId: string) => Promise<void>
    ): void {
        this.checkCallback = callback;
    }

    startMonitor(
        siteIdentifier: string,
        monitorId: string,
        interval: number
    ): void {
        const key = `${siteIdentifier}:${monitorId}`;

        if (this.intervals.has(key)) {
            this.stopMonitor(siteIdentifier, monitorId);
        }

        const timeoutId = setInterval(async () => {
            if (this.checkCallback) {
                try {
                    await this.checkCallback(siteIdentifier, monitorId);
                } catch {
                    // Handle error
                }
            }
        }, interval);

        this.intervals.set(key, timeoutId);
        this.activeMonitors.add(key);
    }

    stopMonitor(siteIdentifier: string, monitorId: string): void {
        const key = `${siteIdentifier}:${monitorId}`;
        const interval = this.intervals.get(key);

        if (interval) {
            clearInterval(interval);
            this.intervals.delete(key);
            this.activeMonitors.delete(key);
        }
    }

    getActiveCount(): number {
        return this.activeMonitors.size;
    }

    stopAll(): void {
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        this.activeMonitors.clear();
    }
}

// Simulate site cache operations
class MockSiteCache {
    private cache = new Map<string, any>();
    private accessCount = 0;
    private hitCount = 0;

    get(key: string): any {
        this.accessCount++;
        const value = this.cache.get(key);
        if (value) {
            this.hitCount++;
        }
        return value;
    }

    set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    getHitRatio(): number {
        return this.accessCount > 0 ? this.hitCount / this.accessCount : 0;
    }

    evictOldest(maxSize: number): void {
        if (this.cache.size <= maxSize) return;

        const entries = Array.from(this.cache.entries());
        const toRemove = entries.slice(0, this.cache.size - maxSize);

        for (const [key] of toRemove) {
            this.cache.delete(key);
        }
    }
}

// Type definitions for benchmarking
interface MockSite {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: MockMonitor[];
}

interface MockMonitor {
    id: string;
    type: string;
    url?: string;
    host?: string;
    monitoring: boolean;
    checkInterval: number;
    timeout: number;
    retryAttempts: number;
}

// Generate test data
function generateSiteData(count: number): MockSite[] {
    const sites: MockSite[] = [];
    for (let i = 0; i < count; i++) {
        sites.push({
            identifier: `site-${i}`,
            name: `Test Site ${i}`,
            monitoring: true,
            monitors: [
                {
                    id: `monitor-${i}-1`,
                    type: "http",
                    url: `https://example${i}.com`,
                    monitoring: true,
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                },
                {
                    id: `monitor-${i}-2`,
                    type: "ping",
                    host: `example${i}.com`,
                    monitoring: true,
                    checkInterval: 30_000,
                    timeout: 3000,
                    retryAttempts: 2,
                },
            ],
        });
    }
    return sites;
}

// Simulate heavy monitoring check
async function simulateMonitorCheck(): Promise<void> {
    // Simulate network delay and computation
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate some CPU work
            let result = 0;
            for (let i = 0; i < 1000; i++) {
                result += Math.random();
            }
            resolve();
        }, Math.random() * 10); // 0-10ms delay
    });
}

describe("Monitoring System Performance Benchmarks", () => {
    describe("Operation Registry Performance", () => {
        const registry = new MockMonitorOperationRegistry();

        bench("operation initiation - small scale (100 operations)", () => {
            for (let i = 0; i < 100; i++) {
                const opId = registry.initiateCheck(`monitor-${i}`);
                registry.completeOperation(opId);
            }
        });

        bench("operation validation - concurrent operations", () => {
            const operations: string[] = [];
            for (let i = 0; i < 1000; i++) {
                operations.push(registry.initiateCheck(`monitor-${i}`));
            }

            for (const opId of operations) {
                registry.validateOperation(opId);
            }

            for (const opId of operations) {
                registry.completeOperation(opId);
            }
        });

        bench("operation cleanup - large registry", () => {
            // Create many old operations
            for (let i = 0; i < 5000; i++) {
                registry.initiateCheck(`monitor-${i}`);
            }

            registry.cleanup();
        });
    });

    describe("Monitor Scheduler Performance", () => {
        const scheduler = new MockMonitorScheduler();
        let checkCallCount = 0;

        scheduler.setCheckCallback(async (siteIdentifier, monitorId) => {
            checkCallCount++;
            await simulateMonitorCheck();
        });

        bench("start/stop monitor operations", () => {
            for (let i = 0; i < 100; i++) {
                scheduler.startMonitor(`site-${i}`, `monitor-${i}`, 60_000);
            }

            for (let i = 0; i < 100; i++) {
                scheduler.stopMonitor(`site-${i}`, `monitor-${i}`);
            }
        });

        bench("scheduler state queries", () => {
            // Start some monitors
            for (let i = 0; i < 50; i++) {
                scheduler.startMonitor(`site-${i}`, `monitor-${i}`, 60_000);
            }

            // Query state many times
            for (let i = 0; i < 1000; i++) {
                scheduler.getActiveCount();
            }

            scheduler.stopAll();
        });
    });

    describe("Site Cache Performance", () => {
        const cache = new MockSiteCache();
        const sites = generateSiteData(1000);

        bench("cache population - 1000 sites", () => {
            for (const site of sites) {
                cache.set(site.identifier, site);
            }
        });

        bench("cache lookups - high hit ratio", () => {
            // Populate cache first
            for (const site of sites) {
                cache.set(site.identifier, site);
            }

            // Perform many lookups
            for (let i = 0; i < 10_000; i++) {
                const siteIdentifier = `site-${i % 1000}`;
                cache.get(siteIdentifier);
            }
        });

        bench("cache eviction - LRU simulation", () => {
            // Fill cache beyond capacity
            for (let i = 0; i < 2000; i++) {
                cache.set(`site-${i}`, {
                    identifier: `site-${i}`,
                    name: `Site ${i}`,
                });
            }

            // Simulate eviction
            cache.evictOldest(1000);
        });
    });

    describe("Bulk Monitoring Operations", () => {
        const registry = new MockMonitorOperationRegistry();
        const scheduler = new MockMonitorScheduler();
        const cache = new MockSiteCache();
        const sites = generateSiteData(100);

        // Setup cache
        for (const site of sites) {
            cache.set(site.identifier, site);
        }

        scheduler.setCheckCallback(async (siteIdentifier, monitorId) => {
            const operationId = registry.initiateCheck(monitorId);
            try {
                await simulateMonitorCheck();
                registry.completeOperation(operationId);
            } catch {
                registry.cancelOperation(operationId);
            }
        });

        bench("start monitoring for 100 sites (200 monitors)", () => {
            for (const site of sites) {
                for (const monitor of site.monitors) {
                    scheduler.startMonitor(
                        site.identifier,
                        monitor.id,
                        monitor.checkInterval
                    );
                }
            }

            // Clean up
            scheduler.stopAll();
        });

        bench("bulk operation initiation and completion", () => {
            const operations: string[] = [];

            // Initiate many operations
            for (let i = 0; i < 1000; i++) {
                operations.push(registry.initiateCheck(`monitor-${i}`));
            }

            // Complete them all
            for (const opId of operations) {
                registry.completeOperation(opId);
            }
        });
    });

    describe("Race Condition Prevention", () => {
        const registry = new MockMonitorOperationRegistry();

        bench("concurrent operation validation", () => {
            const operations = new Map<string, string>();

            // Simulate concurrent operation initiation
            for (let i = 0; i < 500; i++) {
                const monitorId = `monitor-${i % 50}`; // 50 monitors, multiple ops each
                const opId = registry.initiateCheck(monitorId);
                operations.set(monitorId, opId);
            }

            // Simulate validation during concurrent execution
            for (const [monitorId, opId] of operations) {
                registry.validateOperation(opId);
            }

            // Simulate completion
            for (const [, opId] of operations) {
                registry.completeOperation(opId);
            }
        });

        bench("operation cancellation under load", () => {
            const operations: string[] = [];

            // Create many operations
            for (let i = 0; i < 1000; i++) {
                operations.push(registry.initiateCheck(`monitor-${i}`));
            }

            // Cancel half of them randomly
            for (let i = 0; i < 500; i++) {
                const randomIndex = Math.floor(
                    Math.random() * operations.length
                );
                registry.cancelOperation(operations[randomIndex]);
            }

            // Complete the rest
            for (const opId of operations) {
                registry.completeOperation(opId);
            }
        });
    });

    describe("Memory Usage Patterns", () => {
        bench("memory allocation patterns - high turnover", () => {
            const registry = new MockMonitorOperationRegistry();

            // Simulate high operation turnover
            for (let cycle = 0; cycle < 10; cycle++) {
                const operations: string[] = [];

                // Create many operations
                for (let i = 0; i < 1000; i++) {
                    operations.push(registry.initiateCheck(`monitor-${i}`));
                }

                // Complete them quickly
                for (const opId of operations) {
                    registry.completeOperation(opId);
                }
            }
        });

        bench("cache memory management", () => {
            const cache = new MockSiteCache();

            // Simulate cache churn
            for (let cycle = 0; cycle < 100; cycle++) {
                // Add items
                for (let i = 0; i < 100; i++) {
                    cache.set(`key-${cycle}-${i}`, {
                        data: `value-${cycle}-${i}`,
                        timestamp: Date.now(),
                    });
                }

                // Access some items
                for (let i = 0; i < 50; i++) {
                    cache.get(`key-${cycle}-${i}`);
                }

                // Evict if needed
                if (cache.size() > 5000) {
                    cache.evictOldest(3000);
                }
            }
        });
    });
});
