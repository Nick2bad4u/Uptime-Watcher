import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";

import { FormErrorAlert } from "@app/components/shared/FormErrorAlert";
import { ThemedButton } from "@app/theme/components/ThemedButton";
import { useState } from "react";
import { action } from "storybook/actions";

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
} satisfies Meta<typeof FormErrorAlert>;

export default meta;

type Story = StoryObj<typeof meta>;
type FormErrorAlertProps = ComponentProps<typeof FormErrorAlert>;

const InteractiveStory = (args: FormErrorAlertProps): ReactElement => {
    const { error, onClearError, ...rest } = args;
    const [message, setMessage] = useState<string | null>(error ?? null);

    const handleClear = (): void => {
        setMessage(null);
        onClearError?.();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <FormErrorAlert
                {...rest}
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
};

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
    render: (args) => <InteractiveStory {...args} />,
};
