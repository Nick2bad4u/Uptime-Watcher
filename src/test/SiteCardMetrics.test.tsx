import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteCardMetrics } from "../components/Dashboard/SiteCard/SiteCardMetrics";

// Mock MetricCard to isolate SiteCardMetrics logic
vi.mock("../components/Dashboard/SiteCard/components/MetricCard", () => ({
    MetricCard: (props: any) => (
        <div
            data-testid="metric-card"
            data-label={props.label}
            data-value={props.value}
        >
            {props.label}:{props.value}
        </div>
    ),
}));

describe("SiteCardMetrics", () => {
    it("renders all metrics with correct values", () => {
        render(
            <SiteCardMetrics
                status="up"
                uptime={99.5}
                responseTime={123}
                checkCount={42}
            />
        );
        const cards = screen.getAllByTestId("metric-card");
        expect(
            cards.find((card) => card.dataset["label"] === "Status")
        ).toHaveAttribute("data-value", "UP");
        expect(
            cards.find((card) => card.dataset["label"] === "Uptime")
        ).toHaveAttribute("data-value", "99.5%");
        expect(
            cards.find((card) => card.dataset["label"] === "Response")
        ).toHaveAttribute("data-value", "123 ms");
        expect(
            cards.find((card) => card.dataset["label"] === "Checks")
        ).toHaveAttribute("data-value", "42");
    });

    it("renders response time as '-' when undefined", () => {
        render(<SiteCardMetrics status="down" uptime={0} checkCount={0} />);
        const cards = screen.getAllByTestId("metric-card");
        expect(
            cards.find((card) => card.dataset["label"] === "Response")
        ).toHaveAttribute("data-value", "-");
    });

    it("renders status as 'UNKNOWN' if status is empty", () => {
        render(<SiteCardMetrics status="" uptime={100} checkCount={1} />);
        const cards = screen.getAllByTestId("metric-card");
        expect(
            cards.find((card) => card.dataset["label"] === "Status")
        ).toHaveAttribute("data-value", "UNKNOWN");
    });

    it("renders correct number of metric cards", () => {
        render(
            <SiteCardMetrics
                status="up"
                uptime={100}
                responseTime={50}
                checkCount={10}
            />
        );
        expect(screen.getAllByTestId("metric-card")).toHaveLength(4);
    });

    it("renders uptime with percent sign", () => {
        render(
            <SiteCardMetrics
                status="up"
                uptime={87.65}
                responseTime={200}
                checkCount={5}
            />
        );
        const cards = screen.getAllByTestId("metric-card");
        expect(
            cards.find((card) => card.dataset["label"] === "Uptime")
        ).toHaveAttribute("data-value", "87.7%");
    });
});
