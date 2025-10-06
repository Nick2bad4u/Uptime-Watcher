/**
 * Shared marquee text presenter with automatic overflow detection and hover
 * pause.
 *
 * @remarks
 * Renders a horizontally scrolling marquee track whenever the provided content
 * overflows. The component wraps {@link ThemedText} to ensure typography
 * consistency across the UI and exposes styling hooks through class names and
 * CSS custom properties. Hovering or focusing the marquee pauses the animation
 * for improved readability and accessibility.
 */

import type {
    ComponentProps,
    CSSProperties,
    JSX,
    NamedExoticComponent,
} from "react";

import { memo, useMemo } from "react";

import { useOverflowMarquee } from "../../../hooks/ui/useOverflowMarquee";
import { ThemedText } from "../../../theme/components/ThemedText";
import "./MarqueeText.css";

interface MarqueeCustomProperties {
    "--marquee-duration"?: string;
    "--marquee-gap"?: string;
}

type ThemedTextOptions = Omit<ComponentProps<typeof ThemedText>, "children">;

const EMPTY_TEXT_PROPS: ThemedTextOptions = {};

/**
 * Properties for {@link MarqueeText}.
 */
export interface MarqueeTextProperties {
    /** CSS class appended when overflow activates marquee behavior. */
    readonly activeClassName?: string;
    /** Optional CSS class for the marquee container. */
    readonly className?: string;
    /** CSS class appended to the cloned text segment. */
    readonly cloneClassName?: string;
    /** Dependency set that should trigger overflow re-evaluation. */
    readonly dependencies?: readonly unknown[];
    /** Duration for a single marquee loop. Defaults to `14s`. */
    readonly duration?: string;
    /** Distance between repeated segments. Defaults to `1.5rem`. */
    readonly gap?: string;
    /** CSS class appended to each text segment. */
    readonly segmentClassName?: string;
    /** Inline style overrides for the marquee container. */
    readonly style?: CSSProperties & MarqueeCustomProperties;
    /** Text content rendered within the marquee track. */
    readonly text: string;
    /** Typography options forwarded to {@link ThemedText}. */
    readonly textProps?: ThemedTextOptions;
    /** Additional CSS class appended to the marquee track wrapper. */
    readonly trackClassName?: string;
}

/**
 * Shared marquee presenter that keeps typography consistent across components.
 */
export const MarqueeText: NamedExoticComponent<MarqueeTextProperties> = memo(
    function MarqueeText({
        activeClassName,
        className,
        cloneClassName,
        dependencies,
        duration,
        gap,
        segmentClassName,
        style,
        text,
        textProps,
        trackClassName,
    }: MarqueeTextProperties): JSX.Element {
        const marqueeDependencies = useMemo(
            () => dependencies ?? [text],
            [dependencies, text]
        );

        const marqueeOptions = useMemo(
            () => ({ dependencies: marqueeDependencies }),
            [marqueeDependencies]
        );

        const { containerRef, isOverflowing } =
            useOverflowMarquee<HTMLDivElement>(marqueeOptions);

        const resolvedStyle = useMemo(() => {
            const hasCustomGap = gap !== undefined;
            const hasCustomDuration = duration !== undefined;

            if (!hasCustomGap && !hasCustomDuration) {
                return style;
            }

            const base: CSSProperties & MarqueeCustomProperties = style
                ? { ...style }
                : {};

            if (hasCustomGap) {
                base["--marquee-gap"] = gap;
            }

            if (hasCustomDuration) {
                base["--marquee-duration"] = duration;
            }

            return base;
        }, [
            duration,
            gap,
            style,
        ]);

        const forwardedTextProps = textProps ?? EMPTY_TEXT_PROPS;
        const providedTextClassName = forwardedTextProps.className;

        const segmentClass = useMemo(
            () =>
                [
                    "marquee-text__segment",
                    segmentClassName,
                    providedTextClassName,
                ]
                    .filter(Boolean)
                    .join(" "),
            [providedTextClassName, segmentClassName]
        );

        const cloneSegmentClass = useMemo(
            () =>
                [
                    segmentClass,
                    "marquee-text__segment--clone",
                    cloneClassName,
                ]
                    .filter(Boolean)
                    .join(" "),
            [cloneClassName, segmentClass]
        );

        const containerClass = useMemo(() => {
            const classes = ["marquee-text", className];
            if (isOverflowing) {
                classes.push("marquee-text--active");
                if (activeClassName) {
                    classes.push(activeClassName);
                }
            }
            return classes.filter(Boolean).join(" ");
        }, [
            activeClassName,
            className,
            isOverflowing,
        ]);

        const trackClass = useMemo(
            () =>
                ["marquee-text__track", trackClassName]
                    .filter(Boolean)
                    .join(" "),
            [trackClassName]
        );

        return (
            <div
                className={containerClass}
                ref={containerRef}
                style={resolvedStyle}
            >
                <div className={trackClass}>
                    <ThemedText
                        {...forwardedTextProps}
                        className={segmentClass}
                    >
                        {text}
                    </ThemedText>
                    {isOverflowing ? (
                        <ThemedText
                            {...forwardedTextProps}
                            aria-hidden="true"
                            className={cloneSegmentClass}
                        >
                            {text}
                        </ThemedText>
                    ) : null}
                </div>
            </div>
        );
    }
);

MarqueeText.displayName = "MarqueeText";
