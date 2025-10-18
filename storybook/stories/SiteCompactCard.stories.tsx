import type { Site } from "@shared/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { SiteCompactCard } from "@app/components/Dashboard/SiteCard/SiteCompactCard";
import { useMount } from "@app/hooks/useMount";
import { useErrorStore } from "@app/stores/error/useErrorStore";
import { useRef } from "react";
import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

const baseSite = createMockSite();

const pausedSite = createMockSite({
    monitoring: false,
    monitors: [
        createMockMonitor({
            id: "paused-http",
            monitoring: false,
            responseTime: 180,
            status: "paused",
            type: "http",
            url: "https://maintenance.example.com",
        }),
        createMockMonitor({
            id: "paused-ping",
            monitoring: false,
            responseTime: 0,
            status: "down",
            type: "ping",
        }),
    ],
    name: "Paused Maintenance Window",
});

const degradedSite = createMockSite({
    monitors: [
        createMockMonitor({
            id: "degraded-http",
            responseTime: 340,
            status: "degraded",
            type: "http",
            url: "https://api.example.com",
        }),
        createMockMonitor({
            id: "degraded-port",
            monitoring: true,
            responseTime: 410,
            status: "down",
            type: "port",
        }),
    ],
    name: "API Cluster",
});

const captureErrorStoreState = (): ReturnType<
    typeof useErrorStore.getState
> => {
    const state = useErrorStore.getState();

    return {
        ...state,
        operationLoading: { ...state.operationLoading },
        storeErrors: { ...state.storeErrors },
    } as ReturnType<typeof useErrorStore.getState>;
};

const withLoadingState: Decorator = (StoryComponent) => {
    const snapshotRef = useRef(captureErrorStoreState());

    useMount(
        () => {
            useErrorStore.setState({ ...snapshotRef.current, isLoading: true });
        },
        () => {
            useErrorStore.setState(() => snapshotRef.current, true);
        }
    );

    return <StoryComponent />;
};

const meta: Meta<typeof SiteCompactCard> = {
    args: {
        site: baseSite,
    },
    component: SiteCompactCard,
    decorators: [
        createSiteDecorator((context) => {
            const site = context.args["site"] as Site | undefined;
            return site ? [site] : [];
        }),
    ],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteCompactCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MonitoringPaused: Story = {
    args: {
        site: pausedSite,
    },
};

export const DegradedStatus: Story = {
    args: {
        site: degradedSite,
    },
};

export const Loading: Story = {
    args: {
        site: baseSite,
    },
    decorators: [withLoadingState],
};
