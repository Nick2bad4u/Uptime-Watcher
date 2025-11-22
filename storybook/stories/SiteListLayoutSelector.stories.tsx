/**
 * Storybook stories for SiteListLayoutSelector showing interactive layout
 * switching behaviour.
 */

import type {
    InterfaceDensity,
    SiteCardPresentation,
    SiteListLayoutMode,
} from "@app/stores/ui/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteListLayoutSelector } from "@app/components/Dashboard/SiteList/SiteListLayoutSelector";
import { type JSX, useState } from "react";
import { action } from "storybook/actions";

type SiteListLayoutSelectorMeta = Meta<typeof SiteListLayoutSelector>;

const meta: SiteListLayoutSelectorMeta = {
    args: {
        cardPresentation: "grid",
        listDensity: "comfortable",
        layout: "card-large",
        onLayoutChange: action("site-list/layout-change"),
        onListDensityChange: action("site-list/density-change"),
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
        const [density, setDensity] = useState<InterfaceDensity>(
            args.listDensity ?? "comfortable"
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

        const handleDensityChange = (nextDensity: InterfaceDensity): void => {
            setDensity(nextDensity);
            args.onListDensityChange?.(nextDensity);
        };

        return (
            <SiteListLayoutSelector
                cardPresentation={presentation}
                layout={layout}
                listDensity={density}
                onLayoutChange={handleLayoutChange}
                onListDensityChange={handleDensityChange}
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
        listDensity: "cozy",
    },
};
