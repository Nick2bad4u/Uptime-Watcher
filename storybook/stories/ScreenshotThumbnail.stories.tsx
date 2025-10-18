/**
 * Storybook coverage for the ScreenshotThumbnail component, verifying preview
 * affordances and hover interactions across URL variations.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScreenshotThumbnail } from "@app/components/SiteDetails/ScreenshotThumbnail";

const meta: Meta<typeof ScreenshotThumbnail> = {
    args: {
        siteName: "Storybook Observability",
        url: "https://status.storybook.dev",
    },
    component: ScreenshotThumbnail,
    parameters: {
        controls: {
            exclude: ["url"],
        },
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ScreenshotThumbnail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MissingUrl: Story = {
    args: {
        url: "",
    },
};
