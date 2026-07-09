import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { MiniChartBar } from "../../theme/components/MiniChartBar";
import { themes } from "../../theme/themes";

const getStatusColorMock = vi.hoisted(() =>
    vi.fn((status: string) => `color-${status}`)
);

vi.mock("../../theme/useTheme", () => ({
    useTheme: () => ({
        currentTheme: themes.light,
        getStatusColor: getStatusColorMock,
    }),
}));

const renderBar = (
    properties: Partial<ComponentProps<typeof MiniChartBar>> = {}
) =>
    render(
        <MiniChartBar
            status="up"
            timestamp="2026-01-02T03:04:05.000Z"
            {...properties}
        />
    );

describe(MiniChartBar, () => {
    it("uses status color and theme radius for the compact bar", () => {
        renderBar({
            className: "custom-bar",
            status: "down",
        });

        const bar = screen.getByTitle(/^down -/u);

        expect(bar).toHaveClass("custom-bar");
        expect(bar).toHaveStyle({
            backgroundColor: "color-down",
            borderRadius: themes.light.borderRadius.sm,
            height: "32px",
            width: "8px",
        });
        expect(getStatusColorMock).toHaveBeenCalledWith("down");
    });

    it("includes formatted response time and valid timestamp labels in the title", () => {
        renderBar({
            responseTime: 1500,
            timestamp: Date.UTC(2026, 0, 2, 3, 4, 5),
        });

        const bar = screen.getByTitle(/^up - 1\.50s at /u);

        expect(bar.title).not.toContain("Invalid Date");
        expect(bar.title).not.toContain("N/A");
    });

    it.each([
        ["invalid string", "invalid-timestamp"],
        ["impossible ISO date", "2026-02-30T00:00:00.000Z"],
        ["non-finite number", Number.NaN],
        ["invalid Date object", new Date(Number.NaN)],
    ] as const)("uses fallback timestamp text for %s", (_, timestamp) => {
        renderBar({ timestamp });

        const bar = screen.getByTitle(/ at N\/A$/u);

        expect(bar.title).not.toContain("Invalid Date");
    });
});
