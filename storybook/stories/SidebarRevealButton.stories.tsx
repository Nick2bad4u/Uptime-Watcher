/**
 * Storybook stories validating SidebarRevealButton behaviour for collapsed and
 * expanded shell states.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { type JSX, useState } from "react";
import { action } from "storybook/actions";

import { SidebarLayoutProvider } from "../../src/components/Layout/SidebarLayoutProvider";
import { SidebarRevealButton } from "../../src/components/Layout/SidebarRevealButton/SidebarRevealButton";
import { ThemedButton } from "../../src/theme/components/ThemedButton";
import { ThemedText } from "../../src/theme/components/ThemedText";

interface SidebarRevealButtonStoryArgs {
    /** Whether the navigation sidebar is currently open. */
    readonly isSidebarOpen: boolean;
}

const meta: Meta<SidebarRevealButtonStoryArgs> = {
    args: {
        isSidebarOpen: false,
    },
    component: SidebarRevealButton,
    parameters: {
        layout: "centered",
    },
    render: function render(args: SidebarRevealButtonStoryArgs): JSX.Element {
        const [isSidebarOpen, setIsSidebarOpen] = useState(
            () => args.isSidebarOpen
        );

        const handleToggle = (): void => {
            const nextState = !isSidebarOpen;
            setIsSidebarOpen(nextState);
            action("sidebar/toggle")(nextState ? "open" : "close");
        };

        return (
            <SidebarLayoutProvider
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={handleToggle}
            >
                <div className="flex flex-col items-center gap-4">
                    <SidebarRevealButton />
                    <ThemedButton
                        onClick={handleToggle}
                        size="xs"
                        variant="secondary"
                    >
                        Toggle sidebar state
                    </ThemedButton>
                    <ThemedText size="xs" variant="secondary">
                        Sidebar is currently{" "}
                        {isSidebarOpen ? "expanded" : "collapsed"}
                    </ThemedText>
                </div>
            </SidebarLayoutProvider>
        );
    },
    tags: ["autodocs"],
} satisfies Meta<SidebarRevealButtonStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
    args: {
        isSidebarOpen: true,
    },
};
