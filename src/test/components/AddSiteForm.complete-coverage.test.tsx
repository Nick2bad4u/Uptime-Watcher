import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddSiteForm } from "../../components/AddSiteForm/AddSiteForm";

// Mock the stores
vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: () => ({
        sites: [
            { identifier: "site1", name: "Test Site 1" },
            { identifier: "site2", name: "Test Site 2" },
        ],
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
    }),
}));

vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: () => ({
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
    }),
}));

// Mock the hooks
vi.mock("../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: () => ({
        addMode: "existing",
        checkInterval: 30,
        formError: null,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        resetForm: vi.fn(),
        selectedExistingSite: null,
        setAddMode: vi.fn(),
        setCheckInterval: vi.fn(),
        setFormError: vi.fn(),
        setHost: vi.fn(),
        setMonitorType: vi.fn(),
        setName: vi.fn(),
        setPort: vi.fn(),
        setSelectedExistingSite: vi.fn(),
        setUrl: vi.fn(),
        siteIdentifier: "test-site-id",
        url: "",
    }),
}));

vi.mock("../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: () => ({
        options: [
            { label: "HTTP", value: "http" },
            { label: "Ping", value: "ping" },
        ],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
    }),
}));

vi.mock("../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: () => false,
}));

vi.mock("../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: () => ({}),
}));

describe("AddSiteForm Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the form with basic elements", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);

        // Check for the presence of key elements
        expect(screen.getByText(/add mode/i)).toBeInTheDocument();
        expect(screen.getByText(/monitor type/i)).toBeInTheDocument();
    });

    it("should display different mode options", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);

        // Look for radio buttons or mode selection elements
        const radioButtons = screen.getAllByRole("radio");
        expect(radioButtons.length).toBeGreaterThan(0);
    });

    it("should show monitor type selection", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm.complete-coverage", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        render(<AddSiteForm />);

        // Check for monitor type dropdown/selection
        expect(screen.getByText(/monitor type/i)).toBeInTheDocument();
    });
});
