/**
 * Storybook stories for the StatusCounter badge variants.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { StatusCounter } from "@app/components/Header/StatusCounter";
import { ThemedText } from "@app/theme/components/ThemedText";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof StatusCounter> = {
    args: {
        count: 18,
        label: "Up",
        status: "up",
    },
    component: StatusCounter,
    parameters: {
        layout: "centered",
    },
    render: (args): JSX.Element => (
        <div className="flex items-center space-x-4 bg-slate-900/40 p-8 text-slate-200">
            <ThemedText size="sm" weight="medium">
                Status
            </ThemedText>
            <StatusCounter {...args} />
        </div>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof StatusCounter>;

export default meta;

export const UpMonitors: Story = {};

export const DegradedMonitors: Story = {
    args: {
        count: 4,
        label: "Degraded",
        status: "degraded",
    },
};

export const DownMonitors: Story = {
    args: {
        count: 2,
        label: "Down",
        status: "down",
    },
};
