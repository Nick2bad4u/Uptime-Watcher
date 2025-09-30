import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { Fragment, type ReactElement } from "react";

import { ConditionalResponseTime } from "../../src/components/common/MonitorUiComponents";
import { ThemedText } from "../../src/theme/components/ThemedText";
import { prepareMonitorTypeMocks } from "./setup/monitorTypeMocks";

prepareMonitorTypeMocks();

const reapplyMonitorMocks: Decorator = (Story): ReactElement => {
    prepareMonitorTypeMocks();
    return <Story />;
};

const meta: Meta<typeof ConditionalResponseTime> = {
    args: {
        fallback: (
            <ThemedText size="sm" variant="secondary">
                Response time not available for this monitor type.
            </ThemedText>
        ),
        monitorType: "http",
    },
    component: ConditionalResponseTime,
    decorators: [reapplyMonitorMocks],
    parameters: {
        layout: "centered",
    },
    render: (args) => (
        <ConditionalResponseTime {...args}>
            <ThemedText size="sm" variant="primary">
                Response time analytics are available.
            </ThemedText>
        </ConditionalResponseTime>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof ConditionalResponseTime>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SupportsResponseTime: Story = {};

export const WithoutSupport: Story = {
    args: {
        monitorType: "ping",
    },
};

export const CustomFallback: Story = {
    args: {
        fallback: (
            <Fragment>
                <ThemedText size="sm" variant="secondary">
                    Lightweight checks do not track response time.
                </ThemedText>
                <ThemedText size="xs" variant="secondary">
                    Consider switching to the HTTP monitor to see latency data.
                </ThemedText>
            </Fragment>
        ),
        monitorType: "ping",
    },
};
