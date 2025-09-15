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

import { useCallback, useEffect, useState } from "react";

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
    /** Set check interval */
    setCheckInterval: (value: number) => void;
    /** Set expected value field value */
    setExpectedValue: (value: string) => void;
    /** Set form error message */
    setFormError: (error: string | undefined) => void;
    /** Set host field value */
    setHost: (value: string) => void;
    /** Set monitor type */
    setMonitorType: (value: MonitorType) => void;
    /** Set site name field value */
    setName: (value: string) => void;
    /** Set port field value */
    setPort: (value: string) => void;
    /** Set record type field value */
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
    /** Check interval in milliseconds */
    checkInterval: number;
    /** Expected DNS record value field for DNS monitors */
    expectedValue: string;
    /** Current form validation error */
    formError: string | undefined;
    /** Host/IP field for port and DNS monitors */
    host: string;
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
    setters: {
        setExpectedValue: (value: string) => void;
        setHost: (value: string) => void;
        setPort: (value: string) => void;
        setRecordType: (value: string) => void;
        setUrl: (value: string) => void;
    }
): void => {
    // Reset fields that are not used by the current monitor type
    if (!currentFieldNames.has("url")) {
        setters.setUrl("");
    }
    if (!currentFieldNames.has("host")) {
        setters.setHost("");
    }
    if (!currentFieldNames.has("port")) {
        setters.setPort("");
    }
    if (!currentFieldNames.has("recordType")) {
        setters.setRecordType("A");
    }
    if (!currentFieldNames.has("expectedValue")) {
        setters.setExpectedValue("");
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
        expectedValue: string;
        host: string;
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
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<MonitorType>("http");
    const [checkInterval, setCheckInterval] = useState(DEFAULT_CHECK_INTERVAL);
    const [siteId, setSiteId] = useState<string>(() => generateUuid()); // Lazy initialization

    // Mode and selection state
    const [addMode, setAddMode] = useState<FormMode>("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState("");

    // UI state
    const [formError, setFormError] = useState<string | undefined>();

    // Use monitor fields hook for dynamic validation
    const { getFields } = useMonitorFields();

    // Compute effective field values based on monitor type during render
    const currentFields = getFields(monitorType);

    // Reset fields when monitor type changes - using useEffect to avoid render-time setState
    useEffect(
        function resetFieldsOnMonitorTypeChange() {
            const currentFieldNames = new Set(
                currentFields.map((field) => field.name)
            );
            resetFieldsForMonitorType(currentFieldNames, {
                setExpectedValue,
                setHost,
                setPort,
                setRecordType,
                setUrl,
            });
        },
        [
            currentFields,
            setExpectedValue,
            setHost,
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

    // Simple validation function without logging - only used for submit button
    // state
    const isFormValid = useCallback(
        () =>
            validateFormFields(
                addMode,
                name,
                selectedExistingSite,
                monitorType,
                { expectedValue, host, port, recordType, url },
                getFields
            ),
        [
            addMode,
            expectedValue,
            getFields,
            host,
            monitorType,
            name,
            port,
            recordType,
            selectedExistingSite,
            url,
        ]
    );

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setUrl("");
        setHost("");
        setPort("");
        setRecordType("A");
        setExpectedValue("");
        setName("");
        setMonitorType("http");
        setCheckInterval(DEFAULT_CHECK_INTERVAL);
        setSiteId(generateUuid());
        setAddMode("new");
        setSelectedExistingSite("");
        setFormError(undefined);
    }, []);

    return {
        // State
        addMode,
        checkInterval,
        expectedValue,
        formError,
        host,
        isFormValid,
        monitorType,
        name,
        port,
        recordType,
        resetForm,
        selectedExistingSite,
        setAddMode,
        setCheckInterval,
        setExpectedValue,
        setFormError,
        setHost,
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
