/**
 * Stories for the StatusChart component.
 */

import type { StatusBarChartData } from "@app/services/chartConfig";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChartOptions } from "chart.js";

import { StatusChart } from "@app/components/SiteDetails/charts/StatusChart";

const baseOptions: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    responsive: true,
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: "rgba(148, 163, 184, 0.25)",
            },
        },
    },
};

const createStatusData = (
    up: number,
    degraded: number,
    down: number
): StatusBarChartData => ({
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
                up,
                degraded,
                down,
            ],
            label: "Status Count",
        },
    ],
    labels: [
        "Up",
        "Degraded",
        "Down",
    ],
});

const healthyData = createStatusData(22, 1, 1);
const incidentData = createStatusData(9, 6, 9);
const pausedData = createStatusData(0, 3, 0);

const meta: Meta<typeof StatusChart> = {
    args: {
        data: healthyData,
        options: baseOptions,
    },
    component: StatusChart,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof StatusChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PredominantlyHealthy: Story = {};

export const ActiveOutage: Story = {
    args: {
        data: incidentData,
    },
};

export const MaintenanceWindow: Story = {
    args: {
        data: pausedData,
    },
    parameters: {
        docs: {
            description: {
                story: "Simulates a maintenance window with monitors paused or in degraded warm-up while systems restart.",
            },
        },
    },
};
