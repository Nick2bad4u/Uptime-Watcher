import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedInput } from "@app/theme/components/ThemedInput";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedInput> = {
    title: "Theme/ThemedInput",
    component: ThemedInput,
    args: {
        type: "text",
        placeholder: "https://status.example.com",
        "aria-label": "Site URL",
    },
    argTypes: {
        onChange: { action: "change" },
    },
    parameters: {
        layout: "padded",
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState(args.value ?? "");

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    width: "320px",
                }}
            >
                <label htmlFor="url-input">
                    <ThemedText variant="secondary">Monitor URL</ThemedText>
                </label>
                <ThemedInput
                    {...args}
                    id="url-input"
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        args.onChange?.(event);
                    }}
                    value={value}
                />
            </div>
        );
    },
};

export const NumberInput: Story = {
    args: {
        type: "number",
        min: 1,
        max: 60,
        step: 1,
        placeholder: "15",
        "aria-label": "Interval",
    },
    render: (args) => {
        const [value, setValue] = useState<number | string>(args.value ?? "");

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    width: "200px",
                }}
            >
                <label htmlFor="interval-input">
                    <ThemedText variant="secondary">
                        Check interval (minutes)
                    </ThemedText>
                </label>
                <ThemedInput
                    {...args}
                    id="interval-input"
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        args.onChange?.(event);
                    }}
                    value={value}
                />
            </div>
        );
    },
};
