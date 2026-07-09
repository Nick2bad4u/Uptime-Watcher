import type { IconType } from "react-icons";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingItem } from "../../../components/shared/SettingItem";

const TestIcon: IconType = ({ className, size }) => (
    <svg
        className={className}
        data-testid="setting-icon"
        height={size}
        width={size}
    />
);

describe(SettingItem, () => {
    it("renders title, description, control, and custom class", () => {
        render(
            <SettingItem
                className="custom-setting"
                control={<input aria-label="Enable alerts" />}
                description="Send a desktop notification when a monitor fails."
                title="Desktop alerts"
            />
        );

        const item = screen.getByText("Desktop alerts").closest(".setting-item");

        expect(item).toHaveClass("custom-setting");
        expect(
            screen.getByText("Send a desktop notification when a monitor fails.")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("textbox", { name: "Enable alerts" })
        ).toBeInTheDocument();
    });

    it("resolves render-callback controls", () => {
        const renderControl = vi.fn(() => (
            <button type="button">Connect cloud account</button>
        ));

        render(
            <SettingItem
                control={renderControl}
                title="Cloud synchronization"
            />
        );

        expect(renderControl).toHaveBeenCalledTimes(1);
        expect(
            screen.getByRole("button", { name: "Connect cloud account" })
        ).toBeInTheDocument();
    });

    it("supports disabled styling and both icon APIs", () => {
        const { rerender } = render(
            <SettingItem
                control={<input aria-label="Muted setting" />}
                disabled
                icon={<span data-testid="legacy-icon" />}
                title="Muted setting"
            />
        );

        expect(screen.getByText("Muted setting").closest(".setting-item"))
            .toHaveClass("disabled");
        expect(screen.getByTestId("legacy-icon")).toBeInTheDocument();

        rerender(
            <SettingItem
                control={<input aria-label="Icon setting" />}
                iconClassName="accent-icon"
                iconComponent={TestIcon}
                iconSize={20}
                title="Icon setting"
            />
        );

        const icon = screen.getByTestId("setting-icon");

        expect(icon).toHaveClass("accent-icon");
        expect(icon).toHaveAttribute("height", "20");
        expect(icon).toHaveAttribute("width", "20");
    });
});
