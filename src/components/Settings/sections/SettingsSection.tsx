import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { ThemedText } from "../../../theme/components/ThemedText";

interface SettingsSectionProperties {
    readonly children: ReactNode;
    readonly description: string;
    readonly icon: IconType;
    readonly testId: string;
    readonly title: string;
}

export const SettingsSection = ({
    children,
    description,
    icon: SectionIcon,
    testId,
    title,
}: SettingsSectionProperties): JSX.Element => (
    <section className="settings-section" data-testid={testId}>
        <header className="settings-section__header">
            <div className="settings-section__icon">
                <SectionIcon size={18} />
            </div>
            <div>
                <ThemedText
                    className="settings-section__title"
                    size="md"
                    weight="semibold"
                >
                    {title}
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                    {description}
                </ThemedText>
            </div>
        </header>
        <div className="settings-section__content">{children}</div>
    </section>
);
