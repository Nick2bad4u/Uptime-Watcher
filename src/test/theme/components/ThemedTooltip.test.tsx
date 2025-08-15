/**
 * @version 1.0.0
 *
 * @file Comprehensive tests for ThemedTooltip component
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemedTooltip, {
    type ThemedTooltipProperties,
} from "../../../theme/components/ThemedTooltip";

describe("ThemedTooltip", () => {
    const defaultProps: ThemedTooltipProperties = {
        content: "Test tooltip content",
        children: <span>Hover me</span>,
    };

    describe("Rendering", () => {
        it("should render children content", () => {
            render(<ThemedTooltip {...defaultProps} />);

            expect(screen.getByText("Hover me")).toBeInTheDocument();
        });

        it("should render with tooltip content as title attribute", () => {
            render(<ThemedTooltip {...defaultProps} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Test tooltip content"
            );
        });

        it("should apply base themed-tooltip class", () => {
            render(<ThemedTooltip {...defaultProps} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveClass("themed-tooltip");
        });

        it("should render with custom className", () => {
            render(
                <ThemedTooltip {...defaultProps} className="custom-tooltip" />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveClass(
                "themed-tooltip",
                "custom-tooltip"
            );
        });

        it("should render with empty className", () => {
            render(<ThemedTooltip {...defaultProps} className="" />);

            const tooltipContainer =
                screen.getByText("Hover me").parentElement!;
            expect(tooltipContainer).toHaveClass("themed-tooltip");
            expect(tooltipContainer.className).toBe("themed-tooltip ");
        });
    });

    describe("Content Handling", () => {
        it("should handle empty tooltip content", () => {
            render(<ThemedTooltip {...defaultProps} content="" />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", "");
        });

        it("should handle long tooltip content", () => {
            const longContent =
                "This is a very long tooltip content that contains multiple sentences and should be displayed properly when the user hovers over the element.";
            render(<ThemedTooltip {...defaultProps} content={longContent} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", longContent);
        });

        it("should handle tooltip content with special characters", () => {
            const specialContent = "Special chars: & < > \" ' @#$%^&*()";
            render(
                <ThemedTooltip {...defaultProps} content={specialContent} />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", specialContent);
        });

        it("should handle tooltip content with newlines", () => {
            const multilineContent = "Line 1\nLine 2\nLine 3";
            render(
                <ThemedTooltip {...defaultProps} content={multilineContent} />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", multilineContent);
        });

        it("should handle tooltip content with HTML entities", () => {
            const htmlContent = "Value must be > 0 & < 100";
            render(<ThemedTooltip {...defaultProps} content={htmlContent} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", htmlContent);
        });

        it("should handle unicode tooltip content", () => {
            const unicodeContent = "Unicode test: 🎯 📊 ✅ ❌ ⚠️";
            render(
                <ThemedTooltip {...defaultProps} content={unicodeContent} />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", unicodeContent);
        });
    });

    describe("Children Handling", () => {
        it("should render text children", () => {
            render(
                <ThemedTooltip content="Tooltip">
                    Simple text content
                </ThemedTooltip>
            );

            expect(screen.getByText("Simple text content")).toBeInTheDocument();
        });

        it("should render element children", () => {
            render(
                <ThemedTooltip content="Button tooltip">
                    <button>Click me</button>
                </ThemedTooltip>
            );

            expect(
                screen.getByRole("button", { name: "Click me" })
            ).toBeInTheDocument();
        });

        it("should render multiple children", () => {
            render(
                <ThemedTooltip content="Multiple elements">
                    <span>First</span>
                    <span>Second</span>
                </ThemedTooltip>
            );

            expect(screen.getByText("First")).toBeInTheDocument();
            expect(screen.getByText("Second")).toBeInTheDocument();
        });

        it("should render complex nested children", () => {
            render(
                <ThemedTooltip content="Complex content">
                    <div>
                        <span>Nested</span>
                        <div>
                            <button>Deep button</button>
                        </div>
                    </div>
                </ThemedTooltip>
            );

            expect(screen.getByText("Nested")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Deep button" })
            ).toBeInTheDocument();
        });

        it("should handle empty children", () => {
            render(<ThemedTooltip content="Empty tooltip">{""}</ThemedTooltip>);

            const tooltipContainer = screen.getByTitle("Empty tooltip");
            expect(tooltipContainer).toBeInTheDocument();
        });

        it("should handle numeric children", () => {
            render(
                <ThemedTooltip content="Number tooltip">{42}</ThemedTooltip>
            );

            expect(screen.getByText("42")).toBeInTheDocument();
        });
    });

    describe("CSS Classes", () => {
        it("should combine base class with custom className", () => {
            render(
                <ThemedTooltip
                    {...defaultProps}
                    className="custom-class another-class"
                />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveClass(
                "themed-tooltip",
                "custom-class",
                "another-class"
            );
        });

        it("should handle whitespace in className", () => {
            render(
                <ThemedTooltip {...defaultProps} className="spaced-class" />
            );

            const tooltipContainer =
                screen.getByText("Hover me").parentElement!;
            expect(tooltipContainer.className).toBe(
                "themed-tooltip   spaced-class  "
            );
        });

        it("should handle undefined className", () => {
            render(<ThemedTooltip {...defaultProps} className={undefined} />);

            const tooltipContainer =
                screen.getByText("Hover me").parentElement!;
            expect(tooltipContainer).toHaveClass("themed-tooltip");
            expect(tooltipContainer.className).toBe("themed-tooltip ");
        });

        it("should preserve class order", () => {
            render(
                <ThemedTooltip
                    {...defaultProps}
                    className="first second third"
                />
            );

            const tooltipContainer =
                screen.getByText("Hover me").parentElement!;
            expect(tooltipContainer.className).toBe(
                "themed-tooltip first second third"
            );
        });
    });

    describe("User Interactions", () => {
        it("should allow interaction with children", async () => {
            const user = userEvent.setup();
            const mockClick = vi.fn();

            render(
                <ThemedTooltip content="Button tooltip">
                    <button onClick={mockClick}>Interactive button</button>
                </ThemedTooltip>
            );

            const button = screen.getByRole("button", {
                name: "Interactive button",
            });
            await user.click(button);

            expect(mockClick).toHaveBeenCalledTimes(1);
        });

        it("should support hover interactions", async () => {
            const user = userEvent.setup();

            render(<ThemedTooltip {...defaultProps} />);

            const tooltipContainer =
                screen.getByText("Hover me").parentElement!;

            // Test that hover behavior works with title attribute
            await user.hover(tooltipContainer);
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Test tooltip content"
            );

            await user.unhover(tooltipContainer);
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Test tooltip content"
            );
        });

        it("should support keyboard navigation", async () => {
            const user = userEvent.setup();
            const mockClick = vi.fn();

            render(
                <ThemedTooltip content="Keyboard tooltip">
                    <button onClick={mockClick}>Keyboard button</button>
                </ThemedTooltip>
            );

            const button = screen.getByRole("button", {
                name: "Keyboard button",
            });
            button.focus();
            await user.keyboard("{Enter}");

            expect(mockClick).toHaveBeenCalledTimes(1);
        });

        it("should support focus events", () => {
            render(
                <ThemedTooltip content="Focus tooltip">
                    <input type="text" placeholder="Focus me" />
                </ThemedTooltip>
            );

            const input = screen.getByPlaceholderText("Focus me");
            input.focus();

            expect(input).toHaveFocus();
            const tooltipContainer = input.parentElement;
            expect(tooltipContainer).toHaveAttribute("title", "Focus tooltip");
        });
    });

    describe("Accessibility", () => {
        it("should provide tooltip content via title attribute", () => {
            render(<ThemedTooltip {...defaultProps} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Test tooltip content"
            );
        });

        it("should preserve child element accessibility", () => {
            render(
                <ThemedTooltip content="Accessible tooltip">
                    <button aria-label="Accessible button">Click</button>
                </ThemedTooltip>
            );

            const button = screen.getByLabelText("Accessible button");
            expect(button).toBeInTheDocument();
        });

        it("should not interfere with child element roles", () => {
            render(
                <ThemedTooltip content="Role tooltip">
                    <div role="alert">Alert message</div>
                </ThemedTooltip>
            );

            const alert = screen.getByRole("alert");
            expect(alert).toHaveTextContent("Alert message");
        });

        it("should support screen reader friendly content", () => {
            render(
                <ThemedTooltip content="Screen reader tooltip information">
                    <span aria-describedby="tooltip-desc">
                        Described content
                    </span>
                </ThemedTooltip>
            );

            const describedElement = screen.getByText("Described content");
            expect(describedElement).toHaveAttribute(
                "aria-describedby",
                "tooltip-desc"
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle content updates", () => {
            const { rerender } = render(
                <ThemedTooltip {...defaultProps} content="Initial content" />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Initial content"
            );

            rerender(
                <ThemedTooltip {...defaultProps} content="Updated content" />
            );
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Updated content"
            );
        });

        it("should handle children updates", () => {
            const { rerender } = render(
                <ThemedTooltip content="Tooltip">
                    <span>Initial child</span>
                </ThemedTooltip>
            );

            expect(screen.getByText("Initial child")).toBeInTheDocument();

            rerender(
                <ThemedTooltip content="Tooltip">
                    <span>Updated child</span>
                </ThemedTooltip>
            );

            expect(screen.getByText("Updated child")).toBeInTheDocument();
            expect(screen.queryByText("Initial child")).not.toBeInTheDocument();
        });

        it("should handle className updates", () => {
            const { rerender } = render(
                <ThemedTooltip {...defaultProps} className="initial-class" />
            );

            const tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveClass(
                "themed-tooltip",
                "initial-class"
            );

            rerender(
                <ThemedTooltip {...defaultProps} className="updated-class" />
            );
            expect(tooltipContainer).toHaveClass(
                "themed-tooltip",
                "updated-class"
            );
            expect(tooltipContainer).not.toHaveClass("initial-class");
        });

        it("should handle rapid state changes", () => {
            const { rerender } = render(<ThemedTooltip {...defaultProps} />);

            const tooltipContainer = screen.getByText("Hover me").parentElement;

            // Rapid updates
            rerender(
                <ThemedTooltip
                    {...defaultProps}
                    content="Content 1"
                    className="class1"
                />
            );
            expect(tooltipContainer).toHaveAttribute("title", "Content 1");
            expect(tooltipContainer).toHaveClass("class1");

            rerender(
                <ThemedTooltip
                    {...defaultProps}
                    content="Content 2"
                    className="class2"
                />
            );
            expect(tooltipContainer).toHaveAttribute("title", "Content 2");
            expect(tooltipContainer).toHaveClass("class2");

            rerender(
                <ThemedTooltip
                    {...defaultProps}
                    content="Content 3"
                    className="class3"
                />
            );
            expect(tooltipContainer).toHaveAttribute("title", "Content 3");
            expect(tooltipContainer).toHaveClass("class3");
        });

        it("should handle null-like children", () => {
            render(
                <ThemedTooltip content="Null children">
                    {null}
                    {undefined}
                    {false}
                </ThemedTooltip>
            );

            const tooltipContainer = screen.getByTitle("Null children");
            expect(tooltipContainer).toBeInTheDocument();
        });
    });

    describe("Integration scenarios", () => {
        it("should work with all props combinations", () => {
            render(
                <ThemedTooltip
                    content="Complete tooltip with all features"
                    className="integration-test custom-style"
                >
                    <div>
                        <span>Complex content</span>
                        <button>Interactive element</button>
                    </div>
                </ThemedTooltip>
            );

            const tooltipContainer = screen.getByTitle(
                "Complete tooltip with all features"
            );
            expect(tooltipContainer).toHaveClass(
                "themed-tooltip",
                "integration-test",
                "custom-style"
            );
            expect(screen.getByText("Complex content")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Interactive element" })
            ).toBeInTheDocument();
        });

        it("should work with minimal props", () => {
            render(
                <ThemedTooltip content="Minimal tooltip">
                    <span>Simple text</span>
                </ThemedTooltip>
            );

            const tooltipContainer =
                screen.getByText("Simple text").parentElement;
            expect(tooltipContainer).toHaveClass("themed-tooltip");
            expect(tooltipContainer).toHaveAttribute(
                "title",
                "Minimal tooltip"
            );
        });

        it("should maintain tooltip relationship across re-renders", () => {
            const { rerender } = render(<ThemedTooltip {...defaultProps} />);

            let tooltipContainer = screen.getByText("Hover me").parentElement;
            const initialTitle = tooltipContainer?.getAttribute("title");

            rerender(<ThemedTooltip {...defaultProps} />);

            tooltipContainer = screen.getByText("Hover me").parentElement;
            expect(tooltipContainer).toHaveAttribute("title", initialTitle);
        });
    });
});
