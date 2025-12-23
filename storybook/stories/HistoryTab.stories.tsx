/**
 * Stories for the HistoryTab component.
 */

import type { Monitor } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HistoryTab } from "@app/components/SiteDetails/tabs/HistoryTab";
import { expect, userEvent, within } from "storybook/test";

import { createMockMonitor } from "../helpers/siteStoryHelpers";

const formatFullTimestamp = (timestamp: number): string =>
    new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
    }).format(new Date(timestamp));

const formatResponseTime = (time: number): string => `${time} ms`;

const baseMonitor: Monitor = createMockMonitor({
    history: Array.from({ length: 24 }, (_, index) => ({
        responseTime: 120 + (index % 5) * 30,
        status: index % 6 === 0 ? "degraded" : "up",
        timestamp: Date.now() - index * 60_000,
    })),
    id: "monitor-http",
    responseTime: 132,
    status: "up",
});

const outageMonitor: Monitor = {
    ...baseMonitor,
    history: baseMonitor.history.map((entry, index) =>
        index < 6
            ? {
                  ...entry,
                  responseTime: 500 + index * 40,
                  status: index < 3 ? "down" : "degraded",
              }
            : entry
    ),
    status: "down",
};

const emptyHistoryMonitor: Monitor = {
    ...baseMonitor,
    history: [],
};

const meta: Meta<typeof HistoryTab> = {
    args: {
        formatFullTimestamp,
        formatResponseTime,
        selectedMonitor: baseMonitor,
    },
    component: HistoryTab,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof HistoryTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultHistory: Story = {
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Verify initial history summary", async () => {
            const summary = await canvas.findByText(/24 of 24 records/i);
            void expect(summary).not.toHaveTextContent(/\(down filter\)/i);
        });

        await step("Filter to down records", async () => {
            const downFilterButton = await canvas.findByRole("button", {
                name: /down/i,
            });
            await userEvent.click(downFilterButton);

            const summary = await canvas.findByText(/0 of 24 records/i);
            void expect(summary).toHaveTextContent(/\(down filter\)/i);
        });

        await step("Adjust visible history count", async () => {
            const showSelect = canvas.getByRole("combobox");
            await userEvent.selectOptions(showSelect, "10");

            void expect(showSelect).toHaveValue("10");

            const summary = await canvas.findByText(/0 of 24 records/i);
            void expect(summary).toHaveTextContent(/\(down filter\)/i);
        });
    },
};

export const RecentOutage: Story = {
    args: {
        selectedMonitor: outageMonitor,
    },
};

export const EmptyHistory: Story = {
    args: {
        selectedMonitor: emptyHistoryMonitor,
    },
    parameters: {
        docs: {
            description: {
                story: "Illustrates a brand new monitor where checks have not yet produced any history records.",
            },
        },
    },
};
