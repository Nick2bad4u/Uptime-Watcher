/**
 * Storybook stories for the dashboard SiteList component showcasing the modern
 * layouts and presentations available in the refreshed UI.
 */

import type { Site } from "@shared/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { useEffect } from "react";

import type {
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../src/stores/ui/types";

import { SiteList } from "../../src/components/Dashboard/SiteList/SiteList";
import { useUIStore } from "../../src/stores/ui/useUiStore";
import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

interface SiteListStoryArgs {
    layout: SiteListLayoutMode;
    presentation: SiteCardPresentation;
    sites: readonly Site[];
}

const defaultSites: readonly Site[] = [
    createMockSite({
        identifier: "site-aurora",
        name: "Aurora CDN",
    }),
    createMockSite({
        identifier: "site-orion",
        monitors: [
            createMockMonitor({
                id: "orion-http",
                responseTime: 320,
                status: "degraded",
                type: "http",
                url: "https://api.orion.example",
            }),
            createMockMonitor({
                id: "orion-dns",
                status: "up",
                type: "dns",
            }),
        ],
        name: "Orion API Cluster",
    }),
    createMockSite({
        identifier: "site-atlas",
        monitors: [
            createMockMonitor({
                id: "atlas-port",
                monitoring: false,
                status: "paused",
                type: "port",
            }),
            createMockMonitor({
                id: "atlas-ping",
                responseTime: 180,
                status: "up",
                type: "ping",
            }),
        ],
        name: "Atlas Edge Gateway",
    }),
] as const;

const withLayoutState: Decorator = (StoryComponent, context) => {
    const { layout, presentation } =
        context.args as unknown as SiteListStoryArgs;

    useEffect(
        function syncSiteListLayout(): () => void {
            const previous = {
                siteCardPresentation:
                    useUIStore.getState().siteCardPresentation,
                siteListLayout: useUIStore.getState().siteListLayout,
            } as const;

            useUIStore.setState({
                siteCardPresentation: presentation,
                siteListLayout: layout,
            });

            return function restoreSiteListLayout(): void {
                useUIStore.setState({
                    siteCardPresentation: previous.siteCardPresentation,
                    siteListLayout: previous.siteListLayout,
                });
            };
        },
        [layout, presentation]
    );

    return <StoryComponent />;
};

const meta: Meta<typeof SiteList> = {
    args: {
        layout: "card-large",
        presentation: "stacked",
        sites: defaultSites,
    },
    argTypes: {
        layout: {
            control: {
                labels: {
                    "card-compact": "Compact Cards",
                    "card-large": "Large Cards",
                    list: "Table",
                },
                type: "radio",
            },
            description: "Site list layout mode",
            options: [
                "card-large",
                "card-compact",
                "list",
            ],
        },
        presentation: {
            control: {
                labels: {
                    grid: "Balanced Grid",
                    stacked: "Stacked",
                },
                type: "radio",
            },
            description:
                "Card presentation used when the layout is set to large cards.",
            options: ["stacked", "grid"],
        },
        sites: {
            control: false,
            description: "Site data rendered within the list",
        },
    },
    component: SiteList,
    decorators: [
        createSiteDecorator(
            (context) =>
                (context.args as unknown as SiteListStoryArgs | undefined)
                    ?.sites ?? []
        ),
        withLayoutState,
    ],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StackedCards: Story = {};

export const BalancedGrid: Story = {
    args: {
        presentation: "grid",
    },
};

export const CompactCards: Story = {
    args: {
        layout: "card-compact",
        presentation: "grid",
    },
};

export const ListView: Story = {
    args: {
        layout: "list",
    },
};

export const EmptyState: Story = {
    args: {
        sites: [],
    },
};
