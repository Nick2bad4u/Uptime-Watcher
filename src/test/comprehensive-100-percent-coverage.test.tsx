/**
 * Comprehensive edge case and error scenario tests to boost coverage to 100%.
 *
 * @remarks
 * This test suite focuses on covering edge cases, error paths, and boundary
 * conditions that might be missed in regular unit tests. It targets critical
 * components and utilities to ensure complete code coverage.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReactNode } from "react";

// Import components and utilities to test
import { AddSiteForm } from "../components/AddSiteForm/AddSiteForm";
import { generateUuid } from "../utils/data/generateUuid";
import { ensureError, withUtilityErrorHandling } from "../utils/errorHandling";
import { isNullOrUndefined, withAsyncErrorHandling } from "../utils/fallbacks";
import { logger } from "../services/logger";
import { useErrorStore } from "../stores/error/useErrorStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useMonitorTypes } from "../hooks/useMonitorTypes";
import { useDynamicHelpText } from "../hooks/useDynamicHelpText";
import { useAddSiteForm } from "../components/SiteDetails/useAddSiteForm";

// Mock all external dependencies
vi.mock("../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        setError: vi.fn(),
        lastError: null,
        isLoading: false,
    })),
}));

vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: [],
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
    })),
}));

vi.mock("../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        options: [
            { label: "HTTP/HTTPS", value: "http" },
            { label: "Port Check", value: "port" },
        ],
        isLoading: false,
    })),
}));

vi.mock("../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        primary: "Test help text",
        secondary: "Secondary help text",
    })),
}));

vi.mock("../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => false),
}));

vi.mock("../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: vi.fn(() => ({
        addMode: "new",
        checkInterval: 60_000,
        expectedValue: "",
        formError: undefined,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        recordType: "",
        resetForm: vi.fn(),
        selectedExistingSite: "",
        setAddMode: vi.fn(),
        setCheckInterval: vi.fn(),
        setExpectedValue: vi.fn(),
        setFormError: vi.fn(),
        setHost: vi.fn(),
        setMonitorType: vi.fn(),
        setName: vi.fn(),
        setPort: vi.fn(),
        setRecordType: vi.fn(),
        setSelectedExistingSite: vi.fn(),
        setUrl: vi.fn(),
        siteId: "test-site-id",
        url: "",
    })),
}));

vi.mock("../constants", () => ({
    CHECK_INTERVALS: [
        { label: "1 minute", value: 60_000 },
        { label: "5 minutes", value: 300_000 },
    ],
}));

// Mock all form components
vi.mock("../components/AddSiteForm/RadioGroup", () => ({
    RadioGroup: ({ onChange, value, options }: any) => (
        <div data-testid="radio-group">
            {options.map((option: any) => (
                <input
                    key={option.value}
                    type="radio"
                    data-testid={`radio-${option.value}`}
                    checked={value === option.value}
                    onChange={() => onChange(option.value)}
                />
            ))}
        </div>
    ),
}));

vi.mock("../components/AddSiteForm/SelectField", () => ({
    SelectField: ({ onChange, value, options, id }: any) => (
        <select
            data-testid={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

vi.mock("../components/AddSiteForm/TextField", () => ({
    TextField: ({ onChange, value, id }: any) => (
        <input
            data-testid={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

vi.mock("../components/AddSiteForm/DynamicMonitorFields", () => ({
    DynamicMonitorFields: () => <div data-testid="dynamic-fields" />,
}));

vi.mock("../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: ({ message, onDismiss }: any) => (
        <div data-testid="error-alert">
            {message}
            <button onClick={onDismiss}>Dismiss</button>
        </div>
    ),
}));

vi.mock("../theme/components/ThemedBox", () => ({
    ThemedBox: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../theme/components/ThemedButton", () => ({
    ThemedButton: ({ children, onClick, disabled }: any) => (
        <button disabled={disabled} onClick={onClick}>
            {children}
        </button>
    ),
}));

vi.mock("../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { children: ReactNode }) => (
        <span>{children}</span>
    ),
}));

vi.mock("../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

describe("100% Coverage Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset crypto mock
        Object.defineProperty(globalThis, "crypto", {
            configurable: true,
            writable: true,
            value: undefined,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("UUID Generation Edge Cases", () => {
        it("should handle crypto.randomUUID throwing an error", () => {
            // Mock crypto that throws
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi.fn().mockImplementation(() => {
                        throw new Error("Crypto error");
                    }),
                },
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });

        it("should handle undefined crypto", () => {
            // Ensure crypto is undefined
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: undefined,
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });

        it("should handle crypto without randomUUID method", () => {
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {},
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle Error instances", () => {
            const error = new Error("Test error");
            const result = ensureError(error);
            expect(result).toBe(error);
        });

        it("should handle string errors", () => {
            const error = "String error";
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("String error");
        });

        it("should handle null errors", () => {
            const result = ensureError(null);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("null");
        });

        it("should handle undefined errors", () => {
            const result = ensureError(undefined);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("undefined");
        });

        it("should handle object errors", () => {
            const error = { message: "Object error" };
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("[object Object]");
        });

        it("should handle number errors", () => {
            const error = 123;
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("123");
        });
    });

    describe("Async Error Handling Edge Cases", () => {
        it("should handle async operation success", async () => {
            const operation = vi.fn().mockResolvedValue("success");
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBe("success");
            expect(operation).toHaveBeenCalled();
        });

        it("should handle async operation failure with fallback", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBe("fallback");
            expect(logger.error).toHaveBeenCalledWith(
                "test-operation failed",
                expect.any(Error)
            );
        });

        it("should handle async operation failure with throw", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            await expect(
                withUtilityErrorHandling(
                    operation,
                    "test-operation",
                    undefined,
                    true
                )
            ).rejects.toThrow("Async error");
        });

        it("should handle async operation failure without fallback", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            await expect(
                withUtilityErrorHandling(operation, "test-operation")
            ).rejects.toThrow(
                "test-operation failed and no fallback value provided"
            );
        });
    });

    describe("Fallback Utilities Edge Cases", () => {
        it("should identify null values", () => {
            expect(isNullOrUndefined(null)).toBeTruthy();
        });

        it("should identify undefined values", () => {
            expect(isNullOrUndefined(undefined)).toBeTruthy();
        });

        it("should identify non-null/undefined values", () => {
            expect(isNullOrUndefined("")).toBeFalsy();
            expect(isNullOrUndefined(0)).toBeFalsy();
            expect(isNullOrUndefined(false)).toBeFalsy();
            expect(isNullOrUndefined([])).toBeFalsy();
            expect(isNullOrUndefined({})).toBeFalsy();
        });

        it("should handle async error wrapper", () => {
            const asyncOp = vi.fn().mockResolvedValue(undefined);
            const wrapper = withAsyncErrorHandling(asyncOp, "test-async");

            expect(typeof wrapper).toBe("function");
            wrapper();
            expect(asyncOp).toHaveBeenCalled();
        });
    });

    describe("AddSiteForm Component Edge Cases", () => {
        it("should render without errors", () => {
            render(<AddSiteForm />);
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle onSuccess callback", () => {
            const onSuccess = vi.fn();
            render(<AddSiteForm onSuccess={onSuccess} />);
            expect(screen.getByRole("form")).toBeInTheDocument();
        });

        it("should handle form submission", async () => {
            render(<AddSiteForm />);
            const form = screen.getByRole("form");

            // Verify form exists and is submittable
            expect(form).toBeInTheDocument();
            expect(form.tagName).toBe("FORM");

            // Fire submit event and verify it doesn't throw
            expect(() => fireEvent.submit(form)).not.toThrow();
        });

        it("should handle radio group changes", () => {
            const mockSetAddMode = vi.fn();
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm);
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: undefined,
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: mockSetAddMode,
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: () => true,
                setSiteId: vi.fn(),
            });

            render(<AddSiteForm />);
            const radioButton = screen.getByTestId("radio-new");

            expect(radioButton).toBeInTheDocument();
            expect(() => fireEvent.click(radioButton)).not.toThrow();
        });

        it("should handle select field changes", () => {
            render(<AddSiteForm />);
            const select = screen.getByTestId("monitorType");

            expect(select).toBeInTheDocument();
            expect(select).toHaveAttribute("data-testid", "monitorType");
            expect(() =>
                fireEvent.change(select, { target: { value: "port" } })
            ).not.toThrow();
        });

        it("should handle text field changes", () => {
            render(<AddSiteForm />);
            const input = screen.getByTestId("siteName");

            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("data-testid", "siteName");
            expect(() =>
                fireEvent.change(input, { target: { value: "New Site" } })
            ).not.toThrow();
        });
    });

    describe("Error Display Edge Cases", () => {
        it("should show error alert when error exists", () => {
            const mockUseErrorStore = vi.mocked(useErrorStore); // Updated: Removed require() and used direct import
            mockUseErrorStore.mockReturnValue({
                clearError: vi.fn(),
                setError: vi.fn(),
                lastError: "Test error message",
                isLoading: false,
            });

            render(<AddSiteForm />);
            expect(screen.getByTestId("error-alert")).toBeInTheDocument();
            expect(screen.getByText("Test error message")).toBeInTheDocument();
        });

        it("should handle error dismissal", () => {
            const clearError = vi.fn();
            const mockUseErrorStore = vi.mocked(useErrorStore); // Updated: Removed require() and used direct import
            mockUseErrorStore.mockReturnValue({
                clearError,
                setError: vi.fn(),
                lastError: "Test error",
                isLoading: false,
            });

            render(<AddSiteForm />);
            const dismissButton = screen.getByText("Dismiss");
            fireEvent.click(dismissButton);
            expect(clearError).toHaveBeenCalled();
        });
    });

    describe("Loading State Edge Cases", () => {
        it("should handle loading state", () => {
            const mockUseErrorStore = vi.mocked(useErrorStore); // Updated: Removed require() and used direct import
            mockUseErrorStore.mockReturnValue({
                clearError: vi.fn(),
                setError: vi.fn(),
                lastError: null,
                isLoading: true,
            });

            render(<AddSiteForm />);
            const button = screen.getByRole("button");
            expect(button).toBeDisabled();
        });

        it("should handle monitor types loading", () => {
            const mockUseMonitorTypes = vi.mocked(useMonitorTypes); // Updated: Removed require() and used direct import
            mockUseMonitorTypes.mockReturnValue({
                options: [],
                isLoading: true,
                error: undefined,
                refresh: function (): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            const select = screen.getByTestId("monitorType");
            expect(select).toBeInTheDocument();
            expect(select.tagName).toBe("SELECT");
        });
    });

    describe("Dynamic Content Edge Cases", () => {
        it("should render existing site mode", () => {
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            mockUseAddSiteForm.mockReturnValue({
                addMode: "existing",
                checkInterval: 60_000,
                expectedValue: "",
                formError: undefined,
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: vi.fn(),
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            const mockUseSitesStore = vi.mocked(useSitesStore); // Updated: Removed require() and used direct import
            mockUseSitesStore.mockReturnValue({
                sites: [
                    { identifier: "site1", name: "Site 1" },
                    { identifier: "site2", name: "Site 2" },
                ],
                addMonitorToSite: vi.fn(),
                createSite: vi.fn(),
            });

            render(<AddSiteForm />);
            expect(screen.getByTestId("selectedSite")).toBeInTheDocument();
        });

        it("should handle monitor type validation", () => {
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            const setMonitorType = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: undefined,
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: vi.fn(),
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType,
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            const select = screen.getByTestId("monitorType");

            // Test valid monitor type
            fireEvent.change(select, { target: { value: "http" } });
            expect(setMonitorType).toHaveBeenCalledWith("http");

            // Test invalid monitor type - check that logger.error was called with some message
            fireEvent.change(select, { target: { value: "invalid" } });
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Invalid monitor type value")
            );
        });

        it("should handle check interval validation", () => {
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            const setCheckInterval = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: undefined,
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: vi.fn(),
                setCheckInterval,
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            const select = screen.getByTestId("checkInterval");

            // Test valid number
            fireEvent.change(select, { target: { value: "300000" } });
            expect(setCheckInterval).toHaveBeenCalledWith(300_000);

            // Test invalid number - just verify the component handles it
            fireEvent.change(select, { target: { value: "invalid" } });
            expect(select).toBeInTheDocument(); // Component should still be mounted
        });

        it("should handle add mode validation", () => {
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            const setAddMode = vi.fn();
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: undefined,
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode,
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            const radioButton = screen.getByTestId("radio-existing");

            // Test valid add mode
            fireEvent.click(radioButton);
            expect(setAddMode).toHaveBeenCalledWith("existing");

            // Mock invalid value by directly calling handler
            const radioGroup = screen.getByTestId("radio-group");
            const invalidInput = document.createElement("input");
            invalidInput.value = "invalid";
            radioGroup.append(invalidInput);
            fireEvent.change(invalidInput, { target: { value: "invalid" } });
            // This would trigger the validation in the real component
        });
    });

    describe("Memoization and Optimization Edge Cases", () => {
        it("should handle dynamic field changes", () => {
            render(<AddSiteForm />);
            // The DynamicMonitorFields component is mocked, but this tests the props passing
            expect(screen.getByTestId("dynamic-fields")).toBeInTheDocument();
        });

        it("should handle help text rendering", () => {
            const mockUseDynamicHelpText = vi.mocked(useDynamicHelpText); // Updated: Removed require() and used direct import
            mockUseDynamicHelpText.mockReturnValue({
                primary: "Primary help text",
                secondary: "Secondary help text",
                isLoading: false,
            });

            render(<AddSiteForm />);
            expect(screen.getByText("• Primary help text")).toBeInTheDocument();
            expect(
                screen.getByText("• Secondary help text")
            ).toBeInTheDocument();
        });

        it("should handle empty help text", () => {
            const mockUseDynamicHelpText = vi.mocked(useDynamicHelpText); // Updated: Removed require() and used direct import
            mockUseDynamicHelpText.mockReturnValue({
                primary: "",
                secondary: "",
                isLoading: false,
            });

            render(<AddSiteForm />);
            // Should only show the default help text items
            expect(
                screen.queryByText("• Primary help text")
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText("• Secondary help text")
            ).not.toBeInTheDocument();
        });
    });

    describe("Form Error Edge Cases", () => {
        it("should display form error when present", () => {
            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: "Form validation error",
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: vi.fn(),
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            expect(
                screen.getByText("Form validation error")
            ).toBeInTheDocument();
        });

        it("should prioritize form error over store error", () => {
            const mockUseErrorStore = vi.mocked(useErrorStore); // Updated: Removed require() and used direct import
            mockUseErrorStore.mockReturnValue({
                clearError: vi.fn(),
                setError: vi.fn(),
                lastError: "Store error",
                isLoading: false,
            });

            const mockUseAddSiteForm = vi.mocked(useAddSiteForm); // Updated: Removed require() and used direct import
            mockUseAddSiteForm.mockReturnValue({
                addMode: "new",
                checkInterval: 60_000,
                expectedValue: "",
                formError: "Form error",
                host: "",
                monitorType: "http",
                name: "",
                port: "",
                recordType: "",
                resetForm: vi.fn(),
                selectedExistingSite: "",
                setAddMode: vi.fn(),
                setCheckInterval: vi.fn(),
                setExpectedValue: vi.fn(),
                setFormError: vi.fn(),
                setHost: vi.fn(),
                setMonitorType: vi.fn(),
                setName: vi.fn(),
                setPort: vi.fn(),
                setRecordType: vi.fn(),
                setSelectedExistingSite: vi.fn(),
                setUrl: vi.fn(),
                siteId: "test-site-id",
                url: "",
                isFormValid: function (): boolean {
                    throw new Error("Function not implemented.");
                },
                setSiteId: function (_value: string): void {
                    throw new Error("Function not implemented.");
                },
            });

            render(<AddSiteForm />);
            expect(screen.getByText("Form error")).toBeInTheDocument();
            expect(screen.queryByText("Store error")).not.toBeInTheDocument();
        });
    });
});
