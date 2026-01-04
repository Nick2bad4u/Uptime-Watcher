/**
 * Comprehensive tests for EmptyState component.
 *
 * These tests intentionally avoid asserting on internal themed CSS classes.
 * The EmptyState is an app-level component; its contract is the visible text
 * + the presence of decorative icons.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";

import { EmptyState } from "../../../../components/Dashboard/SiteList/EmptyState";

describe("EmptyState Component", () => {
    it("renders the empty state content", () => {
        render(<EmptyState />);

        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(
            screen.getByText("No sites are being monitored")
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Add your first website to start monitoring its uptime."
            )
        ).toBeInTheDocument();
    });

    it("renders the decorative monitor icon", () => {
        render(<EmptyState />);

        const monitorIcon = screen.getByTestId("empty-state-monitor-icon");
        expect(monitorIcon).toBeInTheDocument();
        expect(monitorIcon).toHaveAttribute("aria-hidden", "true");
    });

    it("centers the content", () => {
        render(<EmptyState />);
        const emptyState = screen.getByTestId("empty-state");

        expect(emptyState.className).toContain("items-center");
        expect(emptyState.className).toContain("justify-center");
    });
});
