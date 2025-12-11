/**
 * Storybook coverage for the navigation sidebar and related UI controls.
 */

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react/jsx-runtime";

import { AppSidebar } from "@app/components/Layout/AppSidebar/AppSidebar";
import { useSidebarLayout } from "@app/components/Layout/SidebarLayoutContext";
import { SidebarLayoutProvider } from "@app/components/Layout/SidebarLayoutProvider";
import { SidebarRevealButton } from "@app/components/Layout/SidebarRevealButton/SidebarRevealButton";
import { useTheme } from "@app/theme/useTheme";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

interface AppSidebarStoryArgs {
    isSidebarOpen: boolean;
}

type Story = StoryObj<typeof meta>;

const sampleSites = [
    createMockSite({
        identifier: "sidebar-aurora",
        monitors: [
            createMockMonitor({ id: "aurora-http", status: "up" }),
            createMockMonitor({ id: "aurora-ping", status: "degraded" }),
        ],
        name: "Aurora Edge",
    }),
    createMockSite({
        identifier: "sidebar-orion",
        monitors: [
            createMockMonitor({ id: "orion-heartbeat", status: "paused" }),
        ],
        name: "Orion API",
    }),
] as const;

const withSidebarLayout: Decorator = (StoryComponent, context) => {
    const args = context.args as Partial<AppSidebarStoryArgs> | undefined;
    const requestedOpen = args?.isSidebarOpen ?? true;
    const [sidebarOpen, dispatchSidebarOpen] = useReducer((
        current: boolean,
        action: { open: boolean; type: "set" } | { type: "toggle" }
    ): boolean => {
        if (action.type === "toggle") {
            return !current;
        }

        return action.open;
    }, requestedOpen);

    useEffect(
        function syncSidebarOpen(): void {
            dispatchSidebarOpen({ open: requestedOpen, type: "set" });
        },
        [requestedOpen]
    );

    const toggleSidebar = useCallback(() => {
        dispatchSidebarOpen({ type: "toggle" });
    }, []);

    const providerValue = useMemo(
        () => ({
            isSidebarOpen: sidebarOpen,
            toggleSidebar,
        }),
        [sidebarOpen, toggleSidebar]
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

const withThemedBackground: Decorator = (StoryComponent) => {
    const { isDark } = useTheme();
    const backgroundClass = isDark ? "bg-slate-900" : "bg-slate-100";

    return (
        <div className={`min-h-screen ${backgroundClass} p-6`}>
            <StoryComponent />
        </div>
    );
};

const SidebarPreview = (): JSX.Element => {
    const { isSidebarOpen } = useSidebarLayout();

    return (
        <div className="relative flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl">
            {isSidebarOpen ? <AppSidebar /> : <div className="flex-1" />}
            <SidebarRevealButton />
        </div>
    );
};

/**
 * Storybook metadata for the application sidebar layout stories.
 */
const meta: Meta<AppSidebarStoryArgs> = {
    args: {
        isSidebarOpen: true,
    },
    component: SidebarPreview,
    decorators: [
        createSiteDecorator(() => sampleSites),
        withSidebarLayout,
        withThemedBackground,
    ],
    parameters: {
        layout: "centered",
    },
    render: () => <SidebarPreview />,
    tags: ["autodocs"],
} satisfies Meta<AppSidebarStoryArgs>;

export default meta;

export const Open: Story = {};

export const Collapsed: Story = {
    args: {
        isSidebarOpen: false,
    },
};
