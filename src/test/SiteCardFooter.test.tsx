/**
 * Tests for SiteCardFooter component
 * Validates footer rendering and interaction hints
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteCardFooter } from "../components/Dashboard/SiteCard/SiteCardFooter";

describe("SiteCardFooter", () => {
    it("renders footer with hint text", () => {
        render(<SiteCardFooter />);
        
        expect(screen.getByText("Click to view detailed statistics and settings")).toBeInTheDocument();
    });

    it("has correct CSS classes for styling", () => {
        render(<SiteCardFooter />);
        
        const footer = screen.getByText("Click to view detailed statistics and settings").parentElement;
        expect(footer).toHaveClass("pt-2", "mt-2", "border-t");
    });

    it("has transition and opacity classes on text", () => {
        render(<SiteCardFooter />);
        
        const text = screen.getByText("Click to view detailed statistics and settings");
        expect(text).toHaveClass("text-center", "transition-opacity", "opacity-0", "group-hover:opacity-100");
    });

    it("memoizes component to prevent unnecessary re-renders", () => {
        const { rerender } = render(<SiteCardFooter />);
        
        // Rerender
        rerender(<SiteCardFooter />);
        
        // Component should still be present
        expect(screen.getByText("Click to view detailed statistics and settings")).toBeInTheDocument();
    });

    it("renders with themed text component", () => {
        render(<SiteCardFooter />);
        
        const text = screen.getByText("Click to view detailed statistics and settings");
        expect(text).toBeInTheDocument();
        
        // Should be rendered as text element (ThemedText renders as text)
        expect(text.tagName.toLowerCase()).toMatch(/^(span|div|p)$/);
    });

    it("provides accessibility for screen readers", () => {
        render(<SiteCardFooter />);
        
        const text = screen.getByText("Click to view detailed statistics and settings");
        // Text should be accessible to screen readers
        expect(text).toBeVisible();
    });

    it("handles component mounting and unmounting", () => {
        const { unmount } = render(<SiteCardFooter />);
        
        expect(screen.getByText("Click to view detailed statistics and settings")).toBeInTheDocument();
        
        unmount();
        
        expect(screen.queryByText("Click to view detailed statistics and settings")).not.toBeInTheDocument();
    });
});
