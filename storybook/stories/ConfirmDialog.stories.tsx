/**
 * Storybook coverage for the shared ConfirmDialog overlay.
 */

import type { ConfirmDialogTone } from "@app/stores/ui/useConfirmDialogStore";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { ConfirmDialog } from "@app/components/common/ConfirmDialog/ConfirmDialog";
import { useConfirmDialogStore } from "@app/stores/ui/useConfirmDialogStore";
import { useEffect } from "react";

interface ConfirmDialogStoryArgs {
    tone: ConfirmDialogTone;
    withDetails: boolean;
}

type Story = StoryObj<typeof meta>;

const withDialogState: Decorator = (StoryComponent, context) => {
    const args = context.args as Partial<ConfirmDialogStoryArgs> | undefined;
    const tone = args?.tone ?? "default";
    const withDetails = args?.withDetails ?? false;

    useEffect(
        function openConfirmDialog(): () => void {
            const request = {
                cancelLabel: "Cancel",
                confirmLabel: tone === "danger" ? "Delete" : "Confirm",
                message:
                    tone === "danger"
                        ? "Are you sure you want to remove the selected site?"
                        : "Do you want to enable response time analytics for all monitors?",
                title: tone === "danger" ? "Delete Site" : "Enable Analytics",
                tone,
                ...(withDetails
                    ? {
                          details:
                              "This action cannot be undone and will remove all monitoring history.",
                      }
                    : {}),
            } satisfies ReturnType<
                typeof useConfirmDialogStore.getState
            >["request"];

            useConfirmDialogStore.setState({
                request,
                resolve: () => {
                    // Storybook preview only
                },
            });

            return function resetConfirmDialog(): void {
                useConfirmDialogStore.setState({
                    request: null,
                    resolve: null,
                });
            };
        },
        [tone, withDetails]
    );

    return <StoryComponent />;
};

const meta: Meta<ConfirmDialogStoryArgs> = {
    args: {
        tone: "default",
        withDetails: false,
    },
    component: ConfirmDialog,
    decorators: [withDialogState],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<ConfirmDialogStoryArgs>;

export default meta;

export const Standard: Story = {};

export const Danger: Story = {
    args: {
        tone: "danger",
        withDetails: true,
    },
};
