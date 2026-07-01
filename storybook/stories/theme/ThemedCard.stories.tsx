import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedButton } from "@app/theme/components/ThemedButton";
import { ThemedCard } from "@app/theme/components/ThemedCard";
import { ThemedText } from "@app/theme/components/ThemedText";
import { AppIcons } from "@app/utils/icons";

const CardIcon = AppIcons.metrics.uptime;
const NewSiteIcon = AppIcons.ui.site;
const AnalyticsIcon = AppIcons.ui.analytics;

const meta: Meta<typeof ThemedCard> = {
    args: {
        children: (
            <ThemedText>
                Monitor uptime, response time, and incidents for every site in
                your workspace.
            </ThemedText>
        ),
        icon: <CardIcon />,
        subtitle: "Last 24 hours",
        title: "Site Availability",
    },
    argTypes: {
        onClick: { action: "clicked" },
        onMouseEnter: { action: "hover" },
        onMouseLeave: { action: "leave" },
    },
    component: ThemedCard,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedCard>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Clickable: Story = {
    args: {
        clickable: true,
        hoverable: true,
    },
};

export const WithAction: Story = {
    args: {
        hoverable: true,
        icon: <CardIcon />,
    },
    render: (args) => (
        <ThemedCard {...args}>
            <ThemedText>
                Quickly add new monitors with sensible defaults and templates
                for common protocols.
            </ThemedText>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <ThemedButton icon={<NewSiteIcon />} variant="primary">
                    New Site
                </ThemedButton>
                <ThemedButton icon={<AnalyticsIcon />} variant="outline">
                    View Analytics
                </ThemedButton>
            </div>
        </ThemedCard>
    ),
};
