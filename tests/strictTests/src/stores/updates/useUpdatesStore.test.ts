/**
 * @file Strict coverage tests for the updates store.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UpdateStatusEventData } from "@shared/types/events";

type Cleanup = () => void;

const quitAndInstallMock = vi.hoisted(() => vi.fn(async () => undefined));
const onUpdateStatusMock = vi.hoisted(() =>
    vi.fn<
        (listener: (status: UpdateStatusEventData) => void) => Promise<Cleanup>
    >()
);

const loggerErrorMock = vi.hoisted(() => vi.fn());

const logStoreActionMock = vi.hoisted(() => vi.fn());

vi.mock("@app/services/SystemService", () => ({
    SystemService: {
        quitAndInstall: quitAndInstallMock,
    },
}));

vi.mock("@app/services/EventsService", () => ({
    EventsService: {
        onUpdateStatus: onUpdateStatusMock,
    },
}));

vi.mock("@app/services/logger", () => ({
    logger: {
        error: loggerErrorMock,
    },
}));

vi.mock("@app/stores/utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@app/stores/utils")>();
    return {
        ...actual,
        logStoreAction: logStoreActionMock,
    };
});

describe("useUpdatesStore (strict coverage)", () => {
    beforeEach(async () => {
        vi.resetModules();
        quitAndInstallMock.mockClear();
        onUpdateStatusMock.mockReset();
        loggerErrorMock.mockReset();
        logStoreActionMock.mockClear();
    });

    it("sets progress without mutating update error", async () => {
        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        useUpdatesStore.getState().setUpdateError("boom");
        useUpdatesStore.getState().setUpdateProgress(50);

        expect(useUpdatesStore.getState().updateProgress).toBe(50);
        expect(useUpdatesStore.getState().updateError).toBe("boom");
    });

    it("applies update and logs success", async () => {
        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        await useUpdatesStore.getState().applyUpdate();

        expect(quitAndInstallMock).toHaveBeenCalledTimes(1);
        expect(useUpdatesStore.getState().updateError).toBeUndefined();
        expect(logStoreActionMock).toHaveBeenCalledWith(
            "UpdatesStore",
            "applyUpdate",
            expect.objectContaining({ success: true })
        );
    });

    it("stores error when quitAndInstall fails", async () => {
        quitAndInstallMock.mockRejectedValueOnce(new Error("install failed"));

        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        await useUpdatesStore.getState().applyUpdate();

        expect(useUpdatesStore.getState().updateError).toBe("install failed");
        expect(logStoreActionMock).toHaveBeenCalledWith(
            "UpdatesStore",
            "applyUpdate",
            expect.objectContaining({ success: false })
        );
    });

    it("applies update status strings", async () => {
        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        useUpdatesStore.getState().applyUpdateStatus("downloaded");
        expect(useUpdatesStore.getState().updateStatus).toBe("downloaded");
    });

    it("subscribes to update status events and updates state", async () => {
        let capturedListener:
            | ((status: UpdateStatusEventData) => void)
            | undefined;

        const cleanupSpy = vi.fn();
        onUpdateStatusMock.mockImplementationOnce(async (listener) => {
            capturedListener = listener;
            return cleanupSpy;
        });

        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        const unsubscribe = useUpdatesStore
            .getState()
            .subscribeToUpdateStatusEvents();

        capturedListener?.({ status: "error", error: "download failed" });
        expect(useUpdatesStore.getState().updateStatus).toBe("error");
        expect(useUpdatesStore.getState().updateError).toBe("download failed");

        unsubscribe();

        // Cleanup is executed via an async path (in case the subscription
        // promise has not resolved yet). Yield to the microtask queue so the
        // deferred cleanup runs before we assert.
        await Promise.resolve();
        await Promise.resolve();
        expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it("does not double-call cleanup when disposed before subscription resolves", async () => {
        let resolveCleanup: ((cleanup: Cleanup) => void) | undefined;
        const cleanupSpy = vi.fn();

        onUpdateStatusMock.mockImplementationOnce(
            async () =>
                await new Promise<Cleanup>((resolve) => {
                    resolveCleanup = resolve;
                })
        );

        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        const unsubscribe = useUpdatesStore
            .getState()
            .subscribeToUpdateStatusEvents();
        unsubscribe();

        resolveCleanup?.(cleanupSpy);
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it("logs cleanup errors and ignores repeated unsubscribe", async () => {
        const cleanupSpy = vi.fn(() => {
            throw new Error("cleanup failed");
        });

        onUpdateStatusMock.mockResolvedValueOnce(cleanupSpy);

        const { useUpdatesStore } =
            await import("@app/stores/updates/useUpdatesStore");

        const unsubscribe = useUpdatesStore
            .getState()
            .subscribeToUpdateStatusEvents();
        await Promise.resolve();

        unsubscribe();
        unsubscribe();

        expect(cleanupSpy).toHaveBeenCalledTimes(1);
        expect(loggerErrorMock).toHaveBeenCalledWith(
            "[UpdatesStore] Failed to cleanup update status subscription",
            expect.any(Error)
        );
    });
});
