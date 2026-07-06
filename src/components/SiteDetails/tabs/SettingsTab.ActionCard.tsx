/**
 * Shared action card shell for the Site Details Settings tab.
 */

import type { ReactElement, ReactNode } from "react";

import type {
    ButtonSize,
    ButtonVariant,
    TextVariant,
    TextWeight,
} from "../../../theme/components/types";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SettingsTabActionCard}.
 */
export interface SettingsTabActionCardProperties {
    readonly buttonIcon: ReactNode;
    readonly buttonLabel: ReactNode;
    readonly buttonSize: ButtonSize;
    readonly buttonVariant: ButtonVariant;
    readonly cardClassName?: string;
    readonly cardIcon: ReactNode;
    readonly contentClassName?: string;
    readonly fieldLabel: ReactNode;
    readonly fieldLabelVariant: TextVariant;
    readonly fieldLabelWeight?: TextWeight;
    readonly isLoading: boolean;
    readonly onClick: () => void;
    readonly supportingContent: ReactNode;
    readonly title: string;
}

/**
 * Renders the repeated action-card layout used by small SettingsTab sections.
 */
export const SettingsTabActionCard = ({
    buttonIcon,
    buttonLabel,
    buttonSize,
    buttonVariant,
    cardClassName,
    cardIcon,
    contentClassName,
    fieldLabel,
    fieldLabelVariant,
    fieldLabelWeight,
    isLoading,
    onClick,
    supportingContent,
    title,
}: SettingsTabActionCardProperties): ReactElement => {
    const field = (
        <div className="site-settings-field">
            <ThemedText
                {...(fieldLabelWeight ? { weight: fieldLabelWeight } : {})}
                className="mb-2"
                size="sm"
                variant={fieldLabelVariant}
            >
                {fieldLabel}
            </ThemedText>
            <div className="mb-4">{supportingContent}</div>
            <ThemedButton
                className="site-settings-field__cta"
                icon={buttonIcon}
                loading={isLoading}
                onClick={onClick}
                size={buttonSize}
                variant={buttonVariant}
            >
                {buttonLabel}
            </ThemedButton>
        </div>
    );

    return (
        <ThemedCard
            {...(cardClassName ? { className: cardClassName } : {})}
            icon={cardIcon}
            title={title}
        >
            {contentClassName ? (
                <div className={contentClassName}>{field}</div>
            ) : (
                field
            )}
        </ThemedCard>
    );
};
