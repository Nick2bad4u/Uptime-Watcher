/**
 * Storybook coverage for the application Header component.
 */

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react/jsx-runtime";

import type { SiteListLayoutMode } from "@app/stores/ui/types";

import { Header } from "@app/components/Header/Header";
import { SidebarLayoutProvider } from "@app/components/Layout/SidebarLayoutProvider";
import { useUIStore } from "@app/stores/ui/useUiStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

interface HeaderStoryArgs {
    siteListLayout: SiteListLayoutMode;
}

type Story = StoryObj<typeof meta>;

const sampleSites = [
    createMockSite({
        identifier: "header-aurora",
        monitors: [
            createMockMonitor({ id: "aurora-http", status: "up" }),
            createMockMonitor({ id: "aurora-ping", status: "degraded" }),
        ],
        name: "Aurora Edge",
    }),
    createMockSite({
        identifier: "header-orion",
        monitors: [createMockMonitor({ id: "orion-http", status: "down" })],
        name: "Orion API",
    }),
] as const;

const withSidebarLayout: Decorator = (StoryComponent) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = useCallback(
        () => setIsSidebarOpen((previous) => !previous),
        []
    );
    const providerValue = useMemo(
        () => ({
            isSidebarOpen,
            toggleSidebar,
        }),
        [isSidebarOpen, toggleSidebar]
    );

    return (
        <SidebarLayoutProvider
            isSidebarOpen={providerValue.isSidebarOpen}
            toggleSidebar={providerValue.toggleSidebar}
        >
            <StoryComponent />
        </SidebarLayoutProvider>
    );
};

const withHeaderLayoutState: Decorator = (StoryComponent, context) => {
    const args = context.args as Partial<HeaderStoryArgs> | undefined;
    const siteListLayout = args?.siteListLayout ?? "list";

    useEffect(
        function syncHeaderLayout(): () => void {
            const previousLayout = useUIStore.getState().siteListLayout;
            useUIStore.setState({ siteListLayout });

            return function restoreHeaderLayout(): void {
                useUIStore.setState({ siteListLayout: previousLayout });
            };
        },
        [siteListLayout]
    );

    return <StoryComponent />;
};
const meta: Meta<HeaderStoryArgs> = {
    args: {
        siteListLayout: "list",
    },
    component: Header,
    decorators: [
        createSiteDecorator(() => sampleSites),
        withSidebarLayout,
        withHeaderLayoutState,
    ],
    parameters: {
        layout: "padded",
    },
    render: (): JSX.Element => <Header />,
    tags: ["autodocs"],
} satisfies Meta<HeaderStoryArgs>;

export default meta;

export const ListLayout: Story = {};

export const CardLayout: Story = {
    args: {
        siteListLayout: "card-large",
    },
};
