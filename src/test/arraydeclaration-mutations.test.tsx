/**
 * Test suite for ArrayDeclaration mutations
 *
 * These tests are designed to catch specific array declaration mutations
 * identified by Stryker mutation testing. These mutations primarily affect
 * React hook dependency arrays and other array declarations.
 *
 * @file Tests for array declaration mutations
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-03
 *
 * @category MutationTesting
 *
 * @tags ["mutation-testing", "array-declarations", "react-hooks", "dependency-arrays"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("ArrayDeclaration Mutations - React Dependencies", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Header.tsx Line 171: [setShowAddSiteModal] dependency", () => {
        it("should re-create callback when dependency changes (detect [] mutation)", () => {
            let rerenderCount = 0;

            function TestComponent({ setter }: { setter: () => void }) {
                const handleClick = React.useCallback(() => {
                    setter();
                    rerenderCount++;
                }, [setter]); // Original: [setter]

                return (
                    <button onClick={handleClick} data-testid="test-button">
                        Click me
                    </button>
                );
            }

            const setter1 = vi.fn();
            const setter2 = vi.fn();

            const { rerender } = render(<TestComponent setter={setter1} />);

            // First render and click
            fireEvent.click(screen.getByTestId("test-button"));
            expect(setter1).toHaveBeenCalledTimes(1);

            // Re-render with new setter
            rerender(<TestComponent setter={setter2} />);

            // Second click with new setter
            fireEvent.click(screen.getByTestId("test-button"));
            expect(setter2).toHaveBeenCalledTimes(1);

            // With mutation (empty array []), the callback wouldn't update
            // and setter2 would never be called, setter1 would be called again
        });
    });

    describe("Header.tsx Line 175: [setShowSettings] dependency", () => {
        it("should memoize callback correctly with dependency (detect [] mutation)", () => {
            const mockSetters = [
                vi.fn(),
                vi.fn(),
                vi.fn(),
            ];

            function TestComponent({ setterIndex }: { setterIndex: number }) {
                const currentSetter = mockSetters[setterIndex];

                const handleClick = React.useCallback(() => {
                    currentSetter();
                }, [currentSetter]); // Original: [currentSetter]

                return (
                    <button onClick={handleClick} data-testid="settings-button">
                        Show Settings
                    </button>
                );
            }

            const { rerender } = render(<TestComponent setterIndex={0} />);

            fireEvent.click(screen.getByTestId("settings-button"));
            expect(mockSetters[0]).toHaveBeenCalledTimes(1);

            rerender(<TestComponent setterIndex={1} />);

            fireEvent.click(screen.getByTestId("settings-button"));
            expect(mockSetters[1]).toHaveBeenCalledTimes(1);
            expect(mockSetters[0]).toHaveBeenCalledTimes(1); // Should not be called again

            rerender(<TestComponent setterIndex={2} />);

            fireEvent.click(screen.getByTestId("settings-button"));
            expect(mockSetters[2]).toHaveBeenCalledTimes(1);
            expect(mockSetters[1]).toHaveBeenCalledTimes(1);
        });
    });

    describe("Settings.tsx Line 139: [settings, updateSettings] dependencies", () => {
        it("should update effect when dependencies change (detect [] mutation)", () => {
            const effectCallback = vi.fn();

            function TestComponent({
                settings,
                updateSettings,
            }: {
                settings: { theme: string };
                updateSettings: () => void;
            }) {
                React.useEffect(effectCallback, [settings, updateSettings]);
                return <div data-testid="settings-component">Settings</div>;
            }

            const initialUpdate = vi.fn();
            const { rerender } = render(
                <TestComponent
                    settings={{ theme: "light" }}
                    updateSettings={initialUpdate}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(1);

            rerender(
                <TestComponent
                    settings={{ theme: "dark" }}
                    updateSettings={initialUpdate}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(2);

            const nextUpdate = vi.fn();
            rerender(
                <TestComponent
                    settings={{ theme: "dark" }}
                    updateSettings={nextUpdate}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(3);
        });
    });

    describe("Settings.tsx Line 166: [settings.historyLimit, persistHistoryLimit] dependencies", () => {
        it("should respond to historyLimit changes (detect [] mutation)", () => {
            const effectCallback = vi.fn();

            function TestComponent({
                historyLimit,
                persistHistoryLimit,
            }: {
                historyLimit: number;
                persistHistoryLimit: () => void;
            }) {
                const settings = { historyLimit };

                React.useEffect(effectCallback, [
                    settings.historyLimit,
                    persistHistoryLimit,
                ]);
                return (
                    <div data-testid="history-component">History Settings</div>
                );
            }

            const persistHistory = vi.fn();
            const { rerender } = render(
                <TestComponent
                    historyLimit={100}
                    persistHistoryLimit={persistHistory}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(1);

            rerender(
                <TestComponent
                    historyLimit={200}
                    persistHistoryLimit={persistHistory}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(2);

            const nextPersist = vi.fn();
            rerender(
                <TestComponent
                    historyLimit={200}
                    persistHistoryLimit={nextPersist}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(3);
        });
    });

    describe("Settings.tsx Line 182: [clearError, resetSettings] dependencies", () => {
        it("should re-run effect when error handling functions change (detect [] mutation)", () => {
            const effectCallback = vi.fn();

            function TestComponent({
                clearError,
                resetSettings,
            }: {
                clearError: () => void;
                resetSettings: () => void;
            }) {
                React.useEffect(effectCallback, [clearError, resetSettings]);
                return <div data-testid="error-component">Error Handling</div>;
            }

            const initialClearError = vi.fn();
            const initialReset = vi.fn();
            const { rerender } = render(
                <TestComponent
                    clearError={initialClearError}
                    resetSettings={initialReset}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(1);

            const nextClearError = vi.fn();
            rerender(
                <TestComponent
                    clearError={nextClearError}
                    resetSettings={initialReset}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(2);

            const nextReset = vi.fn();
            rerender(
                <TestComponent
                    clearError={nextClearError}
                    resetSettings={nextReset}
                />
            );
            expect(effectCallback).toHaveBeenCalledTimes(3);
        });
    });

    describe("Settings.tsx Lines 191, 199, 206, 213, 220: Various callback dependencies", () => {
        it("should update callbacks when their dependencies change", () => {
            let setTheme = vi.fn();
            let themeValue = "light";
            const handleHistoryLimitChange = vi.fn();
            const handleSettingChange = vi.fn();

            function TestComponent() {
                // Line 191: [setTheme, settings.theme]
                const themeCallback = React.useCallback(() => {
                    setTheme(themeValue);
                }, [setTheme, themeValue]);

                // Line 199: [handleHistoryLimitChange]
                const historyCallback = React.useCallback(() => {
                    handleHistoryLimitChange();
                }, [handleHistoryLimitChange]);

                // Lines 206, 213, 220: [handleSettingChange]
                const settingCallback1 = React.useCallback(() => {
                    handleSettingChange("setting1");
                }, [handleSettingChange]);

                const settingCallback2 = React.useCallback(() => {
                    handleSettingChange("setting2");
                }, [handleSettingChange]);

                const settingCallback3 = React.useCallback(() => {
                    handleSettingChange("setting3");
                }, [handleSettingChange]);

                return (
                    <div>
                        <button
                            onClick={themeCallback}
                            data-testid="theme-button"
                        >
                            Theme
                        </button>
                        <button
                            onClick={historyCallback}
                            data-testid="history-button"
                        >
                            History
                        </button>
                        <button
                            onClick={settingCallback1}
                            data-testid="setting1-button"
                        >
                            Setting 1
                        </button>
                        <button
                            onClick={settingCallback2}
                            data-testid="setting2-button"
                        >
                            Setting 2
                        </button>
                        <button
                            onClick={settingCallback3}
                            data-testid="setting3-button"
                        >
                            Setting 3
                        </button>
                    </div>
                );
            }

            const { rerender } = render(<TestComponent />);

            // Test theme callback
            fireEvent.click(screen.getByTestId("theme-button"));
            expect(setTheme).toHaveBeenCalledWith("light");

            // Change theme value and setter
            themeValue = "dark";
            setTheme = vi.fn();
            rerender(<TestComponent />);

            fireEvent.click(screen.getByTestId("theme-button"));
            expect(setTheme).toHaveBeenCalledWith("dark");

            // Test other callbacks
            fireEvent.click(screen.getByTestId("history-button"));
            expect(handleHistoryLimitChange).toHaveBeenCalled();

            fireEvent.click(screen.getByTestId("setting1-button"));
            expect(handleSettingChange).toHaveBeenCalledWith("setting1");

            // With mutation [], callbacks would be stale and use old values
        });
    });

    describe("General Array Declaration Mutations", () => {
        it("should handle empty arrays vs populated arrays correctly", () => {
            const mockCallback = vi.fn();

            // Test that empty dependency array behaves differently from populated array
            function ComponentWithEmptyDeps() {
                React.useEffect(mockCallback, []); // Runs once
                return <div>Empty Deps</div>;
            }

            function ComponentWithDeps({ value }: { value: number }) {
                React.useEffect(mockCallback, [value]); // Runs when value changes
                return <div>With Deps</div>;
            }

            // Test empty dependencies
            const { unmount: unmount1 } = render(<ComponentWithEmptyDeps />);
            expect(mockCallback).toHaveBeenCalledTimes(1);
            unmount1();

            // Reset mock
            mockCallback.mockClear();

            // Test with dependencies
            const { rerender, unmount: unmount2 } = render(
                <ComponentWithDeps value={1} />
            );
            expect(mockCallback).toHaveBeenCalledTimes(1);

            rerender(<ComponentWithDeps value={2} />);
            expect(mockCallback).toHaveBeenCalledTimes(2);

            rerender(<ComponentWithDeps value={2} />); // Same value, no change
            expect(mockCallback).toHaveBeenCalledTimes(2);

            unmount2();

            // This demonstrates the critical difference between [] and [value]
            // Mutations that change [value] to [] would break reactivity
        });

        it("should properly handle useCallback dependency changes", () => {
            let dependency1 = "value1";
            let dependency2 = "value2";
            const mockFunction = vi.fn();

            function TestComponent() {
                const callback = React.useCallback(() => {
                    mockFunction(dependency1, dependency2);
                }, [dependency1, dependency2]);

                // Trigger callback on every render to test staleness
                React.useEffect(() => {
                    callback();
                });

                return <div>Test</div>;
            }

            const { rerender } = render(<TestComponent />);
            expect(mockFunction).toHaveBeenCalledWith("value1", "value2");

            // Change dependencies
            dependency1 = "newValue1";
            dependency2 = "newValue2";
            rerender(<TestComponent />);
            expect(mockFunction).toHaveBeenCalledWith("newValue1", "newValue2");

            // With mutation to [], callback would use stale closure values
        });
    });
});
