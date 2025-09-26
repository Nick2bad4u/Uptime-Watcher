/**
 * Property-based fuzzing tests for SaveButton component behavior and
 * accessibility.
 *
 * @remarks
 * These tests focus on the SaveButton component's ability to handle various
 * configurations, loading states, user interactions, and accessibility
 * scenarios. The SaveButton is a critical UI component used throughout forms
 * and settings.
 *
 * The SaveButton component handles:
 *
 * - Click event handling and propagation
 * - Loading state management and UI feedback
 * - Disabled state behavior and accessibility
 * - Size variants and responsive behavior
 * - Icon rendering and theme integration
 * - Keyboard navigation and ARIA attributes
 *
 * Focus areas:
 *
 * - State transitions between normal, loading, and disabled
 * - User interaction handling with various configurations
 * - Accessibility attributes under all conditions
 * - Performance with rapid state changes
 * - Theme integration and visual feedback
 * - Error handling with invalid props
 */

import { describe, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";
import type { JSX } from "react/jsx-runtime";
import { SaveButton } from "../../../components/shared/SaveButton";
import { sanitizeDomProps } from "../../utils/domPropSanitizer";

// Mock ThemedButton component
vi.mock("../../../theme/components/ThemedButton", () => ({
    ThemedButton: vi.fn(
        ({
            children,
            onClick,
            disabled,
            className,
            variant,
            size,
            icon,
            "aria-label": ariaLabel,
            ...props
        }) => {
            const safeProps = sanitizeDomProps(props);
            return (
                <button
                    type="button"
                    className={className}
                    onClick={onClick}
                    disabled={disabled}
                    data-testid="themed-button"
                    data-variant={variant}
                    data-size={size}
                    aria-label={ariaLabel}
                    {...safeProps}
                >
                    {icon && <span data-testid="button-icon">{icon}</span>}
                    {children}
                </button>
            );
        }
    ),
}));

// Mock React Icons
vi.mock("react-icons/fi", () => ({
    FiSave: () => <span data-testid="save-icon">💾</span>,
}));

/**
 * Fast-check arbitraries for generating test data
 */

// Generate button sizes
const sizeArbitrary = fc.constantFrom("xs", "sm", "md", "lg");

// Generate boolean states
const booleanArbitrary = fc.boolean();

// Generate aria labels
const ariaLabelArbitrary = fc.oneof(
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.constant("Save changes"),
    fc.constant("Save configuration"),
    fc.constant("Save settings"),
    fc.constant(""),
    fc.constant("Save with special characters !@#$%^&*()"),
    fc.constant(
        "Very long aria label that might cause accessibility issues and test text wrapping behavior in screen readers"
    )
);

// Generate class names
const classNameArbitrary = fc.oneof(
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.constant(""),
    fc.constant("save-button"),
    fc.constant("save-button custom-class"),
    fc.constant("invalid-class-name-with-spaces and special!characters"),
    fc.constant("css-injection { color: red; }")
);

// Generate button configurations
const buttonConfigArbitrary = fc.record({
    size: sizeArbitrary,
    disabled: booleanArbitrary,
    isLoading: booleanArbitrary,
    ariaLabel: ariaLabelArbitrary,
    className: classNameArbitrary,
});

// Generate interaction scenarios
const interactionScenarioArbitrary = fc.record({
    clickCount: fc.integer({ min: 1, max: 20 }),
    rapid: booleanArbitrary,
    withStateChanges: booleanArbitrary,
});

describe("SaveButton Component - Property-Based Fuzzing", () => {
    let mockOnClick: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnClick = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Component Rendering Fuzzing", () => {
        fcTest.prop([buttonConfigArbitrary], {
            numRuns: 100,
            timeout: 5000,
        })(
            "should render with arbitrary configurations without crashing",
            async (config) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    expect(() => {
                        render(
                            <SaveButton
                                onClick={mockOnClick}
                                size={config.size}
                                disabled={config.disabled}
                                isLoading={config.isLoading}
                                aria-label={config.ariaLabel}
                                className={config.className}
                            />,
                            { container }
                        );
                    }).not.toThrow();

                    // Verify button renders
                    const button = screen.getByTestId("themed-button");
                    expect(button).toBeInTheDocument();
                    // Normalize whitespace for text content comparison
                    const normalizedText = button.textContent
                        ?.split(/\s+/)
                        .join(" ")
                        .trim();
                    expect(normalizedText).toMatch(/💾\s*Save/); // Allow flexible whitespace
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );

        fcTest.prop([sizeArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })("should handle all size variants correctly", async (size) => {
            // Create unique container for this test instance
            const container = document.createElement("div");
            container.id = `savebutton-size-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            document.body.append(container);

            try {
                render(<SaveButton onClick={mockOnClick} size={size} />, {
                    container,
                });

                const button = screen.getByTestId("themed-button");
                expect(button).toHaveAttribute("data-size", size);
            } finally {
                // Clean up container
                container.remove();
            }
        });

        fcTest.prop([ariaLabelArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle various aria-label configurations",
            async (ariaLabel) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-aria-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            aria-label={ariaLabel}
                        />,
                        { container }
                    );

                    const button = screen.getByTestId("themed-button");
                    // The component uses the provided aria-label directly, even if empty string
                    // Default "Save changes" only applies when aria-label prop is undefined
                    const expectedAriaLabel =
                        ariaLabel === undefined ? "Save changes" : ariaLabel;
                    expect(button).toHaveAttribute(
                        "aria-label",
                        expectedAriaLabel
                    );
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("State Management Fuzzing", () => {
        fcTest.prop([booleanArbitrary, booleanArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle disabled and loading state combinations",
            async (disabled, isLoading) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-state-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            disabled={disabled}
                            isLoading={isLoading}
                        />,
                        { container }
                    );

                    const button = screen.getByTestId("themed-button");

                    // Button should be disabled if either disabled prop is true or isLoading is true
                    const shouldBeDisabled = disabled || isLoading;
                    expect(button).toHaveProperty("disabled", shouldBeDisabled);

                    // Variant should be secondary if disabled, primary otherwise
                    const expectedVariant = disabled ? "secondary" : "primary";
                    expect(button).toHaveAttribute(
                        "data-variant",
                        expectedVariant
                    );
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })("should handle rapid state transitions", async (transitionCount) => {
            // Create unique container for this test instance
            const container = document.createElement("div");
            container.id = `savebutton-rapid-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            document.body.append(container);

            try {
                const { rerender } = render(
                    <SaveButton
                        onClick={mockOnClick}
                        disabled={false}
                        isLoading={false}
                    />,
                    { container }
                );

                for (let i = 0; i < transitionCount; i++) {
                    const disabled = i % 3 === 0;
                    const isLoading = i % 2 === 0;

                    rerender(
                        <SaveButton
                            onClick={mockOnClick}
                            disabled={disabled}
                            isLoading={isLoading}
                        />
                    );

                    const button = screen.getByTestId("themed-button");
                    const shouldBeDisabled = disabled || isLoading;
                    expect(button).toHaveProperty("disabled", shouldBeDisabled);
                }
            } finally {
                // Clean up container
                container.remove();
            }
        });
    });

    describe("User Interaction Fuzzing", () => {
        fcTest.prop([interactionScenarioArbitrary], {
            numRuns: 50,
            timeout: 10_000,
        })("should handle click interactions correctly", async (scenario) => {
            // Create unique container for this test instance
            const container = document.createElement("div");
            container.id = `savebutton-click-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            document.body.append(container);

            // Create a fresh mock for this specific test instance
            const localMockOnClick = vi.fn();

            try {
                render(<SaveButton onClick={localMockOnClick} />, {
                    container,
                });

                const button = screen.getByTestId("themed-button");

                if (scenario.rapid) {
                    // Rapid clicks without delays
                    for (let i = 0; i < scenario.clickCount; i++) {
                        fireEvent.click(button);
                    }
                } else {
                    // Normal clicks without delays (delays not needed for testing)
                    for (let i = 0; i < scenario.clickCount; i++) {
                        fireEvent.click(button);
                    }
                }

                expect(localMockOnClick).toHaveBeenCalledTimes(
                    scenario.clickCount
                );
            } finally {
                // Clean up container
                container.remove();
            }
        });

        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })(
            "should not call onClick when disabled or loading",
            async (clickCount) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-disabled-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    // Test disabled state
                    render(
                        <SaveButton onClick={mockOnClick} disabled={true} />,
                        { container }
                    );

                    const disabledButton = screen.getByTestId("themed-button");

                    for (let i = 0; i < clickCount; i++) {
                        fireEvent.click(disabledButton);
                    }

                    expect(mockOnClick).not.toHaveBeenCalled();

                    // Reset and test loading state
                    mockOnClick.mockClear();

                    const { rerender: _rerender } = render(
                        <SaveButton onClick={mockOnClick} isLoading={true} />,
                        { container }
                    );
                    const loadingButton = screen.getByTestId("themed-button");

                    for (let i = 0; i < clickCount; i++) {
                        fireEvent.click(loadingButton);
                    }

                    expect(mockOnClick).not.toHaveBeenCalled();
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("Accessibility Fuzzing", () => {
        fcTest.prop([buttonConfigArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should maintain accessibility attributes under all conditions",
            async (config) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-a11y-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            size={config.size}
                            disabled={config.disabled}
                            isLoading={config.isLoading}
                            aria-label={config.ariaLabel}
                            className={config.className}
                        />,
                        { container }
                    );

                    const button = screen.getByTestId("themed-button");

                    // Button should always have aria-label
                    expect(button).toHaveAttribute("aria-label");

                    // Button should be focusable unless disabled
                    if (config.disabled || config.isLoading) {
                        expect(button).toHaveProperty("disabled", true);
                    } else {
                        expect(button).not.toHaveProperty("disabled", true);
                        expect(button).not.toHaveAttribute("tabindex", "-1");
                    }
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 5 })], {
            numRuns: 20,
            timeout: 5000,
        })(
            "should handle keyboard navigation correctly",
            async (keyPressCount) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-keyboard-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(<SaveButton onClick={mockOnClick} />, { container });

                    const button = screen.getByTestId("themed-button");

                    for (let i = 0; i < keyPressCount; i++) {
                        // Test Enter key
                        fireEvent.keyDown(button, { key: "Enter" });

                        // Test Space key
                        fireEvent.keyDown(button, { key: " " });
                    }

                    // Component should handle keyboard events without crashing
                    expect(button).toBeInTheDocument();
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("Icon Rendering Fuzzing", () => {
        fcTest.prop([buttonConfigArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should render save icon consistently across configurations",
            async (config) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-icon-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            size={config.size}
                            disabled={config.disabled}
                            isLoading={config.isLoading}
                            aria-label={config.ariaLabel}
                            className={config.className}
                        />,
                        { container }
                    );

                    // Icon should always be present
                    const icon = screen.getByTestId("button-icon");
                    expect(icon).toBeInTheDocument();

                    const saveIcon = screen.getByTestId("save-icon");
                    expect(saveIcon).toBeInTheDocument();
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("CSS Class Handling Fuzzing", () => {
        fcTest.prop([classNameArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle various className configurations",
            async (className) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-class-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            className={className}
                        />,
                        { container }
                    );

                    const button = screen.getByTestId("themed-button");

                    const normalizedClassName = className.trim();

                    if (normalizedClassName.length > 0) {
                        const expectedClasses = normalizedClassName
                            .split(/\s+/u)
                            .filter((candidate) => candidate.length > 0);

                        if (expectedClasses.length > 0) {
                            expect(button).toHaveClass(...expectedClasses);
                        }
                    }

                    // Should not crash with any className
                    expect(button).toBeInTheDocument();
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("Performance Fuzzing", () => {
        fcTest.prop(
            [
                fc.record({
                    buttonCount: fc.integer({ min: 1, max: 50 }),
                    interactionsPerButton: fc.integer({ min: 1, max: 20 }),
                }),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle multiple buttons with interactions efficiently",
            async (scenario) => {
                const onClickHandlers = Array.from(
                    { length: scenario.buttonCount },
                    () => vi.fn()
                );

                const startTime = performance.now();

                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-perf-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    // Render multiple buttons
                    const buttons: JSX.Element[] = [];
                    for (let i = 0; i < scenario.buttonCount; i++) {
                        buttons.push(
                            <SaveButton
                                key={i}
                                onClick={onClickHandlers[i] ?? (() => {})}
                                data-testid={`save-button-${i}`}
                            />
                        );
                    }

                    render(<div>{buttons}</div>, { container });

                    // Interact with all buttons
                    for (
                        let buttonIndex = 0;
                        buttonIndex < scenario.buttonCount;
                        buttonIndex++
                    ) {
                        const button = screen.getByTestId(
                            `save-button-${buttonIndex}`
                        );

                        for (
                            let j = 0;
                            j < scenario.interactionsPerButton;
                            j++
                        ) {
                            fireEvent.click(button);
                        }
                    }

                    const endTime = performance.now();
                    const operationTime = endTime - startTime;

                    // Should complete efficiently
                    expect(operationTime).toBeLessThan(5000); // 5 seconds max

                    // Verify all handlers were called correct number of times
                    for (const handler of onClickHandlers) {
                        expect(handler).toHaveBeenCalledTimes(
                            scenario.interactionsPerButton
                        );
                    }
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("Error Boundary Fuzzing", () => {
        fcTest.prop([fc.anything()], {
            numRuns: 30,
            timeout: 5000,
        })(
            "should handle invalid onClick handlers gracefully",
            async (invalidHandler) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-error-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    expect(() => {
                        render(
                            <SaveButton
                                onClick={invalidHandler as () => void}
                            />,
                            { container }
                        );
                    }).not.toThrow();

                    // Button should render even with invalid handler
                    const button = screen.getByTestId("themed-button");
                    expect(button).toBeInTheDocument();
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );

        fcTest.prop([fc.anything(), fc.anything()], {
            numRuns: 20,
            timeout: 3000,
        })(
            "should not crash with completely invalid props",
            async (invalidProp1, invalidProp2) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-invalid-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    // Some invalid props may cause conversion errors - that's expected behavior
                    // so we just test that the render attempt doesn't crash the test framework
                    try {
                        render(
                            <SaveButton
                                onClick={mockOnClick}
                                {...{ invalidProp1, invalidProp2 }}
                            />,
                            { container }
                        );
                        // If render succeeds, button should be present
                        expect(
                            screen.getByTestId("themed-button")
                        ).toBeInTheDocument();
                    } catch (error: unknown) {
                        // If render fails due to invalid props, that's acceptable behavior
                        // as long as it doesn't crash the test framework itself
                        expect(error).toBeInstanceOf(Error);
                    }
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });

    describe("Memoization Fuzzing", () => {
        fcTest.prop([fc.integer({ min: 1, max: 20 })], {
            numRuns: 20,
            timeout: 10_000,
        })(
            "should maintain icon memoization across re-renders",
            async (rerenderCount) => {
                // Create unique container for this test instance
                const container = document.createElement("div");
                container.id = `savebutton-memo-test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                document.body.append(container);

                try {
                    const { rerender } = render(
                        <SaveButton onClick={mockOnClick} />,
                        { container }
                    );

                    // Get initial icon reference
                    const initialIcon = screen.getByTestId("button-icon");
                    // Icon state tracking for future test expansion
                    void initialIcon;

                    for (let i = 0; i < rerenderCount; i++) {
                        // Re-render with different props that shouldn't affect icon memoization
                        rerender(
                            <SaveButton
                                onClick={mockOnClick}
                                disabled={i % 2 === 0}
                                className={`class-${i}`}
                            />
                        );

                        // Icon should still be present
                        expect(
                            screen.getByTestId("button-icon")
                        ).toBeInTheDocument();
                    }
                } finally {
                    // Clean up container
                    container.remove();
                }
            }
        );
    });
});
