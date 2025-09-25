import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { ThemedTooltip } from "@app/theme/components/ThemedTooltip";

const meta: Meta<typeof ThemedTooltip> = {
    title: "Theme/ThemedTooltip",
    component: ThemedTooltip,
    args: {
        content: "Opens the monitor configuration dialog",
    },
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <ThemedTooltip {...args}>
            <ThemedButton variant="secondary">Hover me</ThemedButton>
        </ThemedTooltip>
    ),
};

export const WithIconButton: Story = {
    args: {
        content: "Refresh site status",
    },
    render: (args) => (
        <ThemedTooltip {...args}>
            <ThemedButton variant="ghost">⟳</ThemedButton>
        </ThemedTooltip>
    ),
};
