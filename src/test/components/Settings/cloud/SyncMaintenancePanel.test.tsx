/**
 * Tests for the SyncMaintenancePanel (destructive remote sync reset UI).
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";

const formatFullTimestampMock = vi.hoisted(() => vi.fn(() => "2025-01-01"));

vi.mock("../../../../utils/time", () => ({
    formatFullTimestamp: formatFullTimestampMock,
}));

import { SyncMaintenancePanel } from "../../../../components/Settings/cloud/SyncMaintenancePanel";

function createPreview(
    overrides: Partial<CloudSyncResetPreview> = {}
): CloudSyncResetPreview {
    return {
        deviceIds: ["device-a"],
        fetchedAt: 1,
        latestSnapshotKey: "sync/snapshots/latest",
        operationDeviceIds: ["device-a", "device-b"],
        operationObjectCount: 2,
        otherObjectCount: 1,
        perDevice: [
            {
                deviceId: "device-a",
                newestCreatedAtEpochMs: 200,
                oldestCreatedAtEpochMs: 100,
                operationObjectCount: 2,
            },
        ],
        resetAt: undefined,
        snapshotObjectCount: 1,
        syncObjectCount: 4,
        ...overrides,
    };
}

describe(SyncMaintenancePanel, () => {
    it("renders connection and sync gating status text", () => {
        const onRefresh = vi.fn();
        const onReset = vi.fn();

        const { rerender } = render(
            <SyncMaintenancePanel
                connected={false}
                encryptionLocked={false}
                encryptionMode="none"
                isRefreshingPreview={false}
                isResetting={false}
                lastResult={null}
                onRefreshPreview={onRefresh}
                onResetRemoteSyncState={onReset}
                preview={null}
                syncEnabled={false}
            />
        );

        expect(
            screen.getByText("Connect a provider to reset remote sync.")
        ).toBeInTheDocument();

        rerender(
            <SyncMaintenancePanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="none"
                isRefreshingPreview={false}
                isResetting={false}
                lastResult={null}
                onRefreshPreview={onRefresh}
                onResetRemoteSyncState={onReset}
                preview={null}
                syncEnabled={false}
            />
        );

        expect(
            screen.getByText("Enable sync before resetting remote sync.")
        ).toBeInTheDocument();
    });

    it("renders preview viewmodel details including mismatch and per-device list", () => {
        const preview = createPreview();

        render(
            <SyncMaintenancePanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="none"
                isRefreshingPreview={false}
                isResetting={false}
                lastResult={null}
                onRefreshPreview={vi.fn()}
                onResetRemoteSyncState={vi.fn()}
                preview={preview}
                syncEnabled={true}
            />
        );

        expect(
            screen.getByText(
                /Sync history files: 4 \(snapshots: 1, changes: 2, other: 1\)\./
            )
        ).toBeInTheDocument();

        expect(screen.getByText("Devices (1): device-a")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Device mismatch: manifest-only [—], ops-only [device-b]."
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Some sync objects were not classified as ops/snapshots; reset will still remove them."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText("Operation logs by device")
        ).toBeInTheDocument();
        expect(
            screen.getByText(/device-a — 2 op object\(s\)/)
        ).toBeInTheDocument();
        // Timestamps are formatted through the helper.
        expect(screen.getByText("Oldest: 2025-01-01")).toBeInTheDocument();
        expect(screen.getByText("Newest: 2025-01-01")).toBeInTheDocument();
    });

    it("copies diagnostics and shows success", async () => {
        const writeText = vi.fn(async (_text: string) => {});
        (globalThis as any).navigator = {
            clipboard: { writeText },
        };

        const preview = createPreview({ otherObjectCount: 0 });
        const lastResult: CloudSyncResetResult = {
            completedAt: 10,
            deletedObjects: 5,
            failedDeletions: [],
            resetAt: 123,
            seededSnapshotKey: "sync/snapshots/new",
            startedAt: 1,
        };

        render(
            <SyncMaintenancePanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="none"
                isRefreshingPreview={false}
                isResetting={false}
                lastResult={lastResult}
                onRefreshPreview={vi.fn()}
                onResetRemoteSyncState={vi.fn()}
                preview={preview}
                syncEnabled={true}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Copy diagnostics" })
        );

        await expect(
            screen.findByText("Copied diagnostics to clipboard.")
        ).resolves.toBeInTheDocument();

        expect(writeText).toHaveBeenCalledTimes(1);
        const payload = writeText.mock.calls[0]?.[0];
        expect(payload).toContain(
            "Uptime-Watcher Cloud Sync Reset Diagnostics"
        );
        expect(payload).toContain("No secrets");
        expect(payload).toContain("seededSnapshotKey");
    });

    it("shows an error message when clipboard copy fails", async () => {
        const writeText = vi.fn(async () => {
            throw new Error("clipboard denied");
        });
        (globalThis as any).navigator = {
            clipboard: { writeText },
        };

        render(
            <SyncMaintenancePanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="none"
                isRefreshingPreview={false}
                isResetting={false}
                lastResult={null}
                onRefreshPreview={vi.fn()}
                onResetRemoteSyncState={vi.fn()}
                preview={createPreview()}
                syncEnabled={true}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Copy diagnostics" })
        );

        await expect(
            screen.findByText("Failed to copy diagnostics: clipboard denied")
        ).resolves.toBeInTheDocument();
    });
});
