/**
 * Dynamic form component that generates monitor fields based on type configuration.
 * Eliminates hard-coded form field rendering by loading field definitions from backend.
 */

import type { MonitorFieldDefinition } from "@shared/types";

import { useEffect, useState } from "react";

import logger from "../../services/logger";
import { ThemedText } from "../../theme/components";
import { ensureError } from "../../utils/errorHandling";
import { getMonitorTypeConfig, type MonitorTypeConfig } from "../../utils/monitorTypeHelper";
import { TextField } from "./FormFields";

/**
 * Props for the DynamicField component
 *
 * @public
 */
export interface DynamicFieldProps {
    /** Whether the field is disabled */
    readonly disabled?: boolean;
    /** Field definition */
    readonly field: MonitorFieldDefinition;
    /** Change handler */
    readonly onChange: (value: number | string) => void;
    /** Current field value */
    readonly value: number | string;
}

/**
 * Props for the DynamicMonitorFields component
 *
 * @public
 */
export interface DynamicMonitorFieldsProps {
    /** Whether the form is in a loading state */
    readonly isLoading?: boolean;
    /** Selected monitor type */
    readonly monitorType: string;
    /** Change handlers for each field */
    readonly onChange: Record<string, (value: number | string) => void>;
    /** Current form values */
    readonly values: Record<string, number | string>;
}

/**
 * Renders form fields dynamically based on monitor type configuration loaded from backend.
 */
export function DynamicMonitorFields({ isLoading = false, monitorType, onChange, values }: DynamicMonitorFieldsProps) {
    const [config, setConfig] = useState<MonitorTypeConfig | undefined>();
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [error, setError] = useState<string | undefined>();

    // Load monitor type configuration from backend
    useEffect(() => {
        let isCancelled = false;

        const loadConfig = async () => {
            try {
                setIsLoadingConfig(true);
                setError(undefined);
                const configData = await getMonitorTypeConfig(monitorType);
                if (!isCancelled) {
                    setConfig(configData);
                }
            } catch (error_) {
                if (!isCancelled) {
                    const errorMessage = error_ instanceof Error ? error_.message : "Failed to load monitor config";
                    setError(errorMessage);
                    logger.error("Failed to load monitor type config", ensureError(error_));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingConfig(false);
                }
            }
        };

        void loadConfig();

        return () => {
            isCancelled = true;
        };
    }, [monitorType]);

    if (isLoadingConfig) {
        return <ThemedText variant="secondary">Loading monitor fields...</ThemedText>;
    }

    if (error) {
        return <ThemedText variant="error">Error loading monitor fields: {error}</ThemedText>;
    }

    if (!config) {
        return <ThemedText variant="error">Unknown monitor type: {monitorType}</ThemedText>;
    }

    return (
        <div className="flex flex-col gap-2">
            {config.fields.map((field) => (
                <DynamicField
                    disabled={isLoading}
                    field={field}
                    key={field.name}
                    onChange={onChange[field.name] ?? (() => {})}
                    value={values[field.name] ?? ""}
                />
            ))}
        </div>
    );
}

/**
 * Renders a single form field based on its definition.
 */
function DynamicField({ disabled = false, field, onChange, value }: DynamicFieldProps) {
    const handleChange = (newValue: number | string) => {
        onChange(newValue);
    };

    switch (field.type) {
        case "number": {
            return (
                <TextField
                    disabled={disabled}
                    {...(field.helpText && { helpText: field.helpText })}
                    id={field.name}
                    label={field.label}
                    {...(field.max && { max: field.max })}
                    {...(field.min && { min: field.min })}
                    onChange={(val: string) => handleChange(Number(val))}
                    {...(field.placeholder && { placeholder: field.placeholder })}
                    required={field.required}
                    type="number"
                    value={String(value)}
                />
            );
        }
        case "text":

        case "url": {
            return (
                <TextField
                    disabled={disabled}
                    {...(field.helpText && { helpText: field.helpText })}
                    id={field.name}
                    label={field.label}
                    onChange={(val: string) => handleChange(val)}
                    {...(field.placeholder && { placeholder: field.placeholder })}
                    required={field.required}
                    type={field.type}
                    value={String(value)}
                />
            );
        }

        default: {
            return <ThemedText variant="error">Unsupported field type: {field.type}</ThemedText>;
        }
    }
}
