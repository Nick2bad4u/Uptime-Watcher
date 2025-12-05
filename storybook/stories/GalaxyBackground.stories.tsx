/**
 * Storybook coverage for the decorative GalaxyBackground component.
 *
 * This story exists primarily to make it easy to debug visual regressions in
 * the animated background used by the header, settings modal, and add-site
 * flows. The component is intentionally rendered without application chrome so
 * the CSS and SVG layers are fully visible.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { GalaxyBackground } from "@app/components/common/GalaxyBackground/GalaxyBackground";

const meta: Meta<typeof GalaxyBackground> = {
    args: {
        className: "min-h-[320px] w-full rounded-xl overflow-hidden",
        isDark: true,
    },
    component: GalaxyBackground,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof GalaxyBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dark: Story = {};

export const Light: Story = {
    args: {
        isDark: false,
    },
};
