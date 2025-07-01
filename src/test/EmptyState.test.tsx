/**
 * Test suite for EmptyState component
 * Tests rendering, content, and themed component integration
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../components/Dashboard/SiteList/EmptyState";

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, surface, padding, className }: { 
        children: React.ReactNode; 
        surface: string; 
        padding: string; 
        className: string; 
    }) => (
        <div 
            data-testid="themed-box" 
            data-surface={surface} 
            data-padding={padding} 
            className={className}
        >
            {children}
        </div>
    ),
    ThemedText: ({ children, size, weight, variant, className }: { 
        children: React.ReactNode; 
        size?: string; 
        weight?: string; 
        variant?: string; 
        className?: string; 
    }) => (
        <div 
            data-testid="themed-text" 
            data-size={size} 
            data-weight={weight}
            data-variant={variant}
            className={className}
        >
            {children}
        </div>
    ),
}));

describe("EmptyState Component", () => {
    describe("Basic Rendering", () => {
        it("renders without crashing", () => {
            render(<EmptyState />);
            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
        });

        it("displays the website icon", () => {
            render(<EmptyState />);
            expect(screen.getByText("🌐")).toBeInTheDocument();
        });

        it("displays the main heading text", () => {
            render(<EmptyState />);
            expect(screen.getByText("No sites to monitor")).toBeInTheDocument();
        });

        it("displays the descriptive text", () => {
            render(<EmptyState />);
            expect(screen.getByText("Add your first website to start monitoring its uptime.")).toBeInTheDocument();
        });
    });

    describe("Component Structure", () => {
        it("uses ThemedBox with correct props", () => {
            render(<EmptyState />);
            
            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toHaveAttribute("data-surface", "base");
            expect(themedBox).toHaveAttribute("data-padding", "xl");
            expect(themedBox).toHaveClass("text-center");
        });

        it("uses ThemedText components with correct props for heading", () => {
            render(<EmptyState />);
            
            const themedTexts = screen.getAllByTestId("themed-text");
            const headingText = themedTexts.find(el => el.textContent === "No sites to monitor");
            
            expect(headingText).toHaveAttribute("data-size", "lg");
            expect(headingText).toHaveAttribute("data-weight", "medium");
            expect(headingText).toHaveClass("mb-2");
        });

        it("uses ThemedText component with correct props for description", () => {
            render(<EmptyState />);
            
            const themedTexts = screen.getAllByTestId("themed-text");
            const descText = themedTexts.find(el => 
                el.textContent === "Add your first website to start monitoring its uptime."
            );
            
            expect(descText).toHaveAttribute("data-variant", "secondary");
        });
    });

    describe("Content Hierarchy", () => {
        it("renders elements in correct order", () => {
            const { container } = render(<EmptyState />);
            
            const themedBox = container.querySelector('[data-testid="themed-box"]');
            const children = themedBox?.children;
            
            expect(children).toHaveLength(3);
            expect(children?.[0]).toHaveClass("empty-state-icon");
            expect(children?.[0]).toHaveTextContent("🌐");
            expect(children?.[1]).toHaveTextContent("No sites to monitor");
            expect(children?.[2]).toHaveTextContent("Add your first website to start monitoring its uptime.");
        });

        it("icon has correct CSS class", () => {
            render(<EmptyState />);
            
            const iconDiv = screen.getByText("🌐").closest('.empty-state-icon');
            expect(iconDiv).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("has proper semantic structure", () => {
            render(<EmptyState />);
            
            // Should have meaningful text content
            expect(screen.getByText("No sites to monitor")).toBeInTheDocument();
            expect(screen.getByText("Add your first website to start monitoring its uptime.")).toBeInTheDocument();
        });

        it("uses centered layout for better visual hierarchy", () => {
            render(<EmptyState />);
            
            const container = screen.getByTestId("themed-box");
            expect(container).toHaveClass("text-center");
        });
    });

    describe("Visual Design", () => {
        it("applies appropriate spacing", () => {
            render(<EmptyState />);
            
            const container = screen.getByTestId("themed-box");
            expect(container).toHaveAttribute("data-padding", "xl");
            
            const heading = screen.getByText("No sites to monitor");
            expect(heading).toHaveClass("mb-2");
        });

        it("uses appropriate text sizes and weights", () => {
            render(<EmptyState />);
            
            const heading = screen.getByText("No sites to monitor");
            expect(heading).toHaveAttribute("data-size", "lg");
            expect(heading).toHaveAttribute("data-weight", "medium");
            
            const description = screen.getByText("Add your first website to start monitoring its uptime.");
            expect(description).toHaveAttribute("data-variant", "secondary");
        });
    });

    describe("Theme Integration", () => {
        it("integrates properly with themed components", () => {
            render(<EmptyState />);
            
            // Should use ThemedBox and ThemedText
            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
            expect(screen.getAllByTestId("themed-text")).toHaveLength(2);
        });

        it("passes through theme properties correctly", () => {
            render(<EmptyState />);
            
            const box = screen.getByTestId("themed-box");
            expect(box).toHaveAttribute("data-surface", "base");
            
            const texts = screen.getAllByTestId("themed-text");
            expect(texts[0]).toHaveAttribute("data-size", "lg");
            expect(texts[1]).toHaveAttribute("data-variant", "secondary");
        });
    });
});
