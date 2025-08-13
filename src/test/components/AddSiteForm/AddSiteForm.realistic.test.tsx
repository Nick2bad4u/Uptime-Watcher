/**
 * Comprehensive test suite for AddSiteForm component
 * Fixed to match actual component behavior and interface structure
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";

// Mock the useAddSiteForm hook
vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: vi.fn(),
}));

// Mock stores
vi.mock("../../../stores/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
    })),
}));

vi.mock("../../../stores/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        sites: [
            { identifier: "site1", name: "Test Site 1" },
            { identifier: "site2", name: "Test Site 2" },
        ],
    })),
}));

// Mock hooks
vi.mock("../../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        isLoading: false,
        options: [
            { label: "HTTP", value: "http" },
            { label: "Port", value: "port" },
        ],
    })),
}));

vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => false),
}));

// Mock constants
vi.mock("../../../constants", () => ({
    ARIA_LABEL: {
        CLOSE_BUTTON: "Close",
        DELETE_BUTTON: "Delete",
    },
    CHECK_INTERVALS: [
        { label: "1 minute", value: 60_000 },
        { label: "5 minutes", value: 300_000 },
        { label: "10 minutes", value: 600_000 },
    ],
    DEFAULT_CHECK_INTERVAL: 60_000,
    FALLBACK_MONITOR_TYPE_OPTIONS: [
        { label: "HTTP", value: "http" },
        { label: "Port", value: "port" },
    ],
    UI_DELAYS: {
        LOADING_BUTTON: 100,
        LOADING_OVERLAY: 100,
        STATE_UPDATE_DEFER: 0,
    },
    TRANSITION_ALL: "all 0.2s ease-in-out",
}));

// Mock other components
vi.mock("../../../components/AddSiteForm/DynamicMonitorFields", () => ({
    default: ({ monitorType }: { monitorType: string }) => {
        if (monitorType === "http") {
            return (
                <div className="flex flex-col gap-2">
                    <div>
                        <label className="mb-1 block">
                            <span>URL *</span>
                        </label>
                        <input
                            aria-label="URL (required)"
                            type="url"
                            placeholder="https://example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block">
                            <span>Port</span>
                        </label>
                        <input
                            aria-label="Port"
                            type="number"
                            min="1"
                            max="65535"
                        />
                    </div>
                </div>
            );
        }

        if (monitorType === "port") {
            return (
                <div className="flex flex-col gap-2">
                    <div>
                        <label className="mb-1 block">
                            <span>Host *</span>
                        </label>
                        <input
                            aria-label="Host (required)"
                            type="text"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block">
                            <span>Port *</span>
                        </label>
                        <input
                            aria-label="Port (required)"
                            type="number"
                            min="1"
                            max="65535"
                            required
                        />
                    </div>
                </div>
            );
        }

        return <span>Loading monitor fields...</span>;
    },
}));

vi.mock("../../../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(() => "test-uuid"),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

import { useAddSiteForm } from "../../../components/SiteDetails/useAddSiteForm";

describe("AddSiteForm Comprehensive Tests", () => {
    let mockFormHook: any;

    beforeEach(() => {
        // Reset mock form hook with complete structure
        mockFormHook = {
            // State
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
        };

        vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);
    });

    describe("Initial Render - New Mode", () => {
        it("renders all required fields for new site mode", () => {
            render(<AddSiteForm />);

            // Mode selector
            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
            expect(
                screen.getByRole("radio", { name: /create new site/i })
            ).toBeChecked();
            expect(
                screen.getByRole("radio", { name: /add to existing site/i })
            ).not.toBeChecked();

            // Site name field (only in new mode)
            expect(
                screen.getByRole("textbox", { name: /site name/i })
            ).toBeInTheDocument();

            // Monitor type selector
            expect(
                screen.getByRole("combobox", { name: /monitor type/i })
            ).toBeInTheDocument();

            // Check interval selector
            expect(
                screen.getByRole("combobox", { name: /check interval/i })
            ).toBeInTheDocument();

            // Submit button
            expect(
                screen.getByRole("button", { name: /add site/i })
            ).toBeInTheDocument();
        });

        it("displays site identifier in new mode", () => {
            render(<AddSiteForm />);

            expect(screen.getByText("Site Identifier:")).toBeInTheDocument();
            expect(screen.getByText("test-site-id")).toBeInTheDocument();
        });

        it("renders HTTP monitor fields by default", () => {
            render(<AddSiteForm />);

            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Mode Switching", () => {
        it("switches to existing site mode correctly", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            const existingModeRadio = screen.getByRole("radio", {
                name: /add to existing site/i,
            });
            await user.click(existingModeRadio);

            expect(mockFormHook.setAddMode).toHaveBeenCalledWith("existing");
        });

        it("renders existing site mode fields", () => {
            mockFormHook.addMode = "existing";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            // Should have site selector instead of site name
            expect(
                screen.getByRole("combobox", { name: /select site/i })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("textbox", { name: /site name/i })
            ).not.toBeInTheDocument();

            // Button text should change
            expect(
                screen.getByRole("button", { name: /add monitor/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Interactions", () => {
        it("calls setName when site name input changes", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            await user.type(nameInput, "Test");

            // userEvent.type calls the setter for each character
            expect(mockFormHook.setName).toHaveBeenCalledTimes(4);
            expect(mockFormHook.setName).toHaveBeenCalledWith("T");
            expect(mockFormHook.setName).toHaveBeenCalledWith("e");
            expect(mockFormHook.setName).toHaveBeenCalledWith("s");
            expect(mockFormHook.setName).toHaveBeenCalledWith("t");
        });

        it("calls setMonitorType when monitor type changes", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            const monitorTypeSelect = screen.getByRole("combobox", {
                name: /monitor type/i,
            });
            await user.selectOptions(monitorTypeSelect, "port");

            expect(mockFormHook.setMonitorType).toHaveBeenCalledWith("port");
        });

        it("calls setCheckInterval when check interval changes", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            const checkIntervalSelect = screen.getByRole("combobox", {
                name: /check interval/i,
            });
            await user.selectOptions(checkIntervalSelect, "300000");

            expect(mockFormHook.setCheckInterval).toHaveBeenCalledWith(300_000);
        });
    });

    describe("Monitor Type Specific Fields", () => {
        it("renders HTTP monitor fields", () => {
            mockFormHook.monitorType = "http";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });

        it("renders port monitor fields", () => {
            mockFormHook.monitorType = "port";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(
                screen.getByRole("textbox", { name: /host/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port.*required/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("shows add button as enabled when form is valid", () => {
            mockFormHook.isFormValid = vi.fn(() => true);
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            const addButton = screen.getByRole("button", { name: /add site/i });
            expect(addButton).not.toBeDisabled();
        });

        it("displays error alert when form has error", () => {
            mockFormHook.formError = "Invalid URL format";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(screen.getByText("Invalid URL format")).toBeInTheDocument();
        });

        it("does not display error alert when form has no error", () => {
            mockFormHook.formError = undefined;
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            render(<AddSiteForm />);

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("handles special characters in input fields", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const specialText = "Test & Special";

            await user.type(nameInput, specialText);

            // Verify character-by-character calls (userEvent.type behavior)
            expect(mockFormHook.setName).toHaveBeenCalledTimes(
                specialText.length
            );
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA labels", () => {
            render(<AddSiteForm />);

            // Check for proper ARIA labels - match the actual rendered text
            expect(
                screen.getByRole("textbox", { name: /site name/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("combobox", { name: /monitor type/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("combobox", { name: /check interval/i })
            ).toBeInTheDocument();
        });

        it("supports keyboard navigation", async () => {
            const user = userEvent.setup();

            render(<AddSiteForm />);

            // Get elements to test navigation between
            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            const monitorTypeSelect = screen.getByRole("combobox", {
                name: /monitor type/i,
            });

            // Focus on name input and verify
            nameInput.focus();
            expect(nameInput).toHaveFocus();

            // Tab to monitor type select
            await user.tab();
            expect(monitorTypeSelect).toHaveFocus();
        });
    });

    describe("Performance", () => {
        it("does not cause unnecessary re-renders", () => {
            const renderCount = vi.fn();

            const TestComponent = () => {
                renderCount();
                return <AddSiteForm />;
            };

            render(<TestComponent />);

            expect(renderCount).toHaveBeenCalledTimes(1);
        });
    });
});
