/**
 * @file Comprehensive behavioral coverage tests for `AddSiteForm` focusing on
 *   branch-heavy handlers and derived callbacks to improve overall coverage.
 */

import type { HTMLAttributes, ReactNode } from "react";
import type { Site } from "@shared/types";

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DynamicMonitorFieldsProperties } from "../../components/AddSiteForm/DynamicMonitorFields";
import type { SelectFieldProperties } from "../../components/AddSiteForm/SelectField";
import type { UseAddSiteFormReturn } from "../../components/SiteDetails/useAddSiteForm";
import type { SelectorHookMock } from "../utils/createSelectorHookMock";
import { createSelectorHookMock } from "../utils/createSelectorHookMock";
import { createMockSite } from "../utils/mockFactories";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../utils/createSitesStoreMock";
import type { SitesStore } from "../utils/createSitesStoreMock";

const handleSubmitMock = vi.fn();

vi.mock("../../components/AddSiteForm/Submit", () => ({
    handleSubmit: (...args: Parameters<typeof handleSubmitMock>) =>
        handleSubmitMock(...args),
}));

const loggerModuleMock = vi.hoisted(() => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../services/logger", () => loggerModuleMock);

const loggerErrorMock = loggerModuleMock.logger.error;
const loggerWarnMock = loggerModuleMock.logger.warn;

const useAddSiteFormMock = vi.fn<() => UseAddSiteFormReturn>();

vi.mock("../../components/SiteDetails/useAddSiteForm", () => ({
    useAddSiteForm: () => useAddSiteFormMock(),
}));

const createDefaultSites = (): Site[] => [
    createMockSite({
        identifier: "site-1",
        monitors: [],
        name: "Behavioural Test Site 1",
    }),
];

const sitesStoreState = createSitesStoreMock({
    addMonitorToSite: vi.fn(),
    createSite: vi.fn(),
    sites: createDefaultSites(),
});

const useSitesStoreMock: SelectorHookMock<SitesStore> =
    createSelectorHookMock(sitesStoreState);

vi.mock("../../stores/sites/useSitesStore", () => ({
    get useSitesStore() {
        if (!useSitesStoreMock) {
            throw new Error("useSitesStoreMock accessed before initialization");
        }

        return useSitesStoreMock;
    },
}));

const useErrorStoreMock = vi.fn();

vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: (selector?: (state: unknown) => unknown) => {
        const state = useErrorStoreMock();
        return typeof selector === "function" ? selector(state) : state;
    },
}));

const useMonitorTypesMock = vi.fn();

vi.mock("../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: () => useMonitorTypesMock(),
}));

const useDelayedButtonLoadingMock = vi.fn();

vi.mock("../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: (
        ...args: Parameters<typeof useDelayedButtonLoadingMock>
    ) => useDelayedButtonLoadingMock(...args),
}));

const useDynamicHelpTextMock = vi.fn();

vi.mock("../../hooks/useDynamicHelpText", () => ({
    useDynamicHelpText: (...args: Parameters<typeof useDynamicHelpTextMock>) =>
        useDynamicHelpTextMock(...args),
}));

const selectFieldProps = new Map<string, SelectFieldProperties>();

vi.mock("../../components/AddSiteForm/SelectField", () => ({
    SelectField: (props: SelectFieldProperties) => {
        selectFieldProps.set(props.id, props);
        return (
            <div data-testid={`mock-select-${props.id}`}>
                <span>{props.label}</span>
            </div>
        );
    },
}));

const textFieldProps = new Map<string, Record<string, unknown>>();

vi.mock("../../components/AddSiteForm/TextField", () => ({
    TextField: (props: Record<string, unknown>) => {
        textFieldProps.set(props["id"] as string, props);
        return (
            <div data-testid={`mock-text-${String(props["id"])}`}>
                <span>{String(props["label"] ?? "")}</span>
            </div>
        );
    },
}));

interface RadioGroupProperties {
    id: string;
    label: string;
    onChange: (value: string) => void;
    value: string;
}

let radioGroupProps: RadioGroupProperties | undefined;

vi.mock("../../components/AddSiteForm/RadioGroup", () => ({
    RadioGroup: (props: RadioGroupProperties) => {
        radioGroupProps = props;
        return (
            <div data-testid={`mock-radio-${props.id}`}>
                <span>{props.label}</span>
            </div>
        );
    },
}));

let dynamicMonitorFieldsProps: DynamicMonitorFieldsProperties | undefined;

vi.mock("../../components/AddSiteForm/DynamicMonitorFields", () => ({
    DynamicMonitorFields: (props: DynamicMonitorFieldsProperties) => {
        dynamicMonitorFieldsProps = props;
        return <div data-testid="mock-dynamic-fields" />;
    },
}));

interface SurfaceContainerProperties extends HTMLAttributes<HTMLDivElement> {
    readonly children?: ReactNode;
}

vi.mock("../../components/shared/SurfaceContainer", () => ({
    SurfaceContainer: ({ children, ...props }: SurfaceContainerProperties) => (
        <div {...props}>{children}</div>
    ),
}));

interface ThemedButtonProperties {
    readonly "data-testid"?: string;
    readonly disabled?: boolean;
    readonly fullWidth?: boolean;
    readonly loading?: boolean;
    readonly onClick?: () => void;
    readonly type?: "button" | "submit" | "reset";
    readonly variant?: string;
    readonly children: ReactNode;
}

interface ThemedButtonSnapshot {
    readonly dataTestId: string | undefined;
    readonly disabled: boolean;
    readonly loading: boolean;
    readonly type: "button" | "submit" | "reset";
}

let themedButtonProps: ThemedButtonSnapshot | undefined;

vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        loading = false,
        variant: _variant,
        fullWidth: _fullWidth,
        onClick,
        disabled = false,
        type = "button",
        "data-testid": dataTestId,
    }: ThemedButtonProperties) => {
        themedButtonProps = {
            dataTestId: dataTestId ?? undefined,
            disabled,
            loading,
            type,
        };

        return (
            <button
                data-loading={loading ? "true" : "false"}
                data-testid={dataTestId}
                disabled={disabled}
                onClick={onClick}
                type={type}
            >
                {children}
            </button>
        );
    },
}));

interface ErrorAlertProperties {
    message: string;
    onDismiss: () => void;
    variant: string;
}

let errorAlertProps: ErrorAlertProperties | undefined;

vi.mock("../../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: (props: ErrorAlertProperties) => {
        errorAlertProps = props;
        return (
            <div data-testid="mock-error-alert">
                <span>{props.message}</span>
            </div>
        );
    },
}));

interface ThemedTextProperties extends HTMLAttributes<HTMLSpanElement> {
    readonly children?: ReactNode;
}

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: ({ children, ...props }: ThemedTextProperties) => (
        <span {...props}>{children}</span>
    ),
}));

import { AddSiteForm } from "../../components/AddSiteForm/AddSiteForm";

interface FormStateReferences {
    setAddMode: ReturnType<typeof vi.fn>;
    setBaselineUrl: ReturnType<typeof vi.fn>;
    setBodyKeyword: ReturnType<typeof vi.fn>;
    setCertificateWarningDays: ReturnType<typeof vi.fn>;
    setCheckIntervalMs: ReturnType<typeof vi.fn>;
    setEdgeLocations: ReturnType<typeof vi.fn>;
    setExpectedHeaderValue: ReturnType<typeof vi.fn>;
    setExpectedJsonValue: ReturnType<typeof vi.fn>;
    setExpectedStatusCode: ReturnType<typeof vi.fn>;
    setExpectedValue: ReturnType<typeof vi.fn>;
    setFormError: ReturnType<typeof vi.fn>;
    setHeaderName: ReturnType<typeof vi.fn>;
    setHeartbeatExpectedStatus: ReturnType<typeof vi.fn>;
    setHeartbeatMaxDriftSeconds: ReturnType<typeof vi.fn>;
    setHeartbeatStatusField: ReturnType<typeof vi.fn>;
    setHeartbeatTimestampField: ReturnType<typeof vi.fn>;
    setHost: ReturnType<typeof vi.fn>;
    setJsonPath: ReturnType<typeof vi.fn>;
    setMaxPongDelayMs: ReturnType<typeof vi.fn>;
    setMaxReplicationLagSeconds: ReturnType<typeof vi.fn>;
    setMaxResponseTime: ReturnType<typeof vi.fn>;
    setMonitorType: ReturnType<typeof vi.fn>;
    setName: ReturnType<typeof vi.fn>;
    setPort: ReturnType<typeof vi.fn>;
    setPrimaryStatusUrl: ReturnType<typeof vi.fn>;
    setRecordType: ReturnType<typeof vi.fn>;
    setReplicaStatusUrl: ReturnType<typeof vi.fn>;
    setReplicationTimestampField: ReturnType<typeof vi.fn>;
    setSelectedExistingSite: ReturnType<typeof vi.fn>;
    setSiteIdentifier: ReturnType<typeof vi.fn>;
    setUrl: ReturnType<typeof vi.fn>;
    resetForm: ReturnType<typeof vi.fn>;
}

let formStateRefs: FormStateReferences & UseAddSiteFormReturn;

const createFormState = (
    overrides: Partial<UseAddSiteFormReturn> = {}
): UseAddSiteFormReturn => {
    const defaultSetter = () => vi.fn();

    const base: UseAddSiteFormReturn = {
        addMode: "new",
        baselineUrl: "",
        bodyKeyword: "",
        certificateWarningDays: "",
        checkIntervalMs: 60_000,
        edgeLocations: "",
        expectedHeaderValue: "",
        expectedJsonValue: "",
        expectedStatusCode: "",
        expectedValue: "",
        formError: undefined,
        headerName: "",
        heartbeatExpectedStatus: "",
        heartbeatMaxDriftSeconds: "",
        heartbeatStatusField: "",
        heartbeatTimestampField: "",
        host: "",
        isFormValid: vi.fn().mockReturnValue(true),
        jsonPath: "",
        maxPongDelayMs: "",
        maxReplicationLagSeconds: "",
        maxResponseTime: "",
        monitorType: "http",
        name: "My Site",
        port: "80",
        primaryStatusUrl: "",
        recordType: "A",
        replicaStatusUrl: "",
        replicationTimestampField: "",
        resetForm: defaultSetter(),
        selectedExistingSite: "",
        setAddMode: defaultSetter(),
        setBaselineUrl: defaultSetter(),
        setBodyKeyword: defaultSetter(),
        setCertificateWarningDays: defaultSetter(),
        setCheckIntervalMs: defaultSetter(),
        setEdgeLocations: defaultSetter(),
        setExpectedHeaderValue: defaultSetter(),
        setExpectedJsonValue: defaultSetter(),
        setExpectedStatusCode: defaultSetter(),
        setExpectedValue: defaultSetter(),
        setFormError: defaultSetter(),
        setHeaderName: defaultSetter(),
        setHeartbeatExpectedStatus: defaultSetter(),
        setHeartbeatMaxDriftSeconds: defaultSetter(),
        setHeartbeatStatusField: defaultSetter(),
        setHeartbeatTimestampField: defaultSetter(),
        setHost: defaultSetter(),
        setJsonPath: defaultSetter(),
        setMaxPongDelayMs: defaultSetter(),
        setMaxReplicationLagSeconds: defaultSetter(),
        setMaxResponseTime: defaultSetter(),
        setMonitorType: defaultSetter(),
        setName: defaultSetter(),
        setPort: defaultSetter(),
        setPrimaryStatusUrl: defaultSetter(),
        setRecordType: defaultSetter(),
        setReplicaStatusUrl: defaultSetter(),
        setReplicationTimestampField: defaultSetter(),
        setSelectedExistingSite: defaultSetter(),
        setSiteIdentifier: defaultSetter(),
        setUrl: defaultSetter(),
        siteIdentifier: "site-identifier-123",
        url: "https://example.com",
    };

    const combined = { ...base, ...overrides } as UseAddSiteFormReturn;
    formStateRefs = combined as FormStateReferences & UseAddSiteFormReturn;
    return combined;
};

describe("AddSiteForm behavioral coverage", () => {
    beforeEach(() => {
        handleSubmitMock.mockReset();
        handleSubmitMock.mockImplementation(async (_event, payload) => {
            payload?.onSuccess?.();
        });
        loggerErrorMock.mockReset();
        loggerWarnMock.mockReset();
        useDelayedButtonLoadingMock.mockReset();
        useAddSiteFormMock.mockReset();
        selectFieldProps.clear();
        textFieldProps.clear();
        radioGroupProps = undefined;
        dynamicMonitorFieldsProps = undefined;
        themedButtonProps = undefined;
        errorAlertProps = undefined;

        useAddSiteFormMock.mockImplementation(() => createFormState());
        useSitesStoreMock.mockClear();
        updateSitesStoreMock(sitesStoreState, {
            addMonitorToSite: vi.fn(),
            createSite: vi.fn(),
            sites: [
                createMockSite({
                    identifier: "site-1",
                    monitors: [],
                    name: "Primary",
                }),
                createMockSite({
                    identifier: "site-2",
                    monitors: [],
                    name: "Secondary",
                }),
            ],
        });
        useErrorStoreMock.mockReturnValue({
            clearError: vi.fn(),
            isLoading: false,
            lastError: undefined,
        });
        useMonitorTypesMock.mockReturnValue({
            isLoading: false,
            options: [
                { label: "HTTP", value: "http" },
                { label: "DNS", value: "dns" },
            ],
        });
        useDelayedButtonLoadingMock.mockReturnValue(false);
        useDynamicHelpTextMock.mockReturnValue({
            primary: "Primary guidance",
            secondary: "Secondary guidance",
        });
    });

    it("wires monitor and interval selects with validation logging", () => {
        render(<AddSiteForm />);

        const monitorSelect = selectFieldProps.get("monitorType");
        expect(monitorSelect).toBeDefined();
        monitorSelect?.onChange("dns");
        expect(formStateRefs.setMonitorType).toHaveBeenCalledWith("dns");

        monitorSelect?.onChange("unsupported-type");
        expect(loggerErrorMock).toHaveBeenCalledWith(
            "Invalid monitor type value: unsupported-type"
        );

        const intervalSelect = selectFieldProps.get("checkInterval");
        expect(intervalSelect).toBeDefined();
        intervalSelect?.onChange("120000");
        expect(formStateRefs.setCheckIntervalMs).toHaveBeenCalledWith(120_000);

        intervalSelect?.onChange("NaN-value");
        expect(loggerErrorMock).toHaveBeenCalledWith(
            "Invalid check interval value: NaN-value"
        );
    });

    it("provides dynamic field handlers that coerce values to strings", () => {
        render(<AddSiteForm />);
        expect(dynamicMonitorFieldsProps).toBeDefined();
        expect(formStateRefs).toBeDefined();
        const { onChange } = dynamicMonitorFieldsProps!;

        for (const [fieldName, handler] of Object.entries(onChange)) {
            handler(123);
            const setterName =
                `set${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}` as keyof FormStateReferences;
            const setter = (formStateRefs as FormStateReferences)[setterName];
            expect(setter).toBeDefined();
            expect(setter).toHaveBeenCalledWith("123");
        }
    });

    it("toggles add mode and logs invalid selections", () => {
        render(<AddSiteForm />);
        expect(radioGroupProps).toBeDefined();
        radioGroupProps?.onChange("existing");
        expect(formStateRefs.setAddMode).toHaveBeenCalledWith("existing");
        radioGroupProps?.onChange("unsupported");
        expect(loggerErrorMock).toHaveBeenCalledWith(
            "Invalid add mode value: unsupported"
        );
    });

    it("renders new-site fields and help text guidance", () => {
        render(<AddSiteForm />);
        expect(textFieldProps.has("siteName")).toBeTruthy();
        expect(screen.getByText(/site identifier:/i)).toBeInTheDocument();
        expect(
            within(screen.getByTestId("add-site-form")).getByText(
                /primary guidance/i
            )
        ).toBeInTheDocument();
        expect(
            within(screen.getByTestId("add-site-form")).getByText(
                /secondary guidance/i
            )
        ).toBeInTheDocument();
    });

    it("renders existing-site pathway with selection handlers", () => {
        useAddSiteFormMock.mockImplementation(() =>
            createFormState({
                addMode: "existing",
                selectedExistingSite: "site-1",
            })
        );
        render(<AddSiteForm />);

        const existingSiteSelect = selectFieldProps.get("selectedSite");
        expect(existingSiteSelect).toBeDefined();
        existingSiteSelect?.onChange("site-2");
        expect(formStateRefs.setSelectedExistingSite).toHaveBeenCalledWith(
            "site-2"
        );
    });

    it("submits form successfully and triggers success callbacks", async () => {
        const onSuccess = vi.fn();
        render(<AddSiteForm onSuccess={onSuccess} />);

        const form = screen.getByTestId("add-site-form");
        fireEvent.submit(form);

        await waitFor(() => expect(handleSubmitMock).toHaveBeenCalledTimes(1));
        const callArguments = handleSubmitMock.mock.calls[0];
        expect(callArguments).toBeDefined();
        const submissionPayload = callArguments?.[1];
        expect(submissionPayload).toMatchObject({
            addMode: "new",
            monitorType: "http",
        });

        // The submit handler wires the provided onSuccess callback via the
        // AddSiteForm's internal handleSuccess helper. Verifying that
        // onSuccess has been invoked is sufficient to confirm the success
        // pipeline executed; the underlying form reset behavior is covered by
        // dedicated store tests.
        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(useDelayedButtonLoadingMock).toHaveBeenCalledWith(false);
        expect(themedButtonProps?.loading).toBeFalsy();
    });

    it("handles submission errors by logging the failure", async () => {
        handleSubmitMock.mockImplementationOnce(async () => {
            throw new Error("network failure");
        });
        render(<AddSiteForm />);
        const form = screen.getByTestId("add-site-form");
        fireEvent.submit(form);
        await waitFor(() => expect(handleSubmitMock).toHaveBeenCalled());
        await waitFor(() =>
            expect(loggerErrorMock).toHaveBeenCalledWith(
                "Form submission failed:",
                expect.objectContaining({ message: "network failure" })
            )
        );
    });

    it("displays errors and clears them via alert dismiss", () => {
        const clearErrorSpy = vi.fn();
        const setFormErrorSpy = vi.fn();
        useErrorStoreMock.mockReturnValue({
            clearError: clearErrorSpy,
            isLoading: false,
            lastError: "remote failure",
        });
        useAddSiteFormMock.mockImplementation(() =>
            createFormState({
                formError: "validation failed",
                setFormError: setFormErrorSpy,
            })
        );

        render(<AddSiteForm />);
        expect(errorAlertProps).toBeDefined();
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
        errorAlertProps?.onDismiss();
        expect(clearErrorSpy).toHaveBeenCalled();
        expect(setFormErrorSpy).toHaveBeenCalledWith(undefined);
    });

    it("hides optional help text when not provided", () => {
        useDynamicHelpTextMock.mockReturnValue({
            primary: undefined,
            secondary: undefined,
        });
        render(<AddSiteForm />);
        expect(
            within(screen.getByTestId("add-site-form")).queryByText(/guidance/i)
        ).toBeNull();
    });
});
