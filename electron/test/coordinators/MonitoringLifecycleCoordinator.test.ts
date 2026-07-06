import type { Monitor } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitoringLifecycleCoordinatorDependencies } from "../../coordinators/MonitoringLifecycleCoordinator";
import type { MonitorManager } from "../../managers/MonitorManager";
import type { SiteManager } from "../../managers/SiteManager";

import { MonitoringLifecycleCoordinator } from "../../coordinators/MonitoringLifecycleCoordinator";

const mockLogger = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("../../utils/logger", () => ({
    logger: mockLogger,
}));

const flushAsync = async (): Promise<void> =>
    new Promise((resolve) => {
        setImmediate(resolve);
    });

const createMonitor = (id: string): Monitor => ({
    activeOperations: [],
    checkInterval: 30_000,
    history: [],
    id,
    lastChecked: new Date("2026-01-01T00:00:00.000Z"),
    monitoring: true,
    retryAttempts: 0,
    responseTime: 0,
    status: "up",
    timeout: 5000,
    type: "http",
    url: "https://example.com/health",
});

describe(MonitoringLifecycleCoordinator, () => {
    const rawIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private";
    const monitorId = "monitor-1";

    let coordinator: MonitoringLifecycleCoordinator;
    let emitTyped: ReturnType<
        typeof vi.fn<MonitoringLifecycleCoordinatorDependencies["emitTyped"]>
    >;
    let monitorManager: MonitorManager;
    let siteManager: SiteManager;
    let startMonitoringForSite: ReturnType<typeof vi.fn>;
    let restartMonitorWithNewConfig: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        emitTyped = vi.fn<
            MonitoringLifecycleCoordinatorDependencies["emitTyped"]
        >(async () => undefined);
        startMonitoringForSite = vi
            .fn()
            .mockRejectedValue(new Error("start failed"));
        restartMonitorWithNewConfig = vi.fn(() => {
            throw new Error("restart failed");
        });
        monitorManager = {
            restartMonitorWithNewConfig,
            startMonitoringForSite,
        } as unknown as MonitorManager;
        siteManager = {} as unknown as SiteManager;

        coordinator = new MonitoringLifecycleCoordinator({
            emitTyped,
            monitorManager,
            siteManager,
        } satisfies MonitoringLifecycleCoordinatorDependencies);
    });

    it("redacts site identifiers in start-monitoring failure logs", async () => {
        coordinator.handleStartMonitoringRequestedEvent({
            identifier: rawIdentifier,
            monitorId,
        });

        await flushAsync();

        expect(startMonitoringForSite).toHaveBeenCalledWith(
            rawIdentifier,
            monitorId
        );
        expect(emitTyped).toHaveBeenCalledWith(
            "internal:site:start-monitoring-response",
            expect.objectContaining({
                identifier: rawIdentifier,
                monitorId,
                success: false,
            })
        );

        const logPayload = JSON.stringify(mockLogger.error.mock.calls);

        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private");
    });

    it("redacts site identifiers in restart-monitoring failure logs", async () => {
        const monitor = createMonitor(monitorId);

        coordinator.handleRestartMonitoringRequestedEvent({
            identifier: rawIdentifier,
            monitor,
        });

        await flushAsync();

        expect(restartMonitorWithNewConfig).toHaveBeenCalledWith(
            rawIdentifier,
            monitor
        );
        expect(emitTyped).toHaveBeenCalledWith(
            "internal:site:restart-monitoring-response",
            expect.objectContaining({
                identifier: rawIdentifier,
                monitorId,
                success: false,
            })
        );

        const logPayload = JSON.stringify(mockLogger.error.mock.calls);

        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private");
    });
});
