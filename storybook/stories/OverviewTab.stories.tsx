/**
 * Stories for the OverviewTab component.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChangeEvent, ComponentProps, ReactElement } from "react";

import { OverviewTab } from "@app/components/SiteDetails/tabs/OverviewTab";
import { useCallback, useMemo, useState } from "react";
import { action } from "storybook/actions";

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

const OverviewTabStory = ({
    handleIntervalChange,
    handleTimeoutChange,
    intervalChanged,
    localCheckInterval,
    localTimeout,
    timeoutChanged,
    ...rest
}: ComponentProps<typeof OverviewTab>): ReactElement => {
    const [checkInterval, setCheckInterval] = useState(localCheckInterval);
    const [timeoutValue, setTimeoutValue] = useState(localTimeout);
    const [intervalDirty, setIntervalDirty] = useState(intervalChanged);
    const [timeoutDirty, setTimeoutDirty] = useState(timeoutChanged);

    const handleIntervalChangeWrapper = useCallback(
        (event: ChangeEvent<HTMLSelectElement>): void => {
            const nextValue = Number(event.target.value);
            setCheckInterval(nextValue);
            setIntervalDirty(true);
            action("overview/changeInterval")(event.target.value);
            handleIntervalChange?.(event);
        },
        [handleIntervalChange]
    );

    const handleTimeoutChangeWrapper = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const nextValue = Number(event.target.value);
            setTimeoutValue(nextValue);
            setTimeoutDirty(true);
            action("overview/changeTimeout")(event.target.value);
            handleTimeoutChange?.(event);
        },
        [handleTimeoutChange]
    );

    const memoizedProps = useMemo(
        () => ({
            intervalChanged: intervalDirty,
            localCheckInterval: checkInterval,
            localTimeout: timeoutValue,
            timeoutChanged: timeoutDirty,
        }),
        [
            checkInterval,
            intervalDirty,
            timeoutDirty,
            timeoutValue,
        ]
    );

    return (
        <OverviewTab
            {...rest}
            handleIntervalChange={handleIntervalChangeWrapper}
            handleTimeoutChange={handleTimeoutChangeWrapper}
            {...memoizedProps}
        />
    );
};

const meta: Meta<typeof OverviewTab> = {
    args: {
        avgResponseTime: 180,
        fastestResponse: 95,
        formatResponseTime,
        handleIntervalChange: (): void => {},
        handleRemoveMonitor: async (): Promise<void> => {
            action("overview/removeMonitor")();
        },
        handleSaveInterval: async (): Promise<void> => {
            action("overview/saveInterval")();
        },
        handleSaveTimeout: async (): Promise<void> => {
            action("overview/saveTimeout")();
        },
        handleTimeoutChange: (): void => {},
        intervalChanged: false,
        isLoading: false,
        localCheckInterval: baseMonitor.checkInterval,
        localTimeout: baseMonitor.timeout,
        onCheckNow: (): void => {
            action("overview/checkNow")();
        },
        selectedMonitor: baseMonitor,
        slowestResponse: 450,
        timeoutChanged: false,
        totalChecks: baseMonitor.history.length,
        uptime: "99.1",
    },
    component: OverviewTab,
    render: (storyArgs) => <OverviewTabStory {...storyArgs} />,
    tags: ["autodocs"],
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
