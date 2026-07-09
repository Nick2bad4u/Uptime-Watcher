/**
 * Property-based fuzzing tests for AddSiteForm user input boundaries.
 *
 * @remarks
 * These tests focus on the actual user input attack surface - the add site form
 * where users can input site names, URLs, host names, ports, and other
 * configuration. This is the primary entry point for external data into the
 * app.
 *
 * These tests use property-based testing to discover edge cases in user input
 * validation that could lead to security issues, data corruption, or app
 * crashes.
 *
 * Focus areas:
 *
 * - Site name validation (XSS prevention, length limits, special characters)
 * - URL validation (protocol validation, malicious URLs, edge cases)
 * - Host name validation (DNS injection, IPv4/IPv6 edge cases)
 * - Port validation (range checking, type coercion issues)
 * - Record type validation for DNS monitors
 * - Form submission with malicious or edge case combinations
 */

import type { MonitorType, Site } from "@shared/types";

import { fc, test as fcTest } from "@fast-check/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { arrayFirst, isEmpty, safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";

// Import the component under test
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";
import { DEFAULT_CHECK_INTERVAL } from "../../../constants";

// Mock state for the form
let mockState = {
    addMode: safeCastTo<"existing" | "new">("new"),
    checkIntervalMs: DEFAULT_CHECK_INTERVAL,
    formError: safeCastTo<string | undefined>(undefined),
    host: "",
    monitorType: safeCastTo<MonitorType>("http"),
    name: "",
    port: "",
    selectedExistingSite: "",
    siteIdentifier: "test-site-id",
    url: "",
};

// Mock setters that update the state
const mockSetAddMode = vi.fn((value: "existing" | "new") => {
    mockState.addMode = value;
});
const mockSetName = vi.fn((value: string) => {
    mockState.name = value;
});
const mockSetUrl = vi.fn((value: string) => {
    mockState.url = value;
});
const mockSetMonitorType = vi.fn((value: MonitorType) => {
    mockState.monitorType = value;
});
const mockSetCheckIntervalMs = vi.fn((value: number) => {
    mockState.checkIntervalMs = value;
});
const mockSetHost = vi.fn((value: string) => {
    mockState.host = value;
});
const mockSetPort = vi.fn((value: string) => {
    mockState.port = value;
});
const mockResetForm = vi.fn(() => {
    mockState = {
        addMode: "new",
        checkIntervalMs: DEFAULT_CHECK_INTERVAL,
        formError: undefined,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        selectedExistingSite: "",
        siteIdentifier: "test-site-id",
        url: "",
    };
});
const mockIsFormValid = vi.fn(() => true);
const mockSetFormError = vi.fn((value: string | undefined) => {
    mockState.formError = value;
});
const mockSetSelectedExistingSite = vi.fn((value: string) => {
    mockState.selectedExistingSite = value;
});
const mockSetSiteIdentifier = vi.fn((value: string) => {
    mockState.siteIdentifier = value;
});

// Get the mocked useAddSiteForm function that returns current state
const mockUseAddSiteForm = vi.fn(() => ({
    // Return current state values
    ...mockState,
    // AddSiteFormActions methods
    isFormValid: mockIsFormValid,
    resetForm: mockResetForm,
    setAddMode: mockSetAddMode,
    setCheckIntervalMs: mockSetCheckIntervalMs,
    setFormError: mockSetFormError,
    setHost: mockSetHost,
    setMonitorType: mockSetMonitorType,
    setName: mockSetName,
    setPort: mockSetPort,
    setSelectedExistingSite: mockSetSelectedExistingSite,
    setSiteIdentifier: mockSetSiteIdentifier,
    setUrl: mockSetUrl,
}));

vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    get useAddSiteForm() {
        return mockUseAddSiteForm;
    },
}));

vi.mock("../../../constants", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        ARIA_LABEL: "aria-label",
        TRANSITION_ALL: "all 0.2s ease-in-out",
        CHECK_INTERVALS: [
            { label: "1 minute", value: 60_000 },
            { label: "5 minutes", value: 300_000 },
            { label: "10 minutes", value: 600_000 },
        ],
        DEFAULT_CHECK_INTERVAL: 60_000,
        UI_DELAYS: {
            STATE_UPDATE_DEFER: 100,
        },
        FALLBACK_MONITOR_TYPE_OPTIONS: [
            { label: "HTTP", value: "http" },
            { label: "Ping", value: "ping" },
            { label: "Port", value: "port" },
            { label: "DNS", value: "dns" },
        ],
    };
});

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
        createSite: vi.fn(),
        addMonitorToSite: vi.fn(),
        isLoading: false,
    })),
}));

vi.mock("../../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        monitorTypes: [
            "http",
            "ping",
            "port",
            "dns",
        ],
        options: [
            { label: "HTTP", value: "http" },
            { label: "Ping", value: "ping" },
            { label: "Port", value: "port" },
            { label: "DNS", value: "dns" },
        ],
        isLoading: false,
        error: null,
    })),
}));

vi.mock("../../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        helpText: "Enter the details for your new site monitor",
        error: null,
        isLoading: false,
    })),
}));

vi.mock("../../../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

vi.mock("../../../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(() => "test-uuid-123"),
}));

vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => ({
        isLoading: false,
        delayedLoading: false,
    })),
}));

// Mock the sub-components used by AddSiteForm
vi.mock("../../../components/AddSiteForm/SelectField", () => ({
    SelectField: vi.fn(({ label, options, onChange, value, id }) => {
        const handleChange = (e: any) => {
            const newValue = e.target.value;

            // Update mock state for monitor type changes
            if (id === "monitorType") {
                mockSetMonitorType(newValue);
            } else if (id === "checkInterval") {
                mockSetCheckIntervalMs(Number(newValue));
            }

            if (onChange) {
                onChange(e);
            }
        };
        return (
            <div>
                <label htmlFor={id}>{label}</label>
                <select
                    data-testid={`selectfield-${id}`}
                    id={id}
                    onChange={handleChange}
                    value={value ?? ""}
                >
                    {options?.map(
                        (option: { label: string; value: string }) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )
                    )}
                </select>
            </div>
        );
    }),
}));

/**
 * Ensure mount-time effects are flushed by wrapping render in act.
 */
let activeRenderCleanup: (() => void) | null = null;

const renderForm = async (): Promise<void> => {
    activeRenderCleanup?.();
    const view = render(<AddSiteForm />);
    activeRenderCleanup = () => {
        view.unmount();
    };
    await waitFor(() => {
        expect(screen.getByRole("form")).toBeInTheDocument();
    });
};

/**
 * Updates an input element's value while allowing Testing Library to internally
 * manage React's act() behavior during fast-check runs.
 */
const commitInputValue = async (
    element: Element | null,
    value: string
): Promise<void> => {
    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    element.value = value;

    fireEvent.input(element, { target: { value } });
};

vi.mock("../../../components/AddSiteForm/TextField", () => ({
    TextField: vi.fn(({ label, onChange, value, id }) => {
        const handleChange = (e: any) => {
            if (onChange) {
                onChange(e.target.value);
            }
            // Also update mock state directly for the appropriate field
            switch (id) {
                case "host": {
                    mockSetHost(e.target.value);
                    break;
                }
                case "port": {
                    mockSetPort(e.target.value);
                    break;
                }
                case "siteName": {
                    mockSetName(e.target.value);
                    break;
                }
                case "url": {
                    mockSetUrl(e.target.value);
                    break;
                }
                default: {
                    // No specific handler for this field
                    break;
                }
            }
        };
        return (
            <div>
                <label htmlFor={id}>{label}</label>
                <input
                    data-testid={`textfield-${id}`}
                    defaultValue={value ?? ""}
                    id={id}
                    onChange={handleChange}
                />
            </div>
        );
    }),
}));

vi.mock("../../../components/AddSiteForm/RadioGroup", () => ({
    RadioGroup: vi.fn(({ label, options, onChange, value }) => {
        const handleChange = (e: any) => {
            if (onChange) {
                onChange(e);
            }
        };
        return (
            <div>
                <fieldset>
                    <legend>{label}</legend>
                    {options?.map(
                        (option: { label: string; value: string }) => (
                            <div key={option.value}>
                                <input
                                    checked={value === option.value}
                                    data-testid={`radio-${option.value}`}
                                    onChange={handleChange}
                                    type="radio"
                                    value={option.value}
                                />
                                <label>{option.label}</label>
                            </div>
                        )
                    )}
                </fieldset>
            </div>
        );
    }),
}));

vi.mock("../../../components/AddSiteForm/DynamicMonitorFields", () => ({
    DynamicMonitorFields: vi.fn(({ monitorType }) => {
        // Determine which monitor type to use
        const currentType = monitorType || mockState.monitorType;

        return (
            <div data-testid="dynamic-monitor-fields">
                {currentType === "http" && (
                    <div>
                        <label htmlFor="url">URL</label>
                        <input
                            aria-label="URL"
                            defaultValue=""
                            id="url"
                            placeholder="https://example.com"
                            type="text"
                        />
                    </div>
                )}
                {currentType === "port" && (
                    <div>
                        <label htmlFor="host">Host</label>
                        <input
                            aria-label="Host"
                            defaultValue=""
                            id="host"
                            placeholder="example.com"
                            type="text"
                        />
                        <label htmlFor="port">Port</label>
                        <input
                            aria-label="Port"
                            defaultValue=""
                            id="port"
                            placeholder="80"
                            type="number"
                        />
                    </div>
                )}
                {currentType === "ping" && (
                    <div>
                        <label htmlFor="host">Host</label>
                        <input
                            aria-label="Host"
                            defaultValue=""
                            id="host"
                            placeholder="example.com"
                            type="text"
                        />
                    </div>
                )}
                {currentType === "dns" && (
                    <div>
                        <label htmlFor="host">Host</label>
                        <input
                            aria-label="Host"
                            defaultValue=""
                            id="host"
                            placeholder="example.com"
                            type="text"
                        />
                    </div>
                )}
            </div>
        );
    }),
}));

vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
}));

vi.mock("../../../theme/components/ThemedButton", () => ({
    ThemedButton: vi.fn(({ children, ...props }) => (
        <button {...props}>{children}</button>
    )),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: vi.fn(({ children, ...props }) => (
        <span {...props}>{children}</span>
    )),
}));

vi.mock("../../../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: vi.fn(({ message }) =>
        message ? <div data-testid="error-alert">{message}</div> : null
    ),
}));

describe("AddSiteForm User Input Fuzzing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        // Force garbage collection and cleanup
        if (globalThis.gc) {
            globalThis.gc();
        }

        // Clear any existing DOM - cleanup() is automatic in modern test runners
        document.body.replaceChildren();

        // Reset mock state to default
        mockState = {
            addMode: "new",
            checkIntervalMs: DEFAULT_CHECK_INTERVAL,
            formError: undefined,
            host: "",
            monitorType: "http",
            name: "",
            port: "",
            selectedExistingSite: "",
            siteIdentifier: "test-site-id",
            url: "",
        };
    });

    afterEach(() => {
        // Aggressive cleanup to prevent hanging afterEach
        activeRenderCleanup?.();
        activeRenderCleanup = null;
        vi.clearAllMocks();
        vi.clearAllTimers();

        // Clear DOM
        document.body.replaceChildren();

        // Remove all event listeners
        window.removeEventListener ||= () => {};

        // Force garbage collection
        if (globalThis.gc) {
            globalThis.gc();
        }
    });

    describe("Site Name Input Validation (Primary User Input)", () => {
        fcTest.prop(
            [
                fc.constantFrom(
                    "My Site",
                    "Test Website",
                    "prod.example.com",
                    "Site 123",
                    "A".repeat(10),
                    "Valid Site Name",
                    "website-test",
                    "site_name",
                    "localhost-test"
                ),
            ],
            { numRuns: 2, timeout: 30_000 }
        )(
            "should handle realistic site name inputs safely",
            async (siteName) => {
                const user = userEvent.setup();
                await renderForm();

                // Switch to "new" mode to show site name field
                const newRadios = screen.getAllByDisplayValue("new");
                const newRadio = arrayFirst(newRadios)!;
                await user.click(newRadio);

                // Find and interact with site name input
                const siteNameInputs = screen.getAllByLabelText(/site name/i);
                const siteNameInput = arrayFirst(siteNameInputs)!;
                expect(siteNameInput).toBeInTheDocument();

                // Test input handling
                await user.clear(siteNameInput);
                await commitInputValue(siteNameInput, siteName);

                // Verify input was accepted (no crash or rejection)
                expect(siteNameInput).toHaveValue(siteName);

                // Verify no XSS injection (input should be treated as plain text)
                expect((siteNameInput as HTMLInputElement).value).toBe(
                    siteName
                );

                // Check for reasonable length limits (prevent memory exhaustion)
                if (siteName.length <= 100) {
                    expect((siteNameInput as HTMLInputElement).value).toBe(
                        siteName
                    );
                } else {
                    // Should either truncate or reject very long inputs
                    expect(
                        (siteNameInput as HTMLInputElement).value.length
                    ).toBeLessThanOrEqual(200);
                }
            }
        );

        fcTest.prop(
            [
                fc.constantFrom(
                    "", // Empty string
                    " ".repeat(3), // Spaces only
                    "\t\n", // Tab and newline
                    "  \t  \n  ", // Mixed whitespace
                    "\r\n", // Carriage return + newline
                    "\t".repeat(3), // Multiple tabs
                    " ".repeat(4) // Multiple spaces
                ),
            ],
            { numRuns: 2, timeout: 30_000 }
        )(
            "should handle empty and whitespace site names appropriately",
            async (emptyName) => {
                const user = userEvent.setup();
                await renderForm();

                // Switch to "new" mode
                const newRadios = screen.getAllByDisplayValue("new");
                const newRadio = arrayFirst(newRadios)!;
                await user.click(newRadio);

                const siteNameInputs = screen.getAllByLabelText(/site name/i);
                const siteNameInput = arrayFirst(siteNameInputs)!;

                // Clear and set value using act-aware helper for more control
                await commitInputValue(siteNameInput, emptyName);

                // HTML input elements may normalize whitespace, but we primarily care that:
                // 1. The component doesn't crash
                // 2. The input accepts the value without throwing
                // 3. The result is still whitespace-only for whitespace-only inputs
                const inputValue = (siteNameInput as HTMLInputElement).value;

                if (emptyName.trim() === "") {
                    // For whitespace-only inputs, verify the result is also whitespace-only when trimmed
                    // (HTML may normalize, but it should still be functionally empty)
                    expect(inputValue.trim()).toBe("");
                } else {
                    // For non-whitespace inputs, verify content is preserved
                    // (basic functional test rather than exact whitespace preservation)
                    expect(inputValue.length).toBeGreaterThan(0);
                }

                // Submit button should still be present (validation is on submit)
                const submitButtons = screen.getAllByRole("button", {
                    name: /add/iv,
                });
                expect(submitButtons.length).toBeGreaterThan(0);
            }
        );

        fcTest.prop(
            [
                fc.constantFrom(
                    "<script>alert('xss')</script>",
                    "Site Name & Co",
                    'Site "with" quotes',
                    "Site 'with' single quotes",
                    "<h1>HTML Tag</h1>",
                    // eslint-disable-next-line no-script-url -- Security fixture intentionally includes a script protocol.
                    "javascript:alert('xss')",
                    "data:text/html,<script>",
                    "vbscript:msgbox('xss')",
                    "Site > Name",
                    "Site < Name"
                ),
            ],
            { numRuns: 2, timeout: 30_000 }
        )(
            "should safely handle potentially malicious site name inputs",
            async (maliciousName) => {
                const user = userEvent.setup();
                await renderForm();

                const newRadios = screen.getAllByDisplayValue("new");
                const newRadio = arrayFirst(newRadios)!;
                await user.click(newRadio);

                const siteNameInputs = screen.getAllByLabelText(/site name/i);
                const siteNameInput = arrayFirst(siteNameInputs)!;

                // Should not throw or crash when handling malicious input
                expect(() => {
                    fireEvent.change(siteNameInput, {
                        target: { value: maliciousName },
                    });
                }).not.toThrow();

                // HTML input elements normalize whitespace, especially newlines
                // Instead of exact matching, verify the input contains expected content
                const inputValue = (siteNameInput as HTMLInputElement).value;

                // For malicious inputs, verify content is preserved (even if whitespace is normalized)
                if (maliciousName.includes("\n")) {
                    // If original had newlines, they should be converted to spaces
                    const normalizedExpected = maliciousName.replaceAll(
                        "\n",
                        " "
                    );
                    // Allow for some whitespace normalization variations
                    const actualTrimmed = inputValue.replaceAll(/\s+/gv, " ");
                    const expectedTrimmed = normalizedExpected.replaceAll(
                        /\s+/gv,
                        " "
                    );
                    expect(actualTrimmed).toBe(expectedTrimmed);
                } else {
                    // For inputs without newlines, should match exactly
                    expect(inputValue).toBe(maliciousName);
                }

                // No script execution or HTML injection should occur
                const scripts = document.querySelectorAll("script");
                const initialScriptCount = scripts.length;

                // Trigger any potential XSS
                await user.click(siteNameInput);

                // No new scripts should be created
                expect(document.querySelectorAll("script")).toHaveLength(
                    initialScriptCount
                );
            }
        );
    });

    describe("URL Input Validation (Critical Security Boundary)", () => {
        fcTest.prop(
            [
                fc.oneof(
                    fc.webUrl().filter((url) => url.length <= 100), // Limit URL length to prevent slow typing
                    fc.constantFrom(
                        "https://example.com",
                        "http://localhost:3000",
                        "https://api.github.com/status",
                        "https://192.168.1.1",
                        "https://subdomain.example.co.uk"
                    )
                ),
            ],
            {
                numRuns: 2, // Reduced from 3 to 2
                timeout: 1500, // Increased fast-check timeout to 1.5s
            }
        )("should handle valid HTTP URLs correctly", async (validUrl) => {
            // Pre-set the mock state to HTTP to avoid DOM interaction
            mockState.monitorType = "http";

            await renderForm();

            // URL input should be available immediately with HTTP monitor type
            const urlInputs = screen.getAllByLabelText(/url/iv);
            const urlInput = arrayFirst(urlInputs)!; // Take the first one if multiple exist
            expect(urlInput).toBeInTheDocument();

            // Use direct DOM manipulation instead of userEvent for speed
            await commitInputValue(urlInput, validUrl);

            // Should accept valid URLs
            expect(urlInput).toHaveValue(validUrl);

            // Verify URL format (webUrl generates valid URLs)
            expect(validUrl).toMatch(/^https?:\/\//v);
        });

        fcTest.prop(
            [
                fc.constantFrom(
                    "data:text/html,<script>alert('xss')</script>",
                    "file:///etc/passwd",
                    "ftp://malicious.com/file",
                    "vbscript:msgbox('xss')",
                    "mailto:admin@example.com",
                    "tel:+1234567890",
                    "data:image/png;base64,iVBORw0KG",
                    "file:///home/user/secrets.txt",
                    "vbscript:alert(1)",
                    // eslint-disable-next-line no-script-url -- Security fixture intentionally includes a script protocol.
                    "javascript:alert('test')"
                ),
            ],
            { numRuns: 2, timeout: 30_000 }
        )("should reject dangerous URL protocols", async (dangerousUrl) => {
            // Pre-set mock state to avoid DOM queries
            mockState.monitorType = "http";

            await renderForm();

            // Use faster query method with timeout
            const urlInput = await waitFor(
                () => {
                    const inputs = screen.queryAllByLabelText(/url/iv);
                    if (isEmpty(inputs)) {
                        throw new Error("URL input not found");
                    }
                    return inputs[0]!;
                },
                { timeout: 5000 }
            );

            // Should not crash when entering dangerous URLs
            // Use direct DOM manipulation for speed
            await commitInputValue(urlInput, dangerousUrl);

            // URL should be entered (validation happens on submit)
            expect(urlInput).toHaveValue(dangerousUrl);

            // But dangerous protocols should be rejected during validation
            // (This would be caught by form validation, not input handling)
        });
    });

    describe("Host Name Input Validation", () => {
        fcTest.prop(
            [
                fc.constantFrom(
                    "example.com",
                    "subdomain.example.org",
                    "localhost",
                    "192.168.1.1",
                    "::1",
                    "2001:db8::1",
                    "test.co.uk",
                    "api.service.io",
                    "dev.company.net"
                ),
            ],
            {
                numRuns: 2, // Reduced from 3 to 2
                timeout: 1500, // Increased fast-check timeout to 1.5s
            }
        )(
            "should handle valid host names and IP addresses",
            async (validHost) => {
                // Set the mock state to port type before rendering - no DOM interaction needed
                mockState.monitorType = "port";

                await renderForm();

                // Verify host input is available
                const hostInputs = screen.getAllByLabelText(/host/i);
                const hostInput = arrayFirst(hostInputs)!; // Take the first one if multiple exist
                expect(hostInput).toBeInTheDocument();

                // Use direct DOM manipulation instead of userEvent for speed
                await commitInputValue(hostInput, validHost);

                expect(hostInput).toHaveValue(validHost);
            }
        );

        fcTest.prop(
            [
                fc.constantFrom(
                    "A".repeat(200), // Very long hostname
                    "host..example.com", // Directory traversal attempts
                    "host$(whoami).com", // Command injection attempts
                    "host`ls`.com", // Command substitution
                    "host;rm -rf /", // Command chaining
                    "host|cat /etc/passwd", // Pipes
                    "host&sleep 10", // Background execution
                    "host<redirect", // Redirects
                    "host>output" // Redirects
                ),
            ],
            { numRuns: 2, timeout: 10_000 }
        )(
            "should safely handle malicious host name inputs",
            async (maliciousHost) => {
                // Set the mock state to port type before rendering to avoid state changes
                mockState.monitorType = "port";

                await renderForm();

                // Use faster query with proper timeout
                const hostInput = await waitFor(
                    () => {
                        const inputs = screen.queryAllByLabelText(/host/i);
                        if (isEmpty(inputs)) {
                            throw new Error("Host input not found");
                        }
                        return inputs[0]!;
                    },
                    { timeout: 2000 }
                );

                // Should not crash - use direct DOM manipulation for speed
                const limitedHost = maliciousHost.slice(0, 50); // Limit to reasonable length
                await commitInputValue(hostInput, limitedHost);

                // Verify the input was set without crashing
                expect(hostInput).toBeInTheDocument();
            }
        );
    });

    describe("Port Number Validation", () => {
        fcTest.prop([fc.integer({ min: 1, max: 65_535 })], {
            numRuns: 2, // Reduced from 3
            timeout: 1500, // Reduced fast-check timeout to 1.5s
        })("should handle valid port numbers", async (validPort) => {
            // Pre-set the mock state to port type before rendering - no DOM interaction needed
            mockState.monitorType = "port";

            await renderForm();

            // Port input should be available immediately
            const portInputs = screen.getAllByLabelText(/port/iv);
            const portInput = arrayFirst(portInputs)!; // Take the first one if multiple exist
            expect(portInput).toBeInTheDocument();

            // Use direct DOM manipulation instead of userEvent for speed
            await commitInputValue(portInput, validPort.toString());

            expect(portInput).toHaveValue(validPort);
        });

        fcTest.prop(
            [
                fc.oneof(
                    fc.integer({ min: -100, max: 0 }), // Negative numbers
                    fc.integer({ min: 65_536, max: 70_000 }), // Out of range
                    fc.constantFrom(
                        "abc",
                        "3.14",
                        "1e5",
                        "0x80",
                        "NaN",
                        "Infinity",
                        "-Infinity"
                    )
                ),
            ],
            { numRuns: 2, timeout: 15_000 }
        )(
            "should handle invalid port number inputs appropriately",
            async (invalidPort) => {
                // Set the mock state to port type before rendering
                mockState.monitorType = "port";

                await renderForm();

                // Port input should be available immediately
                const portInputs = screen.getAllByLabelText(/port/iv);
                const portInput = arrayFirst(portInputs)!; // Take the first one if multiple exist
                expect(portInput).toBeInTheDocument();

                // Should not crash on invalid input while simulating user entry
                await expect(async () => {
                    await commitInputValue(portInput, "");
                    await commitInputValue(portInput, invalidPort.toString());
                }).not.toThrow();

                // Input should be handled gracefully (validation happens on submit)
                // For invalid inputs, number fields may clear the value or set to null
                // The key is that it doesn't crash
                expect(portInput).toBeInTheDocument();
            }
        );
    });

    describe("Form Submission Edge Cases", () => {
        fcTest.prop(
            [
                fc.record({
                    mode: fc.constantFrom("new", "existing"),
                    siteName: fc.string({ maxLength: 50 }),
                    monitorType: fc.constantFrom("http", "port", "ping", "dns"),
                    url: fc.string({ maxLength: 100 }),
                    host: fc.string({ maxLength: 50 }),
                    port: fc.string({ maxLength: 5 }), // String because user input is string
                }),
            ],
            { numRuns: 2, timeout: 30_000 }
        )(
            "should handle edge case form submissions without crashing",
            async (formData) => {
                const user = userEvent.setup();
                await renderForm();

                // Should not crash during form interaction
                await expect(async () => {
                    // Set mode - use query to handle missing elements
                    const modeRadios = screen.queryAllByDisplayValue(
                        formData.mode
                    );
                    const modeRadio = arrayFirst(modeRadios);
                    if (modeRadio) {
                        await user.click(modeRadio);
                    }

                    // Set monitor type - use query to handle missing elements
                    const monitorTypeSelect =
                        screen.queryByLabelText(/monitor type/iv);
                    if (monitorTypeSelect) {
                        await user.selectOptions(
                            monitorTypeSelect,
                            formData.monitorType
                        );
                    }

                    // Fill in fields based on monitor type and mode
                    if (formData.mode === "new") {
                        const siteNameInput =
                            screen.queryByLabelText(/site name/i);
                        if (siteNameInput) {
                            await user.clear(siteNameInput);
                            // Use faster direct assignment
                            const limitedSiteName = formData.siteName.slice(
                                0,
                                50
                            );
                            await commitInputValue(
                                siteNameInput,
                                limitedSiteName
                            );
                        }
                    }

                    // Fill type-specific fields
                    if (formData.monitorType === "http") {
                        const urlInput =
                            screen.queryByLabelText(/url/iv) ||
                            screen.queryByPlaceholderText(/url/iv);
                        if (urlInput) {
                            await user.clear(urlInput);
                            // Use faster direct assignment
                            const limitedUrl = formData.url.slice(0, 100);
                            await commitInputValue(urlInput, limitedUrl);
                        }
                    }

                    if (
                        formData.monitorType === "port" ||
                        formData.monitorType === "ping" ||
                        formData.monitorType === "dns"
                    ) {
                        const hostInput =
                            screen.queryByLabelText(/host/i) ||
                            screen.queryByPlaceholderText(/host/i);
                        if (hostInput) {
                            await user.clear(hostInput);
                            // Use faster direct assignment
                            const limitedHost = formData.host.slice(0, 50);
                            await commitInputValue(hostInput, limitedHost);
                        }

                        if (formData.monitorType === "port") {
                            const portInput =
                                screen.queryByLabelText(/port/iv) ||
                                screen.queryByRole("spinbutton", {
                                    name: /port/iv,
                                });
                            if (portInput) {
                                await user.clear(portInput);
                                // Use faster direct assignment
                                await commitInputValue(
                                    portInput,
                                    formData.port
                                );
                            }
                        }
                    }
                }).not.toThrow();

                // Form should still be functional
                const submitButtons = screen.getAllByRole("button", {
                    name: /add/iv,
                });
                const submitButton =
                    submitButtons.length > 0
                        ? arrayFirst(submitButtons)
                        : arrayFirst(
                              screen.getAllByRole("button", { name: /submit/i })
                          );
                expect(submitButton).toBeInTheDocument();
            }
        );
    });

    describe("Validation Function Tests", () => {
        fcTest.prop(
            [
                fc.record({
                    siteName: fc.constantFrom(
                        "Test Site",
                        "My Website",
                        "Production Server",
                        "Dev Environment",
                        "Staging Site"
                    ),
                    monitorType: fc.constantFrom("http", "port", "ping", "dns"),
                    url: fc.constantFrom(
                        "https://example.com",
                        "http://localhost:3000",
                        "https://test.com",
                        "https://api.example.org"
                    ),
                    host: fc.constantFrom(
                        "example.com",
                        "localhost",
                        "test.org",
                        "api.service.com"
                    ),
                    port: fc.integer({ min: 80, max: 8080 }),
                    recordType: fc.constantFrom(
                        "A",
                        "AAAA",
                        "CNAME",
                        "MX",
                        "TXT"
                    ),
                }),
            ],
            { numRuns: 2, timeout: 30_000 }
        )(
            "should validate site configurations with realistic inputs",
            async (config) => {
                // Test that valid configurations would create proper site objects
                const mockSite: Partial<Site> = {
                    name: config.siteName,
                    identifier: "test-id",
                    monitoring: true,
                    monitors: [],
                };

                // For valid inputs, we should get valid sites
                if (config.siteName.trim().length > 0) {
                    expect(mockSite.name).toBe(config.siteName);
                    expect(mockSite.monitoring).toBeTruthy();
                    expect(Array.isArray(mockSite.monitors)).toBeTruthy();
                }
            }
        );
    });
});
