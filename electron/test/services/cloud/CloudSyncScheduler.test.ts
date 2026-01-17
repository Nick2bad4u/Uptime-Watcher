/**
 * Unit tests for the CloudSyncScheduler polling/backoff loop.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CloudSyncScheduler } from "@electron/services/cloud/CloudSyncScheduler";

const mockLogger = vi.hoisted(() => ({
    warn: vi.fn(),
}));

vi.mock("../../../utils/logger", () => ({
    logger: mockLogger,
}));

vi.mock("node:crypto", () => ({
    randomInt: vi.fn(() => 0),
}));

describe(CloudSyncScheduler, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("backs off after repeated failures (delay increases)", async () => {
        const cloudService = {
            getStatus: vi.fn(async () => ({
                backupsEnabled: false,
                configured: true,
                connected: true,
                encryptionLocked: false,
                encryptionMode: "none",
                lastBackupAt: null,
                lastError: undefined,
                lastSyncAt: null,
                provider: "dropbox",
                providerDetails: {
                    kind: "dropbox",
                    accountLabel: "acct",
                },
                syncEnabled: true,
            })),
            requestSyncNow: vi.fn(async () => {
                throw new Error("boom");
            }),
        };

        const scheduler = new CloudSyncScheduler({
            cloudService: cloudService as never,
        });

        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

        scheduler.initialize();

        // Initialize() schedules a 0ms run.
        expect(setTimeoutSpy).toHaveBeenCalled();

        // Run 1: failure -> schedule with backoff attempt 1 (20m)
        await vi.runOnlyPendingTimersAsync();
        // Run 2: failure -> schedule with backoff attempt 2 (40m)
        await vi.runOnlyPendingTimersAsync();

        // Extract scheduled delays (ignore the initial 0ms run).
        const delays = setTimeoutSpy.mock.calls
            .map((call) => call[1])
            .filter((value): value is number => typeof value === "number")
            .filter((value) => value > 0);

        // We should see increasing delays for the first couple of failures.
        // Values are exact because we mocked crypto.randomInt to 0.
        expect(delays.length).toBeGreaterThanOrEqual(2);
        expect(delays[0]).toBe(20 * 60_000);
        expect(delays[1]).toBe(40 * 60_000);

        expect(cloudService.requestSyncNow).toHaveBeenCalledTimes(2);
    });

    it("resets backoff after a successful cycle", async () => {
        const cloudService = {
            getStatus: vi.fn(async () => ({
                backupsEnabled: false,
                configured: true,
                connected: true,
                encryptionLocked: false,
                encryptionMode: "none",
                lastBackupAt: null,
                lastError: undefined,
                lastSyncAt: null,
                provider: "dropbox",
                providerDetails: {
                    kind: "dropbox",
                    accountLabel: "acct",
                },
                syncEnabled: true,
            })),
            requestSyncNow: vi
                .fn<() => Promise<void>>()
                .mockRejectedValueOnce(new Error("boom"))
                .mockResolvedValueOnce(undefined),
        };

        const scheduler = new CloudSyncScheduler({
            cloudService: cloudService as never,
        });

        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

        scheduler.initialize();

        // Run 1: failure -> 20m
        await vi.runOnlyPendingTimersAsync();
        // Run 2: success -> reset to default 10m
        await vi.runOnlyPendingTimersAsync();

        const delays = setTimeoutSpy.mock.calls
            .map((call) => call[1])
            .filter((value): value is number => typeof value === "number")
            .filter((value) => value > 0);

        expect(delays.length).toBeGreaterThanOrEqual(2);
        expect(delays[0]).toBe(20 * 60_000);
        expect(delays[1]).toBe(10 * 60_000);

        expect(cloudService.requestSyncNow).toHaveBeenCalledTimes(2);
    });

    it("does not log raw error objects (no token leaks)", async () => {
        const cloudService = {
            getStatus: vi.fn(async () => ({
                backupsEnabled: false,
                configured: true,
                connected: true,
                encryptionLocked: false,
                encryptionMode: "none",
                lastBackupAt: null,
                lastError: undefined,
                lastSyncAt: null,
                provider: "dropbox",
                providerDetails: {
                    kind: "dropbox",
                    accountLabel: "acct",
                },
                syncEnabled: true,
            })),
            requestSyncNow: vi.fn(async () => {
                const error = new Error("boom");
                // Simulate an axios-style error shape which could include
                // sensitive headers/body.
                (error as any).config = {
                    headers: {
                        Authorization: "Bearer VERY_SECRET_TOKEN",
                    },
                    data: "refresh_token=VERY_SECRET_TOKEN",
                };
                throw error;
            }),
        };

        const scheduler = new CloudSyncScheduler({
            cloudService: cloudService as never,
        });

        scheduler.initialize();

        await vi.runOnlyPendingTimersAsync();

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "[CloudSyncScheduler] Sync cycle failed",
            expect.objectContaining({
                message: "boom",
                name: "Error",
            })
        );

        const loggedPayload = mockLogger.warn.mock.calls[0]?.[1];
        expect(loggedPayload).not.toBeInstanceOf(Error);
        expect(JSON.stringify(loggedPayload)).not.toContain(
            "VERY_SECRET_TOKEN"
        );
    });
});
