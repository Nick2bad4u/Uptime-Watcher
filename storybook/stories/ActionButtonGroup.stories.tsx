import type { Meta, StoryObj } from "@storybook/react-vite";

import { action } from "storybook/actions";

import { ActionButtonGroup } from "../../src/components/Dashboard/SiteCard/components/ActionButtonGroup";

const meta: Meta<typeof ActionButtonGroup> = {
    args: {
        allMonitorsRunning: false,
        buttonSize: "sm",
        disabled: false,
        isLoading: false,
        isMonitoring: false,
        onCheckNow: action("check-now"),
        onStartMonitoring: action("start-monitoring"),
        onStartSiteMonitoring: action("start-site-monitoring"),
        onStopMonitoring: action("stop-monitoring"),
        onStopSiteMonitoring: action("stop-site-monitoring"),
    },
    component: ActionButtonGroup,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ActionButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MonitoringActive: Story = {
    args: {
        isMonitoring: true,
    },
};

export const AllMonitorsRunning: Story = {
    args: {
        allMonitorsRunning: true,
        isMonitoring: true,
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        isLoading: true,
    },
};

export const CompactButtons: Story = {
    args: {
        buttonSize: "xs",
    },
};
