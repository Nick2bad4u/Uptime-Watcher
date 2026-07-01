import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";

import { ThemedInput } from "@app/theme/components/ThemedInput";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedInput> = {
    args: {
        "aria-label": "Site URL",
        placeholder: "https://status.example.com",
        type: "text",
    },
    argTypes: {
        onChange: { action: "change" },
    },
    component: ThemedInput,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedInput>;

export default meta;

type ControlledInputProps = ThemedInputProps & {
    readonly containerWidth: string;
    readonly label: string;
    readonly labelId: string;
};
type Story = StoryObj;

type ThemedInputProps = ComponentProps<typeof ThemedInput>;

const ControlledInputStory = (props: ControlledInputProps): ReactElement => {
    const {
        containerWidth,
        label,
        labelId,
        onChange,
        value = "",
        ...rest
    } = props;
    const [currentValue, setCurrentValue] = useState(value);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: containerWidth,
            }}
        >
            <label htmlFor={labelId}>
                <ThemedText variant="secondary">{label}</ThemedText>
            </label>
            <ThemedInput
                {...rest}
                id={labelId}
                onChange={(event) => {
                    setCurrentValue(event.currentTarget.value);
                    onChange?.(event);
                }}
                value={currentValue}
            />
        </div>
    );
};

export const Default: Story = {
    render: (args) => (
        <ControlledInputStory
            {...args}
            containerWidth="320px"
            label="Monitor URL"
            labelId="url-input"
        />
    ),
};

export const NumberInput: Story = {
    args: {
        "aria-label": "Interval",
        max: 60,
        min: 1,
        placeholder: "15",
        step: 1,
        type: "number",
    },
    render: (args) => (
        <ControlledInputStory
            {...args}
            containerWidth="200px"
            label="Check interval (minutes)"
            labelId="interval-input"
        />
    ),
};
