import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedBadge } from "@app/theme/components/ThemedBadge";
import { AppIcons } from "@app/utils/icons";

const SuccessIcon = AppIcons.status.up;
const WarningIcon = AppIcons.status.warning;
const InfoIcon = AppIcons.ui.info;

const meta: Meta<typeof ThemedBadge> = {
    args: {
        children: "Badge",
        variant: "primary",
    },
    component: ThemedBadge,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedBadge>;

export default meta;

type Story = StoryObj;

export const Primary: Story = {};

export const Success: Story = {
    args: {
        children: "Operational",
        icon: <SuccessIcon />,
        variant: "success",
    },
};

export const Warning: Story = {
    args: {
        children: "Degraded",
        icon: <WarningIcon />,
        variant: "warning",
    },
};

export const InfoSmall: Story = {
    args: {
        children: "Info",
        icon: <InfoIcon />,
        size: "sm",
        variant: "info",
    },
};
