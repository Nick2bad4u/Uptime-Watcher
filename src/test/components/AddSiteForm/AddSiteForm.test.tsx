/**
 * Basic tests for AddSiteForm component
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
        resetForm: vi.fn(),
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

describe(AddSiteForm, () => {
    it("should render without crashing", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);
        // Check for the submit button which is definitely in the DOM
        expect(
            screen.getByRole("button", { name: "Add Monitor" })
        ).toBeInTheDocument();
    });

    it("should render form elements", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);
        expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        expect(
            screen.getByTestId("dynamic-monitor-fields")
        ).toBeInTheDocument();
    });
});
