/**
 * @version 1.0.0
 *
 * @file Comprehensive tests for SaveButton component
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    SaveButton,
    type SaveButtonProps,
} from "../../../components/shared/SaveButton";

// Mock themed components and react-icons
vi.mock("../../../theme/components/ThemedButton", () => ({
    default: ({
        children,
        className,
        disabled,
        icon,
        onClick,
        size,
        variant,
        "aria-label": ariaLabel,
        ...props
    }: any) => (
        <button
            data-testid="themed-button"
            className={className}
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel}
            data-size={size}
            data-variant={variant}
            {...props}
        >
            {icon && <span data-testid="button-icon">{icon}</span>}
            {children}
        </button>
    ),
}));

vi.mock("react-icons/fi", () => ({
    FiSave: () => <svg data-testid="save-icon">Save Icon</svg>,
}));

describe("SaveButton", () => {
    const defaultProps: SaveButtonProps = {
        onClick: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render save button with default props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SaveButton {...defaultProps} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent("Save");
            expect(button).toHaveAttribute("aria-label", "Save changes");
            expect(button).toHaveAttribute("data-size", "sm");
            expect(button).toHaveAttribute("data-variant", "primary");
            expect(button).not.toBeDisabled();
        });

        it("should render save icon", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Saving", "type");

            render(<SaveButton {...defaultProps} />);

            expect(screen.getByTestId("button-icon")).toBeInTheDocument();
            expect(screen.getByTestId("save-icon")).toBeInTheDocument();
        });

        it("should render with custom aria-label", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} aria-label="Save document" />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "aria-label",
                "Save document"
            );
        });

        it("should render with custom className", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SaveButton {...defaultProps} className="custom-save-btn" />
            );

            expect(screen.getByTestId("themed-button")).toHaveClass(
                "custom-save-btn"
            );
        });

        it("should render with different sizes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = render(
                <SaveButton {...defaultProps} size="xs" />
            );
            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-size",
                "xs"
            );

            rerender(<SaveButton {...defaultProps} size="sm" />);
            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-size",
                "sm"
            );

            rerender(<SaveButton {...defaultProps} size="md" />);
            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-size",
                "md"
            );

            rerender(<SaveButton {...defaultProps} size="lg" />);
            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-size",
                "lg"
            );
        });
    });

    describe("Disabled State", () => {
        it("should be disabled when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} disabled={true} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "secondary");
        });

        it("should be disabled when isLoading is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(<SaveButton {...defaultProps} isLoading={true} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "primary"); // isLoading doesn't change variant
        });

        it("should be disabled when both disabled and isLoading are true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={true}
                    isLoading={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "secondary");
        });

        it("should not be disabled when both disabled and isLoading are false", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={false}
                    isLoading={false}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).not.toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "primary");
        });
    });

    describe("Loading State", () => {
        it("should show primary variant when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(<SaveButton {...defaultProps} isLoading={true} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "primary");
        });

        it("should show secondary variant when disabled but not loading", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={true}
                    isLoading={false}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "secondary");
        });

        it("should show secondary variant when both disabled and loading", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={true}
                    isLoading={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("data-variant", "secondary");
        });
    });

    describe("User Interactions", () => {
        it("should call onClick when clicked", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(<SaveButton {...defaultProps} onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");
            await user.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should not call onClick when disabled", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(
                <SaveButton
                    {...defaultProps}
                    onClick={mockOnClick}
                    disabled={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            await user.click(button);

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it("should not call onClick when loading", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(
                <SaveButton
                    {...defaultProps}
                    onClick={mockOnClick}
                    isLoading={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            await user.click(button);

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it("should call onClick multiple times on multiple clicks", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(<SaveButton {...defaultProps} onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");
            await user.click(button);
            await user.click(button);
            await user.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(3);
        });

        it("should support keyboard navigation", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(<SaveButton {...defaultProps} onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");
            button.focus();
            await user.keyboard("{Enter}");

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should support space key activation", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(<SaveButton {...defaultProps} onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");
            button.focus();
            await user.keyboard(" ");

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("Props Spreading", () => {
        it("should spread additional props to ThemedButton", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const SaveButtonWithProps = (props: any) => (
                <SaveButton {...defaultProps} {...props} />
            );

            render(<SaveButtonWithProps data-testattribute="test-value" />);

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("data-testattribute", "test-value");
        });

        it("should handle id prop", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const SaveButtonWithId = (props: any) => (
                <SaveButton {...defaultProps} {...props} />
            );

            render(<SaveButtonWithId id="save-button-id" />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "id",
                "save-button-id"
            );
        });

        it("should handle data attributes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const SaveButtonWithData = (props: any) => (
                <SaveButton {...defaultProps} {...props} />
            );

            render(
                <SaveButtonWithData
                    data-cy="save-btn"
                    data-automation-id="save-button"
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("data-cy", "save-btn");
            expect(button).toHaveAttribute("data-automation-id", "save-button");
        });
    });

    describe("Variant Logic", () => {
        it("should use primary variant when enabled", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} disabled={false} />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-variant",
                "primary"
            );
        });

        it("should use secondary variant when disabled", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} disabled={true} />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-variant",
                "secondary"
            );
        });

        it("should prioritize disabled prop over loading for variant", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={true}
                    isLoading={true}
                />
            );

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-variant",
                "secondary"
            );
        });

        it("should use primary variant when only loading", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            render(
                <SaveButton
                    {...defaultProps}
                    disabled={false}
                    isLoading={true}
                />
            );

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "data-variant",
                "primary"
            );
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label by default", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "aria-label",
                "Save changes"
            );
        });

        it("should allow custom aria-label", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SaveButton {...defaultProps} aria-label="Save form data" />
            );

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "aria-label",
                "Save form data"
            );
        });

        it("should be focusable when enabled", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} />);

            const button = screen.getByTestId("themed-button");
            button.focus();

            expect(button).toHaveFocus();
        });

        it("should maintain accessibility when disabled", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} disabled={true} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute("aria-label", "Save changes");
        });
    });

    describe("Edge Cases", () => {
        it("should handle rapid state changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = render(
                <SaveButton
                    {...defaultProps}
                    disabled={false}
                    isLoading={false}
                />
            );

            expect(screen.getByTestId("themed-button")).not.toBeDisabled();

            rerender(
                <SaveButton
                    {...defaultProps}
                    disabled={true}
                    isLoading={false}
                />
            );
            expect(screen.getByTestId("themed-button")).toBeDisabled();

            rerender(
                <SaveButton
                    {...defaultProps}
                    disabled={false}
                    isLoading={true}
                />
            );
            expect(screen.getByTestId("themed-button")).toBeDisabled();

            rerender(
                <SaveButton
                    {...defaultProps}
                    disabled={false}
                    isLoading={false}
                />
            );
            expect(screen.getByTestId("themed-button")).not.toBeDisabled();
        });

        it("should handle onClick function changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick1 = vi.fn();
            const mockOnClick2 = vi.fn();

            const { rerender } = render(
                <SaveButton {...defaultProps} onClick={mockOnClick1} />
            );

            await user.click(screen.getByTestId("themed-button"));
            expect(mockOnClick1).toHaveBeenCalledTimes(1);
            expect(mockOnClick2).not.toHaveBeenCalled();

            rerender(<SaveButton {...defaultProps} onClick={mockOnClick2} />);

            await user.click(screen.getByTestId("themed-button"));
            expect(mockOnClick1).toHaveBeenCalledTimes(1);
            expect(mockOnClick2).toHaveBeenCalledTimes(1);
        });

        it("should handle className changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = render(
                <SaveButton {...defaultProps} className="class1" />
            );

            expect(screen.getByTestId("themed-button")).toHaveClass("class1");

            rerender(<SaveButton {...defaultProps} className="class2" />);
            expect(screen.getByTestId("themed-button")).toHaveClass("class2");
            expect(screen.getByTestId("themed-button")).not.toHaveClass(
                "class1"
            );
        });

        it("should handle empty string className", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} className="" />);

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("class", "");
        });

        it("should handle undefined aria-label gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SaveButton {...defaultProps} />);

            expect(screen.getByTestId("themed-button")).toHaveAttribute(
                "aria-label",
                "Save changes"
            );
        });
    });

    describe("Integration scenarios", () => {
        it("should work with all props combinations", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockOnClick = vi.fn();
            const SaveButtonIntegration = (props: any) => (
                <SaveButton {...props} />
            );

            render(
                <SaveButtonIntegration
                    onClick={mockOnClick}
                    aria-label="Custom save label"
                    className="integration-test"
                    size="lg"
                    disabled={false}
                    isLoading={false}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("integration-test");
            expect(button).toHaveAttribute("aria-label", "Custom save label");
            expect(button).toHaveAttribute("data-size", "lg");
            expect(button).toHaveAttribute("data-variant", "primary");
            expect(button).not.toBeDisabled();

            await user.click(button);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should work with minimal props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockOnClick = vi.fn();

            render(<SaveButton onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveTextContent("Save");
            expect(button).toHaveAttribute("aria-label", "Save changes");
            expect(button).toHaveAttribute("data-size", "sm");
            expect(button).not.toBeDisabled();
        });

        it("should preserve icon and text together", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SaveButton", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            render(<SaveButton {...defaultProps} />);

            expect(screen.getByTestId("button-icon")).toBeInTheDocument();
            expect(screen.getByTestId("save-icon")).toBeInTheDocument();
            expect(screen.getByTestId("themed-button")).toHaveTextContent(
                "Save"
            );
        });
    });
});
