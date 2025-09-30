import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedBox } from "@app/theme/components/ThemedBox";
import { ThemedText } from "@app/theme/components/ThemedText";

const meta: Meta<typeof ThemedBox> = {
    component: ThemedBox,
    args: {
        padding: "lg",
        variant: "primary",
        shadow: "md",
        children: (
            <ThemedText>
                Flexible container for grouping related content with themed
                styling.
            </ThemedText>
        ),
    },
    argTypes: {
        onClick: { action: "clicked" },
        onMouseEnter: { action: "mouse-enter" },
        onMouseLeave: { action: "mouse-leave" },
    },
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondarySurface: Story = {
    args: {
        variant: "secondary",
        surface: "elevated",
        rounded: "xl",
        shadow: "lg",
        children: (
            <ThemedText variant="secondary">
                Elevated secondary surface for dashboard sections.
            </ThemedText>
        ),
    },
};

export const Interactive: Story = {
    args: {
        as: "button",
        border: true,
        children: (
            <ThemedText weight="medium">
                Clickable box (button element)
            </ThemedText>
        ),
    },
};
