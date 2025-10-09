/**
 * Storybook coverage for SiteDetailsNavigation, ensuring control surfaces and
 * monitor interactions remain consistent across UI states.
 */

import type { Monitor, Site } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { action } from "storybook/actions";

import type { SiteDetailsTab } from "../../src/stores/ui/types";

import { SiteDetailsNavigation } from "../../src/components/SiteDetails/SiteDetailsNavigation";
import { createMockMonitor, createMockSite } from "../helpers/siteStoryHelpers";

interface NavigationScenario {
    readonly heartbeatMonitor: Monitor;
    readonly portMonitor: Monitor;
    readonly primaryMonitorId: string;
    readonly site: Site;
}

interface PausedNavigationScenario {
    readonly primaryMonitorId: string;
    readonly site: Site;
}

/**
 * Generates the standard site scenario used across navigation stories.
 *
 * @returns Site instance with representative monitors and helper metadata.
 */
const createNavigationSite = (): NavigationScenario => {
    const httpMonitor = createMockMonitor({
        id: "storybook-nav-http",
        monitoring: true,
        responseTime: 150,
        status: "up",
        type: "http",
        url: "https://status.storybook.dev",
    });
    const portMonitor = createMockMonitor({
        host: "db.storybook.dev",
        id: "storybook-nav-port",
        monitoring: true,
        port: 5432,
        status: "degraded",
        type: "port",
    });
    const heartbeatMonitor = createMockMonitor({
        id: "storybook-nav-heartbeat",
        monitoring: false,
        status: "paused",
        type: "server-heartbeat",
        url: "https://status.storybook.dev/heartbeat",
    });

    const site = createMockSite({
        identifier: "storybook-site-navigation",
        monitors: [
            httpMonitor,
            portMonitor,
            heartbeatMonitor,
        ],
        monitoring: true,
        name: "Navigation Coverage Site",
    });

    return {
        heartbeatMonitor,
        portMonitor,
        primaryMonitorId: httpMonitor.id,
        site,
    } as const;
};

/**
 * Creates a site scenario where all monitors are paused for visual validation.
 *
 * @returns Site instance with monitoring disabled across monitors.
 */
const createPausedNavigationSite = (): PausedNavigationScenario => {
    const scenario = createNavigationSite();
    const pausedMonitors = scenario.site.monitors.map((monitor) => ({
        ...monitor,
        monitoring: false,
        status: "paused" as const,
    }));

    const pausedSite = {
        ...scenario.site,
        monitoring: false,
        monitors: pausedMonitors,
    };

    return {
        primaryMonitorId: pausedMonitors[0]?.id ?? "",
        site: pausedSite,
    } as const;
};

/**
 * Produces an async handler that records Storybook actions while fulfilling the
 * command contract used by the navigation component.
 *
 * @param label - Action label emitted to the Storybook actions panel.
 *
 * @returns Async handler resolving immediately after logging the action.
 */
const createAsyncAction = (label: string) => async (): Promise<void> => {
    action(label)();
};

const baseScenario = createNavigationSite();

const meta: Meta<typeof SiteDetailsNavigation> = {
    args: {
        activeSiteDetailsTab: "site-overview",
        currentSite: baseScenario.site,
        handleMonitorIdChange: (event) =>
            action("monitor-id-change")(event.target.value),
        handleStartMonitoring: createAsyncAction("start-monitoring"),
        handleStartSiteMonitoring: createAsyncAction("start-site-monitoring"),
        handleStopMonitoring: createAsyncAction("stop-monitoring"),
        handleStopSiteMonitoring: createAsyncAction("stop-site-monitoring"),
        isLoading: false,
        isMonitoring: true,
        selectedMonitorId: baseScenario.primaryMonitorId,
        setActiveSiteDetailsTab: (tab: SiteDetailsTab) =>
            action("set-active-site-details-tab")(tab),
    },
    component: SiteDetailsNavigation,
    parameters: {
        controls: {
            exclude: [
                "currentSite",
                "handleMonitorIdChange",
                "handleStartMonitoring",
                "handleStartSiteMonitoring",
                "handleStopMonitoring",
                "handleStopSiteMonitoring",
                "selectedMonitorId",
                "setActiveSiteDetailsTab",
            ],
        },
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteDetailsNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const pausedScenario = createPausedNavigationSite();

export const MonitoringPaused: Story = {
    args: {
        currentSite: pausedScenario.site,
        isMonitoring: false,
        selectedMonitorId: pausedScenario.primaryMonitorId,
    },
};

const alternateScenario = createNavigationSite();

export const PortMonitorSelected: Story = {
    args: {
        currentSite: alternateScenario.site,
        selectedMonitorId: alternateScenario.portMonitor.id,
    },
};

export const LoadingState: Story = {
    args: {
        isLoading: true,
    },
};
