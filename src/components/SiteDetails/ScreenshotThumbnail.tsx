/**
 * Screenshot thumbnail component with hover preview
 *
 * Displays a small thumbnail of a website screenshot that expands into a larger
 * preview on hover/focus. Uses Microlink API for screenshot generation and
 * React portals for the overlay positioning.
 */

import {
    type JSX,
    type MouseEvent,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import { useMount } from "../../hooks/useMount";
import { useUIStore } from "../../stores/ui/useUiStore";
import { useTheme } from "../../theme/useTheme";

/**
 * Props for the ScreenshotThumbnail component
 *
 * @public
 */
export interface ScreenshotThumbnailProperties {
    /** The site name for accessibility and alt text */
    readonly siteName: string;
    /** The URL to capture a screenshot of */
    readonly url: string;
}

/**
 * Screenshot thumbnail component with hover preview functionality.
 *
 * @remarks
 * Displays a small thumbnail that expands into a larger preview on hover. Uses
 * Microlink API for screenshot generation and React portals for overlay.
 *
 * @param props - Component properties
 *
 * @returns JSX element containing the screenshot thumbnail
 *
 * @public
 */
export const ScreenshotThumbnail = ({
    siteName,
    url,
}: ScreenshotThumbnailProperties): JSX.Element => {
    const [hovered, setHovered] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null
    );
    const linkReference = useRef<HTMLAnchorElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const { themeName } = useTheme();
    const { openExternal } = useUIStore();

    // Set portal container after component mounts to avoid SSR issues
    useMount(
        useCallback(function initializePortalContainer() {
            if (typeof document !== "undefined" && document.body) {
                setPortalContainer(document.body);
            }
        }, [])
    );

    // Cleanup timeout on component unmount to prevent memory leaks
    useMount(
        useCallback(function setupComponent(): void {
            // No setup needed, just using for cleanup
        }, []),
        useCallback(function cleanupTimeout(): void {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }, [])
    );

    // Calculate safe values using useMemo to avoid infinite loops
    const safeUrl = useMemo(
        () => (typeof url === "string" ? url.trim() : ""),
        [url]
    );

    const safeSiteName = useMemo(
        () => (typeof siteName === "string" ? siteName : "Unknown Site"),
        [siteName]
    );

    const screenshotUrl = useMemo(
        () =>
            safeUrl
                ? `https://api.microlink.io/?url=${encodeURIComponent(safeUrl)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`
                : undefined,
        [safeUrl]
    );

    const ariaLabel = useMemo(
        () => (safeUrl ? `Open ${safeUrl} in browser` : "Open in browser"),
        [safeUrl]
    );

    // Memoized style objects to prevent unnecessary re-renders
    const portalOverlayStyle = useMemo(
        () => ({
            left: "50%",
            maxHeight: "80vh",
            maxWidth: "80vw",
            pointerEvents: "none" as const,
            position: "fixed" as const,
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
        }),
        []
    );

    const portalImageStyle = useMemo(
        () => ({
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            display: "block",
            maxHeight: "100%",
            maxWidth: "100%",
        }),
        []
    );

    const placeholderStyle = useMemo(
        () => ({
            alignItems: "center" as const,
            backgroundColor: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
            display: "flex" as const,
            fontSize: "12px",
            height: "60px",
            justifyContent: "center" as const,
            width: "100px",
        }),
        []
    );

    const handleClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            openExternal(safeUrl, { siteName: safeSiteName });
        },
        [
            openExternal,
            safeSiteName,
            safeUrl,
        ]
    );

    const handleMouseEnter = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setHovered(false);
        }, 100);
    }, []);

    const handleFocus = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleBlur = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        setHovered(false);
    }, []);

    // Simple portal - let CSS handle positioning to avoid complex state management
    const portalJSX =
        hovered && screenshotUrl && portalContainer
            ? createPortal(
                  <div
                      className={`site-details-thumbnail-portal-overlay theme-${themeName}`}
                      style={portalOverlayStyle}
                  >
                      <img
                          alt={`Large screenshot of ${safeSiteName}`}
                          className="site-details-thumbnail-img-portal"
                          loading="lazy"
                          src={screenshotUrl}
                          style={portalImageStyle}
                      />
                  </div>,
                  portalContainer
              )
            : null;

    return (
        <>
            <a
                aria-label={ariaLabel}
                className="site-details-thumbnail-link"
                href={safeUrl || "#"}
                onBlur={handleBlur}
                onClick={handleClick}
                onFocus={handleFocus}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={linkReference}
                tabIndex={0}
            >
                {screenshotUrl ? (
                    <img
                        alt={`Screenshot of ${safeSiteName}`}
                        className="site-details-thumbnail-img"
                        loading="lazy"
                        src={screenshotUrl}
                    />
                ) : (
                    <div
                        className="site-details-thumbnail-placeholder"
                        style={placeholderStyle}
                    >
                        No Preview
                    </div>
                )}
                <span className="site-details-thumbnail-caption">
                    Preview: {safeSiteName}
                </span>
            </a>
            {portalJSX}
        </>
    );
};
