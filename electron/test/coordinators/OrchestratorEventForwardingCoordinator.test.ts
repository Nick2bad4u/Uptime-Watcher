import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorManager } from "../../managers/MonitorManager";
import type { SiteManager } from "../../managers/SiteManager";
import type { OrchestratorEvents } from "../../UptimeOrchestrator.types";

import { OrchestratorEventForwardingCoordinator } from "../../coordinators/OrchestratorEventForwardingCoordinator";
import { TypedEventBus } from "../../events/TypedEventBus";

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

describe(OrchestratorEventForwardingCoordinator, () => {
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private-site";

    let coordinator: OrchestratorEventForwardingCoordinator;
    let eventBus: TypedEventBus<OrchestratorEvents>;
    let monitorManager: MonitorManager;
    let siteManager: SiteManager;

    beforeEach(() => {
        eventBus = new TypedEventBus<OrchestratorEvents>(
            "orchestrator-event-forwarding-test"
        );
        monitorManager = {
            getActiveMonitorCount: vi.fn(() => 0),
        } as unknown as MonitorManager;
        siteManager = {
            getSitesFromCache: vi.fn(() => []),
        } as unknown as SiteManager;

        coordinator = new OrchestratorEventForwardingCoordinator({
            busId: "orchestrator-event-forwarding-test",
            eventBus,
            monitorManager,
            siteManager,
        });
        coordinator.register();
    });

    afterEach(() => {
        coordinator.unregister();
        eventBus.removeAllListeners();
    });

    it("redacts fallback site removal diagnostics without mutating forwarded payloads", async () => {
        const siteRemovedHandler = vi.fn();
        eventBus.on("site:removed", siteRemovedHandler);

        await eventBus.emitTyped("internal:site:removed", {
            identifier: rawSiteIdentifier,
            operation: "removed",
            timestamp: Date.now(),
        });
        await flushAsync();

        expect(siteRemovedHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                siteIdentifier: rawSiteIdentifier,
            })
        );

        const fallbackLogCall = mockLogger.warn.mock.calls.find(([message]) =>
            String(message).includes(
                "internal:site:removed emitted without site snapshot"
            )
        );

        expect(fallbackLogCall).toBeDefined();

        const logPayload = JSON.stringify(fallbackLogCall);

        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
    });

    it("redacts scoped monitor lifecycle skip diagnostics", async () => {
        const monitoringStartedHandler = vi.fn();
        eventBus.on("monitoring:started", monitoringStartedHandler);

        await eventBus.emitTyped("internal:monitor:started", {
            identifier: rawSiteIdentifier,
            monitorId: rawMonitorId,
            operation: "started",
            timestamp: Date.now(),
        });
        await flushAsync();

        expect(monitoringStartedHandler).not.toHaveBeenCalled();

        const scopedLogCall = mockLogger.debug.mock.calls.find(([message]) =>
            String(message).includes(
                "Skipping monitoring:started broadcast for scoped operation"
            )
        );

        expect(scopedLogCall).toBeDefined();

        const logPayload = JSON.stringify(scopedLogCall);

        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    });
});
