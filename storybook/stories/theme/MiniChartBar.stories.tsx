import type { MiniChartBarProperties } from "@app/theme/components/MiniChartBar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { MiniChartBar } from "@app/theme/components/MiniChartBar";

const meta: Meta<typeof MiniChartBar> = {
    args: {
        responseTime: 120,
        status: "up",
        timestamp: new Date().toISOString(),
    },
    component: MiniChartBar,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MiniChartBar>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Timeline: Story = {
    render: (): JSX.Element => {
        const baseTimestamp = Date.now();
        const timeline: readonly {
            readonly responseTime?: number;
            readonly status: MiniChartBarProperties["status"];
        }[] = [
            { responseTime: 95, status: "up" },
            { responseTime: 110, status: "up" },
            { responseTime: 220, status: "degraded" },
            { status: "down" },
            { status: "pending" },
            { responseTime: 105, status: "up" },
            { responseTime: 92, status: "up" },
            { responseTime: 88, status: "up" },
            { responseTime: 215, status: "degraded" },
            { responseTime: 100, status: "up" },
        ];

        return (
            <div
                style={{
                    alignItems: "flex-end",
                    display: "flex",
                    gap: "0.5rem",
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
