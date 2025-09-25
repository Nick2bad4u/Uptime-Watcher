import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { action } from "storybook/actions";

import { FormErrorAlert } from "../../src/components/shared/FormErrorAlert";
import { ThemedButton } from "../../src/theme/components/ThemedButton";

const meta: Meta<typeof FormErrorAlert> = {
    args: {
        error: "Failed to save changes. Please try again.",
        isDark: false,
        onClearError: action("clear-error"),
    },
    component: FormErrorAlert,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Components/Shared/FormErrorAlert",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkTheme: Story = {
    args: {
        isDark: true,
    },
    parameters: {
        backgrounds: {
            default: "dark",
        },
    },
};

export const Interactive: Story = {
    args: {
        error: "Validation failed: URL is required.",
    },
    render: (args) => {
        const [message, setMessage] = useState<string | null>(args.error);

        const handleClear = (): void => {
            setMessage(null);
            if (args.onClearError) {
                args.onClearError();
            }
        };

        return (
            <div className="flex flex-col items-center gap-4">
                <FormErrorAlert
                    {...args}
                    error={message}
                    onClearError={handleClear}
                />
                <ThemedButton
                    onClick={() =>
                        setMessage("Validation failed: URL is required.")
                    }
                    size="sm"
                    variant="secondary"
                >
                    Trigger Error
                </ThemedButton>
            </div>
        );
    },
};
