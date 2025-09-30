import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedBadge } from "@app/theme/components/ThemedBadge";
import { FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";

const meta: Meta<typeof ThemedBadge> = {
    component: ThemedBadge,
    args: {
        children: "Badge",
        variant: "primary",
    },
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Success: Story = {
    args: {
        variant: "success",
        icon: <FiCheckCircle />,
        children: "Operational",
    },
};

export const Warning: Story = {
    args: {
        variant: "warning",
        icon: <FiAlertTriangle />,
        children: "Degraded",
    },
};

export const InfoSmall: Story = {
    args: {
        variant: "info",
        size: "sm",
        icon: <FiInfo />,
        children: "Info",
    },
};
