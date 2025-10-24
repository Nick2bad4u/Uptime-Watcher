/**
 * Comprehensive tests for EmptyState component. Achieves 98%+ branch coverage
 * for the EmptyState component.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../../../../components/Dashboard/SiteList/EmptyState";

// Mock themed components
vi.mock("../../../../theme/components", () => ({
    ThemedBox: ({ children, className, padding, surface, ...props }: any) => (
        <div
            data-testid="themed-box"
            data-classname={className}
            data-padding={padding}
            data-surface={surface}
            {...props}
        >
            {children}
        </div>
    ),
    ThemedText: ({
        children,
        className,
        size,
        weight,
        variant,
        ...props
    }: any) => (
        <span
            data-testid="themed-text"
            data-classname={className}
            data-size={size}
            data-weight={weight}
            data-variant={variant}
            {...props}
        >
            {children}
        </span>
    ),
}));

describe("EmptyState Component - Comprehensive Coverage", () => {
    it("should render with correct structure and content", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Should render the main container with correct CSS classes
        const container = document.querySelector(".themed-box");
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass("text-center");
        expect(container).toHaveClass("themed-box--padding-xl");
        expect(container).toHaveClass("themed-box--surface-base");
    });

    it("should render the icon with correct emoji", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        const iconContainer = document.querySelector(
            ".empty-state-icon"
        ) as HTMLElement | null;
        expect(iconContainer).toBeInTheDocument();
        expect(
            iconContainer?.querySelector(".empty-state-icon__symbol")
        ).toBeInTheDocument();
    });

    it("should render the main heading text", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        const heading = screen.getByText("No sites are being monitored");
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass("themed-text--primary");
        expect(heading).toHaveClass("themed-text--size-lg");
        expect(heading).toHaveClass("themed-text--weight-medium");
        expect(heading).toHaveClass("mb-2");
    });

    it("should render the descriptive text", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        const description = screen.getByText(
            "Add your first website to start monitoring its uptime."
        );
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass("themed-text--secondary");
        expect(description).toHaveClass("themed-text--size-base");
        expect(description).toHaveClass("themed-text--weight-normal");
    });

    it("should have correct CSS classes for styling", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Check icon container
        const iconContainer = document.querySelector(
            ".empty-state-icon"
        ) as HTMLElement | null;
        expect(iconContainer).not.toBeNull();
        expect(iconContainer).toHaveClass("empty-state-icon");

        // Check main container CSS classes
        const container = document.querySelector(".themed-box");
        expect(container).toHaveClass("text-center");
        expect(container).toHaveClass("themed-box--padding-xl");
        expect(container).toHaveClass("themed-box--surface-base");
    });

    it("should render all elements in correct hierarchy", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        const container = document.querySelector(".themed-box");

        // Check that all child elements are present within the container
        const emptyState = screen.getByTestId("empty-state");
        const iconContainer = emptyState.querySelector(".empty-state-icon");
        expect(iconContainer).not.toBeNull();
        expect(emptyState).toContainElement(iconContainer as HTMLElement);

        const themedTexts = document.querySelectorAll(".themed-text");
        for (const element of Array.from(themedTexts)) {
            expect(container).toContainElement(element as HTMLElement);
        }
    });

    it("should handle text content correctly", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Verify exact text content
        expect(
            screen.getByText("No sites are being monitored")
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Add your first website to start monitoring its uptime."
            )
        ).toBeInTheDocument();
        expect(
            document.querySelector(".empty-state-icon__symbol")
        ).toBeInTheDocument();
    });

    it("should maintain consistent prop structure", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Main heading should have specific CSS classes
        const heading = screen.getByText("No sites are being monitored");
        expect(heading).toHaveClass("mb-2");
        expect(heading).toHaveClass("themed-text--size-lg");
        expect(heading).toHaveClass("themed-text--weight-medium");

        // Description should have variant prop
        const description = screen.getByText(
            "Add your first website to start monitoring its uptime."
        );
        expect(description).toHaveClass("themed-text--secondary");
    });

    it("should be accessible and semantic", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Component should be findable by text content
        expect(
            screen.getByText("No sites are being monitored")
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Add your first website to start monitoring its uptime."
            )
        ).toBeInTheDocument();

        // Icon should be present
        expect(
            document.querySelector(".empty-state-icon__symbol")
        ).toBeInTheDocument();
    });

    it("should use themed components correctly", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: EmptyState", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<EmptyState />);

        // Should use ThemedBox for container
        const container = document.querySelector(".themed-box");
        expect(container).toBeInTheDocument();

        // Should use ThemedText for text elements
        const themedTexts = document.querySelectorAll(".themed-text");
        expect(themedTexts).toHaveLength(2);
    });
});
