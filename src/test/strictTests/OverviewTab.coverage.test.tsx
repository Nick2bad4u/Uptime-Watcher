/**
 * @file Coverage tests exercising interactive flows in the OverviewTab.
 */

import type { ChangeEventHandler, ReactNode } from "react";
import type { Monitor } from "@shared/types";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const availabilityMock = vi.hoisted(() => ({
    getAvailabilityColor: vi.fn(() => "#22c55e"),
    getAvailabilityVariant: vi.fn(() => "success" as const),
}));

vi.mock("../../theme/useTheme", () => ({
    useAvailabilityColors: () => availabilityMock,
    useTheme: () => ({
        currentTheme: {
            colors: {
                error: "#ef4444",
                primary: { 500: "#2563eb" },
                success: "#22c55e",
                warning: "#f59e0b",
            },
        },
    }),
}));

const statusIndicatorProps = vi.hoisted(() => [] as Record<string, unknown>[]);

vi.mock("../../theme/components/StatusIndicator", () => ({
    StatusIndicator: (props: Record<string, unknown>) => {
        statusIndicatorProps.push(props);
        return <span data-testid="status-indicator" />;
    },
}));

function createThemedComponent(testId: string) {
    return vi.fn(({ children, ...props }: { children?: ReactNode }) => (
        <div data-testid={testId} {...props}>
            {children}
        </div>
    ));
}

const ThemedCardMock = vi.hoisted(() => createThemedComponent("themed-card"));
const ThemedBadgeMock = vi.hoisted(() => createThemedComponent("themed-badge"));
const ThemedButtonMock = vi.hoisted(() =>
    vi.fn(
        ({
            children,
            onClick,
            ...props
        }: {
            children?: ReactNode;
            onClick?: () => void;
        }) => (
            <button
                data-testid="themed-button"
                onClick={onClick}
                type="button"
                {...props}
            >
                {children}
            </button>
        )
    )
);
const ThemedInputMock = vi.hoisted(() =>
    vi.fn(
        ({
            onChange,
            ...props
        }: {
            onChange?: ChangeEventHandler<HTMLInputElement>;
        }) => (
            <input data-testid="themed-input" onChange={onChange} {...props} />
        )
    )
);
const ThemedProgressMock = vi.hoisted(() =>
    createThemedComponent("themed-progress")
);
const ThemedSelectMock = vi.hoisted(() =>
    vi.fn(
        ({
            children,
            onChange,
            ...props
        }: {
            children?: ReactNode;
            onChange?: ChangeEventHandler<HTMLSelectElement>;
        }) => (
            <select data-testid="themed-select" onChange={onChange} {...props}>
                {children}
            </select>
        )
    )
);
const ThemedTextMock = vi.hoisted(() => createThemedComponent("themed-text"));

vi.mock("../../theme/components/ThemedCard", () => ({
    ThemedCard: ThemedCardMock,
}));
vi.mock("../../theme/components/ThemedBadge", () => ({
    ThemedBadge: ThemedBadgeMock,
}));
vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: ThemedButtonMock,
}));
vi.mock("../../theme/components/ThemedInput", () => ({
    ThemedInput: ThemedInputMock,
}));
vi.mock("../../theme/components/ThemedProgress", () => ({
    ThemedProgress: ThemedProgressMock,
}));
vi.mock("../../theme/components/ThemedSelect", () => ({
    ThemedSelect: ThemedSelectMock,
}));
vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: ThemedTextMock,
}));

const loggerAction = vi.hoisted(() => vi.fn());

vi.mock("../../services/logger", () => ({
    logger: {
        user: {
            action: loggerAction,
        },
    },
}));

import { OverviewTab } from "../../components/SiteDetails/tabs/OverviewTab";

describe("OverviewTab coverage", () => {
    beforeEach(() => {
        availabilityMock.getAvailabilityColor.mockClear();
        availabilityMock.getAvailabilityVariant.mockClear();
        statusIndicatorProps.length = 0;
        ThemedButtonMock.mockClear();
        ThemedSelectMock.mockClear();
        ThemedInputMock.mockClear();
        loggerAction.mockClear();
    });

    it("renders site metrics and processes user interactions", async () => {
        const handleIntervalChange = vi.fn();
        const handleRemoveMonitor = vi.fn().mockResolvedValue(undefined);
        const handleSaveInterval = vi.fn().mockResolvedValue(undefined);
        const handleSaveTimeout = vi.fn().mockResolvedValue(undefined);
        const handleTimeoutChange = vi.fn();
        const onCheckNow = vi.fn();

        const selectedMonitor = {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 120,
            retryAttempts: 0,
            status: "up",
            timeout: 30_000,
            type: "http",
            url: "https://primary.example",
        } as unknown as Monitor;

        render(
            <OverviewTab
                avgResponseTime={240}
                fastestResponse={90}
                formatResponseTime={(value) => `${value} ms`}
                handleIntervalChange={handleIntervalChange}
                handleRemoveMonitor={handleRemoveMonitor}
                handleSaveInterval={handleSaveInterval}
                handleSaveTimeout={handleSaveTimeout}
                handleTimeoutChange={handleTimeoutChange}
                intervalChanged
                isLoading={false}
                localCheckInterval={60_000}
                localTimeout={45}
                onCheckNow={onCheckNow}
                selectedMonitor={selectedMonitor}
                slowestResponse={520}
                timeoutChanged
                totalChecks={128}
                uptime="99.8"
            />
        );

        expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
        expect(statusIndicatorProps[0]).toMatchObject({
            showText: true,
            size: "lg",
            status: "up",
        });

        fireEvent.change(screen.getByTestId("themed-select"), {
            target: { value: "120000" },
        });
        expect(handleIntervalChange).toHaveBeenCalledTimes(1);

        fireEvent.change(screen.getByTestId("themed-input"), {
            target: { value: "50" },
        });
        expect(handleTimeoutChange).toHaveBeenCalledTimes(1);

        const saveButtons = screen.getAllByText("Save");
        expect(saveButtons).toHaveLength(2);
        fireEvent.click(saveButtons[0]!);
        fireEvent.click(saveButtons[1]!);
        expect(handleSaveInterval).toHaveBeenCalledTimes(1);
        expect(handleSaveTimeout).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Check Now"));
        expect(onCheckNow).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Remove Monitor"));
        expect(handleRemoveMonitor).toHaveBeenCalledTimes(1);
        expect(loggerAction).toHaveBeenCalledWith(
            "Monitor removal button clicked from overview tab",
            expect.objectContaining({
                monitorId: "monitor-1",
                monitorType: "http",
                monitorUrl: "https://primary.example",
            })
        );

        expect(availabilityMock.getAvailabilityColor).toHaveBeenCalled();
        expect(availabilityMock.getAvailabilityVariant).toHaveBeenCalled();
    });
});
