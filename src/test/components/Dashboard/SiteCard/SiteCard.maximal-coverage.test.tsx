import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { SiteCard } from "../../../../components/Dashboard/SiteCard/SiteCard";
import type { Site } from "../../../../../shared/types";

// Mock all dependencies
vi.mock("../../../../hooks/site/useSite", () => ({
    useSite: vi.fn(() => ({
        checkCount: 1000,
        filteredHistory: [],
        handleCardClick: vi.fn(),
        handleCheckNow: vi.fn(),
        handleMonitorIdChange: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStartSiteMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        handleStopSiteMonitoring: vi.fn(),
        isLoading: false,
        isMonitoring: false,
        latestSite: {
            identifier: "site-1",
            name: "Test Site",
            monitoring: true,
            monitors: [],
        },
        monitor: undefined,
        responseTime: 150,
        selectedMonitorId: "monitor-1",
        status: "operational",
        uptime: 98,
    })),
}));

vi.mock("@shared/utils/siteStatus", () => ({
    getSiteDisplayStatus: vi.fn(() => "operational"),
    getSiteStatusVariant: vi.fn(() => "success"),
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardHeader", () => ({
    SiteCardHeader: vi.fn(({ site, display, interactions, monitoring }) => (
        <div data-testid="site-card-header" onClick={interactions?.onCheckNow}>
            Header: {site?.site?.name || "Unknown"} | Loading:{" "}
            {display?.isLoading ? "yes" : "no"} | Monitoring:{" "}
            {monitoring?.isMonitoring ? "yes" : "no"}
        </div>
    )),
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardStatus", () => ({
    SiteCardStatus: vi.fn(({ selectedMonitorId, status }) => (
        <div data-testid="site-card-status">
            Status: {status} (Monitor: {selectedMonitorId})
        </div>
    )),
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardMetrics", () => ({
    SiteCardMetrics: vi.fn(({ status, uptime, checkCount, responseTime }) => (
        <div data-testid="site-card-metrics">
            Metrics: {status} | Uptime: {uptime}% | Checks: {checkCount} |
            Response: {responseTime}ms
        </div>
    )),
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardHistory", () => ({
    SiteCardHistory: vi.fn(({ filteredHistory, monitor }) => (
        <div data-testid="site-card-history">
            History: {filteredHistory?.length || 0} items | Monitor:{" "}
            {monitor?.type || "none"}
        </div>
    )),
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardFooter", () => ({
    SiteCardFooter: vi.fn(() => (
        <div data-testid="site-card-footer">Footer: Click to expand</div>
    )),
}));

describe("SiteCard Component - Complete Coverage", () => {
    const mockSite: Site = {
        identifier: "site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render expanded card by default", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        render(<SiteCard site={mockSite} />);

        expect(screen.getByTestId("site-card-header")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-status")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-metrics")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-history")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-footer")).toBeInTheDocument();
    });

    it("should handle card interactions", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        render(<SiteCard site={mockSite} />);

        const header = screen.getByTestId("site-card-header");
        expect(header).toBeInTheDocument();

        // The header now shows site name from the mock
        expect(header).toHaveTextContent("Test Site");
    });

    it("should handle different site states", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        const inactiveSite = { ...mockSite, monitoring: false };
        render(<SiteCard site={inactiveSite} />);

        expect(screen.getByTestId("site-card-header")).toBeInTheDocument();
    });

    it("should pass correct data to all child components", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteCard.maximal-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        render(<SiteCard site={mockSite} />);

        expect(screen.getByTestId("site-card-header")).toHaveTextContent(
            "Test Site"
        );
        expect(screen.getByTestId("site-card-status")).toHaveTextContent(
            "operational"
        );
        expect(screen.getByTestId("site-card-metrics")).toHaveTextContent(
            "Uptime: 98%"
        );
        expect(screen.getByTestId("site-card-history")).toHaveTextContent(
            "History: 0 items"
        );
        expect(screen.getByTestId("site-card-footer")).toHaveTextContent(
            "Click to expand"
        );
    });
});
