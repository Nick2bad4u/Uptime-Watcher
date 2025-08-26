/**
 * @file Comprehensive tests for AddSiteModal component to improve branch
 *   coverage
 *
 * @see Related Component: {@link src/components/AddSiteForm/AddSiteModal.tsx}
 *
 * Test Coverage Focus:
 * - Modal visibility toggle branches
 * - Event handler branches
 * - Keyboard escape handling branches
 * - Backdrop click interaction branches
 * - Theme state branches
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUIStore } from "../../stores/ui/useUiStore";
import { useTheme } from "../../theme/useTheme";
import { AddSiteModal } from "../../components/AddSiteForm/AddSiteModal";

// Mock the dependencies
vi.mock("../../stores/ui/useUiStore");
vi.mock("../../theme/useTheme", () => ({
    useTheme: vi.fn(),
    useThemeClasses: vi.fn(() => ({
        getBackgroundClass: vi.fn(() => ({
            backgroundColor: "var(--color-background-primary)",
        })),
        getTextClass: vi.fn(() => ({ color: "var(--color-text-primary)" })),
        getBorderClass: vi.fn(() => ({
            borderColor: "var(--color-border-primary)",
        })),
        getSurfaceClass: vi.fn(() => ({
            backgroundColor: "var(--color-surface-base)",
        })),
        getStatusClass: vi.fn(() => ({ color: "var(--color-status-up)" })),
        getColor: vi.fn(() => "#000000"),
    })),
}));
vi.mock("../../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: ({ onSuccess }: { onSuccess: () => void }) => (
        <div data-testid="add-site-form">
            <button onClick={onSuccess} data-testid="mock-success-button">
                Mock Success
            </button>
        </div>
    ),
}));

// Mock themed components with unique test-ids
vi.mock("../../theme/components/ThemedBox", () => ({
    default: ({ children, className, ...props }: any) => (
        <div
            data-testid={
                className?.includes("max-w-2xl")
                    ? "modal-outer-box"
                    : "modal-inner-box"
            }
            className={className}
            {...props}
        >
            {children}
        </div>
    ),
}));

vi.mock("../../theme/components/ThemedButton", () => ({
    default: ({ children, onClick, ...props }: any) => (
        <button data-testid="themed-button" onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => ({
    default: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
}));

describe("AddSiteModal - Branch Coverage Tests", () => {
    const mockSetShowAddSiteModal = vi.fn();
    const mockUseUIStore = vi.mocked(useUIStore);
    const mockUseTheme = vi.mocked(useTheme);

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTheme.mockReturnValue({
            isDark: false,
            currentTheme: {
                name: "light",
                isDark: false,
                borderRadius: {
                    none: "0",
                    sm: "0.125rem",
                    md: "0.375rem",
                    lg: "0.5rem",
                    xl: "0.75rem",
                    full: "9999px",
                },
                colors: {
                    background: {
                        primary: "#ffffff",
                        secondary: "#f8fafc",
                        tertiary: "#f1f5f9",
                        modal: "#ffffff",
                    },
                    text: {
                        primary: "#0f172a",
                        secondary: "#475569",
                        tertiary: "#64748b",
                        inverse: "#ffffff",
                    },
                    border: {
                        focus: "#94a3b8",
                        primary: "#e2e8f0",
                        secondary: "#cbd5e1",
                    },
                    surface: {
                        base: "#ffffff",
                        elevated: "#ffffff",
                        overlay: "#ffffff",
                    },
                    status: {
                        up: "#22c55e",
                        down: "#ef4444",
                        mixed: "#f59e0b",
                        paused: "#6b7280",
                        pending: "#f59e0b",
                        unknown: "#6b7280",
                    },
                    error: "#ef4444",
                    errorAlert: "#fca5a5",
                    info: "#3b82f6",
                    success: "#22c55e",
                    warning: "#f59e0b",
                    hover: {
                        dark: "#1e293b",
                        light: "#f8fafc",
                        medium: "#64748b",
                    },
                    primary: {
                        50: "#f8fafc",
                        100: "#f1f5f9",
                        200: "#e2e8f0",
                        300: "#cbd5e1",
                        400: "#94a3b8",
                        500: "#64748b",
                        600: "#475569",
                        700: "#334155",
                        800: "#1e293b",
                        900: "#0f172a",
                    },
                },
                spacing: {
                    xs: "0.25rem",
                    sm: "0.5rem",
                    md: "1rem",
                    lg: "1.5rem",
                    xl: "2rem",
                    "2xl": "3rem",
                    "3xl": "4rem",
                },
                shadows: {
                    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
                },
                typography: {
                    fontFamily: {
                        sans: [
                            "Inter",
                            "system-ui",
                            "sans-serif",
                        ],
                        mono: ["JetBrains Mono", "monospace"],
                    },
                    fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                        base: "1rem",
                        lg: "1.125rem",
                        xl: "1.25rem",
                        "2xl": "1.5rem",
                        "3xl": "1.875rem",
                        "4xl": "2.25rem",
                    },
                    fontWeight: {
                        normal: "400",
                        medium: "500",
                        semibold: "600",
                        bold: "700",
                    },
                    lineHeight: {
                        tight: "1.25",
                        normal: "1.5",
                        relaxed: "1.75",
                    },
                },
            },
            toggleTheme: vi.fn(),
            setTheme: vi.fn(),
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            availableThemes: ["light", "dark"],
            systemTheme: "light",
            themeManager: {} as any,
            themeName: "light",
            themeVersion: 1,
        });
    });

    describe("Modal Visibility Branches", () => {
        it("should render nothing when showAddSiteModal is false", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                showAddSiteModal: false,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            const { container } = render(<AddSiteModal />);
            expect(container.firstChild).toBeNull();
        });

        it("should render modal when showAddSiteModal is true", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            render(<AddSiteModal />);
            expect(screen.getByTestId("modal-outer-box")).toBeInTheDocument();
            expect(screen.getByText("Add New Site")).toBeInTheDocument();
        });
    });

    describe("Theme State Branches", () => {
        it("should apply dark theme classes when isDark is true", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue({
                isDark: true,
                currentTheme: {} as any,
                toggleTheme: vi.fn(),
                setTheme: vi.fn(),
                getColor: vi.fn(),
                getStatusColor: vi.fn(),
                availableThemes: ["light", "dark"],
                systemTheme: "dark",
                themeManager: {} as any,
                themeName: "dark",
                themeVersion: 1,
            });

            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            render(<AddSiteModal />);
            const backdrop = document.querySelector(".fixed.inset-0");
            expect(backdrop).toHaveClass("dark");
        });

        it("should not apply dark theme classes when isDark is false", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue({
                isDark: false,
                currentTheme: {} as any,
                toggleTheme: vi.fn(),
                setTheme: vi.fn(),
                getColor: vi.fn(),
                getStatusColor: vi.fn(),
                availableThemes: ["light", "dark"],
                systemTheme: "light",
                themeManager: {} as any,
                themeName: "light",
                themeVersion: 1,
            });

            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            render(<AddSiteModal />);
            // Check that the backdrop div exists and verify dark class is absent
            const backdrop = document.querySelector(".fixed.inset-0");
            expect(backdrop).not.toHaveClass("dark");
        });
    });

    describe("Event Handler Branches", () => {
        beforeEach(() => {
            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });
        });

        it("should call setShowAddSiteModal(false) when close button is clicked", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            const closeButton = screen.getByRole("button", {
                name: /close modal/i,
            });
            await userEvent.click(closeButton);

            expect(mockSetShowAddSiteModal).toHaveBeenCalledWith(false);
        });

        it("should call setShowAddSiteModal(false) when backdrop is clicked", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            // Get the backdrop by testing the event directly
            const backdrop = document.querySelector(".fixed.inset-0")!;
            fireEvent.click(backdrop);

            expect(mockSetShowAddSiteModal).toHaveBeenCalledWith(false);
        });

        it("should not close modal when clicking inside the modal content", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            const modalContent = screen.getByTestId("modal-outer-box");
            fireEvent.click(modalContent);

            expect(mockSetShowAddSiteModal).not.toHaveBeenCalled();
        });

        it("should close modal when form success callback is called", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            const successButton = screen.getByTestId("mock-success-button");
            await userEvent.click(successButton);

            expect(mockSetShowAddSiteModal).toHaveBeenCalledWith(false);
        });
    });

    describe("Keyboard Event Branches", () => {
        beforeEach(() => {
            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });
        });

        it("should close modal when Escape key is pressed and modal is visible", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            fireEvent.keyDown(document, { key: "Escape" });

            await waitFor(() => {
                expect(mockSetShowAddSiteModal).toHaveBeenCalledWith(false);
            });
        });

        it("should not close modal when other keys are pressed", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteModal />);

            fireEvent.keyDown(document, { key: "Enter" });
            fireEvent.keyDown(document, { key: "Space" });
            fireEvent.keyDown(document, { key: "Tab" });

            expect(mockSetShowAddSiteModal).not.toHaveBeenCalled();
        });

        it("should not respond to Escape when modal is not visible", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // First render with modal hidden
            mockUseUIStore.mockReturnValue({
                showAddSiteModal: false,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            render(<AddSiteModal />);

            fireEvent.keyDown(document, { key: "Escape" });

            expect(mockSetShowAddSiteModal).not.toHaveBeenCalled();
        });
    });

    describe("Event Cleanup Branches", () => {
        it("should add and remove event listeners based on modal visibility", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteModal.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Deletion", "type");

            const addEventListenerSpy = vi.spyOn(document, "addEventListener");
            const removeEventListenerSpy = vi.spyOn(
                document,
                "removeEventListener"
            );

            // Start with modal visible
            mockUseUIStore.mockReturnValue({
                showAddSiteModal: true,
                setShowAddSiteModal: mockSetShowAddSiteModal,
                selectedSiteId: null,
                setSelectedSiteId: vi.fn(),
                selectedChartPeriod: "1d",
                setSelectedChartPeriod: vi.fn(),
                isLoading: false,
                setIsLoading: vi.fn(),
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            const { unmount } = render(<AddSiteModal />);

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function)
            );

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function)
            );

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });
});
