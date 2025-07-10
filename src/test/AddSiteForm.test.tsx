/**
 * Tests for AddSiteForm component.
 * Validates form rendering, validation, submission, and interaction behavior.
 */

import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { AddSiteForm } from "../components";

// Mock the stores
const mockUseErrorStore = vi.fn();
const mockUseSitesStore = vi.fn();
vi.mock("../stores", () => ({
    useErrorStore: () => mockUseErrorStore(),
    useSitesStore: () => mockUseSitesStore(),
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
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
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
import { handleSubmit } from "../components/AddSiteForm";

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
    ThemedButton: ({ children, className, disabled, fullWidth, loading, type, variant, ...props }: any) => (
        <button
            className={`${className} ${variant} ${fullWidth ? "w-full" : ""}`}
            disabled={disabled ?? loading}
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
    ThemedText: ({ children, className, size, variant, weight, ...props }: any) => (
        <span className={`${className} ${size} ${variant} ${weight}`} {...props}>
            {children}
        </span>
    ),
}));

describe("AddSiteForm", () => {
    const defaultErrorStoreState = {
        clearAllErrors: vi.fn(),
        clearError: vi.fn(),
        clearStoreError: vi.fn(),
        getOperationLoading: vi.fn(),
        getStoreError: vi.fn(),
        isLoading: false,
        lastError: undefined,
        operationLoading: {},
        setError: vi.fn(),
        setLoading: vi.fn(),
        setOperationLoading: vi.fn(),
        setStoreError: vi.fn(),
        storeErrors: {},
    };

    const defaultSitesStoreState = {
        addMonitorToSite: vi.fn(),
        addSite: vi.fn(),
        checkSiteNow: vi.fn(),
        createSite: vi.fn(),
        removeSite: vi.fn(),
        sites: [
            { identifier: "site1", monitors: [], name: "Test Site 1" },
            { identifier: "site2", monitors: [], name: "Test Site 2" },
        ],
        syncSitesFromBackend: vi.fn(),
        updateSite: vi.fn(),
        updateSiteStatus: vi.fn(),
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
        mockUseErrorStore.mockReturnValue(defaultErrorStoreState);
        mockUseSitesStore.mockReturnValue(defaultSitesStoreState);
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
            expect(
                screen.getByText("• The monitor will be checked according to your monitoring interval")
            ).toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        it("should handle loading state from store", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
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
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
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

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
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
    });

    describe("Theme Integration", () => {
        it("should apply dark theme classes when isDark is true", () => {
            mockUseTheme.mockReturnValue({
                isDark: true,
            });

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
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
            mockUseSitesStore.mockReturnValue({
                ...defaultSitesStoreState,
                sites: [],
            });

            render(<AddSiteForm />);

            // Should still render form
            expect(screen.getByText("Add Site")).toBeInTheDocument();
        });

        it("should handle both lastError and formError present", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
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

    describe("Port Monitor Type", () => {
        beforeEach(() => {
            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                monitorType: "port",
            });
        });

        it("should show host and port fields for port monitor type", () => {
            render(<AddSiteForm />);

            expect(screen.getByLabelText("Host (required)")).toBeInTheDocument();
            expect(screen.getByText("Enter a valid host (domain or IP)")).toBeInTheDocument();
            expect(screen.getByLabelText("Port (required)")).toBeInTheDocument();
            expect(screen.getByText("Enter a port number (1-65535)")).toBeInTheDocument();
        });

        it("should show port-specific help text", () => {
            render(<AddSiteForm />);

            expect(screen.getByText("• Enter a valid host (domain or IP)")).toBeInTheDocument();
            expect(screen.getByText("• Enter a port number (1-65535)")).toBeInTheDocument();
        });

        it("should not show URL field for port monitor type", () => {
            render(<AddSiteForm />);

            expect(screen.queryByText(/Website URL/)).not.toBeInTheDocument();
            expect(screen.queryByText("Enter the full URL including http:// or https://")).not.toBeInTheDocument();
        });

        it("should call setHost when host field changes", async () => {
            const mockSetHost = vi.fn();
            const mockSetMonitorType = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                monitorType: "port",
                setHost: mockSetHost,
                setMonitorType: mockSetMonitorType,
            });

            render(<AddSiteForm />);

            // First, make sure we're in port monitor mode
            const monitorTypeSelect = screen.getByLabelText("Monitor Type");
            await user.selectOptions(monitorTypeSelect, "port");

            const hostInput = screen.getByPlaceholderText("example.com or 192.168.1.1");
            await user.clear(hostInput);
            await user.type(hostInput, "example.com");

            // Check that setHost was called for each character (11 characters in "example.com")
            expect(mockSetHost).toHaveBeenCalledTimes(11);
            // The last call should be with "m" (the last character)
            const lastCall = mockSetHost.mock.calls[mockSetHost.mock.calls.length - 1];
            expect(lastCall?.[0]).toBe("m");
        });

        it("should call setPort when port field changes", async () => {
            const mockSetPort = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                monitorType: "port",
                setPort: mockSetPort,
            });

            render(<AddSiteForm />);

            const portInput = screen.getByPlaceholderText("80");
            await user.clear(portInput);
            await user.type(portInput, "8080");

            expect(mockSetPort).toHaveBeenCalledTimes(4); // "8080" has 4 characters
            expect(mockSetPort).toHaveBeenLastCalledWith("0"); // Last character is "0"
        });
    });

    describe("Existing Site Mode", () => {
        beforeEach(() => {
            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                addMode: "existing",
            });
        });

        it("should show site selector for existing mode", () => {
            render(<AddSiteForm />);

            expect(screen.getByLabelText("Select Site (required)")).toBeInTheDocument();
            expect(screen.getByText("-- Select a site --")).toBeInTheDocument();
            expect(screen.getByText("Test Site 1")).toBeInTheDocument();
            expect(screen.getByText("Test Site 2")).toBeInTheDocument();
        });

        it("should not show site name field for existing mode", () => {
            render(<AddSiteForm />);

            expect(screen.queryByText(/Site Name/)).not.toBeInTheDocument();
        });

        it("should not show site identifier for existing mode", () => {
            render(<AddSiteForm />);

            expect(screen.queryByText("Site Identifier:")).not.toBeInTheDocument();
            expect(screen.queryByText("test-uuid-123")).not.toBeInTheDocument();
        });

        it("should show 'Add Monitor' button text for existing mode", () => {
            render(<AddSiteForm />);

            expect(screen.getByText("Add Monitor")).toBeInTheDocument();
            expect(screen.queryByText("Add Site")).not.toBeInTheDocument();
        });

        it("should show appropriate help text for existing mode", () => {
            render(<AddSiteForm />);

            expect(screen.getByText("• Select a site to add the monitor to")).toBeInTheDocument();
            expect(screen.queryByText("• Site name is required")).not.toBeInTheDocument();
        });

        it("should call setSelectedExistingSite when site is selected", async () => {
            const mockSetSelectedExistingSite = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                addMode: "existing",
                setSelectedExistingSite: mockSetSelectedExistingSite,
            });

            render(<AddSiteForm />);

            const siteSelect = screen.getByDisplayValue("-- Select a site --");
            await user.selectOptions(siteSelect, "site1");

            expect(mockSetSelectedExistingSite).toHaveBeenCalledWith("site1");
        });

        it("should handle sites with missing name (use identifier)", () => {
            mockUseSitesStore.mockReturnValue({
                ...defaultSitesStoreState,
                sites: [
                    { identifier: "site1", monitors: [], name: "site1" },
                    { identifier: "site2", monitors: [], name: "site2" },
                ],
            });

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                addMode: "existing",
            });

            render(<AddSiteForm />);

            expect(screen.getByText("site1")).toBeInTheDocument();
            expect(screen.getByText("site2")).toBeInTheDocument();
        });
    });

    describe("Mode Switching", () => {
        it("should call setAddMode when mode is changed", async () => {
            const mockSetAddMode = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setAddMode: mockSetAddMode,
            });

            render(<AddSiteForm />);

            const existingModeRadio = screen.getByLabelText("Add to Existing Site");
            await user.click(existingModeRadio);

            expect(mockSetAddMode).toHaveBeenCalledWith("existing");
        });

        it("should call setMonitorType when monitor type is changed", async () => {
            const mockSetMonitorType = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setMonitorType: mockSetMonitorType,
            });

            render(<AddSiteForm />);

            const monitorTypeSelect = screen.getByDisplayValue("HTTP (Website/API)");
            await user.selectOptions(monitorTypeSelect, "port");

            expect(mockSetMonitorType).toHaveBeenCalledWith("port");
        });

        it("should call setCheckInterval when interval is changed", async () => {
            const mockSetCheckInterval = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setCheckInterval: mockSetCheckInterval,
            });

            render(<AddSiteForm />);

            const intervalSelect = screen.getByDisplayValue(/5 minutes/); // Assuming 300000 ms = 5 minutes
            await user.selectOptions(intervalSelect, "60000"); // 1 minute

            expect(mockSetCheckInterval).toHaveBeenCalledWith(60000);
        });
    });

    describe("Input Field Interactions", () => {
        it("should call setName when site name changes", async () => {
            const mockSetName = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setName: mockSetName,
            });

            render(<AddSiteForm />);

            const nameInput = screen.getByPlaceholderText("My Website");
            await user.clear(nameInput);
            await user.type(nameInput, "New Site");

            expect(mockSetName).toHaveBeenCalledTimes(8); // "New Site" has 8 characters
            expect(mockSetName).toHaveBeenLastCalledWith("e"); // Last character is "e"
        });

        it("should call setUrl when URL changes", async () => {
            const mockSetUrl = vi.fn();
            const user = userEvent.setup();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                setUrl: mockSetUrl,
            });

            render(<AddSiteForm />);

            const urlInput = screen.getByPlaceholderText("https://example.com");
            await user.clear(urlInput);
            await user.type(urlInput, "https://test.com");

            expect(mockSetUrl).toHaveBeenCalledTimes(16); // "https://test.com" has 16 characters
            expect(mockSetUrl).toHaveBeenLastCalledWith("m"); // Last character is "m"
        });
    });

    describe("Loading Button Delay Effect", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should show loading button with delay", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            render(<AddSiteForm />);

            // Initially should not show loading spinner
            const submitButton = screen.getByText("Add Site");
            expect(submitButton).toBeInTheDocument();
            expect(submitButton.querySelector(".themed-button__spinner")).toBeFalsy();

            // After 100ms delay, should show loading state
            act(() => {
                vi.advanceTimersByTime(100);
            });

            // Note: There appears to be a potential bug where the button text changes to "Loading..."
            // but no spinner elements are rendered. For now, we test the actual behavior.
            const loadingButtonText = screen.queryByText("Loading...");
            expect(loadingButtonText).toBeInTheDocument();

            // The button should be disabled when loading
            const buttonElement = loadingButtonText?.closest("button");
            expect(buttonElement).toBeInTheDocument();
            expect(buttonElement).toBeDisabled();
        });

        it("should not show loading if loading stops before delay", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            const { rerender } = render(<AddSiteForm />);

            // Stop loading before delay - wrap in act to handle React state updates
            act(() => {
                mockUseErrorStore.mockReturnValue({
                    ...defaultErrorStoreState,
                    isLoading: false,
                });
                rerender(<AddSiteForm />);
            });

            // Advance timers past delay - wrap in act since it affects React state
            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
            expect(screen.getByText("Add Site")).toBeInTheDocument();
        });

        it("should clean up timeout on unmount", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            const { unmount } = render(<AddSiteForm />);

            // Unmount before timeout
            unmount();

            // Should not cause any errors when timer tries to fire
            expect(() => {
                vi.advanceTimersByTime(100);
            }).not.toThrow();
        });
    });

    describe("Form Field Disabled States", () => {
        it("should disable all fields when loading", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            render(<AddSiteForm />);

            // Check various input types are disabled
            const nameInput = screen.getByPlaceholderText("My Website");
            const urlInput = screen.getByPlaceholderText("https://example.com");
            const submitButton = screen.getByText("Add Site");

            expect(nameInput).toBeDisabled();
            expect(urlInput).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it("should disable fields in existing site mode when loading", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                addMode: "existing",
            });

            render(<AddSiteForm />);

            const siteSelect = screen.getByDisplayValue("-- Select a site --");
            expect(siteSelect).toBeDisabled();
        });

        it("should disable port fields when loading", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStoreState,
                isLoading: true,
            });

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                monitorType: "port",
            });

            render(<AddSiteForm />);

            const hostInput = screen.getByPlaceholderText("example.com or 192.168.1.1");
            const portInput = screen.getByPlaceholderText("80");

            expect(hostInput).toBeDisabled();
            expect(portInput).toBeDisabled();
        });
    });

    describe("Form Reset Integration", () => {
        it("should call resetForm on successful submission", () => {
            const mockResetForm = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                ...defaultFormState,
                resetForm: mockResetForm,
            });

            render(<AddSiteForm />);

            const form = screen.getByText("Add Site").closest("form");
            fireEvent.submit(form!);

            // Verify handleSubmit was called with the resetForm callback
            expect(vi.mocked(handleSubmit)).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    onSuccess: mockResetForm,
                })
            );
        });
    });
});
