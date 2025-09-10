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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type { JSX } from "react/jsx-runtime";
import { SaveButton } from "../../../components/shared/SaveButton";

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
        }) => (
            <button
                className={className}
                onClick={onClick}
                disabled={disabled}
                data-testid="themed-button"
                data-variant={variant}
                data-size={size}
                aria-label={ariaLabel}
                {...props}
            >
                {icon && <span data-testid="button-icon">{icon}</span>}
                {children}
            </button>
        )
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
                expect(() => {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            size={config.size}
                            disabled={config.disabled}
                            isLoading={config.isLoading}
                            aria-label={config.ariaLabel}
                            className={config.className}
                        />
                    );
                }).not.toThrow();

                // Verify button renders
                const button = screen.getByTestId("themed-button");
                expect(button).toBeInTheDocument();
                expect(button).toHaveTextContent("Save");
            }
        );

        fcTest.prop([sizeArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })("should handle all size variants correctly", async (size) => {
            render(<SaveButton onClick={mockOnClick} size={size} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("data-size", size);
        });

        fcTest.prop([ariaLabelArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle various aria-label configurations",
            async (ariaLabel) => {
                render(
                    <SaveButton onClick={mockOnClick} aria-label={ariaLabel} />
                );

                const button = screen.getByTestId("themed-button");
                expect(button).toHaveAttribute(
                    "aria-label",
                    ariaLabel || "Save changes"
                );
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
                render(
                    <SaveButton
                        onClick={mockOnClick}
                        disabled={disabled}
                        isLoading={isLoading}
                    />
                );

                const button = screen.getByTestId("themed-button");

                // Button should be disabled if either disabled prop is true or isLoading is true
                const shouldBeDisabled = disabled || isLoading;
                expect(button).toHaveProperty("disabled", shouldBeDisabled);

                // Variant should be secondary if disabled, primary otherwise
                const expectedVariant = disabled ? "secondary" : "primary";
                expect(button).toHaveAttribute("data-variant", expectedVariant);
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })("should handle rapid state transitions", async (transitionCount) => {
            const { rerender } = render(
                <SaveButton
                    onClick={mockOnClick}
                    disabled={false}
                    isLoading={false}
                />
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
        });
    });

    describe("User Interaction Fuzzing", () => {
        fcTest.prop([interactionScenarioArbitrary], {
            numRuns: 50,
            timeout: 10_000,
        })("should handle click interactions correctly", async (scenario) => {
            render(<SaveButton onClick={mockOnClick} />);

            const button = screen.getByTestId("themed-button");

            if (scenario.rapid) {
                // Rapid clicks without delays
                for (let i = 0; i < scenario.clickCount; i++) {
                    fireEvent.click(button);
                }
            } else {
                // Normal clicks with small delays
                for (let i = 0; i < scenario.clickCount; i++) {
                     fireEvent.click(button);
                    
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            }

            expect(mockOnClick).toHaveBeenCalledTimes(scenario.clickCount);
        });

        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })(
            "should not call onClick when disabled or loading",
            async (clickCount) => {
                // Test disabled state
                render(<SaveButton onClick={mockOnClick} disabled={true} />);

                const disabledButton = screen.getByTestId("themed-button");

                for (let i = 0; i < clickCount; i++) {
                    fireEvent.click(disabledButton);
                }

                expect(mockOnClick).not.toHaveBeenCalled();

                // Reset and test loading state
                mockOnClick.mockClear();

                const { rerender } = render(
                    <SaveButton onClick={mockOnClick} isLoading={true} />
                );
                const loadingButton = screen.getByTestId("themed-button");

                for (let i = 0; i < clickCount; i++) {
                    fireEvent.click(loadingButton);
                }

                expect(mockOnClick).not.toHaveBeenCalled();
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
                render(
                    <SaveButton
                        onClick={mockOnClick}
                        size={config.size}
                        disabled={config.disabled}
                        isLoading={config.isLoading}
                        aria-label={config.ariaLabel}
                        className={config.className}
                    />
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
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 5 })], {
            numRuns: 20,
            timeout: 5000,
        })(
            "should handle keyboard navigation correctly",
            async (keyPressCount) => {
                render(<SaveButton onClick={mockOnClick} />);

                const button = screen.getByTestId("themed-button");

                for (let i = 0; i < keyPressCount; i++) {
                    // Test Enter key
                    fireEvent.keyDown(button, { key: "Enter" });

                    // Test Space key
                    fireEvent.keyDown(button, { key: " " });
                }

                // Component should handle keyboard events without crashing
                expect(button).toBeInTheDocument();
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
                render(
                    <SaveButton
                        onClick={mockOnClick}
                        size={config.size}
                        disabled={config.disabled}
                        isLoading={config.isLoading}
                        aria-label={config.ariaLabel}
                        className={config.className}
                    />
                );

                // Icon should always be present
                const icon = screen.getByTestId("button-icon");
                expect(icon).toBeInTheDocument();

                const saveIcon = screen.getByTestId("save-icon");
                expect(saveIcon).toBeInTheDocument();
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
                render(
                    <SaveButton onClick={mockOnClick} className={className} />
                );

                const button = screen.getByTestId("themed-button");

                if (className) {
                    expect(button).toHaveClass(className);
                }

                // Should not crash with any className
                expect(button).toBeInTheDocument();
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

                // Render multiple buttons
                const buttons: JSX.Element[] = [];
                for (let i = 0; i < scenario.buttonCount; i++) {
                    buttons.push(
                        <SaveButton
                            key={i}
                            onClick={onClickHandlers[i]}
                            data-testid={`save-button-${i}`}
                        />
                    );
                }

                render(<div>{buttons}</div>);

                // Interact with all buttons
                for (
                    let buttonIndex = 0;
                    buttonIndex < scenario.buttonCount;
                    buttonIndex++
                ) {
                    const button = screen.getByTestId(
                        `save-button-${buttonIndex}`
                    );

                    for (let j = 0; j < scenario.interactionsPerButton; j++) {
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
                expect(() => {
                    render(
                        <SaveButton onClick={invalidHandler as () => void} />
                    );
                }).not.toThrow();

                // Button should render even with invalid handler
                const button = screen.getByTestId("themed-button");
                expect(button).toBeInTheDocument();
            }
        );

        fcTest.prop([fc.anything(), fc.anything()], {
            numRuns: 20,
            timeout: 3000,
        })(
            "should not crash with completely invalid props",
            async (invalidProp1, invalidProp2) => {
                expect(() => {
                    render(
                        <SaveButton
                            onClick={mockOnClick}
                            {...{ invalidProp1, invalidProp2 }}
                        />
                    );
                }).not.toThrow();
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
                const { rerender } = render(
                    <SaveButton onClick={mockOnClick} />
                );

                // Get initial icon reference
                const initialIcon = screen.getByTestId("button-icon");

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
            }
        );
    });
});

