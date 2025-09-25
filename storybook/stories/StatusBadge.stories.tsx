import type { MonitorStatus } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "../../src/components/common/StatusBadge";

const STATUS_OPTIONS: MonitorStatus[] = [
    "up",
    "pending",
    "degraded",
    "paused",
    "down",
];

const meta: Meta<typeof StatusBadge> = {
    args: {
        label: "Service",
        showIcon: true,
        size: "sm",
        status: "up" satisfies MonitorStatus,
    },
    argTypes: {
        formatter: { control: false },
        status: {
            control: "inline-radio",
            options: STATUS_OPTIONS,
        },
    },
    component: StatusBadge,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Components/Common/StatusBadge",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Up: Story = {
    args: {
        status: "up",
    },
};

export const Pending: Story = {
    args: {
        status: "pending",
    },
};

export const Down: Story = {
    args: {
        status: "down",
    },
};

export const WithoutIcon: Story = {
    args: {
        showIcon: false,
        status: "degraded",
    },
    parameters: {
        backgrounds: {
            default: "dark",
        },
    },
};
