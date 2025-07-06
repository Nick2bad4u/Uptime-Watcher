/**
 * Custom hook for managing add site form state and validation.
 * Provides comprehensive form state management for creating new sites and adding monitors to existing sites.
 * Supports real-time validation, automatic UUID generation, and error handling.
 */

import { useState, useEffect, useCallback } from "react";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { generateUuid } from "../../utils/data/generateUuid";

/** Form operation mode */
export type FormMode = "new" | "existing";

/** Supported monitor types */
export type MonitorType = "http" | "port";

/**
 * Form state interface containing all form field values and UI state.
 */
export interface AddSiteFormState {
    /** URL field for HTTP monitors */
    url: string;
    /** Host/IP field for port monitors */
    host: string;
    /** Port number field for port monitors */
    port: string;
    /** Display name for the site */
    name: string;
    /** Selected monitor type */
    monitorType: MonitorType;
    /** Check interval in milliseconds */
    checkInterval: number;
    /** Generated site identifier */
    siteId: string;
    /** Form operation mode (new site vs existing site) */
    addMode: FormMode;
    /** Selected existing site ID when adding to existing */
    selectedExistingSite: string;
    /** Current form validation error */
    formError: string | undefined;
}

/**
 * Form actions interface containing all form manipulation functions.
 */
export interface AddSiteFormActions {
    /** Set URL field value */
    setUrl: (value: string) => void;
    /** Set host field value */
    setHost: (value: string) => void;
    /** Set port field value */
    setPort: (value: string) => void;
    /** Set site name field value */
    setName: (value: string) => void;
    /** Set monitor type */
    setMonitorType: (value: MonitorType) => void;
    /** Set check interval */
    setCheckInterval: (value: number) => void;
    /** Set site ID */
    setSiteId: (value: string) => void;
    /** Set form operation mode */
    setAddMode: (value: FormMode) => void;
    /** Set selected existing site */
    setSelectedExistingSite: (value: string) => void;
    /** Set form error message */
    setFormError: (error: string | undefined) => void;
    /** Reset form to initial state */
    resetForm: () => void;
    /** Whether the form is currently valid */
    isFormValid: boolean;
}

/**
 * Hook for managing add site form state and operations.
 *
 * Features:
 * - Complete form state management
 * - Real-time validation
 * - Support for both new sites and adding monitors to existing sites
 * - Automatic UUID generation for new sites
 * - Form reset functionality
 * - Error handling and display
 *
 * @returns Combined form state and action handlers
 */
export function useAddSiteForm(): AddSiteFormState & AddSiteFormActions {
    // Form field state
    const [url, setUrl] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<MonitorType>("http");
    const [checkInterval, setCheckInterval] = useState(DEFAULT_CHECK_INTERVAL);
    const [siteId, setSiteId] = useState<string>(generateUuid());

    // Mode and selection state
    const [addMode, setAddMode] = useState<FormMode>("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState("");

    // UI state
    const [formError, setFormError] = useState<string | undefined>(undefined);

    // Reset fields when monitor type changes
    useEffect(() => {
        setFormError(undefined);
        setUrl("");
        setHost("");
        setPort("");
    }, [monitorType]);

    // Reset name and siteId when switching to new site
    useEffect(() => {
        if (addMode === "new") {
            setName("");
            setSiteId(generateUuid());
        } else {
            setName("");
        }
        setFormError(undefined);
    }, [addMode]);

    // Simple validation function without logging - only used for submit button state
    const isFormValid = useCallback(() => {
        // Basic check for submit button enablement only
        if (addMode === "new" && !name.trim()) return false;
        if (addMode === "existing" && !selectedExistingSite) return false;
        if (monitorType === "http" && !url.trim()) return false;
        if (monitorType === "port" && (!host.trim() || !port.trim())) return false;

        return true;
    }, [addMode, name, selectedExistingSite, monitorType, url, host, port]);

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
        isFormValid: isFormValid(),
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
