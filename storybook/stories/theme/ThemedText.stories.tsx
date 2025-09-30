import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedText } from "@app/theme/components/ThemedText";

const meta: Meta<typeof ThemedText> = {
    component: ThemedText,
    args: {
        children: "Themed text demonstrates consistent typography.",
        variant: "primary",
        size: "base",
    },
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Emphasis: Story = {
    args: {
        variant: "success",
        weight: "semibold",
        children: "Uptime is excellent",
    },
};

export const Muted: Story = {
    args: {
        variant: "secondary",
        size: "sm",
        children: "Last checked 2 minutes ago",
    },
};

export const CenteredHeadline: Story = {
    args: {
        variant: "primary",
        size: "2xl",
        weight: "bold",
        align: "center",
        children: "Monitoring Overview",
    },
};
