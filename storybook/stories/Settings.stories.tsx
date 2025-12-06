/**
 * Storybook coverage for the Settings modal component.
 */

import type { SettingsProperties } from "@app/components/Settings/Settings";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react/jsx-runtime";

import { Settings } from "@app/components/Settings/Settings";
import { DEFAULT_HISTORY_LIMIT } from "@app/constants";
import { useErrorStore } from "@app/stores/error/useErrorStore";
import { useSettingsStore } from "@app/stores/settings/useSettingsStore";
import { useSitesStore } from "@app/stores/sites/useSitesStore";
import { useUIStore } from "@app/stores/ui/useUiStore";
import { useEffect } from "react";
import { action } from "storybook/actions";

import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

interface SettingsStoryArgs extends SettingsProperties {
    isDark: boolean;
}

type Story = StoryObj<typeof meta>;

const sampleSites = [
    createMockSite({
        identifier: "settings-aurora",
        monitors: [
            createMockMonitor({ id: "aurora-http", status: "up" }),
            createMockMonitor({
                id: "aurora-replication",
                status: "degraded",
            }),
        ],
        name: "Aurora Edge",
    }),
];

const withSettingsEnvironment: Decorator = (StoryComponent, context) => {
    const args = context.args as Partial<SettingsStoryArgs> | undefined;
    const isDark = args?.isDark ?? false;

    useEffect(
        function setupSettingsStores(): () => void {
            const sitesSnapshot = useSitesStore.getState();
            const settingsSnapshot = useSettingsStore.getState();
            const errorSnapshot = useErrorStore.getState();
            const uiSnapshot = useUIStore.getState();

            useSitesStore.setState(
                {
                    downloadSqliteBackup: async () => {
                        action("sites/downloadSqliteBackup")();
                        return {
                            buffer: new ArrayBuffer(0),
                            fileName: "uptime-watcher-backup.storybook.sqlite",
                            metadata: {
                                appVersion: "storybook",
                                checksum: "storybook-checksum",
                                createdAt: Date.now(),
                                originalPath:
                                    "/var/lib/uptime-watcher/data.sqlite",
                                retentionHintDays: 30,
                                schemaVersion: 1,
                                sizeBytes: 0,
                            },
                        } satisfies SerializedDatabaseBackupResult;
                    },
                    restoreSqliteBackup: async () => {
                        action("sites/restoreSqliteBackup")();
                        return {
                            metadata: {
                                appVersion: "storybook",
                                checksum: "storybook-restore-checksum",
                                createdAt: Date.now(),
                                originalPath:
                                    "/var/lib/uptime-watcher/restore.sqlite",
                                retentionHintDays: 30,
                                schemaVersion: 1,
                                sizeBytes: 0,
                            },
                            preRestoreFileName:
                                "uptime-watcher-pre-restore.storybook.sqlite",
                            restoredAt: Date.now(),
                        };
                    },
                    fullResyncSites: async () => {
                        action("sites/fullResyncSites")();
                        useSitesStore.setState({
                            sites: Array.from(sampleSites),
                        });
                    },
                    sites: Array.from(sampleSites),
                },
                false
            );

            useSettingsStore.setState((state) => ({
                settings: {
                    ...state.settings,
                    autoStart: true,
                    historyLimit: DEFAULT_HISTORY_LIMIT,
                    inAppAlertsEnabled: true,
                    inAppAlertsSoundEnabled: false,
                    minimizeToTray: true,
                    systemNotificationsEnabled: true,
                    systemNotificationsSoundEnabled: false,
                    theme: isDark ? "dark" : "light",
                },
            }));

            useErrorStore.setState({ lastError: undefined }, false);
            useUIStore.setState({ showSettings: true }, false);

            return function restoreSettingsStores(): void {
                useSitesStore.setState(sitesSnapshot, true);
                useSettingsStore.setState(settingsSnapshot, true);
                useErrorStore.setState(errorSnapshot, true);
                useUIStore.setState(uiSnapshot, true);
            };
        },
        [isDark]
    );

    return <StoryComponent />;
};

const SettingsPreview = ({ onClose }: SettingsProperties): JSX.Element => (
    <div className="min-h-screen p-8">
        <Settings onClose={onClose} />
    </div>
);

const meta: Meta<SettingsStoryArgs> = {
    args: {
        onClose: action("settings/onClose"),
        isDark: false,
    },
    component: SettingsPreview,
    decorators: [
        createSiteDecorator(() => sampleSites),
        withSettingsEnvironment,
    ],
    parameters: {
        layout: "fullscreen",
    },
    render: (args): JSX.Element => {
        const handleSettingsClose = (): void => {
            args.onClose();
        };

        return <SettingsPreview onClose={handleSettingsClose} />;
    },
    tags: ["autodocs"],
} satisfies Meta<SettingsStoryArgs>;

export default meta;

export const LightTheme: Story = {};

export const DarkTheme: Story = {
    args: {
        isDark: true,
    },
};
