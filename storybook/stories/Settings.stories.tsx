/**
 * Storybook coverage for the Settings modal component.
 */

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react/jsx-runtime";

import { useEffect } from "react";
import { action } from "storybook/actions";

import type { SettingsProperties } from "../../src/components/Settings/Settings";

import { Settings } from "../../src/components/Settings/Settings";
import { DEFAULT_HISTORY_LIMIT } from "../../src/constants";
import { useErrorStore } from "../../src/stores/error/useErrorStore";
import { useSettingsStore } from "../../src/stores/settings/useSettingsStore";
import { useSitesStore } from "../../src/stores/sites/useSitesStore";
import { useUIStore } from "../../src/stores/ui/useUiStore";
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
                    minimizeToTray: true,
                    notifications: true,
                    soundAlerts: false,
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
