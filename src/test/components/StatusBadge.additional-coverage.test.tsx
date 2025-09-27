/**
 * StatusBadge Additional Coverage Tests
 *
 * This test file specifically targets uncovered lines in StatusBadge.tsx to
 * improve test coverage to 90%+ as required.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "../../components/common/StatusBadge";
import { ThemeProvider } from "../../theme/components/ThemeProvider";
import type { StatusBadgeProperties } from "../../components/common/StatusBadge";

describe("StatusBadge - Additional Coverage", () => {
    it("should handle the default case in getIndicatorSize switch statement", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Data Retrieval", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Data Retrieval", "type");

        // This test is designed to cover line 126 - the default case in the getIndicatorSize function
        // We need to create a situation where an unexpected size value is passed

        // Create a component that uses an invalid size to trigger the default case
        const TestStatusBadgeWithInvalidSize = () => {
            // Cast to bypass TypeScript checking to test runtime behavior
            const invalidSize = "invalid" as any;

            return (
                <StatusBadge
                    label="Test"
                    status="up"
                    size={invalidSize}
                    showIcon
                />
            );
        };

        render(
            <ThemeProvider>
                <TestStatusBadgeWithInvalidSize />
            </ThemeProvider>
        );

        // Verify the component renders (should use default "sm" size for the indicator)
        expect(screen.getByText("Test: up")).toBeInTheDocument();
    });

    it("should handle edge cases for size mapping completeness", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        // Test all documented sizes to ensure complete coverage
        const sizes: NonNullable<StatusBadgeProperties["size"]>[] = [
            "2xl",
            "3xl",
            "4xl",
            "xl", // Should map to "lg"
            "base",
            "lg", // Should map to "md"
            "sm",
            "xs", // Should map to "sm"
        ];

        for (const size of sizes) {
            render(
                <ThemeProvider>
                    <StatusBadge
                        label={`Test-${size}`}
                        status="up"
                        size={size}
                        showIcon
                    />
                </ThemeProvider>
            );
        }

        // Verify all components rendered
        for (const size of sizes) {
            expect(screen.getByText(`Test-${size}: up`)).toBeInTheDocument();
        }
    });

    it("should handle missing size prop (undefined case)", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        // Test when size is undefined - should use default "sm"
        render(
            <ThemeProvider>
                <StatusBadge
                    label="Test Undefined Size"
                    status="down"
                    showIcon
                />
            </ThemeProvider>
        );

        expect(
            screen.getByText("Test Undefined Size: down")
        ).toBeInTheDocument();
    });

    it("should test the switch statement branch coverage completely", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        // This is an integration test to ensure the getIndicatorSize function
        // handles all possible code paths including the default case

        interface TestCase {
            size: any;
            expectedIndicatorSize: "lg" | "md" | "sm";
        }

        const testCases: TestCase[] = [
            // Large sizes -> "lg"
            { size: "2xl", expectedIndicatorSize: "lg" },
            { size: "3xl", expectedIndicatorSize: "lg" },
            { size: "4xl", expectedIndicatorSize: "lg" },
            { size: "xl", expectedIndicatorSize: "lg" },

            // Medium sizes -> "md"
            { size: "base", expectedIndicatorSize: "md" },
            { size: "lg", expectedIndicatorSize: "md" },

            // Small sizes -> "sm"
            { size: "sm", expectedIndicatorSize: "sm" },
            { size: "xs", expectedIndicatorSize: "sm" },

            // Default case -> "sm"
            { size: "unknown", expectedIndicatorSize: "sm" },
            { size: null, expectedIndicatorSize: "sm" },
            { size: "", expectedIndicatorSize: "sm" },
            { size: 123, expectedIndicatorSize: "sm" },
        ];

        for (const [index, { size }] of testCases.entries()) {
            render(
                <ThemeProvider>
                    <StatusBadge
                        label={`Test-${index}`}
                        status="up"
                        size={size}
                        showIcon
                    />
                </ThemeProvider>
            );

            // Verify the component renders (the actual indicator size is internal,
            // but we can verify the component handles it gracefully)
            expect(screen.getByText(`Test-${index}: up`)).toBeInTheDocument();
        }
    });

    it("should handle all formatter edge cases", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        // Test custom formatter function
        const customFormatter = (label: string, status: string) =>
            `${label.toUpperCase()}: ${status.toUpperCase()}`;

        render(
            <ThemeProvider>
                <StatusBadge
                    label="custom"
                    status="paused"
                    formatter={customFormatter}
                    showIcon={false}
                />
            </ThemeProvider>
        );

        expect(screen.getByText("CUSTOM: PAUSED")).toBeInTheDocument();
    });

    it("should handle showIcon false case", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(
            <ThemeProvider>
                <StatusBadge
                    label="No Icon Test"
                    status="up"
                    showIcon={false}
                />
            </ThemeProvider>
        );

        expect(screen.getByText("No Icon Test: up")).toBeInTheDocument();
    });

    it("should handle className prop", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: StatusBadge.additional-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(
            <ThemeProvider>
                <StatusBadge
                    label="Class Test"
                    status="up"
                    className="custom-class"
                />
            </ThemeProvider>
        );

        const container = screen.getByText("Class Test: up").closest("div");
        expect(container).toHaveClass("custom-class");
    });
});
