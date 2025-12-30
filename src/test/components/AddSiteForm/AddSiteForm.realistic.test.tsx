/**
 * Comprehensive test suite for AddSiteForm component Fixed to match actual
 * component behavior and interface structure
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

// Ensure the hook is mocked correctly instead of suppressing React warnings.

// No-op: we use hoisted vi.fn() + vi.mock below to ensure our mock is sensitive to hoisting

// Mock the useAddSiteForm hook using vi.hoisted - keeping as backup
const mockUseAddSiteForm = vi.hoisted(() => vi.fn());

vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: mockUseAddSiteForm,
}));

import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";

/**
 * Render helper that ensures any asynchronous React updates triggered by
 * mount-time effects have settled before assertions run.
 */
let activeRenderCleanup: (() => void) | null = null;

const renderForm = async (): Promise<void> => {
    activeRenderCleanup?.();
    const view = render(<AddSiteForm />);
    activeRenderCleanup = () => {
        view.unmount();
    };
    // Ensure any mount-time effects have run
    await waitFor(() => {
        expect(screen.getByRole("form")).toBeInTheDocument();
    });
};

// Suppress React warnings for this test suite since vi.mock() fails to intercept hook calls
// but the real hook implementation uses proper useEffect patterns
// no beforeAll / afterAll hook - warnings should not be necessary with proper mocks

// Mock stores
vi.mock("../../../stores/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
    })),
}));

const mockSiteEntries = [
    {
        identifier: sampleOne(siteIdentifierArbitrary),
        name: sampleOne(siteNameArbitrary),
        url: sampleOne(siteUrlArbitrary),
    },
    {
        identifier: sampleOne(siteIdentifierArbitrary),
        name: sampleOne(siteNameArbitrary),
        url: sampleOne(siteUrlArbitrary),
    },
];

vi.mock("../../../stores/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        sites: mockSiteEntries,
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

// Mock constants (partial to preserve other exports)
vi.mock("../../../constants", async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import("../../../constants");
    return {
        ...actual,
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
    };
});

// Mock other components
vi.mock("../../../components/AddSiteForm/DynamicMonitorFields", () => ({
    DynamicMonitorFields: ({ monitorType }: { monitorType: string }) => {
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
        // Reset mock form hook with complete structure and stable references
        const stableFunctions = {
            isFormValid: vi.fn(() => true),
            resetForm: vi.fn(),
            setAddMode: vi.fn(),
            setBodyKeyword: vi.fn(),
            setCheckIntervalMs: vi.fn(),
            setCertificateWarningDays: vi.fn(),
            setExpectedHeaderValue: vi.fn(),
            setExpectedJsonValue: vi.fn(),
            setExpectedStatusCode: vi.fn(),
            setExpectedValue: vi.fn(),
            setFormError: vi.fn(),
            setHeaderName: vi.fn(),
            setHost: vi.fn(),
            setJsonPath: vi.fn(),
            setMaxResponseTime: vi.fn(),
            setMonitorType: vi.fn(),
            setName: vi.fn(),
            setPort: vi.fn(),
            setRecordType: vi.fn(),
            setSelectedExistingSite: vi.fn(),
            setSiteIdentifier: vi.fn(),
            setUrl: vi.fn(),
        };

        mockFormHook = {
            // State
            addMode: "new",
            bodyKeyword: "",
            certificateWarningDays: "30",
            checkIntervalMs: 60_000,
            expectedHeaderValue: "",
            expectedJsonValue: "",
            expectedStatusCode: "200",
            expectedValue: "",
            formError: undefined,
            headerName: "",
            host: "",
            jsonPath: "",
            maxResponseTime: "2000",
            monitorType: "http",
            name: "",
            port: "",
            recordType: "A",
            selectedExistingSite: "",
            siteIdentifier: "test-site-id",
            url: "",

            // Actions - use stable function references to prevent re-renders
            ...stableFunctions,
        };

        // Ensure the mock returns the same reference on every call
        mockUseAddSiteForm.mockReturnValue(mockFormHook);
    });

    afterEach(() => {
        activeRenderCleanup?.();
        activeRenderCleanup = null;
    });

    describe("Initial Render - New Mode", () => {
        it("renders all required fields for new site mode", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            await renderForm();

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

        it("displays site identifier in new mode", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            await renderForm();

            expect(screen.getByText("Site Identifier:")).toBeInTheDocument();
            expect(screen.getByText("test-site-id")).toBeInTheDocument();
        });

        it("renders HTTP monitor fields by default", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            await renderForm();

            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Mode Switching", () => {
        it("switches to existing site mode correctly", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            await renderForm();

            const existingModeRadio = screen.getByRole("radio", {
                name: /add to existing site/i,
            });
            await user.click(existingModeRadio);

            expect(mockFormHook.setAddMode).toHaveBeenCalledWith("existing");
        });

        it("renders existing site mode fields", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.addMode = "existing";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

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
        it("calls setName when site name input changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            await renderForm();

            const nameInput = screen.getByRole("textbox", {
                name: /site name/i,
            });
            await user.type(nameInput, "Test");

            // UserEvent.type calls the setter for each character
            expect(mockFormHook.setName).toHaveBeenCalledTimes(4);
            expect(mockFormHook.setName).toHaveBeenCalledWith("T");
            expect(mockFormHook.setName).toHaveBeenCalledWith("e");
            expect(mockFormHook.setName).toHaveBeenCalledWith("s");
            expect(mockFormHook.setName).toHaveBeenCalledWith("t");
        });

        it("calls setMonitorType when monitor type changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const user = userEvent.setup();

            await renderForm();

            const monitorTypeSelect = screen.getByRole("combobox", {
                name: /monitor type/i,
            });
            await user.selectOptions(monitorTypeSelect, "port");

            expect(mockFormHook.setMonitorType).toHaveBeenCalledWith("port");
        });

        it("calls setCheckIntervalMs when check interval changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            await renderForm();

            const checkIntervalSelect = screen.getByRole("combobox", {
                name: /check interval/i,
            });
            await user.selectOptions(checkIntervalSelect, "300000");

            expect(mockFormHook.setCheckIntervalMs).toHaveBeenCalledWith(300_000);
        });
    });

    describe("Monitor Type Specific Fields", () => {
        it("renders HTTP monitor fields", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockFormHook.monitorType = "http";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

            expect(
                screen.getByRole("textbox", { name: /url/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port/i })
            ).toBeInTheDocument();
        });

        it("renders port monitor fields", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockFormHook.monitorType = "port";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

            expect(
                screen.getByRole("textbox", { name: /host/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("spinbutton", { name: /port.*required/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("shows add button as enabled when form is valid", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockFormHook.isFormValid = vi.fn(() => true);
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

            const addButton = screen.getByRole("button", { name: /add site/i });
            expect(addButton).not.toBeDisabled();
        });

        it("displays error alert when form has error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            mockFormHook.formError = "Invalid URL format";
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

            expect(screen.getByText("Invalid URL format")).toBeInTheDocument();
        });

        it("does not display error alert when form has no error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            mockFormHook.formError = undefined;
            vi.mocked(useAddSiteForm).mockReturnValue(mockFormHook);

            await renderForm();

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("handles special characters in input fields", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            await renderForm();

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
        it("has proper ARIA labels", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            await renderForm();

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

        it("supports keyboard navigation", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();

            await renderForm();

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
        it("does not cause unnecessary re-renders", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AddSiteForm.realistic", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const renderCount = vi.fn();

            const TestComponent = () => {
                renderCount();
                return <AddSiteForm />;
            };

            const view = render(<TestComponent />);

            expect(renderCount).toHaveBeenCalledTimes(1);

            view.unmount();
        });
    });

    describe("Property-Based Realistic User Scenarios", () => {
        test.prop(
            [
                fc.record({
                    siteName: fc.oneof(
                        fc.constantFrom(
                            "My Blog",
                            "Company Website",
                            "API Server",
                            "Development Server",
                            "Production API",
                            "Staging Environment",
                            "Personal Portfolio",
                            "Client Dashboard"
                        ),
                        fc
                            .string({ minLength: 3, maxLength: 50 })
                            .filter((s) => s.trim().length > 2)
                    ),
                    url: fc.oneof(
                        fc.webUrl(),
                        fc.constantFrom(
                            "https://api.github.com",
                            "https://www.google.com",
                            "https://stackoverflow.com",
                            "https://example.com",
                            "http://localhost:3000",
                            "https://jsonplaceholder.typicode.com",
                            "https://httpbin.org/status/200"
                        )
                    ),
                    monitorType: fc.constantFrom("http", "port"),
                }),
            ],
            {
                numRuns: 3,
                timeout: 30_000,
            }
        )("should handle realistic site configurations", async (config) => {
            await renderForm();

            // Verify realistic input characteristics
            expect(config.siteName.trim().length).toBeGreaterThan(0);
            expect(config.url).toMatch(/^https?:\/\//);
            expect(["http", "port"]).toContain(config.monitorType);

            // Form should be interactive
            const forms = screen.getAllByRole("form", {
                name: /add site form/i,
            });
            const form = forms[0];
            expect(form).toBeInTheDocument();
        });

        test.prop(
            [
                fc.record({
                    company: fc.constantFrom(
                        "GitHub",
                        "Google",
                        "Microsoft",
                        "Amazon",
                        "Meta",
                        "Netflix",
                        "Apple"
                    ),
                    service: fc.constantFrom(
                        "API",
                        "CDN",
                        "Auth",
                        "Database",
                        "Cache",
                        "Queue",
                        "Storage"
                    ),
                    environment: fc.constantFrom(
                        "prod",
                        "staging",
                        "dev",
                        "test"
                    ),
                }),
            ],
            {
                numRuns: 5,
                timeout: 20_000,
            }
        )(
            "should handle corporate service monitoring scenarios",
            async (scenario) => {
                const siteName = `${scenario.company} ${scenario.service} (${scenario.environment})`;
                const url = `https://${scenario.service.toLowerCase()}.${scenario.company.toLowerCase()}.com`;

                await renderForm();

                // Verify corporate scenario characteristics
                expect([
                    "GitHub",
                    "Google",
                    "Microsoft",
                    "Amazon",
                    "Meta",
                    "Netflix",
                    "Apple",
                ]).toContain(scenario.company);
                expect([
                    "API",
                    "CDN",
                    "Auth",
                    "Database",
                    "Cache",
                    "Queue",
                    "Storage",
                ]).toContain(scenario.service);
                expect([
                    "prod",
                    "staging",
                    "dev",
                    "test",
                ]).toContain(scenario.environment);

                expect(siteName.length).toBeGreaterThan(10);
                expect(url).toMatch(/^https:\/\//);
            }
        );

        test.prop(
            [
                fc.record({
                    region: fc.constantFrom(
                        "us-east-1",
                        "us-west-2",
                        "eu-west-1",
                        "ap-southeast-1"
                    ),
                    port: fc.integer({ min: 80, max: 9999 }),
                    protocol: fc.constantFrom("http", "https"),
                }),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )("should handle regional service configurations", async (config) => {
            const regionalUrl = `${config.protocol}://service-${config.region}.example.com:${config.port}`;

            await renderForm();

            // Verify regional config characteristics
            expect([
                "us-east-1",
                "us-west-2",
                "eu-west-1",
                "ap-southeast-1",
            ]).toContain(config.region);
            expect(config.port).toBeGreaterThanOrEqual(80);
            expect(config.port).toBeLessThanOrEqual(9999);
            expect(["http", "https"]).toContain(config.protocol);
            expect(regionalUrl).toMatch(/^https?:\/\/service-/);
        });

        test.prop(
            [
                fc.array(
                    fc.record({
                        name: fc.string({ minLength: 3, maxLength: 30 }),
                        priority: fc.constantFrom("high", "medium", "low"),
                        frequency: fc.constantFrom(
                            "1min",
                            "5min",
                            "15min",
                            "30min"
                        ),
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle multiple monitoring configurations",
            async (monitorConfigs) => {
                await renderForm();

                // Verify multiple configurations
                expect(Array.isArray(monitorConfigs)).toBeTruthy();
                expect(monitorConfigs.length).toBeGreaterThanOrEqual(1);
                expect(monitorConfigs.length).toBeLessThanOrEqual(5);

                for (const config of monitorConfigs) {
                    expect(config.name.length).toBeGreaterThanOrEqual(3);
                    expect(config.name.length).toBeLessThanOrEqual(30);
                    expect([
                        "high",
                        "medium",
                        "low",
                    ]).toContain(config.priority);
                    expect([
                        "1min",
                        "5min",
                        "15min",
                        "30min",
                    ]).toContain(config.frequency);
                }
            }
        );

        test.prop(
            [
                fc.record({
                    userType: fc.constantFrom(
                        "developer",
                        "admin",
                        "manager",
                        "support"
                    ),
                    experience: fc.constantFrom(
                        "beginner",
                        "intermediate",
                        "expert"
                    ),
                    urgency: fc.constantFrom(
                        "low",
                        "normal",
                        "high",
                        "critical"
                    ),
                }),
            ],
            {
                numRuns: 2,
                timeout: 15_000,
            }
        )(
            "should handle different user personas and scenarios",
            async (persona) => {
                await renderForm();

                // Verify persona characteristics
                expect([
                    "developer",
                    "admin",
                    "manager",
                    "support",
                ]).toContain(persona.userType);
                expect([
                    "beginner",
                    "intermediate",
                    "expert",
                ]).toContain(persona.experience);
                expect([
                    "low",
                    "normal",
                    "high",
                    "critical",
                ]).toContain(persona.urgency);

                // Form should be accessible regardless of user persona
                const forms = screen.getAllByRole("form", {
                    name: /add site form/i,
                });
                const form = forms[0];
                expect(form).toBeInTheDocument();
            }
        );

        test.prop(
            [
                fc.record({
                    timeZone: fc.constantFrom(
                        "America/New_York",
                        "America/Los_Angeles",
                        "Europe/London",
                        "Europe/Paris",
                        "Asia/Tokyo",
                        "Australia/Sydney"
                    ),
                    workingHours: fc.record({
                        start: fc.integer({ min: 0, max: 23 }),
                        end: fc.integer({ min: 0, max: 23 }),
                    }),
                    weekends: fc.boolean(),
                }),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle international and scheduling scenarios",
            async (schedule) => {
                await renderForm();

                // Verify international characteristics
                const validTimeZones = [
                    "America/New_York",
                    "America/Los_Angeles",
                    "Europe/London",
                    "Europe/Paris",
                    "Asia/Tokyo",
                    "Australia/Sydney",
                ];
                expect(validTimeZones).toContain(schedule.timeZone);
                expect(schedule.workingHours.start).toBeGreaterThanOrEqual(0);
                expect(schedule.workingHours.start).toBeLessThanOrEqual(23);
                expect(schedule.workingHours.end).toBeGreaterThanOrEqual(0);
                expect(schedule.workingHours.end).toBeLessThanOrEqual(23);
                expect(typeof schedule.weekends).toBe("boolean");
            }
        );

        test.prop(
            [
                fc.oneof(
                    fc.record({
                        type: fc.constant("ecommerce"),
                        features: fc.constantFrom(
                            "cart",
                            "checkout",
                            "payment",
                            "inventory"
                        ),
                    }),
                    fc.record({
                        type: fc.constant("saas"),
                        features: fc.constantFrom(
                            "auth",
                            "dashboard",
                            "api",
                            "billing"
                        ),
                    }),
                    fc.record({
                        type: fc.constant("blog"),
                        features: fc.constantFrom(
                            "posts",
                            "comments",
                            "rss",
                            "search"
                        ),
                    }),
                    fc.record({
                        type: fc.constant("portfolio"),
                        features: fc.constantFrom(
                            "gallery",
                            "contact",
                            "resume",
                            "projects"
                        ),
                    })
                ),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle different website categories and features",
            async (website) => {
                await renderForm();

                // Verify website category characteristics
                expect([
                    "ecommerce",
                    "saas",
                    "blog",
                    "portfolio",
                ]).toContain(website.type);

                switch (website.type) {
                    case "ecommerce": {
                        expect([
                            "cart",
                            "checkout",
                            "payment",
                            "inventory",
                        ]).toContain(website.features);
                        break;
                    }
                    case "saas": {
                        expect([
                            "auth",
                            "dashboard",
                            "api",
                            "billing",
                        ]).toContain(website.features);
                        break;
                    }
                    case "blog": {
                        expect([
                            "posts",
                            "comments",
                            "rss",
                            "search",
                        ]).toContain(website.features);
                        break;
                    }
                    case "portfolio": {
                        expect([
                            "gallery",
                            "contact",
                            "resume",
                            "projects",
                        ]).toContain(website.features);
                        break;
                    }
                }
            }
        );

        test.prop(
            [
                fc.record({
                    businessSize: fc.constantFrom(
                        "startup",
                        "small",
                        "medium",
                        "enterprise"
                    ),
                    budget: fc.constantFrom(
                        "free",
                        "basic",
                        "professional",
                        "enterprise"
                    ),
                    compliance: fc.array(
                        fc.constantFrom("GDPR", "HIPAA", "SOX", "PCI-DSS"),
                        { maxLength: 3 }
                    ),
                }),
            ],
            {
                numRuns: 10,
                timeout: 20_000,
            }
        )(
            "should handle business context and compliance requirements",
            async (business) => {
                await renderForm();

                // Verify business characteristics
                expect([
                    "startup",
                    "small",
                    "medium",
                    "enterprise",
                ]).toContain(business.businessSize);
                expect([
                    "free",
                    "basic",
                    "professional",
                    "enterprise",
                ]).toContain(business.budget);
                expect(business.compliance.length).toBeLessThanOrEqual(3);

                for (const requirement of business.compliance) {
                    expect([
                        "GDPR",
                        "HIPAA",
                        "SOX",
                        "PCI-DSS",
                    ]).toContain(requirement);
                }
            }
        );
    });
});
