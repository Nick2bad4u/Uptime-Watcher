import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { useState } from "react";
import { action } from "storybook/actions";

import { ErrorAlert } from "../../src/components/common/ErrorAlert/ErrorAlert";
import { ThemedText } from "../../src/theme/components/ThemedText";

const meta: Meta<typeof ErrorAlert> = {
    args: {
        message: "Failed to load monitor data.",
        variant: "error",
    },
    argTypes: {
        variant: {
            control: "radio",
            options: [
                "error",
                "warning",
                "info",
            ],
        },
    },
    component: ErrorAlert,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Components/Common/ErrorAlert",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ErrorVariant: Story = {};

export const Warning: Story = {
    args: {
        message: "Latency is increasing beyond the warning threshold.",
        variant: "warning",
    },
};

export const Informational: Story = {
    args: {
        message: "All systems operational. Next check scheduled soon.",
        variant: "info",
    },
};

export const Dismissible: Story = {
    args: {
        message: "SSL certificate expires in 7 days.",
        onDismiss: action("dismiss"),
        variant: "warning",
    },
    render: (args): JSX.Element => {
        const [visible, setVisible] = useState<boolean>(true);

        if (!visible) {
            return (
                <ThemedText size="sm" variant="secondary">
                    Alert dismissed
                </ThemedText>
            );
        }

        return (
            <ErrorAlert
                {...args}
                onDismiss={() => {
                    setVisible(false);
                    if (args.onDismiss) {
                        args.onDismiss();
                    }
                }}
            />
        );
    },
};
