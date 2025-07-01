/**
 * Tests for AddSiteForm component.
 * Validates form rendering, validation, submission, and interaction behavior.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AddSiteForm } from "../components/AddSiteForm/AddSiteForm";

// Mock the store
const mockUseStore = vi.fn();
vi.mock("../store", () => ({
    useStore: () => mockUseStore(),
}));

// Mock the theme hook
const mockUseTheme = vi.fn();
vi.mock("../theme/useTheme", () => ({
    useTheme: () => mockUseTheme(),
}));

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock UUID generator
vi.mock("../utils/data/generateUuid", () => ({
    generateUuid: () => "test-uuid-123",
}));

// Mock submit handler
vi.mock("../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

// Import the mocked module
import { handleSubmit } from "../components/AddSiteForm/Submit";

// Mock the form hook
const mockUseAddSiteForm = vi.fn();
vi.mock("../components/AddSiteForm/useAddSiteForm", () => ({
    useAddSiteForm: () => mockUseAddSiteForm(),
}));

// Mock theme components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, className, ...props }: any) => (
        <div className={className} {...props}>
            {children}
        </div>
    ),
    ThemedText: ({ children, className, size, variant, weight, ...props }: any) => (
        <span className={`${className} ${size} ${variant} ${weight}`} {...props}>
            {children}
        </span>
    ),
    ThemedButton: ({ children, className, disabled, loading, type, variant, fullWidth, ...props }: any) => (
        <button
            className={`${className} ${variant} ${fullWidth ? "w-full" : ""}`}
            disabled={disabled || loading}
            type={type}
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    ),
    ThemedInput: ({ className, ...props }: any) => <input className={className} {...props} />,
    ThemedSelect: ({ children, className, ...props }: any) => (
        <select className={className} {...props}>
            {children}
        </select>
    ),
}));

describe("AddSiteForm", () => {
    const defaultStoreState = {
        addMonitorToSite: vi.fn(),
        clearError: vi.fn(),
        createSite: vi.fn(),
        isLoading: false,
        lastError: null,
        sites: [
            { identifier: "site1", name: "Test Site 1" },
            { identifier: "site2", name: "Test Site 2" },
        ],
    };

    const defaultFormState = {
        addMode: "new" as const,
        checkInterval: 300000,
        formError: undefined,
        host: "",
        isFormValid: true,
        monitorType: "http" as const,
        name: "",
        port: "",
        resetForm: vi.fn(),
        selectedExistingSite: "",
        setAddMode: vi.fn(),
        setCheckInterval: vi.fn(),
        setFormError: vi.fn(),
        setHost: vi.fn(),
        setMonitorType: vi.fn(),
        setName: vi.fn(),
        setPort: vi.fn(),
        setSelectedExistingSite: vi.fn(),
        setUrl: vi.fn(),
        siteId: "test-uuid-123",
        url: "",
    };

    const defaultThemeState = {
        isDark: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseStore.mockReturnValue(defaultStoreState);
        mockUseAddSiteForm.mockReturnValue(defaultFormState);
        mockUseTheme.mockReturnValue(defaultThemeState);
        vi.mocked(handleSubmit).mockImplementation((e: any) => e.preventDefault());
    });

    describe("Basic Rendering", () => {
        it("should render form with default new site mode", () => {
            render(<AddSiteForm />);

            expect(screen.getByText("Add Mode")).toBeInTheDocument();
            expect(screen.getByText("Create New Site")).toBeInTheDocument();
            expect(screen.getByText("Add to Existing Site")).toBeInTheDocument();
            expect(screen.getByText(/Site Name/)).toBeInTheDocument();
            expect(screen.getByText("Monitor Type")).toBeInTheDocument();
            expect(screen.getByText("Add Site")).toBeInTheDocument();
        });

        it("should show site identifier for new site mode", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("Site Identifier:")).toBeInTheDocument();
            expect(screen.getByText("test-uuid-123")).toBeInTheDocument();
        });

        it("should render monitor type options", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("HTTP (Website/API)")).toBeInTheDocument();
            expect(screen.getByText("Port (Host/Port)")).toBeInTheDocument();
        });

        it("should render check interval options", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("Check Interval")).toBeInTheDocument();
        });
    });

    describe("HTTP Monitor Fields", () => {
        it("should show URL field for HTTP monitor type", () => {
            render(<AddSiteForm />);
            expect(screen.getByText(/Website URL/)).toBeInTheDocument();
            expect(screen.getByText("Enter the full URL including http:// or https://")).toBeInTheDocument();
        });

        it("should show HTTP-specific help text", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("• Enter the full URL including http:// or https://")).toBeInTheDocument();
        });
    });

    describe("Form Validation Help Text", () => {
        it("should show help text for new site mode", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("• Site name is required")).toBeInTheDocument();
        });

        it("should show monitoring interval help text", () => {
            render(<AddSiteForm />);
            expect(screen.getByText("• The monitor will be checked according to your monitoring interval")).toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        it("should handle loading state from store", () => {
            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                isLoading: true,
            });

            render(<AddSiteForm />);

            // Button should be disabled during loading
            const submitButton = screen.getByText("Add Site");
            expect(submitButton).toBeDisabled();
        });
    });

    describe("Error Handling", () => {
        it("should display error from store", () => {
            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                lastError: "Network error occurred",
            });

            render(<AddSiteForm />);

            expect(screen.getByText("❌ Network error occurred")).toBeInTheDocument();
            expect(screen.getByText("✕")).toBeInTheDocument();
        });

        it("should display form error", () => {
            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                formError: "Invalid URL format",
                isFormValid: false,
            });

            render(<AddSiteForm />);

            expect(screen.getByText("❌ Invalid URL format")).toBeInTheDocument();
        });

        it("should clear errors when close button is clicked", async () => {
            const mockClearError = vi.fn();
            const mockSetFormError = vi.fn();
            const user = userEvent.setup();

            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                clearError: mockClearError,
                lastError: "Test error",
            });

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setFormError: mockSetFormError,
            });

            render(<AddSiteForm />);

            const closeButton = screen.getByText("✕");
            await user.click(closeButton);

            expect(mockClearError).toHaveBeenCalled();
            expect(mockSetFormError).toHaveBeenCalledWith(undefined);
        });
    });

    describe("Form Submission", () => {
        it("should handle form submission", () => {
            render(<AddSiteForm />);

            const form = screen.getByText("Add Site").closest("form");
            fireEvent.submit(form!);

            expect(vi.mocked(handleSubmit)).toHaveBeenCalled();
        });

        it("should disable submit button when form is invalid", () => {
            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                isFormValid: false,
            });

            render(<AddSiteForm />);

            const submitButton = screen.getByText("Add Site");
            expect(submitButton).toBeDisabled();
        });
    });

    describe("Theme Integration", () => {
        it("should apply dark theme classes when isDark is true", () => {
            mockUseTheme.mockReturnValue({
                isDark: true,
            });

            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                lastError: "Test error",
            });

            render(<AddSiteForm />);

            // The error alert should have dark class in the container div
            const errorText = screen.getByText("❌ Test error");
            const errorContainer = errorText.closest('[class*="error-alert"]');
            expect(errorContainer).toHaveClass("dark");
        });
    });

    describe("Accessibility", () => {
        it("should have proper form structure", () => {
            render(<AddSiteForm />);

            // Form should be properly structured
            const form = screen.getByText("Add Site").closest("form");
            expect(form).toBeInTheDocument();
        });

        it("should have submit button with proper type", () => {
            render(<AddSiteForm />);

            const submitButton = screen.getByText("Add Site");
            expect(submitButton).toHaveAttribute("type", "submit");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty sites list", () => {
            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                sites: [],
            });

            render(<AddSiteForm />);

            // Should still render form
            expect(screen.getByText("Add Site")).toBeInTheDocument();
        });

        it("should handle both lastError and formError present", () => {
            mockUseStore.mockReturnValue({
                ...defaultStoreState,
                lastError: "Store error",
            });

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                formError: "Form error",
            });

            render(<AddSiteForm />);

            // Should show formError first (formError ?? lastError)
            expect(screen.getByText("❌ Form error")).toBeInTheDocument();
        });
    });
});
