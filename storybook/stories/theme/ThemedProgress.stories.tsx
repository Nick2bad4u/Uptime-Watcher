import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedProgress } from "@app/theme/components/ThemedProgress";

const meta: Meta<typeof ThemedProgress> = {
    component: ThemedProgress,
    args: {
        value: 45,
        max: 100,
        showLabel: true,
        label: "Monthly uptime goal",
    },
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
    args: {
        variant: "success",
        value: 92,
        label: "SLA met",
    },
};

export const Warning: Story = {
    args: {
        variant: "warning",
        value: 72,
        label: "Alert threshold",
    },
};

export const Compact: Story = {
    args: {
        size: "sm",
        showLabel: false,
        value: 30,
        className: "max-w-sm",
    },
};
