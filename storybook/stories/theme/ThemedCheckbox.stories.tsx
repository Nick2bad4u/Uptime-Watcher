import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";

import { ThemedCheckbox } from "@app/theme/components/ThemedCheckbox";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedCheckbox> = {
    args: {
        "aria-label": "Enable alerts",
        checked: false,
    },
    argTypes: {
        onChange: { action: "change" },
    },
    component: ThemedCheckbox,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedCheckbox>;

export default meta;

type Story = StoryObj;
type ThemedCheckboxProps = ComponentProps<typeof ThemedCheckbox>;

const CheckboxWithState = (args: ThemedCheckboxProps): ReactElement => {
    const { checked = false, onChange, ...rest } = args;
    const [isChecked, setIsChecked] = useState(checked);

    return (
        <label style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
            <ThemedCheckbox
                {...rest}
                checked={isChecked}
                onChange={(event) => {
                    setIsChecked(event.currentTarget.checked);
                    onChange?.(event);
                }}
            />
            <ThemedText>Enable downtime alerts</ThemedText>
        </label>
    );
};

export const Basic: Story = {
    render: (args) => <CheckboxWithState {...args} />,
};

export const Disabled: Story = {
    args: {
        "aria-label": "Subscription locked",
        checked: true,
        disabled: true,
    },
    render: (args) => (
        <label style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
            <ThemedCheckbox {...args} />
            <ThemedText variant="secondary">Requires Pro plan</ThemedText>
        </label>
    ),
};
