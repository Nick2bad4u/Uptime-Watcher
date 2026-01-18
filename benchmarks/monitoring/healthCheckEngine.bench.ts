/**
 * Health Check Engine Performance Benchmarks
 *
 * @file Performance benchmarks for health check engine operations using real
 *   EnhancedMonitorChecker with mock dependencies for performance testing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @updated 2025-09-22 - Updated to use real EnhancedMonitorChecker implementation
 *
 * @benchmark Monitoring-HealthCheckEngine
 *
 * @tags ["performance", "monitoring", "health-checks", "engine"]
 */

import { bench, describe, beforeEach, vi } from "vitest";
import { EnhancedMonitorChecker } from "../../electron/services/monitoring/EnhancedMonitorChecker";
import { TypedEventBus } from "../../electron/events/TypedEventBus";
import { StandardizedCache } from "../../electron/utils/cache/StandardizedCache";
import { MonitorOperationRegistry } from "../../electron/services/monitoring/MonitorOperationRegistry";
import { MonitorStatusUpdateService } from "../../electron/services/monitoring/MonitorStatusUpdateService";
import { OperationTimeoutManager } from "../../electron/services/monitoring/OperationTimeoutManager";
import type { UptimeEvents } from "../../electron/events/eventTypes";
import type { Site, Monitor } from "../../shared/types";
import type { HistoryRepository } from "../../electron/services/database/HistoryRepository";
import type { MonitorRepository } from "../../electron/services/database/MonitorRepository";
import type { SiteRepository } from "../../electron/services/database/SiteRepository";
import { randomUUID } from "node:crypto";

// Mock repositories for performance testing
const mockHistoryRepository: HistoryRepository = {
    addEntry: vi.fn().mockResolvedValue(undefined),
    getHistory: vi.fn().mockResolvedValue([]),
    pruneHistory: vi.fn().mockResolvedValue(undefined),
} as any;

const mockMonitorRepository: MonitorRepository = {
    clearActiveOperations: vi.fn().mockResolvedValue(undefined),
    findByIdentifier: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(true),
    updateStatus: vi.fn().mockResolvedValue(undefined),
    getMonitor: vi.fn().mockResolvedValue(null),
    updateMonitor: vi.fn().mockResolvedValue(undefined),
} as any;

const mockSiteRepository: SiteRepository = {
    getSite: vi.fn().mockResolvedValue(null),
    updateSite: vi.fn().mockResolvedValue(undefined),
    getAllSites: vi.fn().mockResolvedValue([]),
} as any;

// Helper function to create test sites with monitors
function createTestSite(siteIndex: number, monitorCount: number = 1): Site {
    const monitors: Monitor[] = [];

    for (let i = 0; i < monitorCount; i++) {
        monitors.push({
            id: `monitor-${siteIndex}-${i}`,
            type: [
                "http",
                "ping",
                "port",
                "dns",
            ][i % 4] as any,
            url: `https://test-site-${siteIndex}-${i}.com`,
            host: `test-site-${siteIndex}-${i}.com`,
            port: 80 + i,
            checkInterval: 60_000,
            timeout: 5000,
            retryAttempts: 3,
            activeOperations: [],
            monitoring: true,
            status: "up",
            responseTime: 0,
            history: [],
            recordType: "A",
            expectedValue: "127.0.0.1",
        });
    }

    return {
        identifier: `site-${siteIndex}`,
        name: `Test Site ${siteIndex}`,
        monitoring: true,
        monitors,
    };
}

describe("Enhanced Monitor Checker Performance", () => {
    let eventBus: TypedEventBus<UptimeEvents>;
    let sitesCache: StandardizedCache<Site>;
    let operationRegistry: MonitorOperationRegistry;
    let timeoutManager: OperationTimeoutManager;
    let statusUpdateService: MonitorStatusUpdateService;
    let healthCheckEngine: EnhancedMonitorChecker;
    let testSites: Site[];

    beforeEach(() => {
        // Create fresh instances for each benchmark
        eventBus = new TypedEventBus();
        sitesCache = new StandardizedCache<Site>({
            name: "benchmarks-sites",
            maxSize: 1000,
            ttl: 300_000, // 5 minutes
        });

        operationRegistry = new MonitorOperationRegistry();
        timeoutManager = new OperationTimeoutManager(
            operationRegistry,
            mockMonitorRepository
        );
        statusUpdateService = new MonitorStatusUpdateService(
            operationRegistry,
            mockMonitorRepository,
            sitesCache,
            timeoutManager
        );

        // Create EnhancedMonitorChecker with all dependencies
        healthCheckEngine = new EnhancedMonitorChecker({
            eventEmitter: eventBus,
            getHistoryLimit: () => 100,
            historyRepository: mockHistoryRepository,
            monitorRepository: mockMonitorRepository,
            operationRegistry,
            siteRepository: mockSiteRepository,
            sites: sitesCache,
            statusUpdateService,
            timeoutManager,
        });

        // Create test sites for benchmarking
        testSites = [];
        for (let i = 0; i < 50; i++) {
            const site = createTestSite(i, 2); // 2 monitors per site
            testSites.push(site);
            sitesCache.set(site.identifier, site);
        }

        const monitorById = new Map<string, Site["monitors"][number]>();
        for (const site of testSites) {
            for (const monitor of site.monitors) {
                monitorById.set(monitor.id, monitor);
            }
        }

        vi.mocked(mockMonitorRepository.findByIdentifier).mockImplementation(
            async (monitorId: string) => monitorById.get(monitorId) ?? null
        );

        vi.mocked(mockMonitorRepository.update).mockImplementation(
            async (monitorId, updates) => {
                const monitor = monitorById.get(monitorId);
                if (monitor) {
                    Object.assign(monitor, updates as Record<string, unknown>);
                }
            }
        );

        vi.mocked(
            mockMonitorRepository.clearActiveOperations
        ).mockImplementation(async (monitorId: string) => {
            const monitor = monitorById.get(monitorId);
            if (monitor) {
                monitor.activeOperations = [];
            }
        });
    });

    bench(
        "enhanced monitor checker initialization",
        () => {
            const freshEventBus = new TypedEventBus<UptimeEvents>();
            const freshCache = new StandardizedCache<Site>({
                name: "benchmarks-sites-fresh",
                maxSize: 1000,
                ttl: 300_000,
            });

            const freshRegistry = new MonitorOperationRegistry();
            const freshTimeoutManager = new OperationTimeoutManager(
                freshRegistry,
                mockMonitorRepository
            );
            const freshStatusService = new MonitorStatusUpdateService(
                freshRegistry,
                mockMonitorRepository,
                freshCache,
                freshTimeoutManager
            );

            new EnhancedMonitorChecker({
                eventEmitter: freshEventBus,
                getHistoryLimit: () => 100,
                historyRepository: mockHistoryRepository,
                monitorRepository: mockMonitorRepository,
                operationRegistry: freshRegistry,
                siteRepository: mockSiteRepository,
                sites: freshCache,
                statusUpdateService: freshStatusService,
                timeoutManager: freshTimeoutManager,
            });
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "single monitor health check (manual)",
        async () => {
            const site = testSites[0];
            const monitor = site.monitors[0];
            await healthCheckEngine.checkMonitor(site, monitor.id, true);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "single monitor health check (scheduled)",
        async () => {
            const site = testSites[1];
            const monitor = site.monitors[0];
            await healthCheckEngine.checkMonitor(site, monitor.id, false);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "bulk monitor health checks (10 monitors)",
        async () => {
            const checkPromises = [];
            for (let i = 0; i < 5; i++) {
                const site = testSites[i];
                for (const monitor of site.monitors) {
                    checkPromises.push(
                        healthCheckEngine.checkMonitor(site, monitor.id, true)
                    );
                }
            }
            await Promise.all(checkPromises);
        },
        { warmupIterations: 2, iterations: 50 }
    );

    bench(
        "monitor status validation",
        () => {
            const site = testSites[0];
            const monitor = site.monitors[0];
            // Validate monitor exists in site
            const isValid = site.monitors.some((m) => m.id === monitor.id);
            void isValid; // Use result to prevent dead code elimination
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "operation registry performance",
        () => {
            const monitorId = testSites[0].monitors[0].id;

            // Test the real API methods
            const operation = operationRegistry.initiateCheck(monitorId);
            const isValid = operationRegistry.validateOperation(
                operation.operationId
            );
            operationRegistry.completeOperation(operation.operationId);

            void isValid; // Use result to prevent dead code elimination
        },
        { warmupIterations: 5, iterations: 1000 }
    );
});
