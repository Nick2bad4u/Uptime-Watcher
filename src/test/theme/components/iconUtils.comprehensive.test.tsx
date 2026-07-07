import { render, screen } from "@testing-library/react";
import * as React from "react";
import { objectEntries } from "ts-extras";
/**
 * Comprehensive tests for iconUtils functions to achieve complete function
 * coverage
 */
import { describe, expect, it } from "vitest";

import { renderColoredIcon } from "../../../theme/components/iconUtils";

describe("iconUtils functions", () => {
    describe(renderColoredIcon, () => {
        it("should return the icon as-is when icon is falsy", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            expect(renderColoredIcon(null)).toBeNull();
            expect(renderColoredIcon(undefined)).toBeUndefined();
            expect(renderColoredIcon(false)).toBeFalsy();
        });

        it("should return icon as-is when no color is provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const icon = <div>test-icon</div>;
            expect(renderColoredIcon(icon)).toBe(icon);
        });

        it("should wrap icon in span with color class for known colors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const icon = <div>test-icon</div>;
            render(renderColoredIcon(icon, "danger") as React.ReactElement);
            // The span wraps the icon, so we find it by looking for its parent
            const iconElement = screen.getByText("test-icon");
            expect(iconElement.parentElement).toHaveClass("themed-icon--error");
            expect(iconElement.parentElement?.tagName).toBe("SPAN");
        });

        it("should wrap icon in span with inline style for custom colors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const icon = <div>test-icon</div>;
            render(renderColoredIcon(icon, "#ff0000") as React.ReactElement);
            const iconElement = screen.getByText("test-icon");
            expect(iconElement.parentElement).toHaveStyle({ color: "#ff0000" });
            expect(iconElement.parentElement?.tagName).toBe("SPAN");
        });

        it("should handle all known color types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const icon = <div>test</div>;
            const colorClassByName = {
                danger: "themed-icon--error",
                error: "themed-icon--error",
                info: "themed-icon--info",
                primary: "themed-icon--primary",
                secondary: "themed-icon--secondary",
                success: "themed-icon--success",
                warning: "themed-icon--warning",
            } as const;

            for (const [color, expectedClassName] of objectEntries(
                colorClassByName
            )) {
                const { unmount } = render(
                    renderColoredIcon(icon, color) as React.ReactElement
                );
                const iconElement = screen.getByText("test");
                expect(iconElement.parentElement?.tagName).toBe("SPAN");
                expect(iconElement.parentElement).toHaveClass(
                    expectedClassName
                );
                unmount();
            }
        });

        it("should handle string icons with color classes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                renderColoredIcon(
                    "string-icon",
                    "success"
                ) as React.ReactElement
            );
            const iconElement = screen.getByText("string-icon");
            expect(iconElement).toHaveClass("themed-icon--success");
            expect(iconElement.tagName).toBe("SPAN");
        });

        it("should handle string icons with custom colors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                renderColoredIcon(
                    "string-icon",
                    "#00ff00"
                ) as React.ReactElement
            );
            const iconElement = screen.getByText("string-icon");
            expect(iconElement).toHaveStyle({ color: "#00ff00" });
            expect(iconElement.tagName).toBe("SPAN");
        });
    });
});
