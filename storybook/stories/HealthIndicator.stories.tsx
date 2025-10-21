/**
 * Storybook stories for the HealthIndicator uptime badge.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { HealthIndicator } from "@app/components/Header/HealthIndicator";
import { useAvailabilityColors } from "@app/theme/useTheme";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof HealthIndicator> = {
    args: {
        uptimePercentage: 99.9,
    },
    argTypes: {
        getAvailabilityColor: {
            control: false,
            description:
                "Injected from the useAvailabilityColors hook to align with the theme palette.",
        },
    },
    component: HealthIndicator,
    parameters: {
        layout: "centered",
    },
    render: (args): JSX.Element => {
        const { getAvailabilityColor } = useAvailabilityColors();

        return (
            <div className="bg-slate-900/40 p-8">
                <HealthIndicator
                    {...args}
                    getAvailabilityColor={getAvailabilityColor}
                />
            </div>
        );
    },
    tags: ["autodocs"],
} satisfies Meta<typeof HealthIndicator>;

export default meta;

export const Excellent: Story = {};

export const WarningThreshold: Story = {
    args: {
        uptimePercentage: 92.5,
    },
};

export const Critical: Story = {
    args: {
        uptimePercentage: 67.3,
    },
};
