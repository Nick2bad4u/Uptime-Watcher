import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedIconButton } from "@app/theme/components/ThemedIconButton";
import { AppIcons } from "@app/utils/icons";

const SettingsIcon = AppIcons.settings.gear;
const TrashIcon = AppIcons.actions.remove;
const EditIcon = AppIcons.actions.edit;

const meta: Meta<typeof ThemedIconButton> = {
    component: ThemedIconButton,
    args: {
        icon: <SettingsIcon />,
        tooltip: "Open settings",
    },
    argTypes: {
        onClick: { action: "clicked" },
    },
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedIconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
    args: {
        icon: <TrashIcon />,
        variant: "error",
        tooltip: "Delete monitor",
    },
};

export const Large: Story = {
    args: {
        icon: <EditIcon />,
        size: "lg",
        tooltip: "Edit",
    },
};

export const Loading: Story = {
    args: {
        loading: true,
    },
};
