import type { CloudService } from "@electron/services/cloud/CloudService";

import { ServiceContainer } from "@electron/services/ServiceContainer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type SchedulerCloudService = Pick<CloudService, "getStatus" | "requestSyncNow">;

const schedulerMock = vi.hoisted(() => ({
    cloudService: undefined as SchedulerCloudService | undefined,
    stop: vi.fn<() => void>(),
}));

vi.mock("@electron/services/cloud/CloudSyncScheduler", () => ({
    CloudSyncScheduler: function MockCloudSyncScheduler(args: {
        cloudService: SchedulerCloudService;
    }) {
        schedulerMock.cloudService = args.cloudService;
        return { stop: schedulerMock.stop };
    },
}));

function createDeferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
} {
    let resolvePromise: ((value: T) => void) | undefined;
    const promise = new Promise<T>((resolve) => {
        resolvePromise = resolve;
    });

    return {
        promise,
        resolve: (value: T): void => {
            resolvePromise?.(value);
        },
    };
}

describe("ServiceContainer cloud scheduler cleanup", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        schedulerMock.cloudService = undefined;
        schedulerMock.stop.mockReset();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("stops new scheduler work and drains an active operation once", async () => {
        const status = {
            backupsEnabled: false,
            configured: true,
            connected: true,
            encryptionLocked: false,
            encryptionMode: "none" as const,
            lastBackupAt: null,
            lastError: undefined,
            lastSyncAt: null,
            provider: "dropbox" as const,
            providerDetails: {
                accountLabel: "test-account",
                kind: "dropbox" as const,
            },
            syncEnabled: true,
        };
        const statusOperation = createDeferred<typeof status>();
        const getStatus = vi.fn(() => statusOperation.promise);
        const requestSyncNow = vi.fn(async () => undefined);

        vi.spyOn(container, "getCloudService").mockReturnValue({
            getStatus,
            requestSyncNow,
        } as never);
        container.getCloudSyncScheduler();

        const activeOperation = schedulerMock.cloudService?.getStatus();
        expect(activeOperation).toBeDefined();

        const firstShutdown = container.shutdownCloudSyncScheduler();
        const secondShutdown = container.shutdownCloudSyncScheduler();
        const disposeDependentServices = vi.fn();
        const cleanup = async (): Promise<void> => {
            await firstShutdown;
            disposeDependentServices();
        };
        const cleanupPromise = cleanup();

        await Promise.resolve();
        expect(schedulerMock.stop).toHaveBeenCalledTimes(1);
        expect(disposeDependentServices).not.toHaveBeenCalled();
        await expect(
            schedulerMock.cloudService?.requestSyncNow()
        ).rejects.toThrow("Cloud sync scheduler is shutting down");
        expect(requestSyncNow).not.toHaveBeenCalled();

        statusOperation.resolve(status);
        await expect(activeOperation).resolves.toEqual(status);
        await expect(
            Promise.all([cleanupPromise, secondShutdown])
        ).resolves.toEqual([undefined, undefined]);
        expect(disposeDependentServices).toHaveBeenCalledTimes(1);
    });

    it("drains active work before preserving a scheduler stop failure", async () => {
        const statusOperation = createDeferred<undefined>();
        const stopError = new Error("scheduler stop failed");
        const getStatus = vi.fn(() => statusOperation.promise);

        vi.spyOn(container, "getCloudService").mockReturnValue({
            getStatus,
            requestSyncNow: vi.fn(async () => undefined),
        } as never);
        container.getCloudSyncScheduler();
        const activeOperation = schedulerMock.cloudService?.getStatus();
        schedulerMock.stop.mockImplementation(() => {
            throw stopError;
        });

        const shutdown = container.shutdownCloudSyncScheduler();
        const disposeDependentServices = vi.fn();
        const cleanup = async (): Promise<void> => {
            await shutdown;
            disposeDependentServices();
        };
        const cleanupPromise = cleanup();

        await Promise.resolve();
        expect(disposeDependentServices).not.toHaveBeenCalled();

        statusOperation.resolve(undefined);
        await expect(activeOperation).resolves.toBeUndefined();
        await expect(cleanupPromise).rejects.toBe(stopError);
        expect(disposeDependentServices).not.toHaveBeenCalled();
        await expect(container.shutdownCloudSyncScheduler()).rejects.toBe(
            stopError
        );
        expect(schedulerMock.stop).toHaveBeenCalledTimes(1);
    });
});
