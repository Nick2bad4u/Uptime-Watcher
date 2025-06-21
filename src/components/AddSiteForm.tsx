import { useState, useEffect } from "react";
import { useStore } from "../store";
import { UI_DELAYS } from "../constants";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput } from "../theme/components";
import logger from "../services/logger";

export function AddSiteForm() {
    const { createSite, isLoading, lastError, clearError } = useStore();
    const { isDark } = useTheme();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
        } else {
            // Hide button loading immediately when loading stops
            setShowButtonLoading(false);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) return;

        clearError();

        try {
            const siteData = {
                url: url.trim(),
                name: name.trim() || undefined,
            };

            await createSite(siteData);

            // Reset form on success
            setUrl("");
            setName("");
            logger.user.action("Added site", { url: url.trim(), name: name.trim() });
        } catch (error) {
            // Error is already handled by the store action
            logger.error("Failed to add site from form", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Site Name (Optional)
                </ThemedText>
                <ThemedInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Website"
                    aria-label="Site name (optional)"
                />
            </div>

            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Website URL *
                </ThemedText>
                <ThemedInput
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    aria-label="Website URL (required)"
                />
            </div>

            <ThemedButton
                type="submit"
                variant="primary"
                disabled={!url.trim() || isLoading}
                fullWidth
                loading={showButtonLoading}
            >
                Add Site
            </ThemedButton>

            {/* Error Message */}
            {lastError && (
                <ThemedBox surface="base" padding="md" className={`error-alert ${isDark ? "dark" : ""}`} rounded="md">
                    <div className="flex items-center">
                        <ThemedText size="sm" className={`error-alert__text ${isDark ? "dark" : ""}`}>
                            ❌ {lastError}
                        </ThemedText>
                        <ThemedButton
                            variant="secondary"
                            size="xs"
                            onClick={clearError}
                            className={`error-alert__close ${isDark ? "dark" : ""}`}
                        >
                            ✕
                        </ThemedButton>
                    </div>
                </ThemedBox>
            )}

            <div className="space-y-1">
                <ThemedText size="xs" variant="tertiary">
                    • Enter the full URL including http:// or https://
                </ThemedText>
                <ThemedText size="xs" variant="tertiary">
                    • The site will be checked according to your monitoring interval
                </ThemedText>
            </div>
        </form>
    );
}
