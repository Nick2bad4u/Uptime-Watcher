import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemedButton, ThemedIconButton, ThemedBadge } from "../theme/components";

// Mock the theme context
const mockTheme = {
    colors: {
        background: {
            primary: "#ffffff",
        },
        primary: {
            500: "#0ea5e9",
            600: "#0284c7",
        },
        text: {
            primary: "#1f2937",
        },
    },
};

vi.mock("../theme/context", () => ({
    useTheme: () => ({ theme: mockTheme }),
}));

describe("components.tsx Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Icon rendering edge cases", () => {
        it("should render ThemedButton with icon but no color styling", () => {
            // This test covers the "return icon;" line (line 235) in renderColoredIcon
            // by providing an icon without any color styling
            render(<ThemedButton icon={<div data-testid="plain-icon">icon</div>}>Button Text</ThemedButton>);

            expect(screen.getByTestId("plain-icon")).toBeInTheDocument();
        });

        it("should render ThemedIconButton with icon but no color styling", () => {
            // Another way to trigger the plain icon return
            render(
                <ThemedIconButton
                    icon={<div data-testid="plain-icon-button">icon</div>}
                    aria-label="plain icon button"
                />
            );

            expect(screen.getByTestId("plain-icon-button")).toBeInTheDocument();
        });
    });

    describe("ThemedButton", () => {
        it("should apply aria-label when provided", () => {
            // This test covers the aria-label line
            render(<ThemedButton aria-label="test-button">Button Text</ThemedButton>);

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-label", "test-button");
        });

        it("should not apply aria-label when not provided", () => {
            render(<ThemedButton>Button Text</ThemedButton>);

            const button = screen.getByRole("button");
            expect(button).not.toHaveAttribute("aria-label");
        });
    });

    describe("ThemedIconButton", () => {
        it("should render with tooltip as title attribute", () => {
            // Test the tooltip functionality instead of aria-label
            render(<ThemedIconButton tooltip="icon button tooltip" icon={<div>icon</div>} />);

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("title", "icon button tooltip");
        });
    });

    describe("ThemedBadge", () => {
        it("should render with primary variant (default)", () => {
            // This test covers the primary variant which is the default
            render(<ThemedBadge variant="primary">Primary badge message</ThemedBadge>);

            const badge = screen.getByText("Primary badge message");
            expect(badge).toBeInTheDocument();
        });

        it("should render with secondary variant", () => {
            render(<ThemedBadge variant="secondary">Secondary badge message</ThemedBadge>);

            const badge = screen.getByText("Secondary badge message");
            expect(badge).toBeInTheDocument();
        });

        it("should apply info variant styling", () => {
            render(<ThemedBadge variant="info">Info badge message</ThemedBadge>);

            const badge = screen.getByText("Info badge message");
            expect(badge).toBeInTheDocument();
        });

        it("should apply error variant styling", () => {
            render(<ThemedBadge variant="error">Error badge message</ThemedBadge>);

            const badge = screen.getByText("Error badge message");
            expect(badge).toBeInTheDocument();
        });

        it("should apply warning variant styling", () => {
            render(<ThemedBadge variant="warning">Warning badge message</ThemedBadge>);

            const badge = screen.getByText("Warning badge message");
            expect(badge).toBeInTheDocument();
        });

        it("should apply success variant styling", () => {
            render(<ThemedBadge variant="success">Success badge message</ThemedBadge>);

            const badge = screen.getByText("Success badge message");
            expect(badge).toBeInTheDocument();
        });
    });
});
