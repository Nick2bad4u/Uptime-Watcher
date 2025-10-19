/**
 * Stories showcasing the DashboardOverview metric cards.
 */

import type { GlobalMonitoringMetrics } from "@app/utils/monitoring/globalMetrics";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DashboardOverview } from "@app/components/Dashboard/Overview/DashboardOverview";

const baseMetrics: GlobalMonitoringMetrics = {
    activeMonitors: 18,
    averageResponseTime: 245,
    incidentCount: 2,
    monitorStatusCounts: {
        degraded: 1,
        down: 1,
        paused: 3,
        pending: 0,
        total: 24,
        up: 19,
    },
    totalMonitors: 24,
    totalSites: 6,
    uptimePercentage: 99,
};

const incidentHeavyMetrics: GlobalMonitoringMetrics = {
    ...baseMetrics,
    activeMonitors: 12,
    incidentCount: 8,
    monitorStatusCounts: {
        degraded: 4,
        down: 4,
        paused: 2,
        pending: 1,
        total: 24,
        up: 13,
    },
    uptimePercentage: 91,
};

const emptyMetrics: GlobalMonitoringMetrics = {
    activeMonitors: 0,
    incidentCount: 0,
    monitorStatusCounts: {
        degraded: 0,
        down: 0,
        paused: 0,
        pending: 0,
        total: 0,
        up: 0,
    },
    totalMonitors: 0,
    totalSites: 0,
    uptimePercentage: 0,
};

const meta: Meta<typeof DashboardOverview> = {
    args: {
        metrics: baseMetrics,
        siteCountLabel: "Sites",
    },
    component: DashboardOverview,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DashboardOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HealthyFleet: Story = {};

export const IncidentHeavy: Story = {
    args: {
        metrics: incidentHeavyMetrics,
    },
};

export const EmptyState: Story = {
    args: {
        metrics: emptyMetrics,
    },
    parameters: {
        docs: {
            description: {
                story: "Represents a freshly onboarded workspace where no monitors have been configured yet.",
            },
        },
    },
};
