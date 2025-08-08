/**
 * Custom hook for managing add site form state and validation.
 *
 * Provides comprehensive form state management for creating new sites and adding monitors to existing sites.
 * Supports real-time validation, automatic UUID generation, and error handling.
 *
 * @remarks
 * This hook uses render-time state management with previous value tracking to handle
 * state resets when the selected monitor changes, following modern React patterns
 * that avoid direct setState calls in useEffect hooks.
 */

import { useCallback, useState } from "react";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { useMonitorFields } from "../../hooks/useMonitorFields";
import { type MonitorType } from "../../types";
import { generateUuid } from "../../utils/data/generateUuid";

/**
 * Form actions interface containing all form manipulation functions.
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
    /** Set selected existing site */
    setSelectedExistingSite: (value: string) => void;
    /** Set site ID */
    setSiteId: (value: string) => void;
    /** Set URL field value */
    setUrl: (value: string) => void;
}

/**
 * Form state interface containing all form field values and UI state.
 */
export interface AddSiteFormState {
    /** Form operation mode (new site vs existing site) */
    addMode: FormMode;
    /** Check interval in milliseconds */
    checkInterval: number;
    /** Current form validation error */
    formError: string | undefined;
    /** Host/IP field for port monitors */
    host: string;
    /** Selected monitor type */
    monitorType: MonitorType;
    /** Display name for the site */
    name: string;
    /** Port number field for port monitors */
    port: string;
    /** Selected existing site ID when adding to existing */
    selectedExistingSite: string;
    /** Generated site identifier */
    siteId: string;
    /** URL field for HTTP monitors */
    url: string;
}

/** Form operation mode */
export type FormMode = "existing" | "new";

// Helper functions for add site form logic (reduces function length by composition)
const resetFieldsForMonitorType = (
    currentFieldNames: Set<string>,
    setters: {
        setHost: (value: string) => void;
        setPort: (value: string) => void;
        setUrl: (value: string) => void;
    }
) => {
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
};

const resetFieldsForModeChange = (
    addMode: FormMode,
    setters: {
        setName: (value: string) => void;
        setSiteId: (value: string) => void;
    }
) => {
    if (addMode === "new") {
        setters.setName("");
        setters.setSiteId(generateUuid());
    } else {
        setters.setName("");
    }
};

const validateFormFields = (
    addMode: FormMode,
    name: string,
    selectedExistingSite: string,
    monitorType: MonitorType,
    fieldValues: { host: string; port: string; url: string },
    getFields: (type: MonitorType) => Array<{ name: string; required: boolean }>
) => {
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
                fieldValues[field.name as keyof typeof fieldValues] || "";
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
 * support for both new sites and adding monitors to existing sites.
 * Handles dynamic field validation based on monitor type and maintains
 * proper form state throughout the user interaction lifecycle.
 *
 * @returns Combined form state and action handlers containing all form fields,
 * validation state, and manipulation functions for managing the add site form
 */
export function useAddSiteForm(): AddSiteFormActions & AddSiteFormState {
    // Form field state
    const [url, setUrl] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
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

    // Track previous values to detect changes and auto-reset fields
    const [prevMonitorType, setPrevMonitorType] = useState(monitorType);
    const [prevAddMode, setPrevAddMode] = useState(addMode);

    // Compute effective field values based on monitor type during render
    const currentFields = getFields(monitorType);
    const currentFieldNames = new Set(currentFields.map((field) => field.name));

    // Reset fields when monitor type changes
    if (monitorType !== prevMonitorType) {
        setPrevMonitorType(monitorType);
        setFormError(undefined);
        resetFieldsForMonitorType(currentFieldNames, {
            setHost,
            setPort,
            setUrl,
        });
    }

    // Reset name and siteId when switching modes
    if (addMode !== prevAddMode) {
        setPrevAddMode(addMode);
        setFormError(undefined);
        resetFieldsForModeChange(addMode, { setName, setSiteId });
    }

    // Simple validation function without logging - only used for submit button state
    const isFormValid = useCallback(() => {
        return validateFormFields(
            addMode,
            name,
            selectedExistingSite,
            monitorType,
            { host, port, url },
            getFields
        );
    }, [
        addMode,
        name,
        selectedExistingSite,
        monitorType,
        url,
        host,
        port,
        getFields,
    ]);

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setUrl("");
        setHost("");
        setPort("");
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
        formError,
        host,
        isFormValid,
        monitorType,
        name,
        port,
        resetForm,
        selectedExistingSite,
        setAddMode,
        setCheckInterval,
        setFormError,
        setHost,
        setMonitorType,
        setName,
        setPort,
        setSelectedExistingSite,
        setSiteId,
        setUrl,
        siteId,
        url,
    };
}
