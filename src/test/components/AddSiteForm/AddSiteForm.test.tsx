/**
 * Basic tests for AddSiteForm component
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock all dependencies
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

vi.mock("../../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: vi.fn(() => ({
        // Current hook-based form API shape (minimal subset for these smoke
        // tests). The enhanced AddSiteForm tests exercise the full surface;
        // here we only need enough structure for the component to render.
        addMode: "existing", // Ensures the primary button label is "Add Monitor"
        name: "", // non-null string so AddSiteForm's name.trim() guard is safe
        formError: undefined,
        siteIdentifier: "test-id",

        // No-op action stubs used by internal handlers
        resetForm: vi.fn(),
        setAddMode: vi.fn(),
        setName: vi.fn(),
        setCheckInterval: vi.fn(),
        setBaselineUrl: vi.fn(),
        setBodyKeyword: vi.fn(),
        setCertificateWarningDays: vi.fn(),
        setEdgeLocations: vi.fn(),
        setExpectedHeaderValue: vi.fn(),
        setExpectedJsonValue: vi.fn(),
        setExpectedStatusCode: vi.fn(),
        setExpectedValue: vi.fn(),
        setFormError: vi.fn(),
        setHeaderName: vi.fn(),
        setHeartbeatExpectedStatus: vi.fn(),
        setHeartbeatMaxDriftSeconds: vi.fn(),
        setHeartbeatStatusField: vi.fn(),
        setHeartbeatTimestampField: vi.fn(),
        setHost: vi.fn(),
        setJsonPath: vi.fn(),
        setMaxPongDelayMs: vi.fn(),
        setMaxReplicationLagSeconds: vi.fn(),
        setMaxResponseTime: vi.fn(),
        setMonitorType: vi.fn(),
        setPort: vi.fn(),
        setPrimaryStatusUrl: vi.fn(),
        setRecordType: vi.fn(),
        setReplicaStatusUrl: vi.fn(),
        setReplicationTimestampField: vi.fn(),
        setSelectedExistingSite: vi.fn(),
        setSiteIdentifier: vi.fn(),
        setUrl: vi.fn(),

        // Previous properties kept for backwards compatibility with older tests
        formData: {
            siteName: "",
            url: "",
            monitor: {
                id: "",
                type: "http",
                status: "active",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                url: "",
                host: "",
                port: 80,
            },
        },
        updateFormData: vi.fn(),
        isValid: true,
        validationErrors: {},
    })),
}));

vi.mock("../../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        monitorTypes: [
            { id: "http", label: "HTTP/HTTPS" },
            { id: "port", label: "Port Check" },
            { id: "ping", label: "Ping" },
        ],
        options: [
            { label: "HTTP/HTTPS", value: "http" },
            { label: "Port Check", value: "port" },
            { label: "Ping", value: "ping" },
        ],
        isLoading: false,
        error: null,
    })),
}));

vi.mock("../../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        helpText: "Default help text",
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

// Mock FormFields components
vi.mock("../../../components/AddSiteForm/FormFields", () => ({
    RadioGroup: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="radio-group">{children}</div>
    ),
    SelectField: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-field">{children}</div>
    ),
    FormField: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="form-field">{children}</div>
    ),
}));

vi.mock("../../../components/AddSiteForm/DynamicMonitorFields", () => ({
    DynamicMonitorFields: () => (
        <div data-testid="dynamic-monitor-fields">Dynamic fields</div>
    ),
}));

vi.mock("../../../theme/components", () => ({
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
    ThemedButton: ({ children, ...props }: any) => (
        <button data-testid="themed-button" {...props}>
            {children}
        </button>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
}));

// Import the component under test
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";

let activeRenderCleanup: (() => void) | null = null;

const renderForm = async (): Promise<void> => {
    activeRenderCleanup?.();
    const view = render(<AddSiteForm />);
    activeRenderCleanup = () => {
        view.unmount();
    };
    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: /add/i })
        ).toBeInTheDocument();
    });
};

describe(AddSiteForm, () => {
    afterEach(() => {
        activeRenderCleanup?.();
        activeRenderCleanup = null;
    });

    it("should render without crashing", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        await renderForm();
        // Check for the submit button which is definitely in the DOM
        expect(
            screen.getByRole("button", { name: "Add Monitor" })
        ).toBeInTheDocument();
    });

    it("should render form elements", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        await renderForm();
        expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        expect(
            screen.getByTestId("dynamic-monitor-fields")
        ).toBeInTheDocument();
    });
});
