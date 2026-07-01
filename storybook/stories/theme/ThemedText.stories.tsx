import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedText } from "@app/theme/components/ThemedText";

const meta: Meta<typeof ThemedText> = {
    args: {
        children: "Themed text demonstrates consistent typography.",
        size: "base",
        variant: "primary",
    },
    component: ThemedText,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedText>;

export default meta;

type Story = StoryObj;

export const Primary: Story = {};

export const Emphasis: Story = {
    args: {
        children: "Uptime is excellent",
        variant: "success",
        weight: "semibold",
    },
};

export const Muted: Story = {
    args: {
        children: "Last checked 2 minutes ago",
        size: "sm",
        variant: "secondary",
    },
};

export const CenteredHeadline: Story = {
    args: {
        align: "center",
        children: "Monitoring Overview",
        size: "2xl",
        variant: "primary",
        weight: "bold",
    },
};
