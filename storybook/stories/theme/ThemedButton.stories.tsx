import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { FiAlertTriangle, FiCheck, FiDownload, FiPlus } from "react-icons/fi";

const meta: Meta<typeof ThemedButton> = {
    title: "Theme/ThemedButton",
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
};

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
        icon: <FiDownload />,
        children: "Download",
    },
};

export const WithTrailingIcon: Story = {
    args: {
        icon: <FiPlus />,
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
        icon: <FiAlertTriangle />,
        children: "Remove",
    },
};

export const Success: Story = {
    args: {
        variant: "success",
        icon: <FiCheck />,
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
