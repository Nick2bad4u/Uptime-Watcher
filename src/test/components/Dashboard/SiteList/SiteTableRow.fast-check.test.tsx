/**
 * Fast-check tests for the SiteTableRow component covering runtime behavior and
 * event handling under diverse site monitor configurations.
 */

import type {
    Monitor,
    MonitorStatus,
    Site,
    StatusHistory,
} from "@shared/types";
import type { ChangeEvent } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";

import { getMonitorRuntimeSummary } from "../../../../utils/monitoring/monitorRuntime";
import { toSentenceCase } from "../../../../utils/text/toSentenceCase";
import type { UseSiteResult } from "../../../../hooks/site/useSite";

interface MarqueeStubProps {
    readonly dependencies: readonly unknown[];
    readonly text: string;
}

interface MonitorSelectorStubProps {
    readonly monitors: Monitor[];
    readonly onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    readonly selectedMonitorId: string;
}

interface StatusBadgeStubProps {
    readonly formatter: (label: string, status: MonitorStatus) => string;
    readonly label: string;
    readonly status: MonitorStatus;
}

interface ActionButtonGroupStubProps {
    readonly allMonitorsRunning: boolean;
    readonly disabled: boolean;
    readonly isLoading: boolean;
    readonly isMonitoring: boolean;
    readonly onCheckNow: () => void;
    readonly onStartMonitoring: () => void;
    readonly onStartSiteMonitoring: () => void;
    readonly onStopMonitoring: () => void;
    readonly onStopSiteMonitoring: () => void;
}

const marqueeCalls: MarqueeStubProps[] = [];
const monitorSelectorCalls: MonitorSelectorStubProps[] = [];
const statusBadgeCalls: StatusBadgeStubProps[] = [];
const actionGroupCalls: ActionButtonGroupStubProps[] = [];

vi.mock("../../../../components/common/MarqueeText/MarqueeText", () => {
    const component = vi.fn((props: MarqueeStubProps) => {
        marqueeCalls.push(props);
        return <div data-testid="marquee-text-stub">{props.text}</div>;
    });
    return { MarqueeText: component };
});

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => {
        const component = vi.fn((props: MonitorSelectorStubProps) => {
            monitorSelectorCalls.push(props);
            return (
                <div data-testid="monitor-selector-stub">
                    <button
                        data-prevent-row-activation
                        data-testid="monitor-selector-trigger"
                        onClick={() =>
                            props.onChange({
                                target: {
                                    value:
                                        props.monitors[0]?.id ??
                                        "unknown-monitor",
                                },
                            } as ChangeEvent<HTMLSelectElement>)
                        }
                        type="button"
                    >
                        Monitors
                    </button>
                </div>
            );
        });
        return { MonitorSelector: component };
    }
);

vi.mock("../../../../components/common/StatusBadge", () => {
    const component = vi.fn((props: StatusBadgeStubProps) => {
        statusBadgeCalls.push(props);
        return (
            <div data-testid="status-badge-stub">
                {props.formatter(props.label, props.status)}
            </div>
        );
    });
    return { StatusBadge: component };
});

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => {
        const component = vi.fn((props: ActionButtonGroupStubProps) => {
            actionGroupCalls.push(props);
            return (
                <div data-testid="action-group-stub">
                    <button
                        data-prevent-row-activation
                        data-testid="action-group-check"
                        onClick={props.onCheckNow}
                        type="button"
                    >
                        Check
                    </button>
                </div>
            );
        });
        return { ActionButtonGroup: component };
    }
);

vi.mock("../../../../hooks/site/useSite", async () => {
    const actual = await vi.importActual<
        typeof import("../../../../hooks/site/useSite")
    >("../../../../hooks/site/useSite");
    return {
        ...actual,
        useSite: vi.fn(),
    };
});

const { useSite } = await import("../../../../hooks/site/useSite");
const mockUseSite = vi.mocked(useSite);

const { SiteTableRow } = await import(
    "../../../../components/Dashboard/SiteList/SiteTableRow"
);

const identifierArbitrary = fc
    .string({ maxLength: 24, minLength: 1 })
    .filter((value) => /^[\w-]+$/.test(value));

const nameArbitrary = fc
    .string({ maxLength: 32, minLength: 1 })
    .filter((value) => /\S/.test(value));

const statusArbitrary = fc.constantFrom<MonitorStatus>(
    "up",
    "down",
    "degraded",
    "pending",
    "paused"
);

const responseTimeArbitrary = fc.option(fc.integer({ max: 5000, min: 0 }), {
    nil: undefined,
});

const THOUSAND = 1000;
const MAX_INTERVAL = 600 * THOUSAND;
const MAX_TIMEOUT = 120 * THOUSAND;

const statusHistoryStatusArbitrary = fc.constantFrom<StatusHistory["status"]>(
    "up",
    "down",
    "degraded"
);

const historyArbitrary = fc.array(
    fc.record({
        details: fc.option(fc.string({ maxLength: 24 }), { nil: undefined }),
        responseTime: fc.integer({ max: 6000, min: 0 }),
        status: statusHistoryStatusArbitrary,
        timestamp: fc.integer({
            max: 1_900_000_000_000,
            min: 1_600_000_000_000,
        }),
    }) as fc.Arbitrary<StatusHistory>,
    { maxLength: 3, minLength: 1 }
);

const monitorArbitrary = fc
    .record({
        checkInterval: fc.integer({ max: MAX_INTERVAL, min: THOUSAND }),
        history: historyArbitrary,
        id: identifierArbitrary,
        monitoring: fc.boolean(),
        responseTime: fc.integer({ max: 8000, min: 0 }),
        retryAttempts: fc.integer({ max: 5, min: 0 }),
        status: statusArbitrary,
        timeout: fc.integer({ max: MAX_TIMEOUT, min: THOUSAND }),
        type: fc.constant("http" as const),
        url: fc.constant("https://example.com"),
    })
    .map((raw) => raw as Monitor);

const siteScenarioArbitrary = fc.record({
    includeMonitor: fc.boolean(),
    isLoading: fc.boolean(),
    isMonitoring: fc.boolean(),
    latestSiteName: nameArbitrary,
    monitors: fc.array(monitorArbitrary, { maxLength: 4, minLength: 1 }),
    responseTime: responseTimeArbitrary,
    siteIdentifier: identifierArbitrary,
    siteMonitoring: fc.boolean(),
    siteName: nameArbitrary,
    status: statusArbitrary,
    uptime: fc.integer({ max: 100, min: 0 }),
});

describe("SiteTableRow fast-check coverage", () => {
    fcTest.prop([siteScenarioArbitrary])(
        "renders monitor summary rows with consistent handlers",
        async ({
            includeMonitor,
            isLoading,
            isMonitoring,
            latestSiteName,
            monitors,
            responseTime,
            siteIdentifier,
            siteMonitoring,
            siteName,
            status,
            uptime,
        }) => {
            marqueeCalls.length = 0;
            monitorSelectorCalls.length = 0;
            statusBadgeCalls.length = 0;
            actionGroupCalls.length = 0;
            mockUseSite.mockReset();

            const handleCardClick = vi.fn();
            const handleCheckNow = vi.fn();
            const handleMonitorIdChange = vi.fn();
            const handleStartMonitoring = vi.fn();
            const handleStartSiteMonitoring = vi.fn();
            const handleStopMonitoring = vi.fn();
            const handleStopSiteMonitoring = vi.fn();

            const selectedMonitor = includeMonitor ? monitors[0] : undefined;
            const selectedMonitorId = selectedMonitor?.id ?? monitors[0]!.id;
            const filteredHistory = selectedMonitor?.history ?? [];

            const baseSite: Site = {
                identifier: siteIdentifier,
                monitoring: siteMonitoring,
                monitors,
                name: siteName,
            };

            const latestSite: Site = {
                identifier: siteIdentifier,
                monitoring: siteMonitoring,
                monitors,
                name: latestSiteName,
            };

            const useSiteResult: UseSiteResult = {
                averageResponseTime: 0,
                checkCount: filteredHistory.length,
                filteredHistory,
                handleCardClick,
                handleCheckNow,
                handleMonitorIdChange,
                handleStartMonitoring,
                handleStartSiteMonitoring,
                handleStopMonitoring,
                handleStopSiteMonitoring,
                isLoading,
                isMonitoring,
                latestSite,
                monitor: selectedMonitor,
                monitorIds: monitors.map((monitor) => monitor.id),
                responseTime,
                selectedMonitorId,
                status,
                uptime,
            };

            mockUseSite.mockReturnValue(useSiteResult);

            const { unmount } = render(
                <table>
                    <tbody>
                        <SiteTableRow site={baseSite} />
                    </tbody>
                </table>
            );

            expect(mockUseSite).toHaveBeenCalledWith(baseSite);

            const marqueeCall = marqueeCalls.at(-1);
            expect(marqueeCall).toBeDefined();
            expect(marqueeCall?.text).toBe(latestSite.name);
            expect(marqueeCall?.dependencies).toEqual([
                latestSite.name,
                baseSite.identifier,
            ]);

            const statusBadgeCall = statusBadgeCalls.at(-1);
            expect(statusBadgeCall).toBeDefined();
            const customLabel = "Runtime";
            expect(statusBadgeCall?.formatter(customLabel, status)).toBe(
                `${customLabel}: ${toSentenceCase(status)}`
            );

            const monitorSelectorCall = monitorSelectorCalls.at(-1);
            expect(monitorSelectorCall).toBeDefined();
            expect(monitorSelectorCall?.monitors).toEqual(latestSite.monitors);
            expect(monitorSelectorCall?.selectedMonitorId).toBe(
                selectedMonitorId
            );

            monitorSelectorCall?.onChange({
                target: { value: monitors[0]!.id },
            } as ChangeEvent<HTMLSelectElement>);
            expect(handleMonitorIdChange).toHaveBeenCalledTimes(1);

            const actionGroupCall = actionGroupCalls.at(-1);
            expect(actionGroupCall).toBeDefined();

            const runtimeSummary = getMonitorRuntimeSummary(
                latestSite.monitors
            );
            expect(actionGroupCall?.allMonitorsRunning).toBe(
                runtimeSummary.allRunning
            );
            expect(actionGroupCall?.disabled).toBe(!selectedMonitor);
            expect(actionGroupCall?.isLoading).toBe(isLoading);
            expect(actionGroupCall?.isMonitoring).toBe(isMonitoring);
            expect(actionGroupCall?.onCheckNow).toBe(handleCheckNow);
            expect(actionGroupCall?.onStartMonitoring).toBe(
                handleStartMonitoring
            );
            expect(actionGroupCall?.onStartSiteMonitoring).toBe(
                handleStartSiteMonitoring
            );
            expect(actionGroupCall?.onStopMonitoring).toBe(
                handleStopMonitoring
            );
            expect(actionGroupCall?.onStopSiteMonitoring).toBe(
                handleStopSiteMonitoring
            );

            const expectedResponseText =
                typeof responseTime === "number" && responseTime > 0
                    ? `${responseTime} ms`
                    : "—";
            expect(
                screen.getByText(expectedResponseText, { exact: true })
            ).toBeInTheDocument();

            expect(
                screen.getByText(`${uptime}%`, { exact: true })
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    `${runtimeSummary.runningCount}/${runtimeSummary.totalCount}`,
                    { exact: true }
                )
            ).toBeInTheDocument();

            handleCardClick.mockClear();
            const expectedRowAccessibleName =
                `Open details for ${latestSite.name}`
                    .replaceAll(/\s+/gu, " ")
                    .trim();
            const rowElement = screen.getByRole("row", {
                name: expectedRowAccessibleName,
            });
            expect(rowElement).toHaveAccessibleName(expectedRowAccessibleName);
            expect(rowElement.getAttribute("aria-label")).toBe(
                `Open details for ${latestSite.name}`
            );
            fireEvent.click(rowElement);
            expect(handleCardClick).toHaveBeenCalledTimes(1);

            handleCardClick.mockClear();
            const checkButton = screen.getByTestId("action-group-check");
            fireEvent.click(checkButton);
            expect(handleCheckNow).toHaveBeenCalledTimes(1);
            expect(handleCardClick).not.toHaveBeenCalled();

            handleCardClick.mockClear();
            fireEvent.keyDown(rowElement, { key: "Enter" });
            expect(handleCardClick).toHaveBeenCalledTimes(1);

            handleCardClick.mockClear();
            fireEvent.keyDown(rowElement, { key: " " });
            expect(handleCardClick).toHaveBeenCalledTimes(1);

            handleCardClick.mockClear();
            fireEvent.keyDown(rowElement, { key: "Escape" });
            expect(handleCardClick).not.toHaveBeenCalled();

            unmount();
        }
    );
});
