/**
 * Tests for the SyncMaintenancePanel (destructive remote sync reset UI).
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import "@testing-library/jest-dom";

import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudStatusSummary } from "@shared/types/cloud";

const formatFullTimestampMock = vi.hoisted(() => vi.fn(() => "2025-01-01"));

vi.mock("../../../../utils/time", () => ({
    formatFullTimestamp: formatFullTimestampMock,
}));

import { SyncMaintenancePanel } from "../../../../components/Settings/cloud/SyncMaintenancePanel";

const writeClipboardTextMock = vi.hoisted(() =>
    vi.fn(async (_text: string) => {})
);

vi.mock("../../../../services/SystemService", () => ({
    SystemService: {
        writeClipboardText: writeClipboardTextMock,
    },
}));

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

const createStatus = (
    overrides: Partial<CloudStatusSummary> = {}
): CloudStatusSummary => ({
    backupsEnabled: true,
    configured: true,
    connected: true,
    encryptionLocked: false,
    encryptionMode: "none",
    lastBackupAt: null,
    lastSyncAt: null,
    provider: "dropbox",
    providerDetails: {
        kind: "dropbox",
        accountLabel: "someone@example.com",
    },
    syncEnabled: true,
    ...overrides,
});

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
                status={createStatus({ connected: false, provider: null })}
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
                status={createStatus({ syncEnabled: false })}
                syncEnabled={false}
            />
        );

        expect(
            screen.getByText("Enable sync before resetting remote sync.")
        ).toBeInTheDocument();
    });

    it("renders preview summary metrics and details", () => {
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
                status={createStatus()}
                syncEnabled={true}
            />
        );

        const syncHistoryMetric = screen
            .getByText("Sync history files")
            .closest(".settings-metric");
        expect(syncHistoryMetric).not.toBeNull();
        if (!(syncHistoryMetric instanceof HTMLElement)) {
            throw new TypeError("Expected sync history metric to exist");
        }
        expect(within(syncHistoryMetric).getByText("4")).toBeInTheDocument();

        const devicesMetric = screen
            .getByText("Devices")
            .closest(".settings-metric");
        expect(devicesMetric).not.toBeNull();
        if (!(devicesMetric instanceof HTMLElement)) {
            throw new TypeError("Expected devices metric to exist");
        }
        expect(within(devicesMetric).getByText("1")).toBeInTheDocument();

        const objectsBreakdownMetric = screen
            .getByText("Objects breakdown")
            .closest(".settings-metric");
        expect(objectsBreakdownMetric).not.toBeNull();
        if (!(objectsBreakdownMetric instanceof HTMLElement)) {
            throw new TypeError("Expected objects breakdown metric to exist");
        }

        const snapshotsBreakdown = within(objectsBreakdownMetric)
            .getByText("Snapshots")
            .closest(".settings-metric__breakdown-item");
        expect(snapshotsBreakdown).not.toBeNull();
        if (!(snapshotsBreakdown instanceof HTMLElement)) {
            throw new TypeError("Expected snapshots breakdown item to exist");
        }
        expect(within(snapshotsBreakdown).getByText("1")).toBeInTheDocument();

        const changesBreakdown = within(objectsBreakdownMetric)
            .getByText("Changes")
            .closest(".settings-metric__breakdown-item");
        expect(changesBreakdown).not.toBeNull();
        if (!(changesBreakdown instanceof HTMLElement)) {
            throw new TypeError("Expected changes breakdown item to exist");
        }
        expect(within(changesBreakdown).getByText("2")).toBeInTheDocument();

        const otherBreakdown = within(objectsBreakdownMetric)
            .getByText("Other")
            .closest(".settings-metric__breakdown-item");
        expect(otherBreakdown).not.toBeNull();
        if (!(otherBreakdown instanceof HTMLElement)) {
            throw new TypeError("Expected other breakdown item to exist");
        }
        expect(within(otherBreakdown).getByText("1")).toBeInTheDocument();

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

        // Device IDs are available under a details section.
        expect(screen.getByText("View device IDs")).toBeInTheDocument();
        expect(screen.getByText("device-a")).toBeInTheDocument();

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
        writeClipboardTextMock.mockResolvedValueOnce(undefined);

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
                status={createStatus()}
                syncEnabled={true}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Copy diagnostics" })
        );

        await expect(
            screen.findByText("Copied diagnostics to clipboard.")
        ).resolves.toBeInTheDocument();

        expect(writeClipboardTextMock).toHaveBeenCalledTimes(1);
        const payload = writeClipboardTextMock.mock.calls[0]?.[0];
        expect(payload).toContain("Cloud Sync Diagnostics");
        expect(payload).toContain("No secrets");
        expect(payload).toContain("seededSnapshotKey");
    });

    it("shows an error message when clipboard copy fails", async () => {
        writeClipboardTextMock.mockRejectedValueOnce(
            new Error("clipboard denied")
        );

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
                status={createStatus()}
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
