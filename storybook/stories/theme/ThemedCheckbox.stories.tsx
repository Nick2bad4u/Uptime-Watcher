import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";

import { ThemedCheckbox } from "@app/theme/components/ThemedCheckbox";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedCheckbox> = {
    title: "Theme/ThemedCheckbox",
    component: ThemedCheckbox,
    args: {
        checked: false,
        "aria-label": "Enable alerts",
    },
    argTypes: {
        onChange: { action: "change" },
    },
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj<typeof meta>;
type ThemedCheckboxProps = ComponentProps<typeof ThemedCheckbox>;

const CheckboxWithState = (args: ThemedCheckboxProps): ReactElement => {
    const { checked = false, onChange, ...rest } = args;
    const [isChecked, setIsChecked] = useState(checked);

    return (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
        checked: true,
        disabled: true,
        "aria-label": "Subscription locked",
    },
    render: (args) => (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ThemedCheckbox {...args} />
            <ThemedText variant="secondary">Requires Pro plan</ThemedText>
        </label>
    ),
};
