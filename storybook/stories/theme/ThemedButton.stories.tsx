import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { AppIcons } from "@app/utils/icons";

const DownloadIcon = AppIcons.actions.download;
const AddIcon = AppIcons.actions.add;
const WarningIcon = AppIcons.status.warning;
const SuccessIcon = AppIcons.status.upAlt;

const meta: Meta<typeof ThemedButton> = {
    args: {
        children: "Primary Action",
        size: "md",
        variant: "primary",
    },
    argTypes: {
        onClick: { action: "clicked" },
    },
    component: ThemedButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedButton>;

export default meta;

type Story = StoryObj;

export const Primary: Story = {};

export const Secondary: Story = {
    args: {
        children: "Secondary",
        variant: "secondary",
    },
};

export const WithLeadingIcon: Story = {
    args: {
        children: "Download",
        icon: <DownloadIcon />,
    },
};

export const WithTrailingIcon: Story = {
    args: {
        children: "Add Monitor",
        icon: <AddIcon />,
        iconPosition: "right",
    },
};

export const Loading: Story = {
    args: {
        children: "Validating...",
        loading: true,
    },
};

export const Destructive: Story = {
    args: {
        children: "Remove",
        icon: <WarningIcon />,
        variant: "error",
    },
};

export const Success: Story = {
    args: {
        children: "Complete",
        icon: <SuccessIcon />,
        variant: "success",
    },
};

export const FullWidth: Story = {
    args: {
        children: "Full width button",
        fullWidth: true,
    },
    parameters: {
        layout: "padded",
    },
};
