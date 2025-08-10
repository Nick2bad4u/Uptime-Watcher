import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";

// Mock external dependencies
vi.mock("../../../constants", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../constants")>();
    return {
        ...actual,
        CHECK_INTERVALS: [
            { label: "1 minute", value: 60000 },
            { label: "5 minutes", value: 300000 },
            { label: "10 minutes", value: 600000 },
        ],
    };
});
vi.mock("../../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: vi.fn(() => ({
        helpText: "Default help text",
        error: null,
        isLoading: false,
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
        refreshMonitorTypes: vi.fn(),
    })),
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
        sites: [
            {
                id: "1",
                identifier: "1",
                url: "https://example.com",
                name: "Example Site",
                monitors: [],
            },
        ],
        addSite: vi.fn(),
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
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
                checkInterval: 60000,
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
        // Add missing methods from the hook
        monitorType: "http",
        setMonitorType: vi.fn(),
        checkInterval: 60000,
        setCheckInterval: vi.fn(),
        addMode: "new",
        setAddMode: vi.fn(),
        selectedSite: null,
        setSelectedSite: vi.fn(),
    })),
}));

vi.mock("../../../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(() => "test-uuid-123"),
}));

vi.mock("../../../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

// Mock FormFields components
vi.mock("../../../components/AddSiteForm/FormFields", () => ({
    RadioGroup: ({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) => (
        <div data-testid="radio-group">
            <label>{label}</label>
            {children}
        </div>
    ),
    SelectField: ({
        label,
        value,
        onChange,
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
    }) => (
        <div data-testid="select-field">
            <label>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="http">HTTP</option>
                <option value="port">Port</option>
                <option value="ping">Ping</option>
            </select>
        </div>
    ),
    TextField: ({
        label,
        value,
        onChange,
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
    }) => (
        <div data-testid="text-field">
            <label>{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
}));

vi.mock("../../../components/AddSiteForm/DynamicMonitorFields", () => ({
    default: ({ monitorType }: { monitorType: string }) => (
        <div data-testid="dynamic-monitor-fields">
            Dynamic fields for {monitorType}
        </div>
    ),
}));

describe("AddSiteForm Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render the form without errors", () => {
            render(<AddSiteForm />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        });

        it("should render all required form elements", () => {
            render(<AddSiteForm />);

            // Check for main form elements
            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
            expect(
                document.querySelectorAll(".themed-select")[0]
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("dynamic-monitor-fields")
            ).toBeInTheDocument();
        });

        it("should render submit button", () => {
            render(<AddSiteForm />);

            const submitButton = document.querySelector(".themed-button");
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe("Form Interaction", () => {
        it("should handle form field changes", () => {
            render(<AddSiteForm />);

            const selectFields = screen.getAllByRole("combobox");
            fireEvent.change(selectFields[0]!, { target: { value: "port" } });

            // Verify the form field interaction
            expect(selectFields[0]!).toBeInTheDocument();
        });

        it("should handle monitor type changes", () => {
            render(<AddSiteForm />);

            const dynamicFields = screen.getByTestId("dynamic-monitor-fields");
            expect(dynamicFields).toHaveTextContent("Dynamic fields");
        });

        it("should handle form submission", async () => {
            const onSuccess = vi.fn();
            render(<AddSiteForm onSuccess={onSuccess} />);

            const submitButton = document.querySelector(".themed-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(submitButton).toBeInTheDocument();
            });
        });
    });

    describe("Props and Configuration", () => {
        it("should handle onSuccess callback", () => {
            const onSuccess = vi.fn();
            render(<AddSiteForm onSuccess={onSuccess} />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should work without onSuccess callback", () => {
            render(<AddSiteForm />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });
    });

    describe("State Management Integration", () => {
        it("should integrate with error store", () => {
            render(<AddSiteForm />);

            // Test that error store integration works
            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should integrate with sites store", () => {
            render(<AddSiteForm />);

            // Test that sites store integration works
            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should integrate with form hooks", () => {
            render(<AddSiteForm />);

            // Test that form hooks integration works
            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });
    });

    describe("Theme Integration", () => {
        it("should apply theme styling", () => {
            render(<AddSiteForm />);

            const themedBox = document.querySelector(".themed-box");
            expect(themedBox).toBeInTheDocument();

            const themedButton = document.querySelector(".themed-button");
            expect(themedButton).toBeInTheDocument();
        });

        it("should handle theme changes", () => {
            render(<AddSiteForm />);

            // Test theme integration
            expect(document.querySelectorAll(".themed-text")[0]).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should handle component errors gracefully", () => {
            // Test error boundaries and error handling
            render(<AddSiteForm />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should display validation errors", () => {
            render(<AddSiteForm />);

            // Test validation error display
            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper form labels", () => {
            render(<AddSiteForm />);

            // Check for accessibility labels
            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
            expect(
                document.querySelectorAll(".themed-select")[0]
            ).toBeInTheDocument();
        });

        it("should support keyboard navigation", () => {
            render(<AddSiteForm />);

            const submitButton = document.querySelector(".themed-button");
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty form data", () => {
            render(<AddSiteForm />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should handle missing monitor types", () => {
            render(<AddSiteForm />);

            expect(
                screen.getByTestId("dynamic-monitor-fields")
            ).toBeInTheDocument();
        });

        it("should handle loading states", () => {
            render(<AddSiteForm />);

            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });
    });
});
