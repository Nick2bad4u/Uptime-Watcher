import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusIndicator } from "@app/theme/components/StatusIndicator";

const meta: Meta<typeof StatusIndicator> = {
    title: "Theme/StatusIndicator",
    component: StatusIndicator,
    args: {
        status: "up",
        size: "md",
        showText: false,
    },
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DotIndicator: Story = {};

export const WithText: Story = {
    args: {
        showText: true,
        status: "pending",
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <StatusIndicator {...args} size="sm" status="up" />
            <StatusIndicator {...args} size="md" status="degraded" />
            <StatusIndicator {...args} showText size="lg" status="down" />
        </div>
    ),
};

export const AllStatuses: Story = {
    render: () => {
        const statuses = [
            "up",
            "degraded",
            "pending",
            "paused",
            "down",
            "unknown",
            "mixed",
        ] as const;

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                }}
            >
                {statuses.map((status) => (
                    <div
                        key={status}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                        }}
                    >
                        <StatusIndicator status={status} />
                        <StatusIndicator showText status={status} />
                    </div>
                ))}
            </div>
        );
    },
};
