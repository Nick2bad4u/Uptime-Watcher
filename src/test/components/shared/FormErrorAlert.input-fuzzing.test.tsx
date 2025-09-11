/**
 * Property-based fuzzing tests for FormErrorAlert component error handling and
 * display.
 *
 * @remarks
 * These tests focus on the FormErrorAlert component's ability to handle various
 * error message formats, display states, and user interactions. The component
 * provides consistent error display across forms and interfaces.
 *
 * The FormErrorAlert component handles:
 *
 * - Error message display and formatting
 * - Show/hide behavior based on error state
 * - Dismiss functionality and error clearing
 * - Theme integration (light/dark modes)
 * - Accessibility for screen readers
 * - XSS prevention and content sanitization
 * - Responsive layout and text wrapping
 *
 * Focus areas:
 *
 * - Error message handling with various formats and content
 * - Show/hide state transitions and animations
 * - User interaction with dismiss functionality
 * - Theme integration and visual feedback
 * - Accessibility attributes and ARIA compliance
 * - Performance with rapid error state changes
 * - Security considerations for error message content
 */

import { describe, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    render,
    screen,
    fireEvent,

} from "@testing-library/react";

import "@testing-library/jest-dom";
import type { JSX } from "react/jsx-runtime";
import { FormErrorAlert } from "../../../components/shared/FormErrorAlert";

// Mock themed components
vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: vi.fn(({ children, className, variant, ...props }) => (
        <div
            className={className}
            data-testid="themed-box"
            data-variant={variant}
            {...props}
        >
            {children}
        </div>
    )),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: vi.fn(({ children, className, size, variant, ...props }) => (
        <span
            className={className}
            data-testid="themed-text"
            data-size={size}
            data-variant={variant}
            {...props}
        >
            {children}
        </span>
    )),
}));

vi.mock("../../../theme/components/ThemedButton", () => ({
    ThemedButton: vi.fn(
        ({ children, onClick, className, size, variant, ...props }) => (
            <button
                className={className}
                onClick={onClick}
                data-testid="themed-button"
                data-size={size}
                data-variant={variant}
                {...props}
            >
                {children}
            </button>
        )
    ),
}));

/**
 * Fast-check arbitraries for generating test data
 */

// Generate error messages with various characteristics
const errorMessageArbitrary = fc.oneof(
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.constant("Network connection failed"),
    fc.constant("Validation error: Invalid input"),
    fc.constant("Server error: 500 Internal Server Error"),
    fc.constant(""),
    fc.constant("   "), // Whitespace only
    fc.constant("Error with special characters: !@#$%^&*()"),
    fc.constant("Multi-line\nerror\nmessage"),
    fc.constant("Error with\ttabs\tand\tspaces"),
    fc.constant(
        "Very long error message that might cause layout issues and test text wrapping behavior in various screen sizes and containers with different width constraints"
    ),
    fc.constant("<script>alert('XSS')</script>"), // XSS test
    fc.constant("<img src=x onerror=alert(1)>"), // XSS test
    fc.constant("Error with HTML tags: <b>bold</b> and <i>italic</i>"),
    fc.constant("Error with quotes: 'single' and \"double\""),
    fc.constant("Error\nwith\nnewlines\nand\tspecial\tcharacters"),
    fc.constant("🚨 Error with emojis and unicode: ñáéíóú"),
    // Extreme lengths
    fc.string({ minLength: 500, maxLength: 2000 })
);

// Generate null error scenarios
const nullErrorArbitrary = fc.constantFrom(null, undefined);

// Generate boolean states
const booleanArbitrary = fc.boolean();

// Generate class names
const classNameArbitrary = fc.oneof(
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.constant(""),
    fc.constant("error-alert"),
    fc.constant("error-alert custom-class"),
    fc.constant("invalid-class-name with spaces"),
    fc.constant("css-injection { color: red; }")
);

// Generate component configurations
const alertConfigArbitrary = fc.record({
    error: fc.oneof(errorMessageArbitrary, nullErrorArbitrary),
    isDark: booleanArbitrary,
    className: classNameArbitrary,
});

// Generate error state transition scenarios
const errorTransitionArbitrary = fc.record({
    initialError: fc.oneof(errorMessageArbitrary, nullErrorArbitrary),
    subsequentErrors: fc.array(
        fc.oneof(errorMessageArbitrary, nullErrorArbitrary),
        { minLength: 1, maxLength: 10 }
    ),
    rapid: booleanArbitrary,
});

describe("FormErrorAlert Component - Property-Based Fuzzing", () => {
    let mockOnClearError: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnClearError = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Error Display Fuzzing", () => {
        fcTest.prop([errorMessageArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should display arbitrary error messages correctly",
            async (errorMessage) => {
                render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                    />
                );

                if (errorMessage) {
                    // Error alert should be visible
                    const alertBox = screen.getByTestId("themed-box");
                    expect(alertBox).toBeInTheDocument();

                    const errorText = screen.getByTestId("themed-text");
                    expect(errorText).toHaveTextContent(errorMessage);
                    expect(errorText).toHaveAttribute("data-variant", "error");

                    // Close button should be present
                    const closeButton = screen.getByTestId("themed-button");
                    expect(closeButton).toBeInTheDocument();
                    expect(closeButton).toHaveTextContent("✕");
                } else {
                    // No error should mean no rendered content
                    const alertBoxes = screen.queryAllByTestId("themed-box");
                    expect(alertBoxes).toHaveLength(0);
                }
            }
        );

        fcTest.prop([nullErrorArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })(
            "should not render when error is null or undefined",
            async (nullError) => {
                render(
                    <FormErrorAlert
                        error={nullError ?? null}
                        onClearError={mockOnClearError}
                    />
                );

                // Component should not render anything
                const alertBoxes = screen.queryAllByTestId("themed-box");
                expect(alertBoxes).toHaveLength(0);
            }
        );

        fcTest.prop(
            [fc.array(errorMessageArbitrary, { minLength: 1, maxLength: 20 })],
            {
                numRuns: 30,
                timeout: 15_000,
            }
        )(
            "should handle multiple error messages in sequence",
            async (errorMessages) => {
                const { rerender } = render(
                    <FormErrorAlert
                        error={errorMessages[0] ?? null}
                        onClearError={mockOnClearError}
                    />
                );

                for (let i = 1; i < errorMessages.length; i++) {
                    rerender(
                        <FormErrorAlert
                            error={errorMessages[i] ?? null}
                            onClearError={mockOnClearError}
                        />
                    );

                    if (errorMessages[i]) {
                        const errorText = screen.getByTestId("themed-text");
                        expect(errorText).toHaveTextContent(errorMessages[i]!);
                    }
                }
            }
        );
    });

    describe("Theme Integration Fuzzing", () => {
        fcTest.prop([errorMessageArbitrary, booleanArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle theme states correctly",
            async (errorMessage, isDark) => {
                render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                        isDark={isDark}
                    />
                );

                if (errorMessage) {
                    const alertBox = screen.getByTestId("themed-box");
                    const closeButton = screen.getByTestId("themed-button");

                    if (isDark) {
                        expect(alertBox).toHaveClass("dark");
                        expect(closeButton).toHaveClass("dark");
                    } else {
                        expect(alertBox).not.toHaveClass("dark");
                        expect(closeButton).not.toHaveClass("dark");
                    }
                }
            }
        );

        fcTest.prop([errorMessageArbitrary, fc.integer({ min: 1, max: 10 })], {
            numRuns: 20,
            timeout: 10_000,
        })(
            "should handle rapid theme changes",
            async (errorMessage, themeChanges) => {
                if (!errorMessage) return; // Skip if no error to display

                const { rerender } = render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                        isDark={false}
                    />
                );

                for (let i = 0; i < themeChanges; i++) {
                    const isDark = i % 2 === 1;

                    rerender(
                        <FormErrorAlert
                            error={errorMessage}
                            onClearError={mockOnClearError}
                            isDark={isDark}
                        />
                    );

                    const alertBox = screen.getByTestId("themed-box");
                    if (isDark) {
                        expect(alertBox).toHaveClass("dark");
                    } else {
                        expect(alertBox).not.toHaveClass("dark");
                    }
                }
            }
        );
    });

    describe("User Interaction Fuzzing", () => {
        fcTest.prop([errorMessageArbitrary, fc.integer({ min: 1, max: 10 })], {
            numRuns: 50,
            timeout: 10_000,
        })(
            "should handle close button interactions",
            async (errorMessage, clickCount) => {
                if (!errorMessage) return; // Skip if no error to display

                render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                    />
                );

                const closeButton = screen.getByTestId("themed-button");

                for (let i = 0; i < clickCount; i++) {
                     fireEvent.click(closeButton);

                }

                expect(mockOnClearError).toHaveBeenCalledTimes(clickCount);
            }
        );

        fcTest.prop([errorMessageArbitrary, fc.integer({ min: 1, max: 20 })], {
            numRuns: 30,
            timeout: 15_000,
        })(
            "should handle rapid close button clicks",
            async (errorMessage, rapidClicks) => {
                if (!errorMessage) return; // Skip if no error to display

                render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                    />
                );

                const closeButton = screen.getByTestId("themed-button");

                // Rapid clicks without delays
                for (let i = 0; i < rapidClicks; i++) {
                    fireEvent.click(closeButton);
                }

                expect(mockOnClearError).toHaveBeenCalledTimes(rapidClicks);
            }
        );

        fcTest.prop([errorMessageArbitrary], {
            numRuns: 30,
            timeout: 5000,
        })("should handle keyboard interactions", async (errorMessage) => {
            if (!errorMessage) return; // Skip if no error to display

            render(
                <FormErrorAlert
                    error={errorMessage}
                    onClearError={mockOnClearError}
                />
            );

            const closeButton = screen.getByTestId("themed-button");

            // Test Enter key
            fireEvent.keyDown(closeButton, { key: "Enter" });
            fireEvent.keyUp(closeButton, { key: "Enter" });

            // Test Space key
            fireEvent.keyDown(closeButton, { key: " " });
            fireEvent.keyUp(closeButton, { key: " " });

            // Test Escape key
            fireEvent.keyDown(closeButton, { key: "Escape" });

            // Component should handle keyboard events without crashing
            expect(closeButton).toBeInTheDocument();
        });
    });

    describe("Error State Transitions Fuzzing", () => {
        fcTest.prop([errorTransitionArbitrary], {
            numRuns: 50,
            timeout: 15_000,
        })(
            "should handle error state transitions correctly",
            async (scenario) => {
                const { rerender } = render(
                    <FormErrorAlert
                        error={scenario.initialError ?? null}
                        onClearError={mockOnClearError}
                    />
                );

                for (const nextError of scenario.subsequentErrors) {
                    if (scenario.rapid) {
                        // Rapid transitions without delays
                        rerender(
                            <FormErrorAlert
                                error={nextError ?? null}
                                onClearError={mockOnClearError}
                            />
                        );
                    } else {
                        // Normal transitions with small delays
                        rerender(
                            <FormErrorAlert
                                error={nextError ?? null}
                                onClearError={mockOnClearError}
                            />
                        );
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }

                    // Verify correct state after transition
                    if (nextError) {
                        const errorText = screen.getByTestId("themed-text");
                        expect(errorText).toHaveTextContent(nextError);
                    } else {
                        const alertBoxes =
                            screen.queryAllByTestId("themed-box");
                        expect(alertBoxes).toHaveLength(0);
                    }
                }
            }
        );
    });

    describe("CSS Class Handling Fuzzing", () => {
        fcTest.prop([errorMessageArbitrary, classNameArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle various className configurations",
            async (errorMessage, className) => {
                if (!errorMessage) return; // Skip if no error to display

                render(
                    <FormErrorAlert
                        error={errorMessage}
                        onClearError={mockOnClearError}
                        className={className}
                    />
                );

                const alertBox = screen.getByTestId("themed-box");

                // Base classes should always be present
                expect(alertBox).toHaveClass("error-alert");

                if (className) {
                    expect(alertBox).toHaveClass(className);
                }

                // Should not crash with any className
                expect(alertBox).toBeInTheDocument();
            }
        );
    });

    describe("Accessibility Fuzzing", () => {
        fcTest.prop([alertConfigArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should maintain accessibility attributes under all conditions",
            async (config) => {
                render(
                    <FormErrorAlert
                        error={config.error ?? null}
                        onClearError={mockOnClearError}
                        isDark={config.isDark}
                        className={config.className}
                    />
                );

                if (config.error) {
                    const errorText = screen.getByTestId("themed-text");
                    const closeButton = screen.getByTestId("themed-button");

                    // Error text should have error variant for screen readers
                    expect(errorText).toHaveAttribute("data-variant", "error");

                    // Close button should be focusable
                    expect(closeButton).not.toHaveAttribute("tabindex", "-1");

                    // Close button should have appropriate size and variant
                    expect(closeButton).toHaveAttribute("data-size", "xs");
                    expect(closeButton).toHaveAttribute(
                        "data-variant",
                        "secondary"
                    );
                }
            }
        );
    });

    describe("Content Security Fuzzing", () => {
        fcTest.prop(
            [
                fc.constantFrom(
                    "<script>alert('XSS')</script>",
                    "<img src=x onerror=alert(1)>",
                    "data:text/html,<script>alert('test')</script>",
                    "<iframe src=javascript:alert(1)>",
                    "<svg onload=alert(1)>",
                    "Error with HTML: <b>bold</b> <i>italic</i>",
                    "<div onclick='malicious()'>Click me</div>"
                ),
            ],
            {
                numRuns: 30,
                timeout: 5000,
            }
        )(
            "should handle potentially malicious content safely",
            async (maliciousContent) => {
                render(
                    <FormErrorAlert
                        error={maliciousContent}
                        onClearError={mockOnClearError}
                    />
                );

                const errorText = screen.getByTestId("themed-text");

                // Content should be displayed as text, not executed
                expect(errorText).toHaveTextContent(maliciousContent);
                expect(errorText).toBeInTheDocument();

                // No scripts should have been executed (component should still be safe)
                expect(screen.getByTestId("themed-button")).toBeInTheDocument();
            }
        );
    });

    describe("Performance Fuzzing", () => {
        fcTest.prop(
            [
                fc.record({
                    alertCount: fc.integer({ min: 1, max: 20 }),
                    errorChangesPerAlert: fc.integer({ min: 1, max: 10 }),
                }),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle multiple alerts with state changes efficiently",
            async (scenario) => {
                const onClearHandlers = Array.from(
                    { length: scenario.alertCount },
                    () => vi.fn()
                );

                const startTime = performance.now();

                // Create multiple error alerts
                const alerts: JSX.Element[] = [];
                for (let i = 0; i < scenario.alertCount; i++) {
                    alerts.push(
                        <FormErrorAlert
                            key={i}
                            error={`Error message ${i}`}
                            onClearError={onClearHandlers[i] ?? (() => {})}
                            data-testid={`error-alert-${i}`}
                        />
                    );
                }

                const { rerender } = render(<div>{alerts}</div>);

                // Perform error state changes
                for (
                    let changeIndex = 0;
                    changeIndex < scenario.errorChangesPerAlert;
                    changeIndex++
                ) {
                    const updatedAlerts: JSX.Element[] = [];
                    for (let i = 0; i < scenario.alertCount; i++) {
                        updatedAlerts.push(
                            <FormErrorAlert
                                key={i}
                                error={`Updated error ${i}-${changeIndex}`}
                                onClearError={onClearHandlers[i] ?? (() => {})}
                                data-testid={`error-alert-${i}`}
                            />
                        );
                    }
                    rerender(<div>{updatedAlerts}</div>);
                }

                const endTime = performance.now();
                const operationTime = endTime - startTime;

                // Should complete efficiently
                expect(operationTime).toBeLessThan(5000); // 5 seconds max

                // All alerts should still be present
                for (let i = 0; i < scenario.alertCount; i++) {
                    expect(
                        screen.getByTestId(`error-alert-${i}`)
                    ).toBeInTheDocument();
                }
            }
        );
    });

    describe("Error Boundary Fuzzing", () => {
        fcTest.prop([fc.anything()], {
            numRuns: 30,
            timeout: 5000,
        })(
            "should handle invalid onClearError handlers gracefully",
            async (invalidHandler) => {
                expect(() => {
                    render(
                        <FormErrorAlert
                            error="Test error"
                            onClearError={invalidHandler as () => void}
                        />
                    );
                }).not.toThrow();

                // Component should render even with invalid handler
                const alertBox = screen.getByTestId("themed-box");
                expect(alertBox).toBeInTheDocument();
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
                        <FormErrorAlert
                            error="Test error"
                            onClearError={mockOnClearError}
                            {...{ invalidProp1, invalidProp2 }}
                        />
                    );
                }).not.toThrow();
            }
        );
    });

    describe("Memory Management Fuzzing", () => {
        fcTest.prop([fc.integer({ min: 1, max: 15 })], {
            numRuns: 20,
            timeout: 15_000,
        })(
            "should clean up resources properly on unmount",
            async (mountCount) => {
                for (let i = 0; i < mountCount; i++) {
                    const { unmount } = render(
                        <FormErrorAlert
                            error={`Error message ${i}`}
                            onClearError={mockOnClearError}
                        />
                    );

                    // Interact with the alert
                    const closeButton = screen.getByTestId("themed-button");
                    fireEvent.click(closeButton);

                    // Unmount component
                    unmount();
                }

                // No memory leaks or errors should occur
                expect(mockOnClearError).toHaveBeenCalledTimes(mountCount);
            }
        );
    });
});
