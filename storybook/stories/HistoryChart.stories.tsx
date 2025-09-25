import type { StatusHistory } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HistoryChart } from "../../src/components/common/HistoryChart";

const STATUS_SEQUENCE: StatusHistory["status"][] = [
    "up",
    "up",
    "degraded",
    "up",
    "down",
];

const createHistory = (length: number): StatusHistory[] => {
    const now = Date.now();

    return Array.from({ length }, (_, index) => {
        const status = STATUS_SEQUENCE[index % STATUS_SEQUENCE.length] ?? "up";

        return {
            responseTime: 80 + (index % 5) * 25,
            status,
            timestamp: now - index * 60_000,
        } satisfies StatusHistory;
    });
};

const baseHistory = createHistory(24);

const meta: Meta<typeof HistoryChart> = {
    args: {
        history: baseHistory,
        maxItems: 24,
        title: "Past 24 Checks",
    },
    component: HistoryChart,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
    title: "Components/Common/HistoryChart",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LimitedToTen: Story = {
    args: {
        history: baseHistory,
        maxItems: 10,
        title: "Last 10 Checks",
    },
};

export const RecentDowntime: Story = {
    args: {
        history: createHistory(12).map((entry, index) =>
            index < 4
                ? {
                      ...entry,
                      responseTime: 350 + index * 15,
                      status: index === 2 ? "degraded" : "down",
                  }
                : entry
        ),
        title: "Incident Recovery",
    },
};
