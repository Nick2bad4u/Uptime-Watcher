/**
 * Screenshot thumbnail component with hover preview
 *
 * Displays a small thumbnail of a website screenshot that expands into a larger
 * preview on hover/focus. Uses Microlink API for screenshot generation and
 * React portals for the overlay positioning.
 */

import type { JSX, MouseEvent } from "react";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
    const linkReference = useRef<HTMLAnchorElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>();
    const { themeName } = useTheme();
    const { openExternal } = useUIStore();

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

    const handleClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            openExternal(safeUrl, { siteName: safeSiteName });
        },
        [openExternal, safeSiteName, safeUrl]
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
    const portalJSX = hovered && screenshotUrl
        ? createPortal(
              <div
                  className={`site-details-thumbnail-portal-overlay theme-${themeName}`}
                  style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 9999,
                      pointerEvents: "none",
                      maxWidth: "80vw",
                      maxHeight: "80vh",
                  }}
              >
                  <img
                      alt={`Large screenshot of ${safeSiteName}`}
                      className="site-details-thumbnail-img-portal"
                      loading="lazy"
                      src={screenshotUrl}
                      style={{
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "100%",
                          borderRadius: "8px",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                      }}
                  />
              </div>,
              document.body
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
                        style={{
                            width: "100px",
                            height: "60px",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            color: "#666",
                        }}
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
