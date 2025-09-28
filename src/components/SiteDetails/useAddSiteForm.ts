/**
 * Custom hook for managing add site form state and validation.
 *
 * @remarks
 * Provides comprehensive form state management for creating new sites and
 * adding monitors to existing sites. Supports real-time validation, automatic
 * UUID generation, and error handling. This hook uses render-time state
 * management with previous value tracking to handle state resets when the
 * selected monitor changes, following modern React patterns that avoid direct
 * setState calls in useEffect hooks.
 *
 * The hook manages two distinct operation modes:
 *
 * - "new": Creates a new site with the first monitor
 * - "existing": Adds a monitor to an existing site
 *
 * @example Basic usage in a form component:
 *
 * ```typescript
 * function AddSiteForm() {
 *   const {
 *     addMode,
 *     setAddMode,
 *     isFormValid,
 *     resetForm,
 *     // ... other properties
 *   } = useAddSiteForm();
 *
 *   const handleSubmit = () => {
 *     if (isFormValid()) {
 *       // Process form data
 *     }
 *   };
 *
 *   return (
 *     // Form JSX using the hook's state and actions
 *   );
 * }
 * ```
 *
 * @public
 */

import type { MonitorType } from "@shared/types";
import type { Simplify } from "type-fest";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { useMonitorFields } from "../../hooks/useMonitorFields";
import { generateUuid } from "../../utils/data/generateUuid";

/**
 * Form actions interface containing all form manipulation functions.
 *
 * @remarks
 * Provides a complete set of methods for manipulating form state, including
 * validation, field updates, and form lifecycle management. All setter methods
 * trigger re-renders and validation updates.
 *
 * @public
 */
export interface AddSiteFormActions {
    /** Whether the form is currently valid */
    isFormValid: () => boolean;
    /** Reset form to initial state */
    resetForm: () => void;
    /** Set form operation mode */
    setAddMode: (value: FormMode) => void;
    /** Set response body keyword */
    setBodyKeyword: (value: string) => void;
    /** Set SSL certificate warning days */
    setCertificateWarningDays: (value: string) => void;
    /** Set check interval */
    setCheckInterval: (value: number) => void;
    /** Set expected header value */
    setExpectedHeaderValue: (value: string) => void;
    /** Set expected JSON value */
    setExpectedJsonValue: (value: string) => void;
    /** Set expected HTTP status code */
    setExpectedStatusCode: (value: string) => void;
    /** Set expected value field value */
    setExpectedValue: (value: string) => void;
    /** Set form error message */
    setFormError: (error: string | undefined) => void;
    /** Set HTTP header name */
    setHeaderName: (value: string) => void;
    /** Set host field value */
    setHost: (value: string) => void;
    /** Set JSON path */
    setJsonPath: (value: string) => void;
    /** Set latency max response time */
    setMaxResponseTime: (value: string) => void;
    /** Set monitor type */
    setMonitorType: (value: MonitorType) => void;
    /** Set site name field value */
    setName: (value: string) => void;
    /** Set port field value */
    setPort: (value: string) => void;
    /** Set DNS record type field value */
    setRecordType: (value: string) => void;
    /** Set selected existing site */
    setSelectedExistingSite: (value: string) => void;
    /** Set site ID */
    setSiteId: (value: string) => void;
    /** Set URL field value */
    setUrl: (value: string) => void;
}

/**
 * Form state interface containing all form field values and UI state.
 *
 * @remarks
 * Represents the complete state of the add site form, including field values,
 * validation state, and operation mode. Field visibility and requirements
 * change based on the selected monitor type and operation mode.
 *
 * @public
 */
export interface AddSiteFormState {
    /** Form operation mode (new site vs existing site) */
    addMode: FormMode;
    /** Keyword to match for HTTP keyword monitors */
    bodyKeyword: string;
    /** SSL certificate warning days */
    certificateWarningDays: string;
    /** Check interval in milliseconds */
    checkInterval: number;
    /** Expected HTTP header value for header monitors */
    expectedHeaderValue: string;
    /** Expected JSON value for JSON monitors */
    expectedJsonValue: string;
    /** Expected HTTP status code for status-based HTTP monitors */
    expectedStatusCode: string;
    /** Expected DNS record value field for DNS monitors */
    expectedValue: string;
    /** Current form validation error */
    formError: string | undefined;
    /** Header name for HTTP header monitors */
    headerName: string;
    /** Host/IP field for port and DNS monitors */
    host: string;
    /** JSON path for HTTP JSON monitors */
    jsonPath: string;
    /** Maximum response time for latency monitors */
    maxResponseTime: string;
    /** Selected monitor type */
    monitorType: MonitorType;
    /** Display name for the site */
    name: string;
    /** Port number field for port monitors */
    port: string;
    /** DNS record type field for DNS monitors */
    recordType: string;
    /** Selected existing site ID when adding to existing */
    selectedExistingSite: string;
    /** Generated site identifier */
    siteId: string;
    /** URL field for HTTP monitors */
    url: string;
}

/**
 * Form operation mode type.
 */
export type FormMode = "existing" | "new";

/**
 * Complete form hook return type combining actions and state.
 */
export type UseAddSiteFormReturn = Simplify<
    AddSiteFormActions & AddSiteFormState
>;

// Helper functions for add site form logic (reduces function length by
// composition)
const resetFieldsForMonitorType = (
    currentFieldNames: Set<string>,
    currentValues: {
        bodyKeyword: string;
        certificateWarningDays: string;
        expectedHeaderValue: string;
        expectedJsonValue: string;
        expectedStatusCode: string;
        expectedValue: string;
        headerName: string;
        host: string;
        jsonPath: string;
        maxResponseTime: string;
        port: string;
        recordType: string;
        url: string;
    },
    setters: {
        setBodyKeyword: (value: string) => void;
        setCertificateWarningDays: (value: string) => void;
        setExpectedHeaderValue: (value: string) => void;
        setExpectedJsonValue: (value: string) => void;
        setExpectedStatusCode: (value: string) => void;
        setExpectedValue: (value: string) => void;
        setHeaderName: (value: string) => void;
        setHost: (value: string) => void;
        setJsonPath: (value: string) => void;
        setMaxResponseTime: (value: string) => void;
        setPort: (value: string) => void;
        setRecordType: (value: string) => void;
        setUrl: (value: string) => void;
    }
): void => {
    const fieldResetters: Array<{
        defaultValue: string;
        name: string;
        setter: (value: string) => void;
        value: string;
    }> = [
        {
            defaultValue: "",
            name: "url",
            setter: setters.setUrl,
            value: currentValues.url,
        },
        {
            defaultValue: "",
            name: "host",
            setter: setters.setHost,
            value: currentValues.host,
        },
        {
            defaultValue: "",
            name: "port",
            setter: setters.setPort,
            value: currentValues.port,
        },
        {
            defaultValue: "A",
            name: "recordType",
            setter: setters.setRecordType,
            value: currentValues.recordType,
        },
        {
            defaultValue: "",
            name: "expectedValue",
            setter: setters.setExpectedValue,
            value: currentValues.expectedValue,
        },
        {
            defaultValue: "30",
            name: "certificateWarningDays",
            setter: setters.setCertificateWarningDays,
            value: currentValues.certificateWarningDays,
        },
        {
            defaultValue: "",
            name: "bodyKeyword",
            setter: setters.setBodyKeyword,
            value: currentValues.bodyKeyword,
        },
        {
            defaultValue: "200",
            name: "expectedStatusCode",
            setter: setters.setExpectedStatusCode,
            value: currentValues.expectedStatusCode,
        },
        {
            defaultValue: "",
            name: "headerName",
            setter: setters.setHeaderName,
            value: currentValues.headerName,
        },
        {
            defaultValue: "",
            name: "expectedHeaderValue",
            setter: setters.setExpectedHeaderValue,
            value: currentValues.expectedHeaderValue,
        },
        {
            defaultValue: "",
            name: "jsonPath",
            setter: setters.setJsonPath,
            value: currentValues.jsonPath,
        },
        {
            defaultValue: "",
            name: "expectedJsonValue",
            setter: setters.setExpectedJsonValue,
            value: currentValues.expectedJsonValue,
        },
        {
            defaultValue: "2000",
            name: "maxResponseTime",
            setter: setters.setMaxResponseTime,
            value: currentValues.maxResponseTime,
        },
    ];

    for (const field of fieldResetters) {
        if (
            !currentFieldNames.has(field.name) &&
            field.value !== field.defaultValue
        ) {
            field.setter(field.defaultValue);
        }
    }
};

const resetFieldsForModeChange = (
    addMode: FormMode,
    setters: {
        setName: (value: string) => void;
        setSiteId: (value: string) => void;
    }
): void => {
    if (addMode === "new") {
        setters.setName("");
        setters.setSiteId(generateUuid());
    } else {
        setters.setName("");
    }
};

/**
 * Validates form fields based on operation mode and monitor type requirements.
 *
 * @remarks
 * Performs comprehensive validation including mode-specific checks (site name
 * for new sites, existing site selection for existing sites) and dynamic field
 * validation based on the selected monitor type's required fields.
 *
 * @param addMode - Form operation mode (new site vs existing site)
 * @param name - Site name for new sites
 * @param selectedExistingSite - Selected existing site for monitor addition
 * @param monitorType - Type of monitor being configured
 * @param fieldValues - Current field values from the form
 * @param getFields - Function to get required fields for monitor type
 *
 * @returns True if form data is valid, false otherwise
 *
 * @internal
 */
const validateFormFields = (
    addMode: FormMode,
    name: string,
    selectedExistingSite: string,
    monitorType: MonitorType,
    fieldValues: {
        bodyKeyword: string;
        certificateWarningDays: string;
        expectedHeaderValue: string;
        expectedJsonValue: string;
        expectedStatusCode: string;
        expectedValue: string;
        headerName: string;
        host: string;
        jsonPath: string;
        maxResponseTime: string;
        port: string;
        recordType: string;
        url: string;
    },
    getFields: (type: MonitorType) => Array<{ name: string; required: boolean }>
): boolean => {
    // Basic validation for mode and name
    if (addMode === "new" && !name.trim()) {
        return false;
    }
    if (addMode === "existing" && !selectedExistingSite) {
        return false;
    }

    // Dynamic validation based on monitor type fields
    const currentFields = getFields(monitorType);
    for (const field of currentFields) {
        if (field.required) {
            const value =
                field.name in fieldValues
                    ? /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Runtime check confirms field.name exists in fieldValues */
                      fieldValues[field.name as keyof typeof fieldValues] || ""
                    : "";
            if (!value.trim()) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Hook for managing add site form state and operations.
 *
 * @remarks
 * Provides comprehensive form state management with real-time validation,
 * support for both new sites and adding monitors to existing sites. Handles
 * dynamic field validation based on monitor type and maintains proper form
 * state throughout the user interaction lifecycle.
 *
 * @returns Combined form state and action handlers containing all form fields,
 *   validation state, and manipulation functions for managing the add site
 *   form
 */
export function useAddSiteForm(): UseAddSiteFormReturn {
    // Form field state
    const [url, setUrl] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [recordType, setRecordType] = useState("A");
    const [expectedValue, setExpectedValue] = useState("");
    const [bodyKeyword, setBodyKeyword] = useState("");
    const [expectedStatusCode, setExpectedStatusCode] = useState("200");
    const [expectedHeaderValue, setExpectedHeaderValue] = useState("");
    const [expectedJsonValue, setExpectedJsonValue] = useState("");
    const [headerName, setHeaderName] = useState("");
    const [jsonPath, setJsonPath] = useState("");
    const [maxResponseTime, setMaxResponseTime] = useState("2000");
    const [certificateWarningDays, setCertificateWarningDays] = useState("30");
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<MonitorType>("http");
    const [checkInterval, setCheckInterval] = useState(DEFAULT_CHECK_INTERVAL);
    const [siteId, setSiteId] = useState<string>(() => generateUuid()); // Lazy initialization

    const monitorFieldValues = useMemo(
        () => ({
            bodyKeyword,
            certificateWarningDays,
            expectedHeaderValue,
            expectedJsonValue,
            expectedStatusCode,
            expectedValue,
            headerName,
            host,
            jsonPath,
            maxResponseTime,
            port,
            recordType,
            url,
        }),
        [
            bodyKeyword,
            certificateWarningDays,
            expectedHeaderValue,
            expectedJsonValue,
            expectedStatusCode,
            expectedValue,
            headerName,
            host,
            jsonPath,
            maxResponseTime,
            port,
            recordType,
            url,
        ]
    );

    // Mode and selection state
    const [addMode, setAddMode] = useState<FormMode>("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState("");

    // UI state
    const [formError, setFormError] = useState<string | undefined>();

    // Use monitor fields hook for dynamic validation
    const { getFields } = useMonitorFields();

    // Reset fields when monitor type changes - using useEffect to avoid render-time setState
    useEffect(
        function resetFieldsOnMonitorTypeChange() {
            const fieldDefinitions = getFields(monitorType);
            const currentFieldNames = new Set(
                fieldDefinitions.map((field) => field.name)
            );
            resetFieldsForMonitorType(currentFieldNames, monitorFieldValues, {
                setBodyKeyword,
                setCertificateWarningDays,
                setExpectedHeaderValue,
                setExpectedJsonValue,
                setExpectedStatusCode,
                setExpectedValue,
                setHeaderName,
                setHost,
                setJsonPath,
                setMaxResponseTime,
                setPort,
                setRecordType,
                setUrl,
            });
        },
        [
            getFields,
            monitorFieldValues,
            monitorType,
            setBodyKeyword,
            setCertificateWarningDays,
            setExpectedHeaderValue,
            setExpectedJsonValue,
            setExpectedStatusCode,
            setExpectedValue,
            setHeaderName,
            setHost,
            setJsonPath,
            setMaxResponseTime,
            setPort,
            setRecordType,
            setUrl,
        ]
    );

    // Reset name and siteId when switching modes - using useEffect to avoid render-time setState
    useEffect(
        function resetFieldsOnAddModeChange() {
            resetFieldsForModeChange(addMode, { setName, setSiteId });
        },
        [
            addMode,
            setName,
            setSiteId,
        ]
    );

    const isFormValid = useCallback(
        () =>
            validateFormFields(
                addMode,
                name,
                selectedExistingSite,
                monitorType,
                monitorFieldValues,
                getFields
            ),
        [
            addMode,
            getFields,
            monitorFieldValues,
            monitorType,
            name,
            selectedExistingSite,
        ]
    );

    const resetForm = useCallback(() => {
        setUrl("");
        setHost("");
        setPort("");
        setRecordType("A");
        setExpectedValue("");
        setBodyKeyword("");
        setExpectedStatusCode("200");
        setExpectedHeaderValue("");
        setExpectedJsonValue("");
        setHeaderName("");
        setJsonPath("");
        setMaxResponseTime("2000");
        setCertificateWarningDays("30");
        setName("");
        setMonitorType("http");
        setCheckInterval(DEFAULT_CHECK_INTERVAL);
        setSiteId(generateUuid());
        setAddMode("new");
        setSelectedExistingSite("");
        setFormError(undefined);
    }, [
        setAddMode,
        setBodyKeyword,
        setCertificateWarningDays,
        setCheckInterval,
        setExpectedHeaderValue,
        setExpectedJsonValue,
        setExpectedStatusCode,
        setExpectedValue,
        setFormError,
        setHeaderName,
        setHost,
        setJsonPath,
        setMaxResponseTime,
        setMonitorType,
        setName,
        setPort,
        setRecordType,
        setSelectedExistingSite,
        setSiteId,
        setUrl,
    ]);

    return {
        // State
        addMode,
        bodyKeyword,
        certificateWarningDays,
        checkInterval,
        expectedHeaderValue,
        expectedJsonValue,
        expectedStatusCode,
        expectedValue,
        formError,
        headerName,
        host,
        isFormValid,
        jsonPath,
        maxResponseTime,
        monitorType,
        name,
        port,
        recordType,
        resetForm,
        selectedExistingSite,
        setAddMode,
        setBodyKeyword,
        setCertificateWarningDays,
        setCheckInterval,
        setExpectedHeaderValue,
        setExpectedJsonValue,
        setExpectedStatusCode,
        setExpectedValue,
        setFormError,
        setHeaderName,
        setHost,
        setJsonPath,
        setMaxResponseTime,
        setMonitorType,
        setName,
        setPort,
        setRecordType,
        setSelectedExistingSite,
        setSiteId,
        setUrl,
        siteId,
        url,
    };
}
