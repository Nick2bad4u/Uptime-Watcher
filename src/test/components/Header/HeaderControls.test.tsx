/**
 * Regression tests for HeaderControls component covering refreshed
 * accessibility labels.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderControls } from "../../../components/Header/HeaderControls";

vi.mock("../../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: ({
        children,
    }: {
        children: (props: Record<string, unknown>) => ReactNode;
    }) => <>{children({})}</>,
}));

describe("header controls", () => {
    const addSite = vi.fn();
    const showSettings = vi.fn();
    const toggleTheme = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should expose refreshed aria-labels and trigger callbacks", () => {
        render(
            <HeaderControls
                isDark={false}
                onShowAddSiteModal={addSite}
                onShowSettings={showSettings}
                onToggleTheme={toggleTheme}
            />
        );

        const addButton = screen.getByRole("button", { name: "Add new site" });
        expect(addButton).toHaveTextContent("Add Site");
        fireEvent.click(addButton);
        expect(addSite).toHaveBeenCalledTimes(1);

        const themeButton = screen.getByRole("button", {
            name: "Switch to dark theme",
        });
        expect(themeButton).toHaveTextContent("Theme");
        fireEvent.click(themeButton);
        expect(toggleTheme).toHaveBeenCalledTimes(1);

        const settingsButton = screen.getByRole("button", {
            name: "Open settings",
        });
        expect(settingsButton).toHaveTextContent("Settings");
        fireEvent.click(settingsButton);
        expect(showSettings).toHaveBeenCalledTimes(1);
    });

    it("should surface light-mode label when dark theme is active", () => {
        render(
            <HeaderControls
                isDark={true}
                onShowAddSiteModal={addSite}
                onShowSettings={showSettings}
                onToggleTheme={toggleTheme}
            />
        );

        const themeButton = screen.getByRole("button", {
            name: "Switch to light theme",
        });
        expect(themeButton).toBeInTheDocument();
    });
});
