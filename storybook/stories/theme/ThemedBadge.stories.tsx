import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedBadge } from "@app/theme/components/ThemedBadge";
import { AppIcons } from "@app/utils/icons";

const SuccessIcon = AppIcons.status.up;
const WarningIcon = AppIcons.status.warning;
const InfoIcon = AppIcons.ui.info;

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
        icon: <SuccessIcon />,
        children: "Operational",
    },
};

export const Warning: Story = {
    args: {
        variant: "warning",
        icon: <WarningIcon />,
        children: "Degraded",
    },
};

export const InfoSmall: Story = {
    args: {
        variant: "info",
        size: "sm",
        icon: <InfoIcon />,
        children: "Info",
    },
};
