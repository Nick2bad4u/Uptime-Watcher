/**
 * Storybook coverage for MonitoringStatusDisplay, exercising the monitor
 * activity summary in multiple states.
 */

import type { Monitor } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MonitoringStatusDisplay } from "../../src/components/SiteDetails/MonitoringStatusDisplay";
import { createMockMonitor } from "../helpers/siteStoryHelpers";

const meta: Meta<typeof MonitoringStatusDisplay> = {
    args: {
        monitors: [],
    },
    component: MonitoringStatusDisplay,
    parameters: {
        controls: {
            exclude: ["monitors"],
        },
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MonitoringStatusDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Generates a representative set of monitors featuring mixed activity states.
 *
 * @returns Array of monitors with both running and paused examples.
 */
const createMixedMonitors = (): Monitor[] => [
    createMockMonitor({
        id: "storybook-http-monitor",
        monitoring: true,
        responseTime: 140,
        status: "up",
        type: "http",
        url: "https://status.storybook.dev",
    }),
    createMockMonitor({
        host: "db.storybook.dev",
        id: "storybook-port-monitor",
        monitoring: true,
        port: 5432,
        status: "degraded",
        type: "port",
    }),
    createMockMonitor({
        id: "storybook-ping-monitor",
        monitoring: false,
        status: "paused",
        type: "ping",
    }),
];

/**
 * Generates monitors that are all paused to validate the zero-active state.
 *
 * @returns Array of monitors with monitoring disabled.
 */
const createPausedMonitors = (): Monitor[] => [
    createMockMonitor({
        id: "storybook-paused-http",
        monitoring: false,
        status: "paused",
        type: "http",
        url: "https://status.storybook.dev",
    }),
    createMockMonitor({
        host: "api.storybook.dev",
        id: "storybook-paused-port",
        monitoring: false,
        port: 8443,
        status: "paused",
        type: "port",
    }),
];

export const MixedStatuses: Story = {
    render: (args) => (
        <MonitoringStatusDisplay {...args} monitors={createMixedMonitors()} />
    ),
};

export const AllPaused: Story = {
    render: (args) => (
        <MonitoringStatusDisplay {...args} monitors={createPausedMonitors()} />
    ),
};

export const NoMonitorsConfigured: Story = {
    args: {
        monitors: [],
    },
};
