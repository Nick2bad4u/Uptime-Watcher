/**
 * Scroll helpers for navigating to the main site list/cards from other UI
 * surfaces (e.g. the sidebar quick switcher).
 *
 * @remarks
 * The application uses `data-site-identifier` in multiple places (sidebar
 * buttons, site cards, and table rows). A naive `document.querySelector` may
 * therefore match the sidebar element itself rather than the dashboard card.
 *
 * This helper scopes the search to the main site list container
 * (`[data-testid="site-list"]`) to ensure the correct element is targeted.
 */

/**
 * Configuration options for {@link scrollToSiteCard}.
 */
export interface ScrollToSiteCardOptions {
    /**
     * Scroll behavior passed to `scrollIntoView`.
     *
     * @defaultValue "smooth"
     */
    readonly behavior?: ScrollBehavior;

    /**
     * Vertical alignment passed to `scrollIntoView`.
     *
     * @defaultValue "center"
     */
    readonly block?: ScrollLogicalPosition;
}

const DEFAULT_SCROLL_OPTIONS: Required<ScrollToSiteCardOptions> = {
    behavior: "smooth",
    block: "center",
};

const escapeForAttributeSelector = (value: string): string => {
    try {
        return globalThis.CSS.escape(value);
    } catch {
        // Continue to fallback escaping.
    }

    // Minimal escaping for attribute selector string literals.
    // This is a fallback when CSS.escape is not available.
    return value.replaceAll("\\", "\\\\").replaceAll('"', String.raw`\"`);
};

/**
 * Scrolls the matching site card / table row into view.
 *
 * @remarks
 * This function is deliberately defensive:
 *
 * - No-op when `document` is unavailable (SSR/tests)
 * - No-op when the site list container is missing
 * - No-op when `scrollIntoView` is not supported
 * - Never throws if the selector is invalid
 *
 * @param siteIdentifier - Site identifier used in `data-site-identifier`.
 * @param options - Optional scrolling configuration.
 */
export function scrollToSiteCard(
    siteIdentifier: string,
    options: ScrollToSiteCardOptions = {}
): void {
    if (
        typeof siteIdentifier !== "string" ||
        siteIdentifier.trim().length === 0
    ) {
        return;
    }

    if (typeof document === "undefined") {
        return;
    }

    const container = document.querySelector('[data-testid="site-list"]');
    if (!container) {
        return;
    }

    const escaped = escapeForAttributeSelector(siteIdentifier);
    const selector = `[data-site-identifier="${escaped}"]`;

    try {
        const element = container.querySelector(selector);
        if (element && typeof element.scrollIntoView === "function") {
            const { behavior, block } = {
                ...DEFAULT_SCROLL_OPTIONS,
                ...options,
            };

            element.scrollIntoView({ behavior, block });
        }
    } catch {
        // Ignore selector failures.
    }
}
