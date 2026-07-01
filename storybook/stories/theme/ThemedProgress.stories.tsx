import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedProgress } from "@app/theme/components/ThemedProgress";

const meta: Meta<typeof ThemedProgress> = {
    args: {
        label: "Monthly uptime goal",
        max: 100,
        showLabel: true,
        value: 45,
    },
    component: ThemedProgress,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedProgress>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Success: Story = {
    args: {
        label: "SLA met",
        value: 92,
        variant: "success",
    },
};

export const Warning: Story = {
    args: {
        label: "Alert threshold",
        value: 72,
        variant: "warning",
    },
};

export const Compact: Story = {
    args: {
        className: "max-w-sm",
        showLabel: false,
        size: "sm",
        value: 30,
    },
};
