import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import logger from "../../services/logger";
import { useTheme } from "../../theme/useTheme";

interface ScreenshotThumbnailProps {
    url: string;
    siteName: string;
}

// Accept unknown for runtime type check
function hasOpenExternal(api: unknown): api is { openExternal: (url: string) => void } {
    return typeof (api as { openExternal?: unknown })?.openExternal === "function";
}

export function ScreenshotThumbnail({ siteName, url }: ScreenshotThumbnailProps) {
    const [hovered, setHovered] = useState(false);
    const [overlayVars, setOverlayVars] = useState<React.CSSProperties>({});
    const linkRef = useRef<HTMLAnchorElement>(null);
    const { themeName } = useTheme();
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;

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
            setOverlayVars({});
        }
    }, [hovered, url, siteName]);

    return (
        <>
            <a
                ref={linkRef}
                href={url}
                tabIndex={0}
                aria-label={`Open ${url} in browser`}
                onClick={handleClick}
                className="site-details-thumbnail-link"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
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
                    <div className={`site-details-thumbnail-portal-overlay theme-${themeName}`} style={overlayVars}>
                        <div className="site-details-thumbnail-portal-img-wrapper">
                            <img
                                src={screenshotUrl}
                                alt={`Large screenshot of ${siteName}`}
                                className="site-details-thumbnail-img-portal"
                                loading="lazy"
                                tabIndex={0}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
