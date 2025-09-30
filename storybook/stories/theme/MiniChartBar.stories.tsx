import type { MiniChartBarProperties } from "@app/theme/components/MiniChartBar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { MiniChartBar } from "@app/theme/components/MiniChartBar";

const meta: Meta<typeof MiniChartBar> = {
    component: MiniChartBar,
    args: {
        status: "up",
        timestamp: new Date().toISOString(),
        responseTime: 120,
    },
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MiniChartBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Timeline: Story = {
    render: (): JSX.Element => {
        const baseTimestamp = Date.now();
        const timeline: ReadonlyArray<{
            readonly responseTime?: number;
            readonly status: MiniChartBarProperties["status"];
        }> = [
            { status: "up", responseTime: 95 },
            { status: "up", responseTime: 110 },
            { status: "degraded", responseTime: 220 },
            { status: "down" },
            { status: "pending" },
            { status: "up", responseTime: 105 },
            { status: "up", responseTime: 92 },
            { status: "up", responseTime: 88 },
            { status: "degraded", responseTime: 215 },
            { status: "up", responseTime: 100 },
        ];

        return (
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-end",
                }}
            >
                {timeline.map((entry, index) => {
                    const timestamp = new Date(
                        baseTimestamp - index * 60_000
                    ).toISOString();

                    if (entry.responseTime === undefined) {
                        return (
                            <MiniChartBar
                                key={`${timestamp}-${entry.status}`}
                                status={entry.status}
                                timestamp={timestamp}
                            />
                        );
                    }

                    return (
                        <MiniChartBar
                            key={`${timestamp}-${entry.status}`}
                            responseTime={entry.responseTime}
                            status={entry.status}
                            timestamp={timestamp}
                        />
                    );
                })}
            </div>
        );
    },
};
