/**
 * Comprehensive tests for iconUtils functions to achieve complete function
 * coverage
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
    getIconColorClass,
    renderColoredIcon,
} from "../../../theme/components/iconUtils";

describe("iconUtils functions", () => {
    describe("getIconColorClass", () => {
        it("should return undefined for no color", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            expect(getIconColorClass()).toBeUndefined();
            expect(getIconColorClass(undefined)).toBeUndefined();
        });

        it("should return themed-icon--error for danger and error colors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: iconUtils", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            expect(getIconColorClass("danger")).toBe("themed-icon--error");
            expect(getIconColorClass("error")).toBe("themed-icon--error");
        });

        it("should return themed-icon--info for info color", ({
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

            expect(getIconColorClass("info")).toBe("themed-icon--info");
        });

        it("should return themed-icon--primary for primary color", ({
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

            expect(getIconColorClass("primary")).toBe("themed-icon--primary");
        });

        it("should return themed-icon--secondary for secondary color", ({
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

            expect(getIconColorClass("secondary")).toBe(
                "themed-icon--secondary"
            );
        });

        it("should return themed-icon--success for success color", ({
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

            expect(getIconColorClass("success")).toBe("themed-icon--success");
        });

        it("should return themed-icon--warning for warning color", ({
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

            expect(getIconColorClass("warning")).toBe("themed-icon--warning");
        });

        it("should return undefined for unknown colors", ({
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

            expect(getIconColorClass("unknown")).toBeUndefined();
            expect(getIconColorClass("invalid")).toBeUndefined();
            expect(getIconColorClass("")).toBeUndefined();
            expect(getIconColorClass("custom")).toBeUndefined();
        });
    });

    describe("renderColoredIcon", () => {
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
            expect(renderColoredIcon(false)).toBe(false);
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
            const colors = [
                "danger",
                "error",
                "info",
                "primary",
                "secondary",
                "success",
                "warning",
            ];

            for (const color of colors) {
                const { unmount } = render(
                    renderColoredIcon(icon, color) as React.ReactElement
                );
                const iconElement = screen.getByText("test");
                expect(iconElement.parentElement?.tagName).toBe("SPAN");
                expect(iconElement.parentElement).toBeTruthy();
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
