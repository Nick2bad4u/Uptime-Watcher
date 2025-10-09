/**
 * Storybook stories covering StatusSummary badge layouts for healthy and
 * degraded fleets.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { StatusSummary } from "../../src/components/Header/StatusSummary";
import { useAvailabilityColors } from "../../src/theme/useTheme";

const meta: Meta<typeof StatusSummary> = {
    args: {
        degradedMonitors: 2,
        downMonitors: 1,
        pausedMonitors: 1,
        pendingMonitors: 3,
        totalMonitors: 18,
        upMonitors: 11,
        uptimePercentage: 98.4,
    },
    argTypes: {
        getAvailabilityColor: {
            control: false,
            description: "Provided via useAvailabilityColors hook",
        },
    },
    component: StatusSummary,
    parameters: {
        layout: "centered",
    },
    render: function render(args): JSX.Element {
        const { getAvailabilityColor } = useAvailabilityColors();
        return (
            <StatusSummary
                {...args}
                getAvailabilityColor={getAvailabilityColor}
            />
        );
    },
    tags: ["autodocs"],
} satisfies Meta<typeof StatusSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Healthy: Story = {};

export const IncidentInProgress: Story = {
    args: {
        degradedMonitors: 4,
        downMonitors: 3,
        pausedMonitors: 2,
        pendingMonitors: 6,
        totalMonitors: 24,
        upMonitors: 9,
        uptimePercentage: 88.6,
    },
};
