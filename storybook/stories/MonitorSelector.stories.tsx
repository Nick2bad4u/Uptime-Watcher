import type { Monitor } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { action } from "storybook/actions";

import { MonitorSelector } from "../../src/components/Dashboard/SiteCard/components/MonitorSelector";
import { createMockMonitor } from "../helpers/siteStoryHelpers";

const baseMonitors: Monitor[] = [
    createMockMonitor({
        id: "monitor-http",
        responseTime: 95,
        status: "up",
        type: "http",
        url: "https://status.example.com",
    }),
    createMockMonitor({
        id: "monitor-port",
        host: "api.example.com",
        monitoring: true,
        port: 8443,
        responseTime: 130,
        status: "degraded",
        type: "port",
    }),
    createMockMonitor({
        id: "monitor-ping",
        monitoring: false,
        responseTime: 220,
        status: "paused",
        type: "ping",
    }),
];

const meta: Meta<typeof MonitorSelector> = {
    args: {
        monitors: baseMonitors,
        onChange: action("select-monitor"),
        selectedMonitorId: baseMonitors[0]?.id ?? "",
    },
    component: MonitorSelector,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MonitorSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomClass: Story = {
    args: {
        className: "max-w-80",
    },
};

export const PortMonitorSelected: Story = {
    args: {
        selectedMonitorId: baseMonitors[1]?.id ?? "",
    },
};

export const EmptyState: Story = {
    args: {
        monitors: [],
        selectedMonitorId: "",
    },
};
