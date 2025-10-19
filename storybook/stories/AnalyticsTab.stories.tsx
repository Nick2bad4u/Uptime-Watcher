/**
 * Stories for the AnalyticsTab component.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";
import type { ChartOptions } from "chart.js";
import type { ReactElement } from "react";
import { useState } from "react";

import { AnalyticsTab } from "@app/components/SiteDetails/tabs/AnalyticsTab";
import { CHART_TIME_RANGES } from "@app/constants";
import type { ChartTimeRange } from "@app/constants";
import type { AnalyticsTabProperties } from "@app/components/SiteDetails/tabs/AnalyticsTab";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "@app/services/chartConfig";
import type { MonitorType } from "@shared/types";

const MONITOR_TYPE: MonitorType = "http";

const baseBarOptions: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    responsive: true,
};

const baseLineOptions: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    responsive: true,
};

const baseDoughnutOptions: ChartOptions<"doughnut"> = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            align: "center",
            position: "right",
        },
    },
    responsive: true,
};

const barChartData: StatusBarChartData = {
    datasets: [
        {
            backgroundColor: [
                "#10B981",
                "#F59E0B",
                "#EF4444",
            ],
            borderColor: [
                "#059669",
                "#D97706",
                "#DC2626",
            ],
            borderWidth: 1,
            data: [
                420,
                36,
                12,
            ],
            label: "Status Counts",
        },
    ],
    labels: [
        "Up",
        "Degraded",
        "Down",
    ],
};

const lineChartData: ResponseTimeChartData = {
    datasets: [
        {
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            borderColor: "#3B82F6",
            data: [
                210,
                240,
                215,
                198,
                260,
                230,
                220,
            ],
            fill: true,
            label: "Response Time",
            tension: 0.35,
        },
    ],
    labels: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
    ],
};

const uptimeChartData: UptimeChartData = {
    datasets: [
        {
            backgroundColor: [
                "#22C55E",
                "#F97316",
                "#EF4444",
            ],
            borderColor: [
                "#16A34A",
                "#EA580C",
                "#DC2626",
            ],
            borderWidth: 1,
            data: [
                94,
                4,
                2,
            ],
        },
    ],
    labels: [
        "Up",
        "Degraded",
        "Down",
    ],
};

const downtimePeriods = [
    {
        duration: 12 * 60_000,
        end: Date.now() - 1_800_000,
        start: Date.now() - 1_920_000,
    },
    {
        duration: 8 * 60_000,
        end: Date.now() - 3_600_000,
        start: Date.now() - 3_680_000,
    },
];

const formatDuration = (ms: number): string => {
    const minutes = Math.round(ms / 60_000);
    return minutes < 60
        ? `${minutes} min`
        : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

const formatResponseTime = (ms: number): string => `${ms} ms`;

const describeAvailability = (percentage: number): string => {
    if (percentage >= 99.9) return "Exceptional";
    if (percentage >= 99) return "Excellent";
    if (percentage >= 97) return "Good";
    if (percentage >= 95) return "Fair";
    return "Needs attention";
};

const AnalyticsTabStory = (args: AnalyticsTabProperties): ReactElement => {
    const [timeRange, setTimeRange] = useState<ChartTimeRange>(
        args.siteDetailsChartTimeRange
    );
    const [showAdvancedMetrics, setShowAdvanced] = useState<boolean>(
        args.showAdvancedMetrics
    );

    const handleToggleAdvanced = (next: boolean): void => {
        setShowAdvanced(next);
        args.setShowAdvancedMetrics?.(next);
    };

    const handleRangeChange = (range: ChartTimeRange): void => {
        setTimeRange(range);
        args.setSiteDetailsChartTimeRange?.(range);
    };

    return (
        <AnalyticsTab
            {...args}
            setShowAdvancedMetrics={handleToggleAdvanced}
            setSiteDetailsChartTimeRange={handleRangeChange}
            showAdvancedMetrics={showAdvancedMetrics}
            siteDetailsChartTimeRange={timeRange}
        />
    );
};

const meta: Meta<typeof AnalyticsTab> = {
    args: {
        avgResponseTime: 225,
        barChartData,
        barChartOptions: baseBarOptions,
        doughnutOptions: baseDoughnutOptions,
        downCount: 12,
        downtimePeriods,
        formatDuration,
        formatResponseTime,
        getAvailabilityDescription: describeAvailability,
        lineChartData,
        lineChartOptions: baseLineOptions,
        monitorType: MONITOR_TYPE,
        mttr: 6 * 60_000,
        p50: 185,
        p95: 420,
        p99: 680,
        setShowAdvancedMetrics: action("analytics/setShowAdvanced"),
        setSiteDetailsChartTimeRange: action("analytics/setRange"),
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: CHART_TIME_RANGES[1] ?? "7d",
        totalChecks: 468,
        totalDowntime: 22 * 60_000,
        upCount: 444,
        uptime: "98.4",
        uptimeChartData,
    },
    component: AnalyticsTab,
    parameters: {
        layout: "fullscreen",
    },
    render: (props) => <AnalyticsTabStory {...props} />,
    tags: ["autodocs"],
    title: "Site Details/Tabs/AnalyticsTab",
} satisfies Meta<typeof AnalyticsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultView: Story = {};

export const AdvancedMetricsVisible: Story = {
    args: {
        showAdvancedMetrics: true,
    },
};

export const HighIncidentVolume: Story = {
    args: {
        barChartData: {
            datasets: [
                {
                    ...barChartData.datasets[0]!,
                    data: [
                        280,
                        60,
                        128,
                    ],
                },
            ],
            labels: barChartData.labels,
        },
        downCount: 128,
        downtimePeriods: downtimePeriods.map((period) => ({
            ...period,
            duration: period.duration * 2,
        })),
        totalDowntime: 86 * 60_000,
        uptime: "93.2",
        uptimeChartData: {
            datasets: [
                {
                    ...uptimeChartData.datasets[0]!,
                    data: [
                        70,
                        12,
                        18,
                    ],
                },
            ],
            labels: uptimeChartData.labels,
        },
    },
};
