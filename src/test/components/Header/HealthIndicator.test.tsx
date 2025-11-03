/**
 * Focused tests for the `HealthIndicator` component to validate that renderer
 * metadata correctly reflects the supplied availability metrics.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import { HealthIndicator } from "../../../components/Header/HealthIndicator";

describe(HealthIndicator, () => {
    it("renders uptime percentage with color tokens from the availability helper", () => {
        const getAvailabilityColor = vi.fn((percentage: number) =>
            percentage >= 99 ? "health-success" : "health-warning"
        );

        render(
            <HealthIndicator
                getAvailabilityColor={getAvailabilityColor}
                uptimePercentage={97.5}
            />
        );

        expect(getAvailabilityColor).toHaveBeenCalledTimes(1);
        expect(getAvailabilityColor).toHaveBeenNthCalledWith(1, 97.5);

        const indicatorRoot =
            screen.getByText("Health").parentElement?.parentElement;
        if (!(indicatorRoot instanceof HTMLElement)) {
            throw new TypeError(
                "Expected health indicator root element to be present"
            );
        }
        expect(indicatorRoot).toHaveClass("health-badge");
        expect(indicatorRoot).toHaveAttribute(
            "data-health-color",
            "health-warning"
        );

        const dot = indicatorRoot.querySelector(".health-dot");
        expect(dot).toHaveAttribute("data-health-color", "health-warning");

        expect(screen.getByText("97.5%")).toBeInTheDocument();
        expect(screen.getByText("Health")).toHaveClass("leading-none");
    });

    it("updates indicator styling when the uptime percentage changes", () => {
        const getAvailabilityColor = vi.fn((percentage: number) =>
            percentage >= 95 ? "health-success" : "health-critical"
        );

        const { rerender } = render(
            <HealthIndicator
                getAvailabilityColor={getAvailabilityColor}
                uptimePercentage={98}
            />
        );
        const initialRoot =
            screen.getByText("Health").parentElement?.parentElement;
        if (!(initialRoot instanceof HTMLElement)) {
            throw new TypeError(
                "Expected health indicator root element to be present after initial render"
            );
        }
        expect(initialRoot).toHaveAttribute(
            "data-health-color",
            "health-success"
        );
        expect(getAvailabilityColor).toHaveBeenCalledTimes(1);

        rerender(
            <HealthIndicator
                getAvailabilityColor={getAvailabilityColor}
                uptimePercentage={72}
            />
        );

        expect(getAvailabilityColor).toHaveBeenCalledTimes(2);
        expect(getAvailabilityColor).toHaveBeenNthCalledWith(2, 72);

        const indicatorRoot =
            screen.getByText("Health").parentElement?.parentElement;
        if (!(indicatorRoot instanceof HTMLElement)) {
            throw new TypeError(
                "Expected health indicator root element to be present after rerender"
            );
        }
        expect(indicatorRoot).toHaveAttribute(
            "data-health-color",
            "health-critical"
        );
        expect(screen.getByText("72%")).toBeInTheDocument();
    });
});
