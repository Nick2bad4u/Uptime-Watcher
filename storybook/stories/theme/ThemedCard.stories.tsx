import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { ThemedCard } from "@app/theme/components/ThemedCard";
import { ThemedText } from "@app/theme/components/ThemedText";
import { FiBarChart2, FiServer, FiTrendingUp } from "react-icons/fi";

const meta: Meta<typeof ThemedCard> = {
    title: "Theme/ThemedCard",
    component: ThemedCard,
    args: {
        title: "Site Availability",
        subtitle: "Last 24 hours",
        icon: <FiTrendingUp />,
        children: (
            <ThemedText>
                Monitor uptime, response time, and incidents for every site in
                your workspace.
            </ThemedText>
        ),
    },
    argTypes: {
        onClick: { action: "clicked" },
        onMouseEnter: { action: "hover" },
        onMouseLeave: { action: "leave" },
    },
    parameters: {
        layout: "padded",
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Clickable: Story = {
    args: {
        clickable: true,
        hoverable: true,
    },
};

export const WithAction: Story = {
    render: (args) => (
        <ThemedCard {...args}>
            <ThemedText>
                Quickly add new monitors with sensible defaults and templates
                for common protocols.
            </ThemedText>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <ThemedButton icon={<FiServer />} variant="primary">
                    New Site
                </ThemedButton>
                <ThemedButton icon={<FiBarChart2 />} variant="outline">
                    View Analytics
                </ThemedButton>
            </div>
        </ThemedCard>
    ),
    args: {
        icon: <FiTrendingUp />,
        hoverable: true,
    },
};
