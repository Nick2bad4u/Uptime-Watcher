import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { SettingItem } from "../../src/components/shared/SettingItem";
import { ThemedCheckbox } from "../../src/theme/components/ThemedCheckbox";
import { ThemedSelect } from "../../src/theme/components/ThemedSelect";

const meta: Meta<typeof SettingItem> = {
    args: {
        control: (
            <ThemedCheckbox
                aria-label="Enable monitoring"
                checked
                onChange={() => {
                    /* preview only */
                }}
            />
        ),
        description:
            "Toggle real-time monitoring for all configured endpoints.",
        title: "Real-time monitoring",
    },
    component: SettingItem,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Components/Shared/SettingItem",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const CheckboxControl: Story = {};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const WithSelect: Story = {
    render: (args) => {
        const [interval, setInterval] = useState<string>("1");

        return (
            <SettingItem
                {...args}
                control={
                    <ThemedSelect
                        aria-label="Check interval"
                        onChange={(event) => {
                            setInterval(event.target.value);
                        }}
                        value={interval}
                    >
                        <option value="1">Every minute</option>
                        <option value="5">Every 5 minutes</option>
                        <option value="15">Every 15 minutes</option>
                    </ThemedSelect>
                }
                description="Choose how often uptime checks should run."
                title="Check interval"
            />
        );
    },
};
