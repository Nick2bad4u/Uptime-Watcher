import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Monitor, MonitorStatus, Site } from "@shared/types";
import type { SiteTableRowProperties } from "../../../../components/Dashboard/SiteList/SiteTableRow";
import { SiteTableRow } from "../../../../components/Dashboard/SiteList/SiteTableRow";
import { useSite } from "../../../../hooks/site/useSite";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../hooks/site/useSite", () => ({
    useSite: vi.fn(),
}));

const monitorSelectorCalls: { selectedMonitorId: string }[] = [];
const marqueeTextCalls: string[] = [];
interface MockActionButtonGroupProps {
    allMonitorsRunning: boolean;
    disabled: boolean;
    isLoading: boolean;
    isMonitoring: boolean;
    onCheckNow: () => void;
    onStartMonitoring: () => void;
    onStartSiteMonitoring: () => void;
    onStopMonitoring: () => void;
    onStopSiteMonitoring: () => void;
}

let actionButtonProps: MockActionButtonGroupProps | undefined;

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => ({
        MonitorSelector: ({
            className,
            onChange,
            selectedMonitorId,
        }: {
            readonly className?: string;
            readonly onChange: (event: { target: { value: string } }) => void;
            readonly selectedMonitorId: string;
        }) => {
            monitorSelectorCalls.push({ selectedMonitorId });
            return (
                <button
                    className={className}
                    data-testid="monitor-selector"
                    onClick={() => onChange({ target: { value: "monitor-2" } })}
                    type="button"
                >
                    selector:{selectedMonitorId}
                </button>
            );
        },
    })
);

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => ({
        ActionButtonGroup: (props: MockActionButtonGroupProps) => {
            actionButtonProps = props;
            return (
                <div
                    data-disabled={props.disabled}
                    data-testid="action-button-group"
                >
                    <button onClick={props.onCheckNow} type="button">
                        check-now
                    </button>
                </div>
            );
        },
    })
);

vi.mock("../../../../components/common/MarqueeText/MarqueeText", () => ({
    MarqueeText: ({ text }: { readonly text: string }) => {
        marqueeTextCalls.push(text);
        return <span data-testid="marquee-text">{text}</span>;
    },
}));

vi.mock("../../../../components/common/StatusBadge", () => ({
    StatusBadge: ({
        formatter,
        label,
        status,
    }: {
        readonly formatter: (label: string, status: string) => string;
        readonly label: string;
        readonly status: string;
    }) => <span data-testid="status-badge">{formatter(label, status)}</span>,
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({
        children,
        className,
        ...rest
    }: {
        readonly children?: ReactNode;
        readonly className?: string;
    } & Record<string, unknown>) => {
        const {
            size: _size,
            variant: _variant,
            weight: _weight,
            ...domProps
        } = rest;
        return (
            <span className={className} data-testid="themed-text" {...domProps}>
                {children}
            </span>
        );
    },
}));

const mockUseSite = vi.mocked(useSite);

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: overrides.checkInterval ?? 60_000,
    history: overrides.history ?? [],
    id: overrides.id ?? "monitor-primary",
    monitoring: overrides.monitoring ?? true,
    responseTime: overrides.responseTime ?? 120,
    retryAttempts: overrides.retryAttempts ?? 0,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 10_000,
    type: overrides.type ?? "http",
    ...overrides,
});

const baseSite: Site = {
    identifier: "alpha-site",
    monitoring: true,
    monitors: [
        createMonitor({ id: "monitor-1", monitoring: true }),
        createMonitor({ id: "monitor-2", monitoring: true }),
    ],
    name: "Alpha Observatory",
};

interface MockUseSiteState {
    handleCardClick: ReturnType<typeof vi.fn>;
    handleCheckNow: ReturnType<typeof vi.fn>;
    handleMonitorIdChange: ReturnType<typeof vi.fn>;
    handleStartMonitoring: ReturnType<typeof vi.fn>;
    handleStartSiteMonitoring: ReturnType<typeof vi.fn>;
    handleStopMonitoring: ReturnType<typeof vi.fn>;
    handleStopSiteMonitoring: ReturnType<typeof vi.fn>;
    isLoading: boolean;
    isMonitoring: boolean;
    latestSite: Site;
    monitor: Monitor | undefined;
    responseTime: number | undefined;
    selectedMonitorId: string;
    status: MonitorStatus;
    uptime: number;
}

const createHookState = (
    overrides: Partial<MockUseSiteState> = {}
): MockUseSiteState => ({
    handleCardClick: vi.fn(),
    handleCheckNow: vi.fn(),
    handleMonitorIdChange: vi.fn(),
    handleStartMonitoring: vi.fn(),
    handleStartSiteMonitoring: vi.fn(),
    handleStopMonitoring: vi.fn(),
    handleStopSiteMonitoring: vi.fn(),
    isLoading: overrides.isLoading ?? false,
    isMonitoring: overrides.isMonitoring ?? true,
    latestSite: overrides.latestSite ?? baseSite,
    monitor: Object.hasOwn(overrides, "monitor")
        ? overrides.monitor!
        : baseSite.monitors[0],
    responseTime: Object.hasOwn(overrides, "responseTime")
        ? overrides.responseTime!
        : 88,
    selectedMonitorId: overrides.selectedMonitorId ?? "monitor-1",
    status: overrides.status ?? "up",
    uptime: overrides.uptime ?? 99.9,
});

const renderRow = (
    hookOverrides?: Partial<MockUseSiteState>,
    componentOverrides?: Partial<SiteTableRowProperties>
) => {
    const hookState = createHookState(hookOverrides);
    mockUseSite.mockReturnValue(
        hookState as unknown as ReturnType<typeof useSite>
    );

    const siteProp = componentOverrides?.site ?? baseSite;
    const rowOrderProps =
        componentOverrides?.rowOrder === undefined
            ? {}
            : { rowOrder: componentOverrides.rowOrder };
    const rowVariantProps =
        componentOverrides?.rowVariant === undefined
            ? {}
            : { rowVariant: componentOverrides.rowVariant };

    return {
        hookState,
        ...render(
            <table>
                <tbody>
                    <SiteTableRow
                        {...rowOrderProps}
                        {...rowVariantProps}
                        site={siteProp}
                    />
                </tbody>
            </table>
        ),
    };
};

describe(SiteTableRow, () => {
    beforeEach(() => {
        mockUseSite.mockReset();
        monitorSelectorCalls.length = 0;
        marqueeTextCalls.length = 0;
        actionButtonProps = undefined;
    });

    it("renders core metrics and passes state to action buttons", () => {
        renderRow();

        expect(screen.queryByText(baseSite.identifier)).not.toBeInTheDocument();
        expect(screen.getByText("99.9%")).toBeInTheDocument();
        expect(screen.getByText("88 ms")).toBeInTheDocument();
        expect(screen.getByText("2/2")).toBeInTheDocument();
        expect(marqueeTextCalls.at(-1)).toBe(baseSite.name);
        expect(monitorSelectorCalls.at(-1)?.selectedMonitorId).toBe(
            "monitor-1"
        );
        expect(actionButtonProps).toMatchObject({
            allMonitorsRunning: true,
            disabled: false,
            isLoading: false,
            isMonitoring: true,
        });
    });

    it("disables controls and falls back to em dash when no monitor is active", () => {
        const monitors: Monitor[] = [
            createMonitor({ id: "monitor-1", monitoring: true }),
            createMonitor({ id: "monitor-2", monitoring: false }),
        ];
        const customSite: Site = {
            ...baseSite,
            monitors,
        };
        renderRow(
            {
                latestSite: customSite,
                monitor: undefined,
                responseTime: undefined,
            },
            { site: customSite }
        );

        expect(screen.getByText("—")).toBeInTheDocument();
        expect(actionButtonProps).toMatchObject({
            allMonitorsRunning: false,
            disabled: true,
        });
    });

    it("activates the row via clicks and keyboard interactions", async () => {
        const { hookState } = renderRow();
        const user = userEvent.setup();
        const row = screen.getByRole("row");

        await user.click(row);
        expect(hookState.handleCardClick).toHaveBeenCalledTimes(1);

        hookState.handleCardClick.mockClear();
        const siteTrigger = screen.getByText("View details").closest("button");
        if (!siteTrigger) {
            throw new Error("Expected site trigger button to exist");
        }
        await user.click(siteTrigger);
        expect(hookState.handleCardClick).toHaveBeenCalledTimes(1);

        hookState.handleCardClick.mockClear();
        fireEvent.keyDown(row, { key: "A" });
        expect(hookState.handleCardClick).not.toHaveBeenCalled();
        fireEvent.keyDown(row, { key: "Enter" });
        fireEvent.keyDown(row, { key: " " });
        expect(hookState.handleCardClick).toHaveBeenCalledTimes(2);
    });

    it("applies surface order style and zebra variants", () => {
        renderRow(undefined, { rowOrder: 3, rowVariant: "odd" });

        const row = screen.getByRole("row");
        expect(row).toHaveClass("site-table__row--odd");
        expect(row).toHaveStyle("--surface-order: 3");
    });

    it("propagates monitor selection changes without activating the row", async () => {
        const { hookState } = renderRow();
        const user = userEvent.setup();

        await user.click(screen.getByTestId("monitor-selector"));

        expect(hookState.handleMonitorIdChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { value: "monitor-2" } })
        );
        expect(hookState.handleCardClick).not.toHaveBeenCalled();
    });

    it("ignores keyboard activation originating from interactive children", () => {
        const { hookState } = renderRow();

        fireEvent.keyDown(screen.getByTestId("monitor-selector"), {
            key: "Enter",
        });

        expect(hookState.handleCardClick).not.toHaveBeenCalled();
    });

    it("passes loading flags and fallback metrics when site data is incomplete", () => {
        const monitors: Monitor[] = [
            createMonitor({ id: "primary", monitoring: true }),
            createMonitor({ id: "secondary", monitoring: false }),
        ];
        const latestSite: Site = { ...baseSite, monitors };

        renderRow(
            {
                isLoading: true,
                isMonitoring: false,
                latestSite,
                monitor: undefined,
                responseTime: undefined,
                uptime: Number.NaN,
            },
            { site: latestSite }
        );

        expect(screen.getByText("NaN%")).toBeInTheDocument();
        expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("1/2")).toBeInTheDocument();
        expect(actionButtonProps).toMatchObject({
            disabled: true,
            isLoading: true,
            isMonitoring: false,
        });
    });
});
