import type { MouseEvent, ReactNode } from "react";
import type { IconType } from "react-icons";

import { Tooltip } from "../../common/Tooltip/Tooltip";

/**
 * Option entry rendered by {@link ToggleGroup}.
 */
export interface ToggleGroupOption<TValue extends string> {
    readonly description: string;
    readonly Icon: IconType;
    readonly label: string;
    readonly value: TValue;
}

/**
 * Props for {@link ToggleGroup}.
 */
export interface ToggleGroupProperties<TValue extends string> {
    readonly ariaLabel: string;
    readonly buttonClassName: string;
    readonly buttonClassNameActive: string;
    readonly containerClassName: string;
    readonly getDataAttributes: (value: TValue) => Record<string, string>;
    readonly iconClassName: string;
    readonly labelClassName: string;
    readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    readonly options: ReadonlyArray<ToggleGroupOption<TValue>>;
    readonly selectedValue: TValue;
}

/**
 * Generic radio-like toggle group used by {@link SiteListLayoutSelector}.
 *
 * @remarks
 * This component exists to avoid duplicating the same Tooltip + button mapping
 * for layout, presentation, and density controls.
 */
export const ToggleGroup = <TValue extends string>({
    ariaLabel,
    buttonClassName,
    buttonClassNameActive,
    containerClassName,
    getDataAttributes,
    iconClassName,
    labelClassName,
    onClick,
    options,
    selectedValue,
}: ToggleGroupProperties<TValue>): ReactNode => (
    <div
        aria-label={ariaLabel}
        className={containerClassName}
        role="radiogroup"
    >
        {options.map((option) => {
            const { description, Icon, label, value } = option;
            const isActive = value === selectedValue;

            return (
                <Tooltip content={description} key={value} position="bottom">
                    {(triggerProps) => (
                        <button
                            aria-pressed={isActive}
                            className={
                                isActive
                                    ? `${buttonClassName} ${buttonClassNameActive}`
                                    : buttonClassName
                            }
                            onClick={onClick}
                            type="button"
                            {...getDataAttributes(value)}
                            {...triggerProps}
                        >
                            <Icon className={iconClassName} />
                            <span className={labelClassName}>{label}</span>
                        </button>
                    )}
                </Tooltip>
            );
        })}
    </div>
);
