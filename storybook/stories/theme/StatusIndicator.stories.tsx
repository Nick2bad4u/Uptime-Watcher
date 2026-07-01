import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusIndicator } from "@app/theme/components/StatusIndicator";

const meta: Meta<typeof StatusIndicator> = {
    args: {
        showText: false,
        size: "md",
        status: "up",
    },
    component: StatusIndicator,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof StatusIndicator>;

export default meta;

type Story = StoryObj;

export const DotIndicator: Story = {};

export const WithText: Story = {
    args: {
        showText: true,
        status: "pending",
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ alignItems: "center", display: "flex", gap: "1.5rem" }}>
            <StatusIndicator {...args} size="sm" status="up" />
            <StatusIndicator {...args} size="md" status="degraded" />
            <StatusIndicator {...args} showText size="lg" status="down" />
        </div>
    ),
};

export const AllStatuses: Story = {
    render: () => {
        const statuses = [
            "degraded",
            "down",
            "mixed",
            "paused",
            "pending",
            "unknown",
            "up",
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
                            alignItems: "center",
                            display: "flex",
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
