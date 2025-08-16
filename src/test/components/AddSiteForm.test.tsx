import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddSiteForm } from "../../components/AddSiteForm/AddSiteForm";

// Mock the hooks
vi.mock("../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: () => ({
        addMode: "existing",
        checkInterval: 30,
        formError: undefined,
        host: "",
        isFormValid: () => true,
        monitorType: "http", // Set a valid initial value
        name: "",
        port: "",
        resetForm: vi.fn(),
        selectedExistingSite: "",
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
        siteId: "test-site-id",
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
        error: undefined,
        refresh: vi.fn(),
    }),
}));

// Mock the stores
vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: () => ({
        clearError: vi.fn(),
        isLoading: false,
        lastError: undefined,
    }),
}));

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: () => ({
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        sites: [],
    }),
}));

// Mock other hooks
vi.mock("../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: () => ({
        isShowingLoading: false,
    }),
}));

vi.mock("../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: () => ({
        host: "Enter host address",
        port: "Enter port number",
        url: "Enter URL",
    }),
}));

describe("AddSiteForm Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the form with basic elements", () => {
        render(<AddSiteForm />);

        // Check for the presence of key elements
        expect(screen.getByText(/add mode/i)).toBeInTheDocument();
        expect(screen.getByText(/monitor type/i)).toBeInTheDocument();
    });

    it("should display different mode options", () => {
        render(<AddSiteForm />);

        // Look for radio buttons or mode selection elements
        const radioButtons = screen.getAllByRole("radio");
        expect(radioButtons.length).toBeGreaterThan(0);
    });

    it("should show monitor type selection", () => {
        render(<AddSiteForm />);

        // Check for monitor type select element specifically
        const monitorTypeSelect = screen.getByRole("combobox", {
            name: /monitor type/i,
        });
        expect(monitorTypeSelect).toBeInTheDocument();

        // Verify it has the expected options by looking for option elements
        expect(
            screen.getByRole("option", { name: "HTTP" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Ping" })
        ).toBeInTheDocument();
    });
});
