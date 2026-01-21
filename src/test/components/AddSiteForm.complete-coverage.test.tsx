import type { Site } from "@shared/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UnknownRecord } from "type-fest";

import { AddSiteForm } from "../../components/AddSiteForm/AddSiteForm";
import { createSelectorHookMock } from "../utils/createSelectorHookMock";
import { createMockSite } from "../utils/mockFactories";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../utils/createSitesStoreMock";

const createDefaultSites = (): Site[] => [
    createMockSite({ identifier: "site-1", name: "Test Site 1" }),
    createMockSite({ identifier: "site-2", name: "Test Site 2" }),
];

// Create store mocks normally, and bridge them through a global reference
const sitesStoreState = createSitesStoreMock({
    addMonitorToSite: vi.fn(),
    createSite: vi.fn(),
    sites: createDefaultSites(),
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

// Expose the mock via global so the hoisted mock factory can access it lazily

interface GlobalWithSitesStoreMock extends UnknownRecord {
    __useSitesStoreMock__?: typeof useSitesStoreMock;
}

const globalWithSitesStoreMock =
    globalThis as unknown as GlobalWithSitesStoreMock;
globalWithSitesStoreMock.__useSitesStoreMock__ = useSitesStoreMock;

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: <Result = typeof sitesStoreState,>(
        selector?: (state: typeof sitesStoreState) => Result,
        equality?: (a: Result, b: Result) => boolean
    ): Result | typeof sitesStoreState => {
        const hook = globalWithSitesStoreMock.__useSitesStoreMock__;
        if (!hook) {
            throw new Error("useSitesStore mock was not initialized");
        }

        return hook(selector, equality) as Result | typeof sitesStoreState;
    },
}));

const resetSitesStoreState = (): void => {
    updateSitesStoreMock(sitesStoreState, {
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        sites: createDefaultSites(),
    });
};

vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: (() => {
        const state = {
            clearAllErrors: vi.fn(),
            clearError: vi.fn(),
            clearStoreError: vi.fn(),
            getOperationLoading: vi.fn(() => false),
            getStoreError: vi.fn(() => undefined),
            isLoading: false,
            lastError: undefined,
            operationLoading: {},
            setError: vi.fn(),
            setLoading: vi.fn(),
            setOperationLoading: vi.fn(),
            setStoreError: vi.fn(),
            storeErrors: {},
        };

        const store = ((selector?: (candidate: typeof state) => unknown) =>
            typeof selector === "function"
                ? selector(state)
                : state) as unknown as ((
            selector?: (candidate: typeof state) => unknown
        ) => unknown) & {
            getState: () => typeof state;
            setState: (partial: Partial<typeof state>) => void;
            subscribe: () => () => void;
        };

        store.getState = () => state;
        store.setState = (partial) => {
            Object.assign(state, partial);
        };
        store.subscribe = () => () => {
            // no-op
        };

        return store;
    })(),
}));

// Mock the hooks
vi.mock("../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: () => ({
        addMode: "existing",
        checkIntervalMs: 30,
        formError: null,
        host: "",
        monitorType: "http",
        name: "",
        port: "",
        resetForm: vi.fn(),
        selectedExistingSite: null,
        setAddMode: vi.fn(),
        setCheckIntervalMs: vi.fn(),
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

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: (selector?: unknown) => {
        const state = {
            isLoaded: true,
            lastError: null,
            loadMonitorTypes: vi.fn(),
            monitorTypes: [
                {
                    description: "Monitor HTTP endpoints",
                    displayName: "HTTP Monitor",
                    fields: [
                        {
                            helpText: "Enter the full URL including http://",
                            label: "Website URL",
                            name: "url",
                            placeholder: "https://status.example.com",
                            required: true,
                            type: "url",
                        },
                    ],
                    type: "http",
                    uiConfig: {
                        supportsAdvancedAnalytics: true,
                        supportsResponseTime: true,
                    },
                    version: "1.0.0",
                },
            ],
        };

        return typeof selector === "function"
            ? (selector as (value: typeof state) => unknown)(state)
            : state;
    },
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
        useSitesStoreMock.mockClear();
        resetSitesStoreState();
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
