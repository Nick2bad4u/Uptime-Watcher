/**
 * Storybook coverage for the HeaderControls action cluster.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeaderControls } from "@app/components/Header/HeaderControls";
import { action } from "storybook/actions";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof HeaderControls> = {
    args: {
        isDark: false,
        onShowAddSiteModal: action("header-controls/show-add-site"),
        onShowSettings: action("header-controls/show-settings"),
        onToggleTheme: action("header-controls/toggle-theme"),
        orientation: "horizontal",
    },
    argTypes: {
        onShowAddSiteModal: {
            control: false,
            description:
                "Action handler triggered when the add site button is clicked.",
        },
        onShowSettings: {
            control: false,
            description:
                "Action handler triggered when the settings button is clicked.",
        },
        onToggleTheme: {
            control: false,
            description: "Action handler toggling the light/dark theme state.",
        },
    },
    component: HeaderControls,
    parameters: {
        layout: "centered",
    },
    render: (args) => (
        <div className="bg-slate-900/40 p-8">
            <HeaderControls {...args} />
        </div>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof HeaderControls>;

export default meta;

export const LightTheme: Story = {};

export const DarkTheme: Story = {
    args: {
        isDark: true,
    },
};

export const VerticalLayout: Story = {
    args: {
        orientation: "vertical",
    },
};
