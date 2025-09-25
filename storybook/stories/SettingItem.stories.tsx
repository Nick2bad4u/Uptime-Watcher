import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";

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
type SettingItemProps = ComponentProps<typeof SettingItem>;

const WithSelectStory = (args: SettingItemProps): ReactElement => {
    const rest = { ...args };
    const [selectedInterval, setSelectedInterval] = useState<string>("1");

    return (
        <SettingItem
            {...rest}
            control={
                <ThemedSelect
                    aria-label="Check interval"
                    onChange={(event) => {
                        setSelectedInterval(event.target.value);
                    }}
                    value={selectedInterval}
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
};

export const CheckboxControl: Story = {};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const WithSelect: Story = {
    render: (args) => <WithSelectStory {...args} />,
};
