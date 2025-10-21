import type { Meta, StoryObj } from "@storybook/react-vite";

import { SaveButton } from "@app/components/shared/SaveButton";
import { action } from "storybook/actions";

const meta: Meta<typeof SaveButton> = {
    args: {
        "aria-label": "Save changes",
        className: "",
        disabled: false,
        isLoading: false,
        onClick: action("save-clicked"),
        size: "sm",
    },
    component: SaveButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SaveButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
    args: {
        size: "lg",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        isLoading: true,
    },
};
