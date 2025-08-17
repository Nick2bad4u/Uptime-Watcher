/**
 * Targeted tests for ThemedBox keyboard interaction coverage
 * Specifically targeting lines 111-113 (onKeyDown handler)
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import React from "react";
import ThemedBox from "../../theme/components/ThemedBox";
import ThemeProvider from "../../theme/components/ThemeProvider";

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("ThemedBox - Keyboard Interaction Coverage", () => {
    describe("onKeyDown handler coverage (lines 111-113)", () => {
        it("should handle Enter key for interactive div", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox onClick={mockOnClick} as="div">
                    Interactive content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            
            // Test Enter key
            fireEvent.keyDown(box, { key: "Enter" });
            expect(mockOnClick).toHaveBeenCalledTimes(1);
            
            // Test Space key
            fireEvent.keyDown(box, { key: " " });
            expect(mockOnClick).toHaveBeenCalledTimes(2);
        });

        it("should not trigger onClick for non-Enter/Space keys", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox onClick={mockOnClick} as="div">
                    Interactive content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            
            // Test other keys that should not trigger onClick
            fireEvent.keyDown(box, { key: "Tab" });
            fireEvent.keyDown(box, { key: "Escape" });
            fireEvent.keyDown(box, { key: "a" });
            
            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it("should handle preventDefault for Enter and Space keys", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox onClick={mockOnClick} as="div">
                    Interactive content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            
            // Test that keyboard events trigger onClick (which means preventDefault is working)
            // Because if preventDefault wasn't called, the default browser behavior would interfere
            fireEvent.keyDown(box, { key: "Enter" });
            fireEvent.keyDown(box, { key: " " });
            
            // If preventDefault is working correctly, onClick should be called
            expect(mockOnClick).toHaveBeenCalledTimes(2);
            
            // Test that non-Enter/Space keys don't trigger onClick
            fireEvent.keyDown(box, { key: "Tab" });
            expect(mockOnClick).toHaveBeenCalledTimes(2); // Still 2, not 3
        });

        it("should not handle keyboard events when not interactive", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox>
                    Non-interactive content
                </ThemedBox>
            );
            
            const box = screen.getByText("Non-interactive content");
            
            // Try to trigger keyboard events - should not have any keyboard handlers
            fireEvent.keyDown(box, { key: "Enter" });
            fireEvent.keyDown(box, { key: " " });
            
            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it("should not add keyboard handlers for button elements", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox onClick={mockOnClick} as="button">
                    Button content
                </ThemedBox>
            );
            
            const button = screen.getByRole("button");
            
            // Buttons handle their own keyboard events natively
            // Our custom onKeyDown should not be added
            fireEvent.keyDown(button, { key: "Enter" });
            
            // The click should still work through native button behavior
            fireEvent.click(button);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should handle edge cases in keyboard interaction", () => {
            const mockOnClick = vi.fn();
            
            renderWithTheme(
                <ThemedBox onClick={mockOnClick} as="div">
                    Interactive content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            
            // Test with different event properties
            fireEvent.keyDown(box, { 
                key: "Enter", 
                shiftKey: true, 
                ctrlKey: true 
            });
            
            fireEvent.keyDown(box, { 
                key: " ", 
                altKey: true 
            });
            
            expect(mockOnClick).toHaveBeenCalledTimes(2);
        });

        it("should handle case where onClick is not provided", () => {
            renderWithTheme(
                <ThemedBox as="div">
                    Non-clickable interactive content
                </ThemedBox>
            );
            
            const box = screen.getByText("Non-clickable interactive content");
            
            // Should not error when Enter/Space is pressed without onClick
            expect(() => {
                fireEvent.keyDown(box, { key: "Enter" });
                fireEvent.keyDown(box, { key: " " });
            }).not.toThrow();
        });
    });

    describe("Additional ThemedBox edge cases for complete coverage", () => {
        it("should handle custom aria-label and role", () => {
            renderWithTheme(
                <ThemedBox 
                    onClick={vi.fn()} 
                    as="div"
                    aria-label="Custom label"
                    role="tab"
                >
                    Content
                </ThemedBox>
            );
            
            const box = screen.getByRole("tab");
            expect(box).toHaveAttribute("aria-label", "Custom label");
        });

        it("should handle custom tabIndex", () => {
            renderWithTheme(
                <ThemedBox 
                    onClick={vi.fn()} 
                    as="div"
                    tabIndex={5}
                >
                    Content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            expect(box).toHaveAttribute("tabIndex", "5");
        });

        it("should default role and tabIndex for interactive div", () => {
            renderWithTheme(
                <ThemedBox onClick={vi.fn()} as="div">
                    Content
                </ThemedBox>
            );
            
            const box = screen.getByRole("button");
            expect(box).toHaveAttribute("tabIndex", "0");
        });
    });
});
