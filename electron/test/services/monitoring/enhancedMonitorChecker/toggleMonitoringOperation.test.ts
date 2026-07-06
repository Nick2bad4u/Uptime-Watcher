import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    startMonitoringOperation,
    stopMonitoringOperation,
} from "../../../../services/monitoring/enhancedMonitorChecker/toggleMonitoring";

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
            monitorRepository: { update },
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
});
