import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedIconButton } from "@app/theme/components/ThemedIconButton";
import { FiEdit, FiSettings, FiTrash2 } from "react-icons/fi";

const meta: Meta<typeof ThemedIconButton> = {
    title: "Theme/ThemedIconButton",
    component: ThemedIconButton,
    args: {
        icon: <FiSettings />,
        tooltip: "Open settings",
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

export const Default: Story = {};

export const Danger: Story = {
    args: {
        icon: <FiTrash2 />,
        variant: "error",
        tooltip: "Delete monitor",
    },
};

export const Large: Story = {
    args: {
        icon: <FiEdit />,
        size: "lg",
        tooltip: "Edit",
    },
};

export const Loading: Story = {
    args: {
        loading: true,
    },
};
