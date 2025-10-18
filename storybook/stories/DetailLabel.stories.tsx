import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX, ReactNode } from "react";

import type { ElectronAPI } from "../types/electron-api";

import { DetailLabel } from "@app/components/common/MonitorUiComponents";
import { useMount } from "@app/hooks/useMount";
import { useRef } from "react";
import { prepareMonitorTypeMocks } from "./setup/monitorTypeMocks";

prepareMonitorTypeMocks();

const meta: Meta<typeof DetailLabel> = {
    args: {
        details: "200",
        monitorType: "http",
    },
    component: DetailLabel,
    decorators: [
        (StoryComponent): JSX.Element => {
            prepareMonitorTypeMocks();
            return <StoryComponent />;
        },
    ],
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DetailLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HttpStatus: Story = {};

export const PingTarget: Story = {
    args: {
        details: "192.168.0.10",
        monitorType: "ping",
    },
};

const WithFormatFailure = ({
    children,
}: {
    readonly children: ReactNode;
}): JSX.Element => {
    type FormatMonitorDetail = ElectronAPI["monitoring"]["formatMonitorDetail"];

    const originalRef = useRef<FormatMonitorDetail | null>(null);

    useMount(
        () => {
            const monitoring = window.electronAPI.monitoring as unknown as {
                formatMonitorDetail: FormatMonitorDetail;
            };

            originalRef.current = monitoring.formatMonitorDetail;
            monitoring.formatMonitorDetail = async (): Promise<never> => {
                throw new Error("Simulated formatting failure");
            };
        },
        () => {
            if (originalRef.current) {
                const monitoring = window.electronAPI.monitoring as unknown as {
                    formatMonitorDetail: FormatMonitorDetail;
                };

                monitoring.formatMonitorDetail = originalRef.current;
            }
        }
    );

    return <>{children}</>;
};

export const WithFallback: Story = {
    args: {
        details: "dashboard service",
        fallback: "dashboard service",
        monitorType: "http",
    },
    render: (args): JSX.Element => (
        <WithFormatFailure>
            <DetailLabel {...args} />
        </WithFormatFailure>
    ),
};
