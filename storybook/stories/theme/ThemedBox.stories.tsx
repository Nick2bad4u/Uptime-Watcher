import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedBox } from "@app/theme/components/ThemedBox";
import { ThemedText } from "@app/theme/components/ThemedText";

const meta: Meta<typeof ThemedBox> = {
    args: {
        children: (
            <ThemedText>
                Flexible container for grouping related content with themed
                styling.
            </ThemedText>
        ),
        padding: "lg",
        shadow: "md",
        variant: "primary",
    },
    argTypes: {
        onClick: { action: "clicked" },
        onMouseEnter: { action: "mouse-enter" },
        onMouseLeave: { action: "mouse-leave" },
    },
    component: ThemedBox,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedBox>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const SecondarySurface: Story = {
    args: {
        children: (
            <ThemedText variant="secondary">
                Elevated secondary surface for dashboard sections.
            </ThemedText>
        ),
        rounded: "xl",
        shadow: "lg",
        surface: "elevated",
        variant: "secondary",
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
