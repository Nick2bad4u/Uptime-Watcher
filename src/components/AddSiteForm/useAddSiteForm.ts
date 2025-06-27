import { useState, useEffect, useCallback } from "react";

import { CHECK_INTERVALS } from "../../constants";
import { generateUuid } from "../../utils/data/generateUuid";

export type FormMode = "new" | "existing";
export type MonitorType = "http" | "port";

export interface AddSiteFormState {
    // Form fields
    url: string;
    host: string;
    port: string;
    name: string;
    monitorType: MonitorType;
    checkInterval: number;
    siteId: string;

    // Mode and selection
    addMode: FormMode;
    selectedExistingSite: string;

    // UI state
    formError: string | undefined;
}

export interface AddSiteFormActions {
    // Field setters
    setUrl: (value: string) => void;
    setHost: (value: string) => void;
    setPort: (value: string) => void;
    setName: (value: string) => void;
    setMonitorType: (value: MonitorType) => void;
    setCheckInterval: (value: number) => void;
    setSiteId: (value: string) => void;

    // Mode and selection setters
    setAddMode: (value: FormMode) => void;
    setSelectedExistingSite: (value: string) => void;

    // UI actions
    setFormError: (error: string | undefined) => void;
    resetForm: () => void;

    // Validation
    isFormValid: boolean;
}

export function useAddSiteForm(): AddSiteFormState & AddSiteFormActions {
    // Form field state
    const [url, setUrl] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<MonitorType>("http");
    const [checkInterval, setCheckInterval] = useState(CHECK_INTERVALS[6]?.value || 60000);
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
        setCheckInterval(CHECK_INTERVALS[6]?.value || 60000);
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
