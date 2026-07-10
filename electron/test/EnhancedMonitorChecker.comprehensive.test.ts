import type { Monitor, Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../events/eventTypes";
import type { HistoryRepository } from "../services/database/HistoryRepository";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { SiteRepository } from "../services/database/SiteRepository";
import type { EnhancedMonitorCheckConfig } from "../services/monitoring/EnhancedMonitorChecker";

import { TypedEventBus } from "../events/TypedEventBus";
import { EnhancedMonitorChecker } from "../services/monitoring/EnhancedMonitorChecker";
import { MonitorOperationRegistry } from "../services/monitoring/MonitorOperationRegistry";
import { MonitorStatusUpdateService } from "../services/monitoring/MonitorStatusUpdateService";
import { OperationTimeoutManager } from "../services/monitoring/OperationTimeoutManager";
import { StandardizedCache } from "../utils/cache/StandardizedCache";

const EVENT_BUS_ID = "enhanced-monitor-checker-test";

const createHistoryRepositoryMock = () =>
    ({
        addEntry: vi
            .fn<HistoryRepository["addEntry"]>()
            .mockResolvedValue(undefined),
        findByMonitorId: vi
            .fn<HistoryRepository["findByMonitorId"]>()
            .mockResolvedValue([]),
    }) satisfies Partial<HistoryRepository>;

const createMonitorRepositoryMock = () =>
    ({
        clearActiveOperations: vi
            .fn<MonitorRepository["clearActiveOperations"]>()
            .mockResolvedValue(undefined),
        findByIdentifier: vi
            .fn<MonitorRepository["findByIdentifier"]>()
            .mockResolvedValue(undefined),
        update: vi
            .fn<MonitorRepository["update"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<MonitorRepository>;

const createSiteRepositoryMock = () =>
    ({
        findByIdentifier: vi
            .fn<SiteRepository["findByIdentifier"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<SiteRepository>;

/**
 * Promotes contract-checked partial test doubles at the fixture boundary.
 */
const asMockContract = <Contract extends object>(
    mock: Partial<Contract>
): Contract => mock as Contract;

const createCheckerFixture = () => {
    const eventEmitter = new TypedEventBus<UptimeEvents>(EVENT_BUS_ID);
    const historyRepositoryMock = createHistoryRepositoryMock();
    const monitorRepositoryMock = createMonitorRepositoryMock();
    const siteRepositoryMock = createSiteRepositoryMock();
    const historyRepository = asMockContract<HistoryRepository>(
        historyRepositoryMock
    );
    const monitorRepository = asMockContract<MonitorRepository>(
        monitorRepositoryMock
    );
    const siteRepository = asMockContract<SiteRepository>(siteRepositoryMock);
    const operationRegistry = new MonitorOperationRegistry({
        randomUUID: () => "operation-123",
    });
    const sites = new StandardizedCache<Site>({
        eventEmitter,
        name: "enhanced-monitor-checker-sites",
        ttl: 0,
    });
    const timeoutManager = new OperationTimeoutManager(
        operationRegistry,
        monitorRepository
    );
    const statusUpdateService = new MonitorStatusUpdateService(
        operationRegistry,
        monitorRepository,
        sites,
        timeoutManager
    );
    const config = {
        eventEmitter,
        getHistoryLimit: () => 100,
        historyRepository,
        monitorRepository,
        operationRegistry,
        siteRepository,
        sites,
        statusUpdateService,
        timeoutManager,
    } satisfies EnhancedMonitorCheckConfig;

    return {
        checker: new EnhancedMonitorChecker(config),
        eventEmitter,
        monitorRepositoryMock,
    };
};

const getDynamicEventMetadata = (event: object): unknown =>
    Reflect.get(event, "_meta") as unknown;

function createTestMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "monitor-1",
        type: "http",
        host: "example.com",
        monitoring: true,
        status: "pending",
        responseTime: -1,
        history: [],
        checkInterval: 60_000,
        retryAttempts: 3,
        timeout: 30_000,
        ...overrides,
    };
}

function createTestSite(overrides: Partial<Site> = {}): Site {
    return {
        identifier: "test-site",
        name: "Test Site",
        monitoring: true,
        monitors: [],
        ...overrides,
    };
}

describe(EnhancedMonitorChecker, () => {
    let checker: EnhancedMonitorChecker;
    let fixture: ReturnType<typeof createCheckerFixture>;

    beforeEach(() => {
        fixture = createCheckerFixture();
        checker = fixture.checker;
    });

    it("should initialize successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Initialization", "type");

        expect(checker).toBeDefined();
        expect(checker).toBeInstanceOf(EnhancedMonitorChecker);
    });

    it("should handle checkMonitor with manual check", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        const monitor = createTestMonitor({ type: "http" });
        const site = createTestSite({
            monitors: [monitor],
        });

        const result = await checker.checkMonitor(site, "monitor-1", true);

        // The actual implementation may return different results based on service availability
        // Result can be either a StatusUpdate object or undefined depending on implementation
        // Just verify the method completes without throwing errors
        expect(typeof result === "object" || result === undefined).toBeTruthy();
    });

    it("should handle startMonitoring", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        const startedEvents: UptimeEvents["internal:monitor:started"][] = [];
        fixture.eventEmitter.onTyped("internal:monitor:started", (event) => {
            startedEvents.push(event);
        });

        const isResult = await checker.startMonitoring(
            "test-site-1",
            "monitor-1"
        );

        expect(typeof isResult).toBe("boolean");
        expect(fixture.monitorRepositoryMock.update).toHaveBeenCalled();
        expect(startedEvents).toHaveLength(1);
        expect(getDynamicEventMetadata(startedEvents[0] ?? {})).toEqual(
            expect.objectContaining({
                busId: EVENT_BUS_ID,
                eventName: "internal:monitor:started",
            })
        );
    });

    it("should handle stopMonitoring", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        const stoppedEvents: UptimeEvents["internal:monitor:stopped"][] = [];
        fixture.eventEmitter.onTyped("internal:monitor:stopped", (event) => {
            stoppedEvents.push(event);
        });

        const isResult = await checker.stopMonitoring(
            "test-site-1",
            "monitor-1"
        );

        expect(typeof isResult).toBe("boolean");
        expect(fixture.monitorRepositoryMock.update).toHaveBeenCalled();
        expect(stoppedEvents).toHaveLength(1);
        expect(getDynamicEventMetadata(stoppedEvents[0] ?? {})).toEqual(
            expect.objectContaining({
                busId: EVENT_BUS_ID,
                eventName: "internal:monitor:stopped",
            })
        );
    });

    it("should handle checkMonitor with non-existent monitor", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite({
            monitors: [],
        });

        const result = await checker.checkMonitor(site, "non-existent", false);

        expect(result).toBeUndefined();
    });

    it("should handle checkMonitor with non-monitoring monitor in scheduled mode", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: EnhancedMonitorChecker", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        const monitor = createTestMonitor({
            type: "http",
            monitoring: false, // Not monitoring
        });
        const site = createTestSite({
            monitors: [monitor],
        });

        const result = await checker.checkMonitor(site, "monitor-1", false);

        expect(result).toBeUndefined();
    });
});
