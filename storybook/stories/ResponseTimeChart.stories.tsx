/**
 * Stories for the ResponseTimeChart component.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChartOptions } from "chart.js";

import { ResponseTimeChart } from "@app/components/SiteDetails/charts/ResponseTimeChart";
import type { ResponseTimeChartData } from "@app/services/chartConfig";

const baseOptions: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: "top",
        },
    },
    responsive: true,
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxRotation: 0,
            },
        },
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => `${value} ms`,
            },
        },
    },
};

const hourlyLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}h`);

const createDataset = (data: number[]): ResponseTimeChartData => ({
    datasets: [
        {
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3B82F6",
            data,
            fill: true,
            label: "Response Time",
            tension: 0.35,
        },
    ],
    labels: hourlyLabels,
});

const baselineData = createDataset([
    120,
    135,
    142,
    138,
    126,
    132,
    140,
    128,
    130,
    124,
    121,
    118,
]);

const outageSpikeData = createDataset([
    120,
    128,
    135,
    900,
    780,
    480,
    210,
    180,
    150,
    138,
    128,
    120,
]);

const flatlineData = createDataset(Array.from({ length: 12 }, () => 95));

const meta: Meta<typeof ResponseTimeChart> = {
    args: {
        data: baselineData,
        options: baseOptions,
    },
    component: ResponseTimeChart,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Site Details/Charts/ResponseTimeChart",
} satisfies Meta<typeof ResponseTimeChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NormalOperation: Story = {};

export const IncidentRecovery: Story = {
    args: {
        data: outageSpikeData,
    },
};

export const StableLowLatency: Story = {
    args: {
        data: flatlineData,
    },
    parameters: {
        docs: {
            description: {
                story: "Demonstrates a consistently fast API where response times hug a low threshold across all intervals.",
            },
        },
    },
};
