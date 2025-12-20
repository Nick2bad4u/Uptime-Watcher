import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import type { CloudStatusSummary } from "@shared/types/cloud";

import { CloudProviderSetupPanel } from "../components/Settings/cloud/CloudProviderSetupPanel";

describe(CloudProviderSetupPanel, () => {
    function renderPanel(args?: { status?: CloudStatusSummary | null }): {
        onConfigureFilesystemProvider: ReturnType<typeof vi.fn>;
        onConnectDropbox: ReturnType<typeof vi.fn>;
        onConnectGoogleDrive: ReturnType<typeof vi.fn>;
        onDisconnect: ReturnType<typeof vi.fn>;
        onRefreshStatus: ReturnType<typeof vi.fn>;
    } {
        const onConfigureFilesystemProvider = vi.fn();
        const onConnectDropbox = vi.fn();
        const onConnectGoogleDrive = vi.fn();
        const onDisconnect = vi.fn();
        const onRefreshStatus = vi.fn();

        render(
            <CloudProviderSetupPanel
                isConfiguringFilesystemProvider={false}
                isConnectingDropbox={false}
                isConnectingGoogleDrive={false}
                isDisconnecting={false}
                isRefreshingStatus={false}
                onConfigureFilesystemProvider={onConfigureFilesystemProvider}
                onConnectDropbox={onConnectDropbox}
                onConnectGoogleDrive={onConnectGoogleDrive}
                onDisconnect={onDisconnect}
                onRefreshStatus={onRefreshStatus}
                status={args?.status ?? null}
            />
        );

        return {
            onConfigureFilesystemProvider,
            onConnectDropbox,
            onConnectGoogleDrive,
            onDisconnect,
            onRefreshStatus,
        };
    }

    it("shows Dropbox + Google Drive + Local folder tabs", () => {
        renderPanel();

        expect(
            screen.getByRole("tab", { name: "Dropbox" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Google Drive" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Local folder" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: /WebDAV/iu })
        ).toBeInTheDocument();
    });

    it("calls refresh status when clicked", () => {
        const { onRefreshStatus } = renderPanel();

        fireEvent.click(screen.getByRole("button", { name: "Refresh status" }));
        expect(onRefreshStatus).toHaveBeenCalledTimes(1);
    });

    it("includes account label in provider label for Google Drive", () => {
        renderPanel({
            status: {
                provider: "google-drive",
                configured: true,
                connected: true,
                backupsEnabled: true,
                encryptionLocked: false,
                encryptionMode: "none",
                syncEnabled: false,
                lastBackupAt: null,
                lastSyncAt: null,
                providerDetails: {
                    kind: "google-drive",
                    accountLabel: "me@example.com",
                },
            },
        });

        expect(
            screen.getByText("Google Drive (me@example.com)")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Disconnect" })
        ).toBeEnabled();
    });

    it("locks provider switching when already configured", () => {
        renderPanel({
            status: {
                provider: "dropbox",
                configured: true,
                connected: true,
                backupsEnabled: true,
                encryptionLocked: false,
                encryptionMode: "none",
                syncEnabled: false,
                lastBackupAt: null,
                lastSyncAt: null,
                providerDetails: {
                    kind: "dropbox",
                    accountLabel: "me@example.com",
                },
            },
        });

        fireEvent.click(screen.getByRole("tab", { name: "Google Drive" }));

        expect(screen.getByRole("alert")).toBeInTheDocument();

        expect(
            screen.getByText(
                "Disconnect Dropbox before setting up Google Drive."
            )
        ).toBeInTheDocument();

        // Still locked to Dropbox.
        expect(
            screen.getByRole("tab", {
                name: "Dropbox",
                selected: true,
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "Connect Google Drive",
            })
        ).not.toBeInTheDocument();

    });
});
