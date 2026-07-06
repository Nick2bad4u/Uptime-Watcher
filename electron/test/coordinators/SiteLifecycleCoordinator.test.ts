import type { Monitor, Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SiteLifecycleCoordinatorDependencies } from "../../coordinators/SiteLifecycleCoordinator";
import type { MonitorManager } from "../../managers/MonitorManager";
import type { SiteManager } from "../../managers/SiteManager";
import type { ContextualErrorFactory } from "../../orchestrator/utils/contextualErrorFactory";

import { SiteLifecycleCoordinator } from "../../coordinators/SiteLifecycleCoordinator";

const mockLogger = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("../../utils/logger", () => ({
    logger: mockLogger,
}));

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

const createSite = (identifier: string, monitor: Monitor): Site => ({
    identifier,
    monitoring: true,
    monitors: [monitor],
    name: "Example",
});

describe(SiteLifecycleCoordinator, () => {
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private";
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#monitor-private";

    let createContextualError: ReturnType<typeof vi.fn>;
    let emitSystemError: ReturnType<typeof vi.fn>;
    let monitorManager: MonitorManager;
    let monitorManagerStartMonitoringForSite: ReturnType<typeof vi.fn>;
    let monitorManagerStopMonitoringForSite: ReturnType<typeof vi.fn>;
    let siteManager: SiteManager;
    let siteManagerRemoveMonitor: ReturnType<typeof vi.fn>;
    let coordinator: SiteLifecycleCoordinator;

    beforeEach(() => {
        createContextualError = vi.fn(
            (input: Parameters<ContextualErrorFactory>[0]) =>
                new Error(input.message)
        );
        emitSystemError = vi.fn().mockResolvedValue(undefined);
        monitorManagerStartMonitoringForSite = vi
            .fn()
            .mockRejectedValue(new Error("restart failed"));
        monitorManagerStopMonitoringForSite = vi.fn().mockResolvedValue(true);
        monitorManager = {
            startMonitoringForSite: monitorManagerStartMonitoringForSite,
            stopMonitoringForSite: monitorManagerStopMonitoringForSite,
        } as unknown as MonitorManager;

        siteManagerRemoveMonitor = vi
            .fn()
            .mockRejectedValue(new Error("database failed"));
        siteManager = {
            removeMonitor: siteManagerRemoveMonitor,
        } as unknown as SiteManager;

        coordinator = new SiteLifecycleCoordinator({
            createContextualError,
            emitSystemError,
            monitorManager,
            siteManager,
        } as SiteLifecycleCoordinatorDependencies);
    });

    it("redacts URL-shaped identifiers in monitor removal diagnostics", async () => {
        await expect(
            coordinator.removeMonitor(rawSiteIdentifier, rawMonitorId)
        ).rejects.toThrow("Failed to remove monitor");

        expect(monitorManagerStopMonitoringForSite).toHaveBeenCalledWith(
            rawSiteIdentifier,
            rawMonitorId
        );
        expect(siteManagerRemoveMonitor).toHaveBeenCalledWith(
            rawSiteIdentifier,
            rawMonitorId
        );
        expect(monitorManagerStartMonitoringForSite).toHaveBeenCalledWith(
            rawSiteIdentifier,
            rawMonitorId
        );

        const diagnosticPayload = JSON.stringify({
            contextualErrors: createContextualError.mock.calls,
            emittedErrors: emitSystemError.mock.calls,
            logs: {
                error: mockLogger.error.mock.calls,
                info: mockLogger.info.mock.calls,
                warn: mockLogger.warn.mock.calls,
            },
        });

        expect(diagnosticPayload).toContain("https://example.com/path");
        expect(diagnosticPayload).toContain("https://monitor.example/check");
        expect(diagnosticPayload).not.toContain("site-secret");
        expect(diagnosticPayload).not.toContain("site-token");
        expect(diagnosticPayload).not.toContain("monitor-token");
        expect(diagnosticPayload).not.toContain("monitor-private");
    });

    it("redacts URL-shaped identifiers in add-site rollback diagnostics", async () => {
        const monitor = createMonitor(rawMonitorId);
        const site = createSite(rawSiteIdentifier, monitor);

        siteManager = {
            addSite: vi.fn().mockResolvedValue(site),
            removeSite: vi.fn().mockResolvedValue(true),
        } as unknown as SiteManager;
        monitorManager = {
            setupSiteForMonitoring: vi
                .fn()
                .mockRejectedValue(new Error("setup failed")),
        } as unknown as MonitorManager;
        coordinator = new SiteLifecycleCoordinator({
            createContextualError,
            emitSystemError,
            monitorManager,
            siteManager,
        } as SiteLifecycleCoordinatorDependencies);

        await expect(coordinator.addSite(site)).rejects.toThrow(
            "Failed to add site"
        );

        expect(siteManager.removeSite).toHaveBeenCalledWith(rawSiteIdentifier);

        const diagnosticPayload = JSON.stringify({
            contextualErrors: createContextualError.mock.calls,
            logs: {
                error: mockLogger.error.mock.calls,
                info: mockLogger.info.mock.calls,
                warn: mockLogger.warn.mock.calls,
            },
        });

        expect(diagnosticPayload).toContain("https://example.com/path");
        expect(diagnosticPayload).not.toContain("site-secret");
        expect(diagnosticPayload).not.toContain("site-token");
        expect(diagnosticPayload).not.toContain("private");
    });
});
