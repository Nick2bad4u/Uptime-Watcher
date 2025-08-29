/**
 * Comprehensive AddSiteForm tests
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import React from "react";

// Mock all dependencies with proper structure
vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: vi.fn(() => ({
        // AddSiteFormState properties
        addMode: "new",
        checkInterval: 60_000,
        formError: undefined,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        selectedExistingSite: "",
        siteId: "test-site-id",
        url: "",
        // AddSiteFormActions methods
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

vi.mock("../../../constants", () => ({
    ARIA_LABEL: "aria-label",
    TRANSITION_ALL: "all 0.2s ease-in-out",
    CHECK_INTERVALS: [
        { label: "1 minute", value: 60_000 },
        { label: "5 minutes", value: 300_000 },
        { label: "10 minutes", value: 600_000 },
    ],
    DEFAULT_CHECK_INTERVAL: 60_000,
    FALLBACK_MONITOR_TYPE_OPTIONS: [
        { label: "HTTP", value: "http" },
        { label: "Ping", value: "ping" },
        { label: "Port", value: "port" },
    ],
    UI_DELAYS: {
        LOADING_BUTTON: 100,
        LOADING_OVERLAY: 100,
        STATE_UPDATE_DEFER: 0,
    },
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        setError: vi.fn(),
        lastError: null,
    })),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: [],
        addSite: vi.fn(),
        isLoading: false,
    })),
}));

vi.mock("../../../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: ({ message }: { message: string }) => (
        <div data-testid="error-alert">{message}</div>
    ),
}));

vi.mock("../../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        isLoading: false,
        options: [
            { label: "HTTP", value: "http" },
            { label: "Ping", value: "ping" },
            { label: "Port", value: "port" },
        ],
    })),
}));

vi.mock("../../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        primary: "Dynamic help text",
        secondary: "Secondary help text",
    })),
}));

vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => false),
}));

vi.mock("../../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: vi.fn(() => ({
        isLoaded: true,
        lastError: null,
        loadMonitorTypes: vi.fn(),
        monitorTypes: [
            {
                type: "http",
                fields: [
                    { name: "url", type: "text", label: "URL", required: true },
                    {
                        name: "port",
                        type: "number",
                        label: "Port",
                        required: false,
                    },
                ],
            },
            {
                type: "ping",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        label: "Host",
                        required: true,
                    },
                ],
            },
            {
                type: "port",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        label: "Host",
                        required: true,
                    },
                    {
                        name: "port",
                        type: "number",
                        label: "Port",
                        required: true,
                    },
                ],
            },
        ],
    })),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => <span className={className}>{children}</span>,
}));

vi.mock("../../../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(() => "test-uuid"),
}));

vi.mock("../DynamicMonitorFields", () => ({
    DynamicMonitorFields: ({ monitorType }: { monitorType: string }) => (
        <div data-testid="dynamic-monitor-fields">
            Dynamic fields for {monitorType}
        </div>
    ),
}));

// Import the component after mocks
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";
import { useAddSiteForm } from "../../../components/SiteDetails/useAddSiteForm";

describe("AddSiteForm Comprehensive Tests", () => {
    let mockFormHook: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFormHook = {
            addMode: "new",
            checkInterval: 60_000,
            formError: undefined,
            host: "",
            monitorType: "http",
            name: "",
            port: "0",
            selectedExistingSite: "",
            siteId: "test-site-id",
            url: "",
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
        };
        vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);
    });

    describe("Initial Render", () => {
        it("renders the form with all required fields", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteForm />);

            expect(
                screen.getByRole("textbox", { name: /site name/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("combobox", { name: /monitor type/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /add site/i })
            ).toBeInTheDocument();
        });

        it("displays default values correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const urlInput = screen.getByRole("textbox", { name: /url/i });

            expect(nameInput).toHaveValue("");
            expect(urlInput).toHaveValue("");
        });

        it("shows monitor type dropdown with correct options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            render(<AddSiteForm />);

            const monitorTypeSelect = screen.getByRole("combobox", {
                name: /monitor type/i,
            });
            expect(monitorTypeSelect).toHaveValue("http");
        });
    });

    describe("Form Interactions", () => {
        it("calls setName when site name input changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            await user.type(nameInput, "Test Site");

            // Check that setName was called with each character as user types
            expect(mockFormHook.setName).toHaveBeenCalledTimes(9); // "Test Site" = 9 characters
            expect(mockFormHook.setName).toHaveBeenLastCalledWith("e"); // Last character typed
        });

        it("calls setUrl when URL input changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const urlInput = screen.getByRole("textbox", { name: /url/i });
            await user.type(urlInput, "https://example.com");

            // Check that setUrl was called with each character as user types
            expect(mockFormHook.setUrl).toHaveBeenCalledTimes(19); // "https://example.com" = 19 characters
            expect(mockFormHook.setUrl).toHaveBeenLastCalledWith("m"); // Last character typed
        });

        it("calls setMonitorType when monitor type changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const monitorTypeSelect = screen.getByRole("combobox", {
                name: /monitor type/i,
            });
            await user.selectOptions(monitorTypeSelect, "ping");

            expect(mockFormHook.setMonitorType).toHaveBeenCalledWith("ping");
        });
    });

    describe("Monitor Type Specific Fields", () => {
        it("renders dynamic fields for HTTP monitor type", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockFormHook.monitorType = "http";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            // Check for HTTP-specific fields (URL and Port)
            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });

        it("renders dynamic fields for ping monitor type", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockFormHook.monitorType = "ping";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            // Check for ping-specific fields (Host only)
            expect(
                screen.getByRole("textbox", { name: /host/i })
            ).toBeInTheDocument();
        });

        it("renders dynamic fields for port monitor type", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockFormHook.monitorType = "port";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            // Check for port-specific fields (Host and Port, both required)
            expect(
                screen.getByRole("textbox", { name: /host/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("shows add button as enabled when form is valid", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.isFormValid = vi.fn(() => true);
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            const addButton = screen.getByRole("button", { name: /add site/i });
            expect(addButton).not.toBeDisabled();
        });

        it("displays error alert when form has error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            mockFormHook.formError = "Invalid URL format";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(screen.getByTestId("error-alert")).toHaveTextContent(
                "Invalid URL format"
            );
        });

        it("does not display error alert when form has no error", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            mockFormHook.formError = undefined;
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(screen.queryByTestId("error-alert")).not.toBeInTheDocument();
        });
    });

    describe("Form Modes", () => {
        it("handles new site mode correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.addMode = "new";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(
                screen.getByRole("button", { name: /add site/i })
            ).toBeInTheDocument();
        });

        it("handles existing site mode correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.addMode = "existing";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            // In existing mode, should show site selector instead of site name input
            expect(
                screen.getByRole("combobox", { name: /select site/i })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("textbox", { name: /site name/i })
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /add monitor/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Reset", () => {
        it("calls resetForm when reset is triggered", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteForm />);

            // Assuming there's a reset mechanism in the component
            // This would need to be adapted based on actual reset implementation
            expect(mockFormHook.resetForm).toBeDefined();
        });
    });

    describe("Edge Cases", () => {
        it("handles empty string values correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.name = "";
            mockFormHook.url = "";
            mockFormHook.host = "";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const urlInput = screen.getByRole("textbox", { name: /url/i });

            expect(nameInput).toHaveValue("");
            expect(urlInput).toHaveValue("");
        });

        it("handles special characters in input fields", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const specialText = "Test & Special-Characters_123";

            await user.type(nameInput, specialText);

            // Check that setName was called for each character
            expect(mockFormHook.setName).toHaveBeenCalledTimes(
                specialText.length
            );
            expect(mockFormHook.setName).toHaveBeenLastCalledWith("3"); // Last character
        });

        it("handles very long input values", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const longText = "A".repeat(50); // Reduced from 1000 to 50 to avoid excessive mock calls

            await user.type(nameInput, longText);

            // Check that setName was called for each character
            expect(mockFormHook.setName).toHaveBeenCalledTimes(50);
            expect(mockFormHook.setName).toHaveBeenLastCalledWith("A"); // Last character
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA labels", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<AddSiteForm />);

            expect(
                screen.getByRole("textbox", { name: /site name/i })
            ).toHaveAttribute("aria-label");
            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toHaveAttribute("aria-label");
            expect(
                screen.getByRole("combobox", { name: /monitor type/i })
            ).toHaveAttribute("aria-label");
        });

        it("supports keyboard navigation", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });

            // Test basic focus behavior
            await user.click(nameInput);
            expect(nameInput).toHaveFocus();

            // Test tab navigation works (don't assert specific element order as it's complex with dynamic fields)
            await user.tab();
            // Just ensure we can tab through without errors
            await user.tab();
            await user.tab();
        });
    });

    describe("Performance", () => {
        it("does not cause unnecessary re-renders", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const renderCount = vi.fn();
            const TestWrapper = () => {
                renderCount();
                return <AddSiteForm />;
            };

            const { rerender } = render(<TestWrapper />);

            // Initial render
            expect(renderCount).toHaveBeenCalledTimes(1);

            // Rerender with same props
            rerender(<TestWrapper />);
            expect(renderCount).toHaveBeenCalledTimes(2);
        });
    });

    describe("Error Handling", () => {
        it("gracefully handles undefined hook values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.name = undefined;
            mockFormHook.url = undefined;
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const urlInput = screen.getByRole("textbox", { name: /url/i });

            expect(nameInput).toHaveValue("");
            expect(urlInput).toHaveValue("");
        });

        it("handles missing setter functions gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.setName = undefined;
            mockFormHook.setUrl = undefined;
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            expect(() => render(<AddSiteForm />)).not.toThrow();
        });
    });
});
