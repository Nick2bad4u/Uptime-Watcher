import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, JSX } from "react";

import type { TextSize, TextWeight } from "../../src/theme/components/types";

import { MarqueeText } from "../../src/components/common/MarqueeText/MarqueeText";

/**
 * Story arguments for the marquee presenter.
 */
interface MarqueeStoryArgs
    extends Omit<ComponentProps<typeof MarqueeText>, "textProps"> {
    readonly textSize: TextSize;
    readonly textWeight: TextWeight;
}

const TEXT_SIZE_OPTIONS: TextSize[] = [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "base",
];

const TEXT_WEIGHT_OPTIONS: TextWeight[] = [
    "normal",
    "medium",
    "semibold",
    "bold",
];

const meta: Meta<MarqueeStoryArgs> = {
    args: {
        duration: "14s",
        gap: "1.5rem",
        text: "Uptime Watcher • Command center for resilient sites • Hover to pause the marquee",
        textSize: "lg",
        textWeight: "semibold",
    },
    argTypes: {
        activeClassName: { control: false },
        className: { control: false },
        cloneClassName: { control: false },
        dependencies: { control: false },
        duration: {
            control: "text",
            description: "Duration for a full marquee cycle (e.g. `14s`).",
        },
        gap: {
            control: "text",
            description: "Spacing between repeated segments (e.g. `1.5rem`).",
        },
        segmentClassName: { control: false },
        style: { control: false },
        text: {
            control: "text",
            description: "Content rendered inside the marquee track.",
        },
        textSize: {
            control: "select",
            options: TEXT_SIZE_OPTIONS,
        },
        textWeight: {
            control: "inline-radio",
            options: TEXT_WEIGHT_OPTIONS,
        },
        trackClassName: { control: false },
    },
    component: MarqueeText,
    decorators: [
        (StoryComponent): JSX.Element => (
            <div
                style={{
                    alignItems: "center",
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: "1rem",
                    display: "flex",
                    justifyContent: "center",
                    maxWidth: "24rem",
                    padding: "1.25rem",
                    width: "100%",
                }}
            >
                <StoryComponent />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    "`MarqueeText` detects horizontal overflow and animates repeated segments. Hover or focus the marquee to pause the animation for readability.",
            },
        },
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<MarqueeStoryArgs>;

export default meta;

type Story = StoryObj<MarqueeStoryArgs>;

const renderMarquee = ({
    textSize,
    textWeight,
    ...args
}: MarqueeStoryArgs): JSX.Element => (
    <MarqueeText
        {...args}
        textProps={{
            size: textSize,
            weight: textWeight,
        }}
    />
);

export const Overflowing: Story = {
    render: renderMarquee,
};

export const SlowScroll: Story = {
    args: {
        duration: "22s",
    },
    render: renderMarquee,
};

export const ShortLabel: Story = {
    args: {
        text: "Short label fits without marquee",
    },
    render: renderMarquee,
};
