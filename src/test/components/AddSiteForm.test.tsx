import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { AddSiteForm } from "../../components/AddSiteForm/AddSiteForm";
import { createSelectorHookMock } from "../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../utils/createSitesStoreMock";

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
        setSiteIdentifier: vi.fn(),
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

// Standard (non-hoisted) creation bridged through global to avoid early access
const sitesStoreState = createSitesStoreMock({
    addMonitorToSite: vi.fn(),
    createSite: vi.fn(),
    sites: [],
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

(globalThis as any).__useSitesStoreMock_basic__ = useSitesStoreMock;

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: (selector?: any, equality?: any) =>
        (globalThis as any).__useSitesStoreMock_basic__?.(selector, equality),
}));

const resetSitesStoreState = (): void => {
    updateSitesStoreMock(sitesStoreState, {
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        sites: [],
    });
};

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
        useSitesStoreMock.mockClear();
        resetSitesStoreState();
    });

    it("should render the form with basic elements", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);

        // Check for the presence of key elements
        expect(screen.getByText(/add mode/i)).toBeInTheDocument();
        expect(screen.getByText(/monitor type/i)).toBeInTheDocument();
    });

    it("should display different mode options", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<AddSiteForm />);

        // Look for radio buttons or mode selection elements
        const radioButtons = screen.getAllByRole("radio");
        expect(radioButtons.length).toBeGreaterThan(0);
    });

    it("should show monitor type selection", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: AddSiteForm", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

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
