/**
 * Comprehensive tests for iconUtils functions to achieve complete function coverage
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { getIconColorClass, renderColoredIcon } from "../../../theme/components/iconUtils";

describe("iconUtils functions", () => {
    describe("getIconColorClass", () => {
        it("should return undefined for no color", () => {
            expect(getIconColorClass()).toBeUndefined();
            expect(getIconColorClass(undefined)).toBeUndefined();
        });

        it("should return themed-icon--error for danger and error colors", () => {
            expect(getIconColorClass("danger")).toBe("themed-icon--error");
            expect(getIconColorClass("error")).toBe("themed-icon--error");
        });

        it("should return themed-icon--info for info color", () => {
            expect(getIconColorClass("info")).toBe("themed-icon--info");
        });

        it("should return themed-icon--primary for primary color", () => {
            expect(getIconColorClass("primary")).toBe("themed-icon--primary");
        });

        it("should return themed-icon--secondary for secondary color", () => {
            expect(getIconColorClass("secondary")).toBe("themed-icon--secondary");
        });

        it("should return themed-icon--success for success color", () => {
            expect(getIconColorClass("success")).toBe("themed-icon--success");
        });

        it("should return themed-icon--warning for warning color", () => {
            expect(getIconColorClass("warning")).toBe("themed-icon--warning");
        });

        it("should return undefined for unknown colors", () => {
            expect(getIconColorClass("unknown")).toBeUndefined();
            expect(getIconColorClass("invalid")).toBeUndefined();
            expect(getIconColorClass("")).toBeUndefined();
            expect(getIconColorClass("custom")).toBeUndefined();
        });
    });

    describe("renderColoredIcon", () => {
        it("should return the icon as-is when icon is falsy", () => {
            expect(renderColoredIcon(null)).toBeNull();
            expect(renderColoredIcon(undefined)).toBeUndefined();
            expect(renderColoredIcon(false)).toBe(false);
        });

        it("should return icon as-is when no color is provided", () => {
            const icon = <div>test-icon</div>;
            const result = renderColoredIcon(icon);
            expect(result).toBe(icon);
        });

        it("should wrap icon in span with color class for known colors", () => {
            const icon = <div>test-icon</div>;
            const result = renderColoredIcon(icon, "danger");
            
            const { container } = render(result as React.ReactElement);
            const span = container.querySelector("span");
            expect(span).toHaveClass("themed-icon--error");
            expect(span).toContainHTML("<div>test-icon</div>");
        });

        it("should wrap icon in span with inline style for custom colors", () => {
            const icon = <div>test-icon</div>;
            const result = renderColoredIcon(icon, "#ff0000");
            
            const { container } = render(result as React.ReactElement);
            const span = container.querySelector("span");
            expect(span).toHaveStyle({ color: "#ff0000" });
            expect(span).toContainHTML("<div>test-icon</div>");
        });

        it("should handle all known color types", () => {
            const icon = <div>test</div>;
            const colors = ["danger", "error", "info", "primary", "secondary", "success", "warning"];
            
            for (const color of colors) {
                const result = renderColoredIcon(icon, color);
                const { container } = render(result as React.ReactElement);
                const span = container.querySelector("span");
                expect(span).toBeTruthy();
                expect(span).toContainHTML("<div>test</div>");
            }
        });

        it("should handle string icons with color classes", () => {
            const result = renderColoredIcon("string-icon", "success");
            const { container } = render(result as React.ReactElement);
            const span = container.querySelector("span");
            expect(span).toHaveClass("themed-icon--success");
            expect(span).toHaveTextContent("string-icon");
        });

        it("should handle string icons with custom colors", () => {
            const result = renderColoredIcon("string-icon", "#00ff00");
            const { container } = render(result as React.ReactElement);
            const span = container.querySelector("span");
            expect(span).toHaveStyle({ color: "#00ff00" });
            expect(span).toHaveTextContent("string-icon");
        });
    });
});
