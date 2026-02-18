/**
 * Shared surface container that standardizes padding, rounding, and surface
 * variants for card-like layouts.
 */

import { memo, type NamedExoticComponent } from "react";

import type { ThemedBoxProperties } from "../../theme/components/ThemedBox";

import { ThemedBox } from "../../theme/components/ThemedBox";

/**
 * Properties for the {@link SurfaceContainer} component.
 */
export interface SurfaceContainerProperties extends ThemedBoxProperties {
    /** Optional class name applied to the underlying element. */
    readonly className?: string;
}

/**
 * Lightweight wrapper around {@link ThemedBox} that applies consistent surface
 * styling defaults for neutral containers.
 *
 * @param props - Component props configuring the rendered surface container.
 *
 * @returns JSX element providing a themed surface container.
 */
export const SurfaceContainer: NamedExoticComponent<SurfaceContainerProperties> =
    memo(function SurfaceContainerComponent({
        className,
        padding = "lg",
        rounded = "lg",
        surface = "base",
        variant = "primary",
        ...rest
    }: SurfaceContainerProperties) {
        const forwardedProps = className
            ? {
                  ...rest,
                  className,
              }
            : rest;

        return (
            <ThemedBox
                {...forwardedProps}
                padding={padding}
                rounded={rounded}
                surface={surface}
                variant={variant}
            />
        );
    });
