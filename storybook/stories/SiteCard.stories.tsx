/**
 * Storybook stories for the SiteCard component, covering grid and stacked
 * presentations with representative monitor data.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteCard } from "@app/components/Dashboard/SiteCard/SiteCard";

import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

const primarySite = createMockSite({
    identifier: "storybook-site-card",
    monitors: [
        createMockMonitor({
            id: "storybook-http",
            responseTime: 215,
            status: "up",
            type: "http",
            url: "https://status.storybook.dev",
        }),
        createMockMonitor({
            id: "storybook-heartbeat",
            responseTime: 640,
            status: "degraded",
            type: "server-heartbeat",
        }),
        createMockMonitor({
            id: "storybook-port",
            monitoring: false,
            responseTime: 0,
            status: "paused",
            type: "port",
        }),
    ],
    name: "Storyboard Primary",
});

const stressedSite = createMockSite({
    identifier: "storybook-site-card-down",
    monitors: [
        createMockMonitor({
            id: "down-http",
            responseTime: 0,
            status: "down",
            type: "http",
        }),
        createMockMonitor({
            id: "down-ping",
            responseTime: 0,
            status: "down",
            type: "ping",
        }),
    ],
    monitoring: false,
    name: "Critical Outage",
});

type SiteCardMeta = Meta<typeof SiteCard>;

const meta: SiteCardMeta = {
    args: {
        presentation: "grid",
        site: primarySite,
    },
    component: SiteCard,
    decorators: [
        createSiteDecorator((context) => {
            const args = context.args as SiteCardMeta["args"];
            const site = args?.site ?? primarySite;
            return [site];
        }),
    ],
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies SiteCardMeta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grid: Story = {};

export const Stacked: Story = {
    args: {
        presentation: "stacked",
    },
};

export const Downtime: Story = {
    args: {
        site: stressedSite,
    },
};
