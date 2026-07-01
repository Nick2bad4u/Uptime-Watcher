/**
 * Comprehensive tests for Theme components to achieve 98%+ coverage. Tests all
 * theme component variants, props, and edge cases.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { safeCastTo } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MiniChartBar } from "../../theme/components/MiniChartBar";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedBadge } from "../../theme/components/ThemedBadge";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedCard } from "../../theme/components/ThemedCard";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedInput } from "../../theme/components/ThemedInput";
import { ThemedSelect } from "../../theme/components/ThemedSelect";
import { ThemedText } from "../../theme/components/ThemedText";

// Mock functions for testing
const mockOnClick = vi.fn();
const mockOnChange = vi.fn();

describe("Theme Components - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ThemedBox Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedBox>Content</ThemedBox>);

            const box = screen.getByText("Content");
            expect(box).toBeInTheDocument();
            expect(box).toHaveTextContent("Content");
        });

        it("should apply all surface variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const surfaces = [
                "base",
                "elevated",
                "overlay",
            ] as const;

            for (const surface of surfaces) {
                const { unmount } = render(
                    <ThemedBox surface={surface}>Surface {surface}</ThemedBox>
                );

                const box = screen.getByText(`Surface ${surface}`);
                expect(box).toBeInTheDocument();
                expect(box).toHaveClass("themed-box");

                unmount();
            }
        });

        it("should apply all padding variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const paddings = [
                "lg",
                "md",
                "sm",
                "xl",
                "xs",
            ] as const;

            for (const padding of paddings) {
                const { unmount } = render(
                    <ThemedBox padding={padding}>Padding {padding}</ThemedBox>
                );

                const box = screen.getByText(`Padding ${padding}`);
                expect(box).toBeInTheDocument();
                expect(box).toHaveClass("themed-box");

                unmount();
            }
        });

        it("should handle click events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            render(<ThemedBox onClick={mockOnClick}>Clickable box</ThemedBox>);

            const box = screen.getByText("Clickable box");
            fireEvent.click(box);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should handle different element types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const elements = [
                "article",
                "aside",
                "div",
                "section",
            ] as const;

            for (const as of elements) {
                const { unmount } = render(
                    <ThemedBox as={as}>Element {as}</ThemedBox>
                );

                const box = screen.getByText(`Element ${as}`);
                expect(box).toBeInTheDocument();
                expect(box.tagName.toLowerCase()).toBe(as);

                unmount();
            }
        });

        it("should handle variant prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const variants = [
                "primary",
                "secondary",
                "tertiary",
            ] as const;

            for (const variant of variants) {
                const { unmount } = render(
                    <ThemedBox variant={variant}>Variant {variant}</ThemedBox>
                );

                const box = screen.getByText(`Variant ${variant}`);
                expect(box).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle rounded prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const roundedOptions = [
                "full",
                "lg",
                "md",
                "none",
                "sm",
            ] as const;

            for (const rounded of roundedOptions) {
                const { unmount } = render(
                    <ThemedBox rounded={rounded}>Rounded {rounded}</ThemedBox>
                );

                const box = screen.getByText(`Rounded ${rounded}`);
                expect(box).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle shadow prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const shadowOptions = [
                "inner",
                "lg",
                "md",
                "sm",
                "xl",
            ] as const;

            for (const shadow of shadowOptions) {
                const { unmount } = render(
                    <ThemedBox shadow={shadow}>Shadow {shadow}</ThemedBox>
                );

                const box = screen.getByText(`Shadow ${shadow}`);
                expect(box).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle border prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedBox border>Bordered box</ThemedBox>);

            const box = screen.getByText("Bordered box");
            expect(box).toBeInTheDocument();
        });

        it("should handle mouse events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            const mockMouseEnter = vi.fn();
            const mockMouseLeave = vi.fn();

            render(
                <ThemedBox
                    onMouseEnter={mockMouseEnter}
                    onMouseLeave={mockMouseLeave}
                >
                    Mouse events
                </ThemedBox>
            );

            const box = screen.getByText("Mouse events");
            fireEvent.mouseEnter(box);
            expect(mockMouseEnter).toHaveBeenCalledTimes(1);

            fireEvent.mouseLeave(box);
            expect(mockMouseLeave).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedButton Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton onClick={mockOnClick}>
                    Default Button
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "Default Button",
            });
            expect(button).toBeInTheDocument();
        });

        it("should apply all variant styles", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const variants = [
                "error",
                "ghost",
                "outline",
                "primary",
                "secondary",
                "success",
                "tertiary",
                "warning",
            ] as const;

            for (const variant of variants) {
                const { unmount } = render(
                    <ThemedButton onClick={mockOnClick} variant={variant}>
                        {variant} Button
                    </ThemedButton>
                );

                const button = screen.getByRole("button", {
                    name: `${variant} Button`,
                });
                expect(button).toBeInTheDocument();

                unmount();
            }
        });

        it("should apply all size variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const sizes = [
                "lg",
                "md",
                "sm",
                "xl",
                "xs",
            ] as const;

            for (const size of sizes) {
                const { unmount } = render(
                    <ThemedButton onClick={mockOnClick} size={size}>
                        {size} Button
                    </ThemedButton>
                );

                const button = screen.getByRole("button", {
                    name: `${size} Button`,
                });
                expect(button).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle disabled state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton disabled onClick={mockOnClick}>
                    Disabled Button
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "Disabled Button",
            });
            expect(button).toBeDisabled();
        });

        it("should handle loading state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Loading", "type");

            render(
                <ThemedButton loading onClick={mockOnClick}>
                    Loading Button
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "Loading Button",
            });
            expect(button).toBeDisabled();
        });

        it("should handle fullWidth prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton fullWidth onClick={mockOnClick}>
                    Full Width Button
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "Full Width Button",
            });
            expect(button).toBeInTheDocument();
        });

        it("should handle icon prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton icon={<span>🚀</span>} onClick={mockOnClick}>
                    Icon Button
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "🚀Icon Button",
            });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("🚀")).toBeInTheDocument();
        });

        it("should handle iconPosition prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton
                    icon={<span>🚀</span>}
                    iconPosition="right"
                    onClick={mockOnClick}
                >
                    Icon Right
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "Icon Right🚀",
            });
            expect(button).toBeInTheDocument();
        });

        it("should handle iconColor prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedButton
                    icon={<span>🚀</span>}
                    iconColor="red"
                    onClick={mockOnClick}
                >
                    Colored Icon
                </ThemedButton>
            );

            const button = screen.getByRole("button", {
                name: "🚀Colored Icon",
            });
            expect(button).toBeInTheDocument();
        });

        it("should handle different button types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const types = [
                "button",
                "reset",
                "submit",
            ] as const;

            for (const type of types) {
                const { unmount } = render(
                    <ThemedButton onClick={mockOnClick} type={type}>
                        {type} Button
                    </ThemedButton>
                );

                const button = screen.getByRole("button", {
                    name: `${type} Button`,
                });
                expect(button).toHaveAttribute("type", type);

                unmount();
            }
        });
    });

    describe("ThemedInput Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedInput />);

            const input = screen.getByRole("textbox");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "text");
        });

        it("should handle different input types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const types = [
                "email",
                "password",
                "text",
                "url",
            ] as const;

            for (const type of types) {
                const { unmount } = render(
                    <ThemedInput placeholder={`${type} input`} type={type} />
                );

                const input = screen.getByPlaceholderText(`${type} input`);
                expect(input).toHaveAttribute("type", type);

                unmount();
            }
        });

        it("should handle number input type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedInput placeholder="number input" type="number" />);

            const input = screen.getByPlaceholderText("number input");
            expect(input).toHaveAttribute("type", "number");
        });

        it("should handle disabled state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedInput disabled placeholder="disabled input" />);

            const input = screen.getByPlaceholderText("disabled input");
            expect(input).toBeDisabled();
        });

        it("should handle value and onChange", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedInput
                    onChange={mockOnChange}
                    placeholder="controlled input"
                    value="test value"
                />
            );

            const input = safeCastTo<HTMLInputElement>(
                screen.getByPlaceholderText("controlled input")
            );
            expect(input.value).toBe("test value");

            fireEvent.change(input, { target: { value: "new value" } });
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should handle placeholder and required", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedInput placeholder="Enter text" required />);

            const input = screen.getByPlaceholderText("Enter text");
            expect(input).toHaveAttribute("placeholder", "Enter text");
            expect(input).toHaveAttribute("required");
        });

        it("should handle min/max for number inputs", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedInput
                    max={100}
                    min={1}
                    placeholder="number range"
                    step={0.1}
                    type="number"
                />
            );

            const input = screen.getByPlaceholderText("number range");
            expect(input).toHaveAttribute("min", "1");
            expect(input).toHaveAttribute("max", "100");
            expect(input).toHaveAttribute("step", "0.1");
        });

        it("should handle aria attributes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedInput
                    aria-describedby="search-help"
                    aria-label="Search"
                />
            );

            const input = screen.getByLabelText("Search");
            expect(input).toHaveAttribute("aria-label", "Search");
            expect(input).toHaveAttribute("aria-describedby", "search-help");
        });
    });

    describe("ThemedText Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedText>Default text</ThemedText>);

            const text = screen.getByText("Default text");
            expect(text).toBeInTheDocument();
        });

        it("should apply all size variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const sizes = [
                "2xl",
                "3xl",
                "4xl",
                "base",
                "lg",
                "md",
                "sm",
                "xl",
                "xs",
            ] as const;

            for (const size of sizes) {
                const { unmount } = render(
                    <ThemedText size={size}>Size {size}</ThemedText>
                );

                const text = screen.getByText(`Size ${size}`);
                expect(text).toBeInTheDocument();

                unmount();
            }
        });

        it("should apply all weight variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const weights = [
                "bold",
                "medium",
                "normal",
                "semibold",
            ] as const;

            for (const weight of weights) {
                const { unmount } = render(
                    <ThemedText weight={weight}>Weight {weight}</ThemedText>
                );

                const text = screen.getByText(`Weight ${weight}`);
                expect(text).toBeInTheDocument();

                unmount();
            }
        });

        it("should apply all variant colors", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const variants = [
                "danger",
                "error",
                "info",
                "inverse",
                "primary",
                "secondary",
                "success",
                "tertiary",
                "warning",
            ] as const;

            for (const variant of variants) {
                const { unmount } = render(
                    <ThemedText variant={variant}>Variant {variant}</ThemedText>
                );

                const text = screen.getByText(`Variant ${variant}`);
                expect(text).toBeInTheDocument();

                unmount();
            }
        });

        it("should apply all text alignment", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const alignments = [
                "center",
                "justify",
                "left",
                "right",
            ] as const;

            for (const align of alignments) {
                const { unmount } = render(
                    <ThemedText align={align}>Align {align}</ThemedText>
                );

                const text = screen.getByText(`Align ${align}`);
                expect(text).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle style prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedText style={{ color: "red", fontSize: "20px" }}>
                    Styled text
                </ThemedText>
            );

            const text = screen.getByText("Styled text");
            expect(text).toHaveStyle("color: rgb(255, 0, 0)");
            expect(text).toHaveStyle("font-size: 20px");
        });
    });

    describe("ThemedCheckbox Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCheckbox onChange={mockOnChange} />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).toHaveAttribute("type", "checkbox");
        });

        it("should handle checked state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCheckbox checked onChange={mockOnChange} />);

            const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
            expect(checkbox.checked).toBeTruthy();
        });

        it("should handle disabled state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCheckbox disabled onChange={mockOnChange} />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeDisabled();
        });

        it("should handle required prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCheckbox onChange={mockOnChange} required />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toHaveAttribute("required");
        });

        it("should apply accessibility props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedCheckbox
                    aria-label="Accept terms"
                    onChange={mockOnChange}
                />
            );

            const checkbox = screen.getByLabelText("Accept terms");
            expect(checkbox).toHaveAttribute("aria-label", "Accept terms");
        });

        it("should handle change events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            render(<ThemedCheckbox onChange={mockOnChange} />);

            const checkbox = screen.getByRole("checkbox");
            fireEvent.click(checkbox);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedSelect Component", () => {
        it("should render with children", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedSelect onChange={mockOnChange}>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox");
            expect(select).toBeInTheDocument();

            const options = select.querySelectorAll("option");
            expect(options).toHaveLength(3);
        });

        it("should handle disabled state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedSelect disabled onChange={mockOnChange}>
                    <option value="test">Test</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox");
            expect(select).toBeDisabled();
        });

        it("should handle value and onChange", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedSelect onChange={mockOnChange} value="option2">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox") as HTMLSelectElement;
            expect(select.value).toBe("option2");

            fireEvent.change(select, { target: { value: "option3" } });
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should handle required prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedSelect onChange={mockOnChange} required>
                    <option value="test">Test</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox");
            expect(select).toHaveAttribute("required");
        });

        it("should handle click and mouse events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            const mockClick = vi.fn();
            const mockMouseDown = vi.fn();

            render(
                <ThemedSelect
                    onChange={mockOnChange}
                    onClick={mockClick}
                    onMouseDown={mockMouseDown}
                >
                    <option value="test">Test</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox");
            fireEvent.click(select);
            fireEvent.mouseDown(select);

            expect(mockClick).toHaveBeenCalledTimes(1);
            expect(mockMouseDown).toHaveBeenCalledTimes(1);
        });

        it("should handle aria attributes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedSelect
                    aria-describedby="select-help"
                    aria-label="Choose option"
                    onChange={mockOnChange}
                >
                    <option value="test">Test</option>
                </ThemedSelect>
            );

            const select = screen.getByLabelText("Choose option");
            expect(select).toHaveAttribute("aria-label", "Choose option");
            expect(select).toHaveAttribute("aria-describedby", "select-help");
        });
    });

    describe("ThemedCard Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCard>Card content</ThemedCard>);

            const card = screen.getByText("Card content").closest("div");
            expect(card).toBeInTheDocument();
            expect(card).toHaveTextContent("Card content");
        });

        it("should handle title and subtitle", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedCard subtitle="Card Subtitle" title="Card Title">
                    Card content
                </ThemedCard>
            );

            const title = screen.getByText("Card Title");
            const subtitle = screen.getByText("Card Subtitle");
            expect(title).toBeInTheDocument();
            expect(subtitle).toBeInTheDocument();
        });

        it("should handle clickable state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedCard clickable onClick={mockOnClick}>
                    Clickable card
                </ThemedCard>
            );

            const card = screen.getByRole("button");
            fireEvent.click(card);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should handle hoverable state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedCard hoverable>Hoverable card</ThemedCard>);

            const card = screen.getByText("Hoverable card").closest("div");
            expect(card).toBeInTheDocument();
        });

        it("should handle icon prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedCard icon={<span>📦</span>} iconColor="blue">
                    Card with icon
                </ThemedCard>
            );

            const iconElement = screen.getByText("📦");
            expect(iconElement).toBeInTheDocument();
            expect(screen.getByText("Card with icon")).toBeInTheDocument();
        });

        it("should handle all variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const variants = [
                "primary",
                "secondary",
                "tertiary",
            ] as const;

            for (const variant of variants) {
                const { unmount } = render(
                    <ThemedCard variant={variant}>Variant {variant}</ThemedCard>
                );

                const cardText = screen.getByText(`Variant ${variant}`);
                expect(cardText).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle mouse events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Event Processing", "type");

            const mockMouseEnter = vi.fn();
            const mockMouseLeave = vi.fn();

            render(
                <ThemedCard
                    onMouseEnter={mockMouseEnter}
                    onMouseLeave={mockMouseLeave}
                >
                    Mouse events card
                </ThemedCard>
            );

            const card = screen.getByText("Mouse events card").closest("div");
            fireEvent.mouseEnter(card!);
            fireEvent.mouseLeave(card!);

            expect(mockMouseEnter).toHaveBeenCalledTimes(1);
            expect(mockMouseLeave).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedBadge Component", () => {
        it("should render with default props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<ThemedBadge>Default Badge</ThemedBadge>);

            const badge = screen.getByText("Default Badge");
            expect(badge).toBeInTheDocument();
        });

        it("should apply all variant styles", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const variants = [
                "error",
                "info",
                "primary",
                "secondary",
                "success",
                "warning",
            ] as const;

            for (const variant of variants) {
                const { unmount } = render(
                    <ThemedBadge variant={variant}>{variant} Badge</ThemedBadge>
                );

                const badge = screen.getByText(`${variant} Badge`);
                expect(badge).toBeInTheDocument();

                unmount();
            }
        });

        it("should apply all size variants", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const sizes = [
                "lg",
                "md",
                "sm",
                "xs",
            ] as const;

            for (const size of sizes) {
                const { unmount } = render(
                    <ThemedBadge size={size}>{size} Badge</ThemedBadge>
                );

                const badge = screen.getByText(`${size} Badge`);
                expect(badge).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle icon prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemedBadge icon={<span>⭐</span>} iconColor="gold">
                    Badge with icon
                </ThemedBadge>
            );

            const badge = screen.getByText("Badge with icon");
            expect(badge).toBeInTheDocument();
            expect(screen.getByText("⭐")).toBeInTheDocument();
        });
    });

    describe("StatusIndicator Component", () => {
        it("should render with status", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<StatusIndicator status="up" />);

            // StatusIndicator renders as a div with themed-status-indicator class
            const indicator = document.querySelector(
                ".themed-status-indicator"
            );
            expect(indicator).toBeInTheDocument();
        });

        it("should handle different sizes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const sizes = [
                "lg",
                "md",
                "sm",
            ] as const;

            for (const size of sizes) {
                const { unmount } = render(
                    <StatusIndicator size={size} status="up" />
                );

                const indicator = document.querySelector(
                    ".themed-status-indicator"
                );
                expect(indicator).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle showText prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<StatusIndicator showText status="up" />);

            const textElement = screen.getByText("Up");
            expect(textElement).toBeInTheDocument();
        });

        it("should handle different status values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const statuses = [
                "down",
                "unknown",
                "up",
            ] as const;

            for (const status of statuses) {
                const { unmount } = render(<StatusIndicator status={status} />);

                const indicator = document.querySelector(
                    ".themed-status-indicator"
                );
                expect(indicator).toBeInTheDocument();

                unmount();
            }
        });
    });

    describe("MiniChartBar Component", () => {
        it("should render with status and timestamp", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<MiniChartBar status="up" timestamp={new Date()} />);

            // MiniChartBar renders as a simple div, not with presentation role
            const bar = document.querySelector(".themed-mini-chart-bar");
            expect(bar).toBeInTheDocument();
        });

        it("should handle responseTime prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <MiniChartBar
                    responseTime={150}
                    status="up"
                    timestamp={new Date()}
                />
            );

            const bar = document.querySelector(".themed-mini-chart-bar");
            expect(bar).toBeInTheDocument();
        });

        it("should handle different status values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const statuses = [
                "down",
                "unknown",
                "up",
            ] as const;

            for (const status of statuses) {
                const { unmount } = render(
                    <MiniChartBar status={status} timestamp={new Date()} />
                );

                const bar = document.querySelector(".themed-mini-chart-bar");
                expect(bar).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle string timestamp", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <MiniChartBar status="up" timestamp="2024-01-01T00:00:00Z" />
            );

            const bar = document.querySelector(".themed-mini-chart-bar");
            expect(bar).toBeInTheDocument();
        });

        it("should handle number timestamp", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(<MiniChartBar status="up" timestamp={Date.now()} />);

            const bar = document.querySelector(".themed-mini-chart-bar");
            expect(bar).toBeInTheDocument();
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle all components together", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            render(
                <ThemedBox padding="lg" surface="elevated">
                    <ThemedText size="lg" weight="bold">
                        Form Components
                    </ThemedText>
                    <ThemedInput placeholder="Name" />
                    <ThemedSelect onChange={mockOnChange}>
                        <option value="test">Test</option>
                    </ThemedSelect>
                    <ThemedCheckbox onChange={mockOnChange} />
                    <ThemedButton onClick={mockOnClick}>Submit</ThemedButton>
                    <ThemedBadge variant="success">Success</ThemedBadge>
                    <StatusIndicator status="up" />
                    <MiniChartBar status="up" timestamp={new Date()} />
                </ThemedBox>
            );

            expect(screen.getByText("Form Components")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Submit" })
            ).toBeInTheDocument();
            expect(screen.getByText("Success")).toBeInTheDocument();
        });

        it("should handle components with custom className", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: components.maximal-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <div>
                    <ThemedBox className="custom-box">Box</ThemedBox>
                    <ThemedButton className="custom-btn" onClick={mockOnClick}>
                        Button
                    </ThemedButton>
                    <ThemedInput className="custom-input" placeholder="input" />
                    <ThemedText className="custom-text">Text</ThemedText>
                    <ThemedCard className="custom-card">Card</ThemedCard>
                    <ThemedBadge className="custom-badge">Badge</ThemedBadge>
                </div>
            );

            expect(screen.getByText("Box")).toHaveClass("custom-box");
            expect(screen.getByRole("button")).toHaveClass("custom-btn");
            expect(screen.getByPlaceholderText("input")).toHaveClass(
                "custom-input"
            );
            expect(screen.getByText("Text")).toHaveClass("custom-text");
            expect(
                screen.getByText("Card").closest(".themed-card")
            ).toHaveClass("custom-card");
            expect(screen.getByText("Badge")).toHaveClass("custom-badge");
        });
    });
});
