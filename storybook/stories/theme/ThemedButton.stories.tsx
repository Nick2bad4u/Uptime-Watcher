import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { AppIcons } from "@app/utils/icons";

const DownloadIcon = AppIcons.actions.download;
const AddIcon = AppIcons.actions.add;
const WarningIcon = AppIcons.status.warning;
const SuccessIcon = AppIcons.status.upAlt;

const meta: Meta<typeof ThemedButton> = {
    component: ThemedButton,
    args: {
        children: "Primary Action",
        variant: "primary",
        size: "md",
    },
    argTypes: {
        onClick: { action: "clicked" },
    },
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
    args: {
        variant: "secondary",
        children: "Secondary",
    },
};

export const WithLeadingIcon: Story = {
    args: {
        icon: <DownloadIcon />,
        children: "Download",
    },
};

export const WithTrailingIcon: Story = {
    args: {
        icon: <AddIcon />,
        iconPosition: "right",
        children: "Add Monitor",
    },
};

export const Loading: Story = {
    args: {
        loading: true,
        children: "Validating...",
    },
};

export const Destructive: Story = {
    args: {
        variant: "error",
        icon: <WarningIcon />,
        children: "Remove",
    },
};

export const Success: Story = {
    args: {
        variant: "success",
        icon: <SuccessIcon />,
        children: "Complete",
    },
};

export const FullWidth: Story = {
    args: {
        fullWidth: true,
        children: "Full width button",
    },
    parameters: {
        layout: "padded",
    },
};
