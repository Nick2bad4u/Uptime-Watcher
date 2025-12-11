/**
 * Stories for SiteTableRow component displaying monitoring summary rows.
 */

import type { Site } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteTableRow } from "@app/components/Dashboard/SiteList/SiteTableRow";

import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";

const baseSite: Site = createMockSite({
    identifier: "site-uptime",
    monitors: [
        createMockMonitor({
            id: "monitor-http",
            responseTime: 110,
            status: "up",
            url: "https://status.example.com",
        }),
        createMockMonitor({
            id: "monitor-ping",
            monitoring: true,
            responseTime: 210,
            status: "up",
            type: "ping",
        }),
    ],
    name: "Status Service",
});

const incidentSite: Site = {
    ...baseSite,
    monitors: baseSite.monitors.map((monitor, index) =>
        index === 0
            ? {
                  ...monitor,
                  responseTime: 680,
                  status: "down",
              }
            : monitor),
};

const pausedSite: Site = {
    ...baseSite,
    monitoring: false,
    monitors: baseSite.monitors.map((monitor) => ({
        ...monitor,
        monitoring: false,
        status: "paused",
    })),
};

const meta: Meta<typeof SiteTableRow> = {
    args: {
        site: baseSite,
    },
    component: SiteTableRow,
    decorators: [
        createSiteDecorator(() => [
            baseSite,
            incidentSite,
            pausedSite,
        ]),
    ],
    parameters: {
        layout: "padded",
    },
    // Wrap the row in a semantic table structure to avoid invalid
    // `<tr>`-inside-`<div>` markup, which React 19+ rightfully warns about and
    // can cause hydration issues. The underlying component still renders a
    // single `<tr>` as in the main app; the story just supplies a proper
    // `<table><tbody>` parent.
    render: (args) => (
        <div className="max-w-4xl overflow-x-auto">
            <table className="site-table w-full border-collapse">
                <tbody>
                    <SiteTableRow {...args} />
                </tbody>
            </table>
        </div>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof SiteTableRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultRow: Story = {};

export const IncidentRow: Story = {
    args: {
        site: incidentSite,
    },
};

export const PausedRow: Story = {
    args: {
        site: pausedSite,
    },
    parameters: {
        docs: {
            description: {
                story: "Highlights the styling used when an entire site is paused for maintenance across all monitors.",
            },
        },
    },
};
