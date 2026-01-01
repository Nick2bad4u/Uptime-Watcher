import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { ThemedCard } from "@app/theme/components/ThemedCard";
import { ThemedText } from "@app/theme/components/ThemedText";
import { AppIcons } from "@app/utils/icons";

const CardIcon = AppIcons.metrics.uptime;
const NewSiteIcon = AppIcons.ui.site;
const AnalyticsIcon = AppIcons.ui.analytics;

const meta: Meta<typeof ThemedCard> = {
    component: ThemedCard,
    args: {
        title: "Site Availability",
        subtitle: "Last 24 hours",
        icon: <CardIcon />,
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
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedCard>;

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
                <ThemedButton icon={<NewSiteIcon />} variant="primary">
                    New Site
                </ThemedButton>
                <ThemedButton icon={<AnalyticsIcon />} variant="outline">
                    View Analytics
                </ThemedButton>
            </div>
        </ThemedCard>
    ),
    args: {
        icon: <CardIcon />,
        hoverable: true,
    },
};
