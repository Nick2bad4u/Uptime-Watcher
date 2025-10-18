/**
 * Storybook snapshot for the StatusDivider utility element.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { StatusDivider } from "@app/components/Header/StatusDivider";
import { ThemedText } from "@app/theme/components/ThemedText";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof StatusDivider> = {
    component: StatusDivider,
    parameters: {
        layout: "centered",
    },
    render: (): JSX.Element => (
        <div className="flex items-center space-x-4 bg-slate-900/40 p-8 text-slate-200">
            <ThemedText size="sm" variant="secondary">
                Before
            </ThemedText>
            <StatusDivider />
            <ThemedText size="sm" variant="secondary">
                After
            </ThemedText>
        </div>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof StatusDivider>;

export default meta;

export const Divider: Story = {};
