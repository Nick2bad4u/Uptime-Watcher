/**
 * Storybook stories for SiteListLayoutSelector showing interactive layout
 * switching behaviour.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
    SiteCardPresentation,
    SiteListLayoutMode,
} from "@app/stores/ui/types";

import { SiteListLayoutSelector } from "@app/components/Dashboard/SiteList/SiteListLayoutSelector";
import { type JSX, useState } from "react";
import { action } from "storybook/actions";

type SiteListLayoutSelectorMeta = Meta<typeof SiteListLayoutSelector>;

const meta: SiteListLayoutSelectorMeta = {
    args: {
        cardPresentation: "grid",
        layout: "card-large",
        onLayoutChange: action("site-list/layout-change"),
        onPresentationChange: action("site-list/presentation-change"),
    },
    component: SiteListLayoutSelector,
    parameters: {
        layout: "centered",
    },
    render: function render(args): JSX.Element {
        const [layout, setLayout] = useState<SiteListLayoutMode>(args.layout);
        const [presentation, setPresentation] = useState<SiteCardPresentation>(
            args.cardPresentation
        );

        const handleLayoutChange = (nextLayout: SiteListLayoutMode): void => {
            setLayout(nextLayout);
            args.onLayoutChange?.(nextLayout);
            if (nextLayout !== "card-large") {
                setPresentation("grid");
            }
        };

        const handlePresentationChange = (
            nextPresentation: SiteCardPresentation
        ): void => {
            setPresentation(nextPresentation);
            args.onPresentationChange?.(nextPresentation);
        };

        return (
            <SiteListLayoutSelector
                cardPresentation={presentation}
                layout={layout}
                onLayoutChange={handleLayoutChange}
                onPresentationChange={handlePresentationChange}
            />
        );
    },
    tags: ["autodocs"],
} satisfies SiteListLayoutSelectorMeta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LargeCards: Story = {};

export const CompactCards: Story = {
    args: {
        layout: "card-compact",
    },
};

export const ListView: Story = {
    args: {
        layout: "list",
    },
};
