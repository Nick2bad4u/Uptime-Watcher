import type { ChangeEvent, ReactElement } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedSlider } from "../../../theme/components/ThemedSlider";
import { ThemedText } from "../../../theme/components/ThemedText";

export interface SettingsAlertVolumeControlProperties {
    readonly automaticPreviewSuppressed: boolean;
    readonly disabled: boolean;
    readonly isVolumeSilent: boolean;
    readonly onPreviewClick: () => void;
    readonly onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly volumePercent: number;
}

/**
 * In-app alert volume slider and preview controls.
 */
export const SettingsAlertVolumeControl = ({
    automaticPreviewSuppressed,
    disabled,
    isVolumeSilent,
    onPreviewClick,
    onVolumeChange,
    volumePercent,
}: SettingsAlertVolumeControlProperties): ReactElement => (
    <div className="settings-alert-volume-control">
        <ThemedSlider
            aria-label="In-app alert volume"
            aria-valuetext={`${volumePercent}%`}
            disabled={disabled}
            max={100}
            min={0}
            onChange={onVolumeChange}
            step={1}
            value={volumePercent}
        />
        <div className="settings-alert-volume-control__row">
            <ThemedText
                className="settings-alert-volume-control__value"
                size="sm"
                variant="secondary"
            >
                {volumePercent}%
            </ThemedText>
            <ThemedButton
                disabled={disabled || isVolumeSilent}
                onClick={onPreviewClick}
                size="xs"
                variant="secondary"
            >
                Preview tone
            </ThemedButton>
        </div>
        {automaticPreviewSuppressed ? (
            <ThemedText
                className="settings-alert-volume-control__note"
                size="xs"
                variant="tertiary"
            >
                Automatic previews are disabled to respect your reduced-motion
                preference.
            </ThemedText>
        ) : null}
    </div>
);
