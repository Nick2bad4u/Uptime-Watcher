/**
 * Screenshot thumbnail component with hover preview
 *
 * Displays a small thumbnail of a website screenshot that expands into a larger
 * preview on hover/focus. Uses Microlink API for screenshot generation and
 * React portals for the overlay positioning.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import logger from "../../services/logger";
import { useTheme } from "../../theme/useTheme";

/** Props for the ScreenshotThumbnail component */
interface ScreenshotThumbnailProps {
    /** The URL to capture a screenshot of */
    readonly url: string;
    /** The site name for accessibility and alt text */
    readonly siteName: string;
}

/**
 * Type guard to check if the window.electronAPI has openExternal method
 * @param api - The API object to check
 * @returns True if the API has openExternal method
 */
function hasOpenExternal(api: unknown): api is { openExternal: (url: string) => void } {
    return typeof (api as { openExternal?: unknown })?.openExternal === "function";
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

export function ScreenshotThumbnail({ siteName, url }: ScreenshotThumbnailProps) {
    const [hovered, setHovered] = useState(false);
    const [overlayVars, setOverlayVars] = useState<React.CSSProperties>({});
    const linkRef = useRef<HTMLAnchorElement>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const { themeName } = useTheme();
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;

    // Clean up portal overlay on unmount and state changes
    useEffect(() => {
        const currentPortal = portalRef.current;
        const currentTimeout = hoverTimeoutRef.current;
        return () => {
            // Clear any pending timeouts

            if (currentTimeout) {
                clearTimeout(currentTimeout);
            }
            setHovered(false);
            setOverlayVars({});
            // Clean up any portal element that might still be in the DOM

            if (currentPortal?.parentNode) {
                currentPortal.parentNode.removeChild(currentPortal);
            }
        };
    }, []);

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
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

    useEffect(() => {
        if (hovered && linkRef.current) {
            const rect = linkRef.current.getBoundingClientRect();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const maxImgW = Math.min(viewportW * 0.9, 900); // 90vw or 900px max
            const maxImgH = Math.min(viewportH * 0.9, 700); // 90vh or 700px max
            const overlayW = maxImgW;
            const overlayH = maxImgH;
            // eslint-disable-next-line functional/no-let -- top is reassigned if it is above the viewport or too close to the top/bottom.
            let top = rect.top - overlayH - 16; // 16px gap above
            // eslint-disable-next-line functional/no-let -- left is reassigned if it is too far left or right.
            let left = rect.left + rect.width / 2 - overlayW / 2;
            if (top < 0) {
                top = rect.bottom + 16;
            }
            if (left < 8) left = 8;
            if (left + overlayW > viewportW - 8) left = viewportW - overlayW - 8;

            if (top < 8) top = 8;
            if (top + overlayH > viewportH - 8) top = viewportH - overlayH - 8;
            setOverlayVars({
                "--overlay-height": `${overlayH}px`,
                "--overlay-left": `${left}px`,
                "--overlay-top": `${top}px`,
                "--overlay-width": `${overlayW}px`,
            } as React.CSSProperties);
        } else if (!hovered) {
            // Clear any pending timeouts when hiding overlay
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = undefined;
            }
            setOverlayVars({});
        }
    }, [hovered, url, siteName]);

    // Debounced hover handlers to prevent rapid state changes
    const handleMouseEnter = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        // Add a small delay to prevent flickering on rapid mouse movements
        hoverTimeoutRef.current = setTimeout(() => {
            setHovered(false);
        }, 100);
    }, []);

    const handleFocus = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = undefined;
        }
        setHovered(true);
    }, []);

    const handleBlur = useCallback(() => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = undefined;
        }
        setHovered(false);
    }, []);

    // Generate accessible aria-label, handling empty URLs
    const ariaLabel = url.trim() ? `Open ${url} in browser` : "Open in browser";

    return (
        <>
            <a
                ref={linkRef}
                href={url}
                tabIndex={0}
                aria-label={ariaLabel}
                onClick={handleClick}
                className="site-details-thumbnail-link"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                <img
                    src={screenshotUrl}
                    alt={`Screenshot of ${siteName}`}
                    className="site-details-thumbnail-img"
                    loading="lazy"
                />
                <span className="site-details-thumbnail-caption">Preview: {siteName}</span>
            </a>
            {hovered &&
                createPortal(
                    <div
                        ref={portalRef}
                        className={`site-details-thumbnail-portal-overlay theme-${themeName}`}
                        style={overlayVars}
                    >
                        <div className="site-details-thumbnail-portal-img-wrapper">
                            <img
                                src={screenshotUrl}
                                alt={`Large screenshot of ${siteName}`}
                                className="site-details-thumbnail-img-portal"
                                loading="lazy"
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
