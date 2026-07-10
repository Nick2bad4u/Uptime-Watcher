import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    startMonitoringOperation,
    stopMonitoringOperation,
} from "../../../../services/monitoring/enhancedMonitorChecker/toggleMonitoring";
import { blockMonitorChecks } from "../../../../services/monitoring/MonitorExecutionFence";

type ToggleMonitoringDependencies = Parameters<
    typeof startMonitoringOperation
>[0]["dependencies"];

const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
}));

vi.mock("../../../../utils/logger", () => ({
    monitorLogger: mockLogger,
}));

describe("toggleMonitoring operations", () => {
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private-site";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redacts URL-shaped identifiers in start success logs while preserving emitted payloads", async () => {
        const emitTyped = vi.fn().mockResolvedValue(undefined);
        const update = vi.fn().mockResolvedValue(undefined);
        const dependencies = {
            eventEmitter: { emitTyped },
            monitorRepository: {
                findByIdentifier: vi
                    .fn()
                    .mockResolvedValue({ id: rawMonitorId }),
                update,
            },
            operationRegistry: { cancelOperations: vi.fn() },
        } as unknown as ToggleMonitoringDependencies;

        await expect(
            startMonitoringOperation({
                dependencies,
                monitorId: rawMonitorId,
                siteIdentifier: rawSiteIdentifier,
            })
        ).resolves.toBeTruthy();

        expect(update).toHaveBeenCalledWith(rawMonitorId, {
            activeOperations: [],
            monitoring: true,
        });
        expect(emitTyped).toHaveBeenCalledWith(
            "internal:monitor:started",
            expect.objectContaining({
                identifier: rawSiteIdentifier,
                monitorId: rawMonitorId,
            })
        );

        const logPayload = JSON.stringify(mockLogger.info.mock.calls);
        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    });

    it("redacts URL-shaped identifiers in stop failure logs", async () => {
        const dependencies = {
            eventEmitter: { emitTyped: vi.fn() },
            monitorRepository: {
                update: vi.fn().mockRejectedValue(new Error("update failed")),
            },
            operationRegistry: { cancelOperations: vi.fn() },
        } as unknown as ToggleMonitoringDependencies;

        await expect(
            stopMonitoringOperation({
                dependencies,
                monitorId: rawMonitorId,
                siteIdentifier: rawSiteIdentifier,
            })
        ).resolves.toBeFalsy();

        const logPayload = JSON.stringify(mockLogger.error.mock.calls);
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    });

    it("allows lifecycle persistence through a deletion check block", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        const dependencies = {
            eventEmitter: { emitTyped: vi.fn().mockResolvedValue(undefined) },
            monitorRepository: { update },
            operationRegistry: { cancelOperations: vi.fn() },
        } as unknown as ToggleMonitoringDependencies;
        const releaseBlock = blockMonitorChecks(["monitor-1"]);

        try {
            await expect(
                stopMonitoringOperation({
                    dependencies,
                    monitorId: "monitor-1",
                    siteIdentifier: "site-1",
                })
            ).resolves.toBeTruthy();
        } finally {
            releaseBlock();
        }

        expect(update).toHaveBeenCalledWith("monitor-1", {
            activeOperations: [],
            monitoring: false,
        });
    });

    it("rejects a queued start after deletion releases its block", async () => {
        const findByIdentifier = vi.fn().mockResolvedValue(undefined);
        const update = vi.fn().mockResolvedValue(undefined);
        const dependencies = {
            eventEmitter: { emitTyped: vi.fn().mockResolvedValue(undefined) },
            monitorRepository: { findByIdentifier, update },
            operationRegistry: { cancelOperations: vi.fn() },
        } as unknown as ToggleMonitoringDependencies;
        const releaseBlock = blockMonitorChecks(["monitor-1"]);

        const start = startMonitoringOperation({
            dependencies,
            monitorId: "monitor-1",
            siteIdentifier: "site-1",
        });
        await Promise.resolve();
        expect(findByIdentifier).not.toHaveBeenCalled();

        releaseBlock();
        await expect(start).resolves.toBeFalsy();
        expect(findByIdentifier).toHaveBeenCalledWith("monitor-1");
        expect(update).not.toHaveBeenCalled();
    });
});
