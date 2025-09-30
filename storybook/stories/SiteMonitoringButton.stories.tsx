import type { Meta, StoryObj } from "@storybook/react-vite";

import { action } from "storybook/actions";

import { SiteMonitoringButton } from "../../src/components/common/SiteMonitoringButton/SiteMonitoringButton";

const meta: Meta<typeof SiteMonitoringButton> = {
    args: {
        allMonitorsRunning: false,
        compact: false,
        isLoading: false,
        onStartSiteMonitoring: action("start-site-monitoring"),
        onStopSiteMonitoring: action("stop-site-monitoring"),
    },
    component: SiteMonitoringButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteMonitoringButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Running: Story = {
    args: {
        allMonitorsRunning: true,
    },
};

export const Loading: Story = {
    args: {
        isLoading: true,
    },
};

export const Compact: Story = {
    args: {
        compact: true,
    },
};
