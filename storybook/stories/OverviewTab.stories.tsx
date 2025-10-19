/**
 * Stories for the OverviewTab component.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChangeEvent, ComponentProps, ReactElement } from "react";
import { useMemo, useState } from "react";
import { action } from "storybook/actions";

import { OverviewTab } from "@app/components/SiteDetails/tabs/OverviewTab";
import { createMockMonitor } from "../helpers/siteStoryHelpers";

const formatResponseTime = (time: number): string => `${time} ms`;

const baseMonitor = createMockMonitor({
    checkInterval: 5,
    history: Array.from({ length: 20 }, (_, index) => ({
        responseTime: 110 + index * 5,
        status: index % 7 === 0 ? "degraded" : "up",
        timestamp: Date.now() - index * 60_000,
    })),
    id: "monitor-http",
    responseTime: 140,
    status: "up",
    timeout: 10,
    url: "https://status.example.com/health",
});

const OverviewTabStory = (
    args: ComponentProps<typeof OverviewTab>
): ReactElement => {
    const [checkInterval, setCheckInterval] = useState(args.localCheckInterval);
    const [timeout, setTimeoutValue] = useState(args.localTimeout);
    const [intervalDirty, setIntervalDirty] = useState(args.intervalChanged);
    const [timeoutDirty, setTimeoutDirty] = useState(args.timeoutChanged);

    const callbacks = useMemo(
        () => ({
            handleIntervalChange: (
                event: ChangeEvent<HTMLSelectElement>
            ): void => {
                setCheckInterval(Number(event.target.value));
                setIntervalDirty(true);
                action("overview/changeInterval")(event.target.value);
                args.handleIntervalChange(event);
            },
            handleTimeoutChange: (
                event: ChangeEvent<HTMLInputElement>
            ): void => {
                setTimeoutValue(Number(event.target.value));
                setTimeoutDirty(true);
                action("overview/changeTimeout")(event.target.value);
                args.handleTimeoutChange(event);
            },
        }),
        [args]
    );

    return (
        <OverviewTab
            {...args}
            handleIntervalChange={callbacks.handleIntervalChange}
            handleTimeoutChange={callbacks.handleTimeoutChange}
            intervalChanged={intervalDirty}
            localCheckInterval={checkInterval}
            localTimeout={timeout}
            timeoutChanged={timeoutDirty}
        />
    );
};

const meta: Meta<typeof OverviewTab> = {
    args: {
        avgResponseTime: 180,
        fastestResponse: 95,
        formatResponseTime,
        handleIntervalChange: () => {},
        handleRemoveMonitor: async () => {
            action("overview/removeMonitor")();
        },
        handleSaveInterval: async () => {
            action("overview/saveInterval")();
        },
        handleSaveTimeout: async () => {
            action("overview/saveTimeout")();
        },
        handleTimeoutChange: () => {},
        intervalChanged: false,
        isLoading: false,
        localCheckInterval: baseMonitor.checkInterval,
        localTimeout: baseMonitor.timeout,
        onCheckNow: () => {
            action("overview/checkNow")();
        },
        selectedMonitor: baseMonitor,
        slowestResponse: 450,
        timeoutChanged: false,
        totalChecks: baseMonitor.history.length,
        uptime: "99.1",
    },
    component: OverviewTab,
    render: (props) => <OverviewTabStory {...props} />,
    tags: ["autodocs"],
    title: "Site Details/Tabs/OverviewTab",
} satisfies Meta<typeof OverviewTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultOverview: Story = {};

export const PendingChanges: Story = {
    args: {
        intervalChanged: true,
        localCheckInterval: 10,
        localTimeout: 20,
        timeoutChanged: true,
    },
};

export const PausedMonitor: Story = {
    args: {
        isLoading: false,
        selectedMonitor: {
            ...baseMonitor,
            monitoring: false,
            status: "paused",
        },
    },
};
