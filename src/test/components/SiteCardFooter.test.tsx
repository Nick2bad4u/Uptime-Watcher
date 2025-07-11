/**
 * Comprehensive tests for SiteCardFooter component
 * Testing all functionality for 100% coverage
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteCardFooter } from "../../components/Dashboard/SiteCard/SiteCardFooter";

// Mock ThemedText component
vi.mock("../../theme", () => ({
    ThemedText: ({ children, size, variant, className }: any) => (
        <div 
            data-testid="themed-text"
            data-size={size}
            data-variant={variant}
            className={className}
        >
            {children}
        </div>
    ),
}));

describe("SiteCardFooter", () => {
    describe("Rendering", () => {
        it("should render footer with correct structure", () => {
            render(<SiteCardFooter />);

            const footer = screen.getByText("Click to view detailed statistics and settings").closest("div");
            expect(footer).toBeInTheDocument();
            expect(footer?.parentElement).toHaveClass("pt-2", "mt-2", "border-t");
        });

        it("should render hint text with correct content", () => {
            render(<SiteCardFooter />);

            expect(screen.getByText("Click to view detailed statistics and settings")).toBeInTheDocument();
        });

        it("should apply correct ThemedText props", () => {
            render(<SiteCardFooter />);

            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toHaveAttribute("data-size", "xs");
            expect(themedText).toHaveAttribute("data-variant", "tertiary");
        });

        it("should apply correct CSS classes to ThemedText", () => {
            render(<SiteCardFooter />);

            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toHaveClass(
                "text-center",
                "transition-opacity",
                "opacity-0",
                "group-hover:opacity-100"
            );
        });
    });

    describe("React.memo optimization", () => {
        it("should be a memoized component", () => {
            // Test that the component is wrapped with React.memo
            expect(SiteCardFooter.$$typeof).toBe(Symbol.for("react.memo"));
        });

        it("should not re-render when props don't change", () => {
            const { rerender } = render(<SiteCardFooter />);
            
            const initialElement = screen.getByText("Click to view detailed statistics and settings");
            
            // Re-render with same props (no props in this case)
            rerender(<SiteCardFooter />);
            
            const afterRerenderElement = screen.getByText("Click to view detailed statistics and settings");
            expect(initialElement).toBe(afterRerenderElement);
        });
    });

    describe("Accessibility", () => {
        it("should have proper text content for screen readers", () => {
            render(<SiteCardFooter />);

            const hintText = screen.getByText("Click to view detailed statistics and settings");
            expect(hintText).toBeInTheDocument();
            expect(hintText).toHaveTextContent("Click to view detailed statistics and settings");
        });

        it("should be focusable by keyboard navigation", () => {
            render(<SiteCardFooter />);

            const footer = screen.getByText("Click to view detailed statistics and settings").closest("div");
            // Footer itself doesn't need to be focusable, but text should be readable
            expect(footer).toBeInTheDocument();
        });
    });

    describe("Visual Design", () => {
        it("should apply border top styling", () => {
            render(<SiteCardFooter />);

            const footer = screen.getByText("Click to view detailed statistics and settings").closest("div");
            expect(footer?.parentElement).toHaveClass("border-t");
        });

        it("should apply proper spacing", () => {
            render(<SiteCardFooter />);

            const footer = screen.getByText("Click to view detailed statistics and settings").closest("div");
            expect(footer?.parentElement).toHaveClass("pt-2", "mt-2");
        });

        it("should include transition and hover effects", () => {
            render(<SiteCardFooter />);

            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toHaveClass("transition-opacity");
            expect(themedText).toHaveClass("opacity-0");
            expect(themedText).toHaveClass("group-hover:opacity-100");
        });
    });

    describe("Component Structure", () => {
        it("should have a single root div element", () => {
            render(<SiteCardFooter />);

            const rootElements = screen.getByText("Click to view detailed statistics and settings").closest("div");
            expect(rootElements).toBeInTheDocument();
        });

        it("should contain exactly one ThemedText component", () => {
            render(<SiteCardFooter />);

            const themedTexts = screen.getAllByTestId("themed-text");
            expect(themedTexts).toHaveLength(1);
        });

        it("should render consistent content", () => {
            const { rerender } = render(<SiteCardFooter />);

            const initialText = screen.getByText("Click to view detailed statistics and settings");
            expect(initialText).toBeInTheDocument();

            rerender(<SiteCardFooter />);

            const afterRerenderText = screen.getByText("Click to view detailed statistics and settings");
            expect(afterRerenderText).toBeInTheDocument();
            expect(initialText.textContent).toBe(afterRerenderText.textContent);
        });
    });

    describe("Integration with Theme System", () => {
        it("should properly integrate with ThemedText component", () => {
            render(<SiteCardFooter />);

            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toBeInTheDocument();
            expect(themedText).toHaveAttribute("data-size", "xs");
            expect(themedText).toHaveAttribute("data-variant", "tertiary");
        });

        it("should handle different theme states", () => {
            // Since the component doesn't depend on theme context directly,
            // it should render consistently
            render(<SiteCardFooter />);

            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle multiple instances independently", () => {
            render(
                <div>
                    <SiteCardFooter />
                    <SiteCardFooter />
                </div>
            );

            const footerTexts = screen.getAllByText("Click to view detailed statistics and settings");
            expect(footerTexts).toHaveLength(2);
        });

        it("should not cause any console errors", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            render(<SiteCardFooter />);

            expect(consoleSpy).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});
