/**
 * Storybook stories for the SurfaceContainer wrapper that standardizes base
 * surfaces across the renderer.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { SurfaceContainer } from "@app/components/shared/SurfaceContainer";
import { ThemedText } from "@app/theme/components/ThemedText";
import { action } from "storybook/actions";

const meta: Meta<typeof SurfaceContainer> = {
    args: {
        children: (
            <div className="space-y-2">
                <ThemedText size="md" weight="semibold">
                    Surface Container
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                    Shared wrapper for base surfaces with consistent padding,
                    rounding, and palette variants.
                </ThemedText>
            </div>
        ),
    },
    component: SurfaceContainer,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SurfaceContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BaseSurface: Story = {};

export const ElevatedSurface: Story = {
    args: {
        surface: "elevated",
        variant: "secondary",
    },
};

export const InteractiveSurface: Story = {
    args: {
        as: "button",
        onClick: action("surface-container/click"),
        role: "button",
        shadow: "md",
        surface: "overlay",
        variant: "secondary",
        children: (
            <ThemedText size="sm" weight="medium">
                Clickable surface
            </ThemedText>
        ),
    },
};
