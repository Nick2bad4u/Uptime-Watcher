/**
 * SettingItem component for consistent settings layout
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { FC, ReactNode } from "react";

import { ThemedText } from "../../theme/components/ThemedText";

/**
 * Props for the SettingItem component
 */
export interface SettingItemProperties extends CoreComponentProperties {
    /** Control component (input, select, checkbox, etc.) */
    readonly control: ReactNode;
    /** Description of the setting */
    readonly description?: string;
    /** Whether the setting is disabled */
    readonly disabled?: boolean;
    /** Optional leading icon for the setting title */
    readonly icon?: ReactNode;
    /** Title of the setting */
    readonly title: string;
}

/**
 * Standardized setting item layout with title, description, and control
 *
 * @example
 *
 * ```tsx
 * <SettingItem
 *     title="Auto Start"
 *     description="Launch the application on system startup"
 *     control={
 *         <ThemedCheckbox
 *             checked={settings.autoStart}
 *             onChange={handleChange}
 *         />
 *     }
 * />;
 * ```
 *
 * @param props - SettingItem props
 *
 * @returns Setting item component with consistent layout
 */
export const SettingItem: FC<SettingItemProperties> = ({
    className = "",
    control,
    description,
    disabled = false,
    icon,
    title,
}) => (
    <div
        className={`setting-item ${disabled ? "disabled" : ""} ${className}`.trim()}
    >
        <div className="setting-info">
            <div className="setting-title-row">
                {icon ? (
                    <span aria-hidden className="setting-item__icon">
                        {icon}
                    </span>
                ) : null}
                <ThemedText
                    className="setting-title"
                    size="sm"
                    weight="medium"
                >
                    {title}
                </ThemedText>
            </div>
            {description ? (
                <ThemedText
                    className="setting-description"
                    size="xs"
                    variant="tertiary"
                >
                    {description}
                </ThemedText>
            ) : null}
        </div>
        <div className="setting-control">{control}</div>
    </div>
);
