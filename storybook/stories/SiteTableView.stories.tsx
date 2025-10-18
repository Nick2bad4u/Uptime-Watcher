import type { Site } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteTableView } from "@app/components/Dashboard/SiteList/SiteTableView";

import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

const siteA = createMockSite({
    identifier: "uptime-watcher",
    name: "Uptime Watcher",
});

const siteB = createMockSite({
    identifier: "api-gateway",
    monitors: [
        createMockMonitor({
            id: "api-http",
            responseTime: 280,
            status: "degraded",
            type: "http",
            url: "https://api.example.com/health",
        }),
        createMockMonitor({
            id: "api-ping",
            responseTime: 180,
            status: "up",
            type: "ping",
        }),
    ],
    name: "API Gateway",
});

const siteC = createMockSite({
    identifier: "worker-cluster",
    monitors: [
        createMockMonitor({
            id: "worker-http",
            monitoring: false,
            responseTime: 0,
            status: "down",
            type: "http",
        }),
        createMockMonitor({
            id: "worker-port",
            monitoring: false,
            responseTime: 0,
            status: "paused",
            type: "port",
        }),
    ],
    monitoring: false,
    name: "Worker Cluster",
});

const meta: Meta<typeof SiteTableView> = {
    args: {
        sites: [
            siteA,
            siteB,
            siteC,
        ],
    },
    component: SiteTableView,
    decorators: [
        createSiteDecorator((context) => {
            const sitesArg = context.args["sites"] as Site[] | undefined;
            return sitesArg ?? [];
        }),
    ],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteTableView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MixedStatuses: Story = {
    args: {
        sites: [siteA, siteB],
    },
};

export const AllPaused: Story = {
    args: {
        sites: [siteC],
    },
};
