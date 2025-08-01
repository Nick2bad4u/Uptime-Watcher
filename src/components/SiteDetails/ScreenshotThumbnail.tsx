/**
 * Screenshot thumbnail component with hover preview
 *
 * Displays a small thumbnail of a website screenshot that expands into a larger
 * preview on hover/focus. Uses Microlink API for screenshot generation and
 * React portals for the overlay positioning.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { UI_DELAYS } from "../../constants";
import logger from "../../services/logger";
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

export function ScreenshotThumbnail({ siteName, url }: ScreenshotThumbnailProperties) {
    const [hovered, setHovered] = useState(false);
    const [overlayVariables, setOverlayVariables] = useState<React.CSSProperties>({});
    const linkReference = useRef<HTMLAnchorElement>(null);
    const portalReference = useRef<HTMLDivElement>(null);
    const hoverTimeoutReference = useRef<NodeJS.Timeout | undefined>(undefined);
    const { themeName } = useTheme();
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;

    // Clean up portal overlay on unmount and state changes
    useEffect(() => {
        return () => {
            // Clear any pending timeouts
            if (hoverTimeoutReference.current) {
                clearTimeout(hoverTimeoutReference.current);
                hoverTimeoutReference.current = undefined;
            }

            // Reset state
            setHovered(false);
            setOverlayVariables({});
        };
    }, []);

    // Create stable callbacks to avoid direct setState in useEffect
    const clearOverlayVariables = useCallback(() => setOverlayVariables({}), []);

    // Additional cleanup on hovered state changes
    useEffect(() => {
        if (!hovered) {
            // Clear any pending timeouts when hiding overlay
            if (hoverTimeoutReference.current) {
                clearTimeout(hoverTimeoutReference.current);
                hoverTimeoutReference.current = undefined;
            }
            // Use timeout to defer state update to avoid direct call in useEffect
            const clearTimeoutId = setTimeout(clearOverlayVariables, UI_DELAYS.STATE_UPDATE_DEFER);
            return () => clearTimeout(clearTimeoutId);
        }
        return () => {};
    }, [hovered, clearOverlayVariables]);

    function handleClick(event: React.MouseEvent) {
        event.preventDefault();
        logger.user.action("External URL opened from screenshot thumbnail", {
            siteName: siteName,
            url: url,
        });
        if (hasOpenExternal(window.electronAPI)) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, "_blank", "noopener");
        }
    }

    const updateOverlayPosition = useCallback(() => {
        if (hovered && linkReference.current) {
            const rect = linkReference.current.getBoundingClientRect();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const maxImgW = Math.min(viewportW * 0.9, 900); // 90vw or 900px max
            const maxImgH = Math.min(viewportH * 0.9, 700); // 90vh or 700px max
            const overlayW = maxImgW;
            const overlayH = maxImgH;

            let top = rect.top - overlayH - 16; // 16px gap above
            let left = rect.left + rect.width / 2 - overlayW / 2;

            if (top < 0) {
                top = rect.bottom + 16;
            }
            if (left < 8) {
                left = 8;
            }
            if (left + overlayW > viewportW - 8) {
                left = viewportW - overlayW - 8;
            }
            if (top < 8) {
                top = 8;
            }
            if (top + overlayH > viewportH - 8) {
                top = viewportH - overlayH - 8;
            }

            setOverlayVariables({
                "--overlay-height": `${overlayH}px`,
                "--overlay-left": `${left}px`,
                "--overlay-top": `${top}px`,
                "--overlay-width": `${overlayW}px`,
            } as React.CSSProperties);
        }
    }, [hovered]);

    useEffect(() => {
        if (hovered && linkReference.current) {
            // Use timeout to defer state update to avoid direct call in useEffect
            const updateTimeoutId = setTimeout(updateOverlayPosition, UI_DELAYS.STATE_UPDATE_DEFER);
            return () => clearTimeout(updateTimeoutId);
        }
        return () => {};
    }, [hovered, url, siteName, updateOverlayPosition]);

    // Debounced hover handlers to prevent rapid state changes
    const handleMouseEnter = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutReference.current) {
            clearTimeout(hoverTimeoutReference.current);
            hoverTimeoutReference.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutReference.current) {
            clearTimeout(hoverTimeoutReference.current);
        }
        // Add a small delay to prevent flickering on rapid mouse movements
        hoverTimeoutReference.current = setTimeout(() => {
            setHovered(false);
        }, 100);
    }, []);

    const handleFocus = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutReference.current) {
            clearTimeout(hoverTimeoutReference.current);
            hoverTimeoutReference.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleBlur = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutReference.current) {
            clearTimeout(hoverTimeoutReference.current);
            hoverTimeoutReference.current = undefined;
        }
        setHovered(false);
    }, []);

    // Generate accessible aria-label, handling empty URLs
    const ariaLabel = url.trim() ? `Open ${url} in browser` : "Open in browser";

    return (
        <>
            <a
                aria-label={ariaLabel}
                className="site-details-thumbnail-link"
                href={url}
                onBlur={handleBlur}
                onClick={handleClick}
                onFocus={handleFocus}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={linkReference}
                tabIndex={0}
            >
                <img
                    alt={`Screenshot of ${siteName}`}
                    className="site-details-thumbnail-img"
                    loading="lazy"
                    src={screenshotUrl}
                />
                <span className="site-details-thumbnail-caption">Preview: {siteName}</span>
            </a>
            {hovered &&
                createPortal(
                    <div
                        className={`site-details-thumbnail-portal-overlay theme-${themeName}`}
                        ref={portalReference}
                        style={overlayVariables}
                    >
                        <div className="site-details-thumbnail-portal-img-wrapper">
                            <img
                                alt={`Large screenshot of ${siteName}`}
                                className="site-details-thumbnail-img-portal"
                                loading="lazy"
                                src={screenshotUrl}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

/**
 * Screenshot thumbnail component with hover preview overlay.
 *
 * Generates a thumbnail using Microlink API and displays a larger preview
 * when hovered. Handles external URL opening and proper positioning of
 * the preview overlay within viewport bounds.
 *
 * @param props - Component props
 * @returns JSX element containing the thumbnail and optional preview overlay
 */

/**
 * Type guard to check if the window.electronAPI has openExternal method
 * @param api - The API object to check
 * @returns True if the API has openExternal method
 */
function hasOpenExternal(api: unknown): api is { openExternal: (url: string) => void } {
    return typeof (api as { openExternal?: unknown }).openExternal === "function";
}
