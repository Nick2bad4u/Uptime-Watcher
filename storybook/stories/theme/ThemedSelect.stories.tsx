import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, Key, ReactElement } from "react";

import { ThemedSelect } from "@app/theme/components/ThemedSelect";
import { ThemedText } from "@app/theme/components/ThemedText";
import { useState } from "react";

const meta: Meta<typeof ThemedSelect> = {
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
    tags: ["autodocs"],
} satisfies Meta<typeof ThemedSelect>;

export default meta;

type Story = StoryObj<typeof meta>;
type ThemedSelectProps = ComponentProps<typeof ThemedSelect>;

type StoryArgsWithKey<TProps> = TProps & { key?: Key };

const MonitorTypeSelectStory = (args: ThemedSelectProps): ReactElement => {
    const {
        value = "http",
        onChange,
        id = "monitor-type",
        key: ignoredKey,
        ...rest
    } = args as StoryArgsWithKey<ThemedSelectProps>;
    void ignoredKey;
    const [selectedValue, setSelectedValue] = useState(value);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "260px",
            }}
        >
            <label htmlFor={id}>
                <ThemedText variant="secondary">Monitor type</ThemedText>
            </label>
            <ThemedSelect
                {...rest}
                id={id}
                onChange={(event) => {
                    setSelectedValue(event.currentTarget.value);
                    onChange?.(event);
                }}
                value={selectedValue}
            >
                <option value="http">HTTP</option>
                <option value="ping">Ping</option>
                <option value="tcp">TCP Port</option>
                <option value="dns">DNS</option>
            </ThemedSelect>
        </div>
    );
};

export const MonitorTypes: Story = {
    render: (args) => {
        const { key: ignoredKey, ...safeArgs } =
            args as StoryArgsWithKey<ThemedSelectProps>;
        void ignoredKey;

        return <MonitorTypeSelectStory {...safeArgs} />;
    },
};

export const Disabled: Story = {
    render: (args) => {
        const { key: ignoredKey, ...safeArgs } =
            args as StoryArgsWithKey<ThemedSelectProps>;
        void ignoredKey;

        return (
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
                    {...safeArgs}
                    disabled
                    id="disabled-select"
                    value="production"
                >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                </ThemedSelect>
            </div>
        );
    },
    args: {
        disabled: true,
        "aria-label": "Environment",
    },
};
