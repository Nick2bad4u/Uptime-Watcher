import type React from "react";

// Cache for color styles to prevent object recreation
const colorStylesCache = new Map<string, React.CSSProperties>();

/**
 * Get or create a cached color style object
 *
 * @param color - The color value
 *
 * @returns Cached color style object
 *
 * @internal
 */
function getColorStyle(color: string): React.CSSProperties {
    let style = colorStylesCache.get(color);
    if (!style) {
        style = {
            color,
        };
        colorStylesCache.set(color, style);
    }
    return style;
}

/**
 * Get the CSS class for an icon color
 *
 * @param color - The color name
 *
 * @returns The CSS class or undefined if no class exists
 *
 * @internal
 */
export function getIconColorClass(color?: string): string | undefined {
    if (!color) {
        return undefined;
    }
    switch (color) {
        case "danger":
        case "error": {
            return "themed-icon--error";
        }
        case "info": {
            return "themed-icon--info";
        }
        case "primary": {
            return "themed-icon--primary";
        }
        case "secondary": {
            return "themed-icon--secondary";
        }
        case "success": {
            return "themed-icon--success";
        }
        case "warning": {
            return "themed-icon--warning";
        }
        default: {
            // If it's a hex or rgb(a) or custom string, fallback to inline
            // style
            return undefined;
        }
    }
}

/**
 * Wraps icon in a span with color class or inline style.
 *
 * @param icon - React icon element
 * @param color - Color name or custom color value
 *
 * @returns Colored icon wrapped in span
 *
 * @internal
 */
export function renderColoredIcon(
    icon: React.ReactNode,
    color?: string
): React.ReactNode {
    if (!icon) {
        return icon;
    }
    const colorClass = getIconColorClass(color);
    if (colorClass) {
        return <span className={colorClass}>{icon}</span>;
    }
    if (color) {
        const colorStyle = getColorStyle(color);
        return <span style={colorStyle}>{icon}</span>;
    }
    return icon;
}
