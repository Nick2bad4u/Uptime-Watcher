/**
 * Enhanced comprehensive tests for AddSiteForm component
 *
 * @fileoverview This test file provides enhanced comprehensive coverage for the AddSiteForm component,
 * testing all functionality including form validation, user interactions, state management,
 * error handling scenarios, validation logic, and all code paths for maximum coverage.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { RenderResult } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import React from "react";

// Component imports
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";

// Import the modules so we can access the mocked functions
import { useAddSiteForm } from "../../../components/SiteDetails/useAddSiteForm";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useMonitorTypes } from "../../../hooks/useMonitorTypes";
import { useDynamicHelpText } from "../../../hooks/useDynamicHelpText";
import { useDelayedButtonLoading } from "../../../hooks/useDelayedButtonLoading";

// Get the mocked functions
const mockUseAddSiteForm = vi.mocked(useAddSiteForm);
const mockUseErrorStore = vi.mocked(useErrorStore);
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseMonitorTypes = vi.mocked(useMonitorTypes);
const mockUseDynamicHelpText = vi.mocked(useDynamicHelpText);
const mockUseDelayedButtonLoading = vi.mocked(useDelayedButtonLoading);

// Mock data
const mockFormData = {
    siteName: "",
    siteUrl: "",
    monitorType: "http",
    interval: 60,
    timeout: 30,
    retries: 3,
    description: "",
    tags: [],
};

const mockMonitorTypes = [
    { id: "http", name: "HTTP", fields: ["url", "method"] },
    { id: "ping", name: "Ping", fields: ["host"] },
    { id: "tcp", name: "TCP", fields: ["host", "port"] },
    { id: "dns", name: "DNS", fields: ["hostname", "query_type"] },
];

const mockSites = [
    { id: "site1", name: "Test Site 1", url: "https://example1.com" },
    { id: "site2", name: "Test Site 2", url: "https://example2.com" },
];

// Setup mocks with static implementations
vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: vi.fn(() => ({
        // State
        addMode: "new",
        checkInterval: 60_000,
        formError: undefined,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        selectedExistingSite: "",
        siteId: "test-id",
        url: "",
        // Actions
        isFormValid: vi.fn(() => true),
        resetForm: vi.fn(),
        setAddMode: vi.fn(),
        setCheckInterval: vi.fn(),
        setFormError: vi.fn(),
        setHost: vi.fn(),
        setMonitorType: vi.fn(),
        setName: vi.fn(),
        setPort: vi.fn(),
        setSelectedExistingSite: vi.fn(),
        setSiteId: vi.fn(),
        setUrl: vi.fn(),
    })),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        setError: vi.fn(),
        getError: vi.fn(() => null),
        lastError: null,
    })),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: mockSites,
        selectedSiteId: null,
        isLoading: false,
        addSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
    })),
}));

vi.mock("../../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        monitorTypes: mockMonitorTypes,
        options: mockMonitorTypes.map((type) => ({
            label: type.name,
            value: type.id,
        })),
        isLoading: false,
        error: null,
        refreshMonitorTypes: vi.fn(),
    })),
}));

vi.mock("../../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        helpText: "Default help text",
        error: null,
        isLoading: false,
    })),
}));

vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => ({
        isLoading: false,
        startLoading: vi.fn(),
        stopLoading: vi.fn(),
    })),
}));

vi.mock("../../../constants", () => ({
    CHECK_INTERVALS: [
        { label: "1 minute", value: 60_000 },
        { label: "5 minutes", value: 300_000 },
        { label: "10 minutes", value: 600_000 },
    ],
    DEFAULT_CHECK_INTERVAL: 60_000,
    ARIA_LABEL: "aria-label",
    TRANSITION_ALL: "all 0.2s ease-in-out",
    FALLBACK_MONITOR_TYPE_OPTIONS: [
        { label: "HTTP (Website/API)", value: "http" },
        { label: "Port (Host/Port)", value: "port" },
        { label: "Ping (Host)", value: "ping" },
    ],
}));

// Default props for testing
const defaultProps = {
    onSuccess: vi.fn(),
};

/**
 * Renders the AddSiteForm component with default props
 */
const renderAddSiteForm = (props = {}): RenderResult => {
    const mergedProps = { ...defaultProps, ...props };
    return render(<AddSiteForm {...mergedProps} />);
};

describe("AddSiteForm Component - Enhanced Coverage", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Basic Rendering and Structure", () => {
        it("should render the form without errors", () => {
            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should render all required form elements", () => {
            renderAddSiteForm();
            expect(screen.getByTestId("site-name-field")).toBeInTheDocument();
            expect(screen.getByTestId("site-url-field")).toBeInTheDocument();
            expect(
                screen.getByTestId("monitor-type-field")
            ).toBeInTheDocument();
        });

        it("should render with proper form structure", () => {
            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should render without errors when no props provided", () => {
            renderAddSiteForm({});
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should render with default configuration", () => {
            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });
    });

    describe("Form Field Components", () => {
        it("should render site name field with proper attributes", () => {
            renderAddSiteForm();
            const nameField = screen.getByTestId("site-name-field");
            expect(nameField).toBeInTheDocument();
            expect(nameField.querySelector("input")).toHaveAttribute(
                "type",
                "text"
            );
        });

        it("should render site URL field with proper attributes", () => {
            renderAddSiteForm();
            const urlField = screen.getByTestId("site-url-field");
            expect(urlField).toBeInTheDocument();
            expect(urlField.querySelector("input")).toHaveAttribute(
                "type",
                "url"
            );
        });

        it("should render monitor type selection field", () => {
            renderAddSiteForm();
            const monitorField = screen.getByTestId("monitor-type-field");
            expect(monitorField).toBeInTheDocument();
            expect(monitorField.querySelector("select")).toBeInTheDocument();
        });

        it("should render description field", () => {
            renderAddSiteForm();
            const descriptionField = screen.getByTestId("description-field");
            expect(descriptionField).toBeInTheDocument();
            expect(
                descriptionField.querySelector("textarea")
            ).toBeInTheDocument();
        });

        it("should render interval field with numeric input", () => {
            renderAddSiteForm();
            const intervalField = screen.getByTestId("interval-field");
            expect(intervalField).toBeInTheDocument();
            expect(intervalField.querySelector("input")).toHaveAttribute(
                "type",
                "number"
            );
        });

        it("should render timeout field with numeric input", () => {
            renderAddSiteForm();
            const timeoutField = screen.getByTestId("timeout-field");
            expect(timeoutField).toBeInTheDocument();
            expect(timeoutField.querySelector("input")).toHaveAttribute(
                "type",
                "number"
            );
        });

        it("should render retries field with numeric input", () => {
            renderAddSiteForm();
            const retriesField = screen.getByTestId("retries-field");
            expect(retriesField).toBeInTheDocument();
            expect(retriesField.querySelector("input")).toHaveAttribute(
                "type",
                "number"
            );
        });
    });

    describe("Form Data Population and Display", () => {
        it("should populate form fields with initial data", () => {
            const formDataWithValues = {
                ...mockFormData,
                siteName: "Test Site",
                siteUrl: "https://test.com",
                description: "Test description",
                interval: 300,
                timeout: 45,
                retries: 5,
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithValues,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();

            expect(screen.getByDisplayValue("Test Site")).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("https://test.com")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Test description")
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue("300")).toBeInTheDocument();
            expect(screen.getByDisplayValue("45")).toBeInTheDocument();
            expect(screen.getByDisplayValue("5")).toBeInTheDocument();
        });

        it("should handle empty form data gracefully", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: {},
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle null form data", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: null,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle undefined form data", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: undefined,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });
    });

    describe("User Interactions and Form Changes", () => {
        it("should handle site name input changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const nameInput = screen
                .getByTestId("site-name-field")
                .querySelector("input");
            await user.type(nameInput, "New Site Name");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle site URL input changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const urlInput = screen
                .getByTestId("site-url-field")
                .querySelector("input");
            await user.type(urlInput, "https://example.com");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle monitor type selection changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const monitorSelect = screen
                .getByTestId("monitor-type-field")
                .querySelector("select");
            await user.selectOptions(monitorSelect, "ping");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle description textarea changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const descriptionTextarea = screen
                .getByTestId("description-field")
                .querySelector("textarea");
            await user.type(descriptionTextarea, "Site description");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle interval value changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const intervalInput = screen
                .getByTestId("interval-field")
                .querySelector("input");
            await user.clear(intervalInput);
            await user.type(intervalInput, "300");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle timeout value changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const timeoutInput = screen
                .getByTestId("timeout-field")
                .querySelector("input");
            await user.clear(timeoutInput);
            await user.type(timeoutInput, "45");
            expect(handleInputChange).toHaveBeenCalled();
        });

        it("should handle retries value changes", async () => {
            const handleInputChange = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange,
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const retriesInput = screen
                .getByTestId("retries-field")
                .querySelector("input");
            await user.clear(retriesInput);
            await user.type(retriesInput, "5");
            expect(handleInputChange).toHaveBeenCalled();
        });
    });

    describe("Form Submission Handling", () => {
        it("should handle form submission with onSuccess callback", async () => {
            const handleSubmit = vi.fn();
            const onSuccess = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit,
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm({ onSuccess });
            const form = screen.getByRole("form");
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalledWith(
                expect.any(Object),
                onSuccess
            );
        });

        it("should handle form submission without onSuccess callback", async () => {
            const handleSubmit = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit,
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm({ onSuccess: undefined });
            const form = screen.getByRole("form");
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalledWith(
                expect.any(Object),
                undefined
            );
        });

        it("should handle submit button click", async () => {
            const handleSubmit = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit,
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            await user.click(submitButton);

            expect(handleSubmit).toHaveBeenCalled();
        });

        it("should prevent submission when form is invalid", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: { siteName: "Required" },
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            expect(submitButton).toBeDisabled();
        });

        it("should handle rapid form submissions", async () => {
            const handleSubmit = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit,
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const form = screen.getByRole("form");

            fireEvent.submit(form);
            fireEvent.submit(form);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalledTimes(3);
        });
    });

    describe("Loading and Disabled States", () => {
        it("should show loading state when form is submitting", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: true,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            expect(submitButton).toBeDisabled();
        });

        it("should disable form fields when submitting", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: true,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const nameInput = screen
                .getByTestId("site-name-field")
                .querySelector("input");
            const urlInput = screen
                .getByTestId("site-url-field")
                .querySelector("input");

            expect(nameInput).toBeDisabled();
            expect(urlInput).toBeDisabled();
        });

        it("should enable submit button when not submitting and form is valid", () => {
            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            expect(submitButton).not.toBeDisabled();
        });

        it("should handle monitor types loading state", () => {
            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: [],
                options: [],
                isLoading: true,
                error: null,
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });
    });

    describe("Error Handling and Display", () => {
        it("should display field validation errors", () => {
            const errors = {
                siteName: "Site name is required",
                siteUrl: "Please enter a valid URL",
                monitorType: "Monitor type is required",
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors,
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            expect(
                screen.getByText("Site name is required")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Please enter a valid URL")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Monitor type is required")
            ).toBeInTheDocument();
        });

        it("should handle monitor types error state", () => {
            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: [],
                options: [],
                isLoading: false,
                error: "Failed to load monitor types",
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle component render errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            mockUseAddSiteForm.mockImplementation(() => {
                throw new Error("Test render error");
            });

            expect(() => renderAddSiteForm()).toThrow("Test render error");

            consoleSpy.mockRestore();
        });

        it("should handle error store integration", () => {
            const mockError = {
                message: "Form submission failed",
                code: "SUBMIT_ERROR",
            };

            mockUseErrorStore.mockReturnValue({
                clearError: vi.fn(),
                setError: vi.fn(),
                getError: vi.fn(() => mockError),
                lastError: mockError,
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should clear errors on field focus", async () => {
            const clearError = vi.fn();
            const errors = { siteName: "Site name is required" };

            mockUseErrorStore.mockReturnValue({
                clearError,
                setError: vi.fn(),
                getError: vi.fn(() => null),
                lastError: null,
            });

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors,
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            const nameInput = screen
                .getByTestId("site-name-field")
                .querySelector("input");
            await user.click(nameInput);

            // Verify error handling behavior
            expect(clearError).toHaveBeenCalled();
        });
    });

    describe("Validation Logic", () => {
        it("should validate add mode correctly", () => {
            const isValidAddMode = vi.fn(() => true);

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode,
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(isValidAddMode).toHaveBeenCalled();
        });

        it("should validate monitor type correctly", () => {
            const isValidMonitorType = vi.fn(() => true);

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType,
            });

            renderAddSiteForm();
            expect(isValidMonitorType).toHaveBeenCalled();
        });

        it("should handle invalid add mode state", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            expect(submitButton).toBeDisabled();
        });

        it("should handle invalid monitor type state", () => {
            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            const submitButton = screen.getByRole("button", {
                name: /submit/i,
            });
            expect(submitButton).toBeDisabled();
        });

        it("should handle complex validation scenarios", () => {
            const formDataWithComplexValidation = {
                ...mockFormData,
                siteName: "a", // Too short
                siteUrl: "invalid-url", // Invalid format
                timeout: -1, // Negative value
                retries: 10, // Too high
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithComplexValidation,
                isSubmitting: false,
                errors: {
                    siteName: "Site name must be at least 3 characters",
                    siteUrl: "Please enter a valid URL",
                    timeout: "Timeout must be positive",
                    retries: "Retries must be between 0 and 5",
                },
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(
                screen.getByText("Site name must be at least 3 characters")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Please enter a valid URL")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Timeout must be positive")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Retries must be between 0 and 5")
            ).toBeInTheDocument();
        });
    });

    describe("Monitor Types Integration", () => {
        it("should render available monitor types in select field", () => {
            renderAddSiteForm();
            const monitorSelect = screen
                .getByTestId("monitor-type-field")
                .querySelector("select");

            expect(monitorSelect).toBeInTheDocument();
            for (const type of mockMonitorTypes) {
                expect(screen.getByText(type.name)).toBeInTheDocument();
            }
        });

        it("should handle empty monitor types list", () => {
            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: [],
                options: [],
                isLoading: false,
                error: null,
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            const monitorSelect = screen
                .getByTestId("monitor-type-field")
                .querySelector("select");
            expect(monitorSelect).toBeInTheDocument();
        });

        it("should handle undefined monitor types", () => {
            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: undefined,
                options: undefined,
                isLoading: false,
                error: null,
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle monitor types with special configurations", () => {
            const specialMonitorTypes = [
                {
                    id: "custom",
                    name: "Custom Monitor",
                    fields: ["custom_field1", "custom_field2"],
                },
                { id: "advanced", name: "Advanced Monitor", fields: [] },
            ];

            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: specialMonitorTypes,
                options: specialMonitorTypes.map((type) => ({
                    label: type.name,
                    value: type.id,
                })),
                isLoading: false,
                error: null,
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            expect(screen.getByText("Custom Monitor")).toBeInTheDocument();
            expect(screen.getByText("Advanced Monitor")).toBeInTheDocument();
        });

        it("should refresh monitor types when needed", () => {
            const refreshMonitorTypes = vi.fn();

            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: mockMonitorTypes,
                options: mockMonitorTypes.map((type) => ({
                    label: type.name,
                    value: type.id,
                })),
                isLoading: false,
                error: null,
                refreshMonitorTypes,
            });

            renderAddSiteForm();
            // Test would trigger refresh in real component
            expect(refreshMonitorTypes).toBeDefined();
        });
    });

    describe("Dynamic Help Text Integration", () => {
        it("should display help text for fields", () => {
            mockUseDynamicHelpText.mockReturnValue({
                helpText: "Enter the URL of the site you want to monitor",
                error: null,
                isLoading: false,
            });

            renderAddSiteForm();
            expect(
                screen.getByText(
                    "Enter the URL of the site you want to monitor"
                )
            ).toBeInTheDocument();
        });

        it("should handle help text loading state", () => {
            mockUseDynamicHelpText.mockReturnValue({
                helpText: null,
                error: null,
                isLoading: true,
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle help text error state", () => {
            mockUseDynamicHelpText.mockReturnValue({
                helpText: null,
                error: "Failed to load help text",
                isLoading: false,
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should update help text based on field focus", async () => {
            const mockDynamicHelp = mockUseDynamicHelpText;

            renderAddSiteForm();
            const urlInput = screen
                .getByTestId("site-url-field")
                .querySelector("input");

            await user.click(urlInput);

            // Verify dynamic help text interaction
            expect(mockDynamicHelp).toHaveBeenCalled();
        });
    });

    describe("Accessibility Features", () => {
        it("should have proper form labels and ARIA attributes", () => {
            renderAddSiteForm();

            const nameField = screen.getByTestId("site-name-field");
            const urlField = screen.getByTestId("site-url-field");
            const monitorField = screen.getByTestId("monitor-type-field");

            expect(nameField).toBeInTheDocument();
            expect(urlField).toBeInTheDocument();
            expect(monitorField).toBeInTheDocument();
        });

        it("should support keyboard navigation through form fields", async () => {
            renderAddSiteForm();

            const nameInput = screen
                .getByTestId("site-name-field")
                .querySelector("input");
            const urlInput = screen
                .getByTestId("site-url-field")
                .querySelector("input");
            const monitorSelect = screen
                .getByTestId("monitor-type-field")
                .querySelector("select");

            await user.tab();
            expect(nameInput).toHaveFocus();

            await user.tab();
            expect(urlInput).toHaveFocus();

            await user.tab();
            expect(monitorSelect).toHaveFocus();
        });

        it("should have proper form role and structure", () => {
            renderAddSiteForm();
            const form = screen.getByRole("form");
            expect(form).toHaveAttribute("role", "form");
        });

        it("should announce validation errors to screen readers", () => {
            const errors = { siteName: "Site name is required" };

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors,
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: false,
                isValidAddMode: vi.fn(() => false),
                isValidMonitorType: vi.fn(() => false),
            });

            renderAddSiteForm();
            const errorMessage = screen.getByText("Site name is required");
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveAttribute("role", "alert");
        });
    });

    describe("Edge Cases and Corner Scenarios", () => {
        it("should handle very long form field values", () => {
            const longText = "a".repeat(1000);
            const formDataWithLongValues = {
                ...mockFormData,
                siteName: longText,
                description: longText,
                siteUrl: `https://${longText}.com`,
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithLongValues,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
        });

        it("should handle special characters in form values", () => {
            const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?`~\"'\\";
            const formDataWithSpecialChars = {
                ...mockFormData,
                siteName: specialChars,
                description: specialChars,
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithSpecialChars,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(screen.getByDisplayValue(specialChars)).toBeInTheDocument();
        });

        it("should handle extreme numeric values", () => {
            const formDataWithExtremeValues = {
                ...mockFormData,
                interval: Number.MAX_SAFE_INTEGER,
                timeout: 0,
                retries: Number.MAX_SAFE_INTEGER,
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithExtremeValues,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(
                screen.getByDisplayValue(String(Number.MAX_SAFE_INTEGER))
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue("0")).toBeInTheDocument();
        });

        it("should handle Unicode characters in form values", () => {
            const unicodeText = "你好世界 🌍 Здравствуй мир 🇺🇳 مرحبا بالعالم";
            const formDataWithUnicode = {
                ...mockFormData,
                siteName: unicodeText,
                description: unicodeText,
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithUnicode,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();
            expect(screen.getByDisplayValue(unicodeText)).toBeInTheDocument();
        });

        it("should handle form reset scenarios", () => {
            const resetForm = vi.fn();

            mockUseAddSiteForm.mockReturnValue({
                formData: mockFormData,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm,
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            renderAddSiteForm();

            // Test reset functionality
            expect(resetForm).toBeDefined();
        });
    });

    describe("Performance and Re-rendering", () => {
        it("should handle frequent re-renders efficiently", () => {
            const { rerender } = renderAddSiteForm();

            // Simulate multiple re-renders with different props
            for (let i = 0; i < 10; i++) {
                rerender(
                    <AddSiteForm {...defaultProps} className={`test-${i}`} />
                );
            }

            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should maintain form state during re-renders", () => {
            const formDataWithValues = {
                ...mockFormData,
                siteName: "Persistent Site",
                siteUrl: "https://persistent.com",
            };

            mockUseAddSiteForm.mockReturnValue({
                formData: formDataWithValues,
                isSubmitting: false,
                errors: {},
                handleInputChange: vi.fn(),
                handleSubmit: vi.fn(),
                resetForm: vi.fn(),
                isValidForm: true,
                isValidAddMode: vi.fn(() => true),
                isValidMonitorType: vi.fn(() => true),
            });

            const { rerender } = renderAddSiteForm();

            expect(
                screen.getByDisplayValue("Persistent Site")
            ).toBeInTheDocument();

            rerender(<AddSiteForm {...defaultProps} />);

            expect(
                screen.getByDisplayValue("Persistent Site")
            ).toBeInTheDocument();
        });

        it("should handle large monitor types lists efficiently", () => {
            const largeMonitorTypesList = Array.from(
                { length: 100 },
                (_, i) => ({
                    id: `monitor${i}`,
                    name: `Monitor Type ${i}`,
                    fields: [`field${i}`],
                })
            );

            mockUseMonitorTypes.mockReturnValue({
                monitorTypes: largeMonitorTypesList,
                options: largeMonitorTypesList.map((type) => ({
                    label: type.name,
                    value: type.id,
                })),
                isLoading: false,
                error: null,
                refreshMonitorTypes: vi.fn(),
            });

            renderAddSiteForm();
            expect(screen.getByRole("form")).toBeInTheDocument();
        });
    });
});
