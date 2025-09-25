import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemedSelect } from "@app/theme/components/ThemedSelect";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedSelect> = {
    title: "Theme/ThemedSelect",
    component: ThemedSelect,
    args: {
        "aria-label": "Select monitor type",
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

export const MonitorTypes: Story = {
    render: (args) => {
        const [value, setValue] = useState(args.value ?? "http");

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    width: "260px",
                }}
            >
                <label htmlFor="monitor-type">
                    <ThemedText variant="secondary">Monitor type</ThemedText>
                </label>
                <ThemedSelect
                    {...args}
                    id="monitor-type"
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        args.onChange?.(event);
                    }}
                    value={value}
                >
                    <option value="http">HTTP</option>
                    <option value="ping">Ping</option>
                    <option value="tcp">TCP Port</option>
                    <option value="dns">DNS</option>
                </ThemedSelect>
            </div>
        );
    },
};

export const Disabled: Story = {
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "260px",
            }}
        >
            <label htmlFor="disabled-select">
                <ThemedText variant="secondary">Environment</ThemedText>
            </label>
            <ThemedSelect
                {...args}
                disabled
                id="disabled-select"
                value="production"
            >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
            </ThemedSelect>
        </div>
    ),
    args: {
        disabled: true,
        "aria-label": "Environment",
    },
};
