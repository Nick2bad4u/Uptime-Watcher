import type { ChangeEvent, ReactElement, ReactNode } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import { SiteSettingsFieldLabel } from "./SiteSettingsFieldLabel";
import { SiteSettingsHelpText } from "./SiteSettingsHelpText";

interface SiteSettingsNumberFieldProps {
    readonly errorText?: ReactNode;
    readonly helperText: ReactNode;
    readonly isChanged: boolean;
    readonly isValid: boolean;
    readonly label: ReactNode;
    readonly max: number;
    readonly min: number;
    readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly onSave: () => void;
    readonly placeholder: string;
    readonly saveIcon: ReactNode;
    readonly step: number;
    readonly value: number;
}

/**
 * Shared numeric setting field for {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
 */
export const SiteSettingsNumberField = ({
    errorText,
    helperText,
    isChanged,
    isValid,
    label,
    max,
    min,
    onChange,
    onSave,
    placeholder,
    saveIcon,
    step,
    value,
}: SiteSettingsNumberFieldProps): ReactElement => {
    const errorNode =
        !isValid && errorText ? (
            <ThemedText size="xs" variant="error">
                {errorText}
            </ThemedText>
        ) : null;

    return (
        <div className="site-settings-field">
            <SiteSettingsFieldLabel>{label}</SiteSettingsFieldLabel>
            <div className="site-settings-field__controls">
                <ThemedInput
                    className="flex-1"
                    max={max}
                    min={min}
                    onChange={onChange}
                    placeholder={placeholder}
                    step={step}
                    type="number"
                    value={value}
                />
                <ThemedButton
                    disabled={!isChanged || !isValid}
                    icon={saveIcon}
                    onClick={onSave}
                    size="sm"
                    variant={isChanged ? "primary" : "secondary"}
                >
                    Save
                </ThemedButton>
            </div>
            <div className="mt-2">
                <SiteSettingsHelpText>{helperText}</SiteSettingsHelpText>
            </div>
            {errorNode}
        </div>
    );
};
